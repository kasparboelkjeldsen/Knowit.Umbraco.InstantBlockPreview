using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileSystemGlobbing.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using StackExchange.Profiling.Internal;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;

using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Web.Common.Controllers;
using static System.Net.Mime.MediaTypeNames;
using static Umbraco.Cms.Core.Constants.HttpContext;

//.net 7 specifics
#if NET7_0_OR_GREATER
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.DeliveryApi;
#endif
namespace Knowit.Umbraco.InstantBlockPreview.API
{
    //.net 7 specifics
#if NET7_0_OR_GREATER
    public partial class GridViewRenderingController : UmbracoApiController
    {
        private readonly IApiElementBuilder _apiElementBuilder;


        [HttpPost("umbraco/api/CustomPreview/RefreshAppComponent")]
        public IActionResult RefreshAppComponent(SC scope)
        {
            if (scope == null || scope.ControllerName == null || scope.Content == null || scope.BlockType == null)
            {
                return BadRequest(new { html = "Missing parameters" });
            }

            var content = scope.Content;
            var settings = scope.Settings;

            // as we are (ab)using content delivery api, we need to bust the cache so it will refresh every time
            // changing the udi is only an issue if we were saving the data, but as we are just using it to generate previews
            // everything is fine

            var matches = Regex.Matches(content, @"umb://element/[\w\d]+");

            foreach (Match match in matches)
            {
                var cacheBusterUdi = Udi.Create("element", Guid.NewGuid());
                content = content.Replace(match.Value, cacheBusterUdi.ToString());
            }

            var controllerName = scope.ControllerName![0].ToString().ToUpper() + scope.ControllerName.Substring(1);

            var blockItemInstance = InstantiateAsContentDeliveryApiResponse(content, settings, controllerName, scope.BlockType);

            return Ok(new { json = JsonConvert.SerializeObject(blockItemInstance) });
        }
        private object? InstantiateAsContentDeliveryApiResponse(string? content, string? settings, string? controllerName, string? blockType)
        {
            var model = InstantiateFromJson(content, settings, controllerName, blockType);

            if (model is BlockGridItem blockGridModel)
            {
                // borrowed from umbracos source code
                ApiBlockGridItem CreateApiBlockGridItem(BlockGridItem item)
                => new ApiBlockGridItem(
                    _apiElementBuilder.Build(item.Content),
                    item.Settings != null
                        ? _apiElementBuilder.Build(item.Settings)
                        : null,
                    item.RowSpan,
                    item.ColumnSpan,
                    item.AreaGridColumns ?? blockGridModel.GridColumns ?? 12,
                    item.Areas.Select(CreateApiBlockGridArea).ToArray());

                ApiBlockGridArea CreateApiBlockGridArea(BlockGridArea area)
                => new ApiBlockGridArea(
                    area.Alias,
                    area.RowSpan,
                    area.ColumnSpan,
                    area.Select(CreateApiBlockGridItem).ToArray());

                return new ApiBlockGridModel(blockGridModel.GridColumns ?? 12, new List<ApiBlockGridItem>() { CreateApiBlockGridItem(blockGridModel) });
            }
            // todo: add support for other models like BlockListItem
            return model;
        }

    }
#endif
    public partial class GridViewRenderingController : UmbracoApiController
    {
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly BlockEditorConverter _blockEditorConverter;
        
        private readonly IConfiguration _configuration;

        private readonly PackageSettings _settings;

        static readonly Random random = new Random();
        static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();

#region default appHtml
        static readonly string defaultAppHtml = @"
<div id=""app{0}""></div>
<script>
    const el = document.querySelector('#app{0}');
    let event = new CustomEvent('init-preview-app', { detail: { element: el, seed: '{0}' } });
    window.dispatchEvent(event);

    function callWhenExists(funcName, el, timeout = 10) {
        if (typeof window[funcName] === 'function') {
            window[funcName](el);
        } else {
            setTimeout(() => callWhenExists(funcName, el, timeout), timeout);
        }
    }
    callWhenExists('init-preview-app' + '{0}', el);
</script>";
#endregion


        public GridViewRenderingController(
            BlockEditorConverter blockEditorConverter, 
            IRazorViewEngine razorViewEngine, 
            ITempDataProvider tempDataProvider,
            #if NET7_0_OR_GREATER
            IApiElementBuilder apiElementBuilder, 
            #endif
            IConfiguration configuration)
        {
            _razorViewEngine = razorViewEngine;
            _blockEditorConverter = blockEditorConverter;
            _tempDataProvider = tempDataProvider;
#if NET7_0_OR_GREATER
            _apiElementBuilder = apiElementBuilder;
#endif
            _configuration = configuration;
            _settings = _configuration.GetSection("Knowit.Umbraco.InstantBlockPreview")?.Get<PackageSettings>();
            
            if(_settings == null)
            {
                _settings = new PackageSettings()
                {
                    BlockViewPath = "~/Views/Partials/blocklist/Components/",
                    GridViewPath = "~/Views/Partials/blockgrid/Components/",
                    EnableBlockEdit = false,
                    RenderType = "razor"
                };
            }

        }

