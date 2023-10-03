using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using StackExchange.Profiling.Internal;
using System.Collections.Concurrent;
using System.Reflection;
using System.Text.RegularExpressions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Web.Common.Controllers;

namespace Knowit.Umbraco.InstantBlockPreview.Core.API
{
    public class GridViewRenderingController : UmbracoApiController
    {
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly BlockEditorConverter _blockEditorConverter;
        private string GridViewPath = "~/Views/Partials/blockgrid/Components/"; // todo, get from config
        private string ListViewPath = "~/Views/Partials/blocklist/Components/"; // todo, get from config

        static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();
        
        public class SC
        {
            public string? Content { get; set; }
            public string? Settings { get; set; }
            public string? ControllerName { get; set; }
            public string? BlockType { get; set; }
        }

        public GridViewRenderingController(BlockEditorConverter blockEditorConverter, IRazorViewEngine razorViewEngine, ITempDataProvider tempDataProvider)
        {
            _razorViewEngine = razorViewEngine;
            _blockEditorConverter = blockEditorConverter;
            _tempDataProvider = tempDataProvider;
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

            try
            {
                // hide the crazy
                object blockItemInstance = InstantiateFromJson(content, settings, controllerName, scope.BlockType);

                var formattedViewPath = string.Format("{0}.cshtml", controllerName);

                var viewPath = (scope.BlockType == "grid" ? GridViewPath : ListViewPath) + formattedViewPath;

                // compile the view
                ViewEngineResult viewResult = _razorViewEngine.GetView("", viewPath, false);

                var actionContext = new ActionContext(ControllerContext.HttpContext, new RouteData(), new ActionDescriptor());

                // build Model and viewbag
                ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                {
                    Model = blockItemInstance
                };

                viewData["blockPreview"] = true;

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
            // Clear href attributes
            htmlString = Regex.Replace(htmlString, @"href\s*=\s*[""'].*?[""']", "", RegexOptions.IgnoreCase);

            // Clear onclick attributes
            htmlString = Regex.Replace(htmlString, @"onclick\s*=\s*[""'].*?[""']", "", RegexOptions.IgnoreCase);

            return Ok(new { html = htmlString });
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
                        Udi.Create("element"),
                model!,
                        Udi.Create("element"),
                settingsModel! //todo something something block settings
            });
            return blockGridItemInstance;
        }
    }
}

