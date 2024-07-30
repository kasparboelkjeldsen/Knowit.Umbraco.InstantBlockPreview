using Knowit.Umbraco.InstantBlockPreview.Shared;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Udi = Umbraco.Cms.Core.Udi;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Controllers
{
    [ApiController]
    [Route("api/blockpreview")]
    public class BlockPreviewController : Controller
    {
		static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();

		private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly IViewComponentHelper _viewComponentHelper;
        private readonly Settings _settings;
        private readonly BlockGridPropertyValueConverter _blockGridPropertyValueConverter;
        private readonly BlockListPropertyValueConverter _blockListPropertyValueConverter;

		private readonly IUmbracoContextFactory _umbracoContextFactory;
        private readonly IContentTypeService _contentTypeService;
        private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
		private readonly ILogger _logger;
		public BlockPreviewController(
            IRazorViewEngine razorViewEngine,
            ITempDataProvider tempDataProvider,
            IViewComponentSelector viewComponentSelector,
            IViewComponentHelper viewComponentHelper,
            IConfiguration configuration,
			IUmbracoContextFactory umbracoContextFactory,
			IContentTypeService contentTypeService,
			IPublishedContentTypeFactory publishedContentTypeFactory,
			BlockGridPropertyValueConverter blockGridPropertyValueConverter,
            BlockListPropertyValueConverter blockListPropertyValueConverter,
			ILogger logger)
        {
            _razorViewEngine = razorViewEngine;
            _tempDataProvider = tempDataProvider;
            _viewComponentSelector = viewComponentSelector;
            _viewComponentHelper = viewComponentHelper;
            
            _settings = new Settings(configuration);
			
			_blockGridPropertyValueConverter = blockGridPropertyValueConverter;
			_blockListPropertyValueConverter = blockListPropertyValueConverter;
			_umbracoContextFactory = umbracoContextFactory;

            _contentTypeService = contentTypeService;
			_publishedContentTypeFactory = publishedContentTypeFactory;

			_logger = logger;
		}


        [HttpPost]
        public async Task<IActionResult> Render([FromBody] RenderingPayloadBellissima scope)
		{
			var content = scope.Content;

			PayloadContentExtractor payloadContentExtractor = JsonSerializer.Deserialize<PayloadContentExtractor>(content);

			var pageAlias = scope.ContentTypeId;
            var propAlias = scope.PropertyTypeAlias;
			var elementTypeId = payloadContentExtractor.ContentData.First().ContentTypeKey;
			var controllerName = string.Empty;
            var blockType = "";
			string htmlString = string.Empty;

			try
			{
				using (var umbracoContextReference = _umbracoContextFactory.EnsureUmbracoContext())
				{
					var ctype = _contentTypeService.Get(Guid.Parse(pageAlias));
					var ptype = _contentTypeService.Get(Guid.Parse(elementTypeId));
					var iptype = _publishedContentTypeFactory.CreateContentType(ctype);
					var propType = iptype.GetPropertyType(propAlias);
					controllerName = ptype.Alias;

					// check if we need to filter on Alias
					if(_settings.PackageSettings.EnableFor != null && _settings.PackageSettings.EnableFor.Any())
					{
						if (!_settings.PackageSettings.EnableFor.Contains(controllerName))
						{
							return Ok(new { html = "blockbeam" });
						}
					}

					if(_settings.PackageSettings.DisableFor != null && _settings.PackageSettings.DisableFor.Any())
					{
						if (_settings.PackageSettings.DisableFor.Contains(controllerName))
						{
							return Ok(new { html = "blockbeam" });
						}
					}

					BlockGridModel bgm = null;
					BlockListModel blm = null;



					if (propType.DataType.EditorAlias == Constants.PropertyEditors.Aliases.BlockGrid)
					{
						bgm = (BlockGridModel)_blockGridPropertyValueConverter.ConvertIntermediateToObject(null, propType, PropertyCacheLevel.None, content, true);
						blockType = "grid";
					}
					else if (propType.DataType.EditorAlias == Constants.PropertyEditors.Aliases.BlockList)
					{
						blockType = "list";
						blm = (BlockListModel)_blockListPropertyValueConverter.ConvertIntermediateToObject(null, propType, PropertyCacheLevel.None, content, true);
					}

					if (bgm == null && blm == null) return Ok(new { html = "blockbeam" });

					object blockInstanceItem = BlockInstance(controllerName, blockType, bgm != null ? bgm.FirstOrDefault() : blm.FirstOrDefault(), false);
                    object blockInstanceItem2 = BlockInstance(controllerName, blockType, bgm != null ? bgm.FirstOrDefault() : blm.FirstOrDefault(), true);

					if(blockInstanceItem == null) blockInstanceItem = blockInstanceItem2;


                    var formattedViewPath = string.Format("{0}.cshtml", controllerName);

					var viewPath = (blockType == "grid" ? _settings.PackageSettings.GridViewPath : _settings.PackageSettings.BlockViewPath) + formattedViewPath;

					ViewEngineResult viewResult = _razorViewEngine.GetView("", viewPath, false);

					var actionContext = new ActionContext(ControllerContext.HttpContext, new Microsoft.AspNetCore.Routing.RouteData(), new ActionDescriptor());

					ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
					{
						Model = blockInstanceItem
					};

					viewData["assignedContentId"] = scope.ContentId;
					viewData["blockPreview"] = true;
                    if (blockType == "grid" && _settings.PackageSettings.AreaReplace.HasValue && _settings.PackageSettings.AreaReplace.Value)
                    {
                        viewData["renderGridAreaSlots"] = "###renderGridAreaSlots";
                    }

                    await using var sw = new StringWriter();

					var viewComponent = _viewComponentSelector.SelectComponent(controllerName);

					if (viewComponent != null)
					{
						try
						{
							htmlString = await ExecuteViewComponent(controllerName, htmlString, blockInstanceItem, actionContext, viewData);
						}
						catch (Exception e)
						{
							htmlString = await ExecuteViewContext(htmlString, viewResult, actionContext, viewData, sw);
						}
					}
					else
					{
						// render the view and convert to string
						htmlString = await ExecuteViewContext(htmlString, viewResult, actionContext, viewData, sw);
					}

					if (!htmlString.ToLower().Contains("<script>")) htmlString += "<script></script>"; // for bootstraping purposes

					// Clear href attributes
					htmlString = Regex.Replace(htmlString, @"href\s*=\s*[""'].*?[""']", "", RegexOptions.IgnoreCase);

					// Clear onclick attributes
					htmlString = Regex.Replace(htmlString, @"onclick\s*=\s*[""'].*?[""']", "", RegexOptions.IgnoreCase);
					if (_settings.PackageSettings.Injections is not null)
					{
						htmlString = string.Join("\n", _settings.PackageSettings.Injections) + "\n" + htmlString;
					}
					return Ok(new { html = htmlString });
				}
			}
			catch (Exception e)
			{
				if(_settings.PackageSettings.Debug.HasValue && _settings.PackageSettings.Debug.Value)
                {
                    _logger.Error(e, "Error rendering block preview");
                }
                return Ok(new { html = "blockbeam" });
			}
        }

		private static object BlockInstance(string controller, string blockType, object blockGridItem, bool comma)
		{
            var controllerKey = blockType + controller + comma;
            try
			{
				IPublishedElement model = blockGridItem is BlockGridItem ? ((BlockGridItem)blockGridItem).Content : ((BlockListItem)blockGridItem).Content;
				object settings = blockGridItem is BlockGridItem ? ((BlockGridItem)blockGridItem).Settings : ((BlockListItem)blockGridItem).Settings;

				Type? controllerType, blockItemType, blockElementType;
				

				if (!controllerToTypes.ContainsKey(controllerKey))
				{
					// get the typed model of the controller/view
					controllerType = model!.GetType();
					var settingsType = settings?.GetType();
					// create generic type BlockGridItem<T> where T is the typed model
					if (!comma)
						blockItemType = blockType == "grid" ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
					else
						blockItemType = blockType == "grid" ? typeof(BlockGridItem<,>) : typeof(BlockListItem<,>);

					Type[] typeArray = settingsType != null ? [controllerType, settingsType] : [controllerType]; 
					blockElementType = blockItemType.MakeGenericType(typeArray);

					controllerToTypes.TryAdd(controllerKey, (controllerType, blockItemType, blockElementType));
				}
				else
				{
					// or just load everything from the static dictionary since we've done this all before
					(controllerType, blockItemType, blockElementType) = controllerToTypes[controllerKey];
				}

				ConstructorInfo? ctor = blockElementType.GetConstructor(new[]
				{
					typeof(Udi),
					controllerType,
					typeof(Udi),
					settings != null ? settings.GetType() : typeof(IPublishedElement)
				});

				object blockGridItemInstance = ctor!.Invoke(new object[]
				{
					Udi.Create("element",Guid.NewGuid()),
					model!,
					Udi.Create("element",Guid.NewGuid()),
					settings
				});
				return blockGridItemInstance;
			}
			catch
			{
				controllerToTypes.Remove(controllerKey, out _);

                return null;
			}
		}

		public static object CreateBlockGridPropertyValueCreator(
		BlockEditorConverter blockEditorConverter,
		IJsonSerializer jsonSerializer,
		BlockGridPropertyValueConstructorCache constructorCache)
		{
			// Get the type of the internal class
			var internalType = typeof(BlockEditorConverter).Assembly.GetType("Umbraco.Cms.Core.PropertyEditors.ValueConverters.BlockGridPropertyValueCreator");

			if (internalType == null)
			{
				throw new InvalidOperationException("Type not found.");
			}

			// Get the constructor with the specific parameters
			var constructor = internalType.GetConstructor(
				BindingFlags.Instance | BindingFlags.NonPublic,
				null,
				new Type[] { typeof(BlockEditorConverter), typeof(IJsonSerializer), typeof(BlockGridPropertyValueConstructorCache) },
				null);

			if (constructor == null)
			{
				throw new InvalidOperationException("Constructor not found.");
			}

			// Use Activator to create an instance
			var instance = constructor.Invoke(new object[] { blockEditorConverter, jsonSerializer, constructorCache });
			return instance;
		}



		private async Task<string> ExecuteViewContext(string htmlString, ViewEngineResult viewResult, ActionContext actionContext, ViewDataDictionary viewData, StringWriter sw)
        {
            var viewContext = new ViewContext(actionContext, viewResult.View!, viewData, new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

            await viewResult.View!.RenderAsync(viewContext);
            htmlString = sw.ToString();
            return htmlString;
        }

        private async Task<string> ExecuteViewComponent(string controllerName, string htmlString, object blockItemInstance, ActionContext actionContext, ViewDataDictionary viewData)
        {
            var viewContext = new ViewContext(
                                    actionContext,
                                    new FakeView(),
                                    viewData,
                                    new TempDataDictionary(actionContext.HttpContext, _tempDataProvider),
                                    new StringWriter(),
                                    new HtmlHelperOptions()
                                );

            var viewComponentHelper = _viewComponentHelper as IViewContextAware;
            viewComponentHelper?.Contextualize(viewContext);

            var result = await _viewComponentHelper.InvokeAsync(controllerName, blockItemInstance);
            using (var writer = new StringWriter())
            {
                // Invoke the ViewComponent and write its output directly to the StringWriter
                result.WriteTo(writer, HtmlEncoder.Default);

                // The StringWriter now contains the rendered HTML
                htmlString = writer.ToString();
            }

            return htmlString;
        }
        private class FakeView : IView
        {
            public string Path => string.Empty;
            public async Task RenderAsync(ViewContext context)
            {
                await Task.CompletedTask;
            }
        }
    }
}