        [HttpPost("umbraco/api/CustomPreview/RenderPartial")]
        public async Task<IActionResult> RenderPartial(SC scope)
        {
            if(scope == null || scope.ControllerName == null || scope.Content == null || scope.BlockType == null)
            {
                return BadRequest(new { html = "Missing parameters" });
            }
   
            var content = scope.Content;
            var settings = scope.Settings;
            var controllerName = scope.ControllerName![0].ToString().ToUpper() + scope.ControllerName.Substring(1);
            string htmlString = "";
            string seed = random.Next(int.MaxValue).ToString();

            if (scope.IsApp && string.IsNullOrEmpty(_settings.AppViewPath))
            {
                htmlString = defaultAppHtml.Replace("{0}", seed);
            }
            else
            {
                try
                {
                    // hide the crazy
                    object blockItemInstance = InstantiateFromJson(content, settings, controllerName, scope.BlockType);

                    var formattedViewPath = string.Format("{0}.cshtml", controllerName);

                    var viewPath = scope.IsApp ? _settings!.AppViewPath : (scope.BlockType == "grid" ? _settings!.GridViewPath : _settings!.BlockViewPath) + formattedViewPath;

                    // compile the view
                    ViewEngineResult viewResult = _razorViewEngine.GetView("", viewPath, false);

                    var actionContext = new ActionContext(ControllerContext.HttpContext, new RouteData(), new ActionDescriptor());
                    BlockGridItem test = blockItemInstance as BlockGridItem;

                    // build Model and viewbag
                    ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                    {
                        Model = blockItemInstance
                    };
                    viewData["assignedContentId"] = scope.ContentId;
                    viewData["blockPreview"] = true;
                    viewData["seed"] = seed;

                    await using var sw = new StringWriter();

                    // render the view and convert to string
                    var viewContext = new ViewContext(actionContext, viewResult.View!, viewData, new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

                    await viewResult.View!.RenderAsync(viewContext);

                    htmlString = sw.ToString();
                }
                catch (Exception e)
                {
                    htmlString = e.Message;
                    return BadRequest(new { html = htmlString });
                }
            }
            // Clear href attributes
            htmlString = Regex.Replace(htmlString, @"href\s*=\s*[""'].*?[""']", "", RegexOptions.IgnoreCase);

            // Clear onclick attributes
            htmlString = Regex.Replace(htmlString, @"onclick\s*=\s*[""'].*?[""']", "", RegexOptions.IgnoreCase);
            if(_settings.Injections != null)
            {
                htmlString = string.Join("\n", _settings.Injections) + htmlString;
            }
            return Ok(new { html = htmlString, seed });
        }

        private object InstantiateFromJson(string? content, string? settings, string? controllerName, string? blockType)
        {
            // try to deserialize to BlockItemData, while ignoring all errors
            BlockItemData? bid = JsonConvert.DeserializeObject<BlockItemData>(content!);

            IPublishedElement? settingsModel = null;

            if (settings.HasValue())
            {
                BlockItemData? set = JsonConvert.DeserializeObject<BlockItemData>(settings!);
                settingsModel = _blockEditorConverter.ConvertToElement(set!, PropertyCacheLevel.Element, true);
            }
            
            var controllerKey = blockType + controllerName;
            // convert to IPublishedElement
            var model = _blockEditorConverter.ConvertToElement(bid!, PropertyCacheLevel.Element, true);
            
            // we cannot avoid using some reflection to make this dynamic
            Type? controllerType, blockItemType, blockElementType;
            if (!controllerToTypes.ContainsKey(controllerKey))
            {
                // get the typed model of the controller/view
                controllerType = model!.GetType();
                // create generic type BlockGridItem<T> where T is the typed model
                blockItemType = blockType == "grid" ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
                blockElementType = blockItemType.MakeGenericType(controllerType);

                controllerToTypes.TryAdd(controllerKey, (controllerType, blockItemType, blockElementType));
            }
            else
            {
                // or just load everything from the static dictionary since we've done this all before
                (controllerType, blockItemType, blockElementType) = controllerToTypes[controllerKey];
            }

            // create our constructor from this signature
            // public BlockGridItem(Udi contentUdi, T content, Udi settingsUdi, IPublishedElement settings)
            // public BlockListItem(Udi contentUdi, T content, Udi settingsUdi, IPublishedElement settings)
            ConstructorInfo? ctor = blockElementType.GetConstructor(new[]
            {
                typeof(Udi),
                controllerType,
                typeof(Udi),
                settingsModel != null ? settingsModel.GetType() : typeof(IPublishedElement)
            });

            // use reflection to instantiate our BlockGridItem<T> with the typed model
            object blockGridItemInstance = ctor!.Invoke(new object[]
            {
                Udi.Create("element",Guid.NewGuid()),
                model!,
                Udi.Create("element",Guid.NewGuid()),
                settingsModel! //todo something something block settings
            });
            return blockGridItemInstance;
        }

        [HttpGet("umbraco/api/CustomPreview/Settings")]
        public IActionResult GetSettings()
        {
            return Ok(_settings);
        }
    }
}

