using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using System.Reflection;
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
        private string ModelsNamespace = "Umbraco.Cms.Web.Common.PublishedModels"; // todo, get from config
        private string ViewPath = "~/Views/Partials/blockgrid/Components/"; // todo, get from config

        static Dictionary<string, (Type, Type, Type)> controllerToTypes = new Dictionary<string, (Type, Type, Type)>();
        static Dictionary<string, ViewEngineResult> views = new Dictionary<string, ViewEngineResult>(); 
        public class SC
        {
            public string? ScopeChange { get; set; }
            public string? ControllerName { get; set; }
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
            var scopeChange = scope.ScopeChange;
            var controllerName = scope.ControllerName;
            string htmlString = "";

            try
            {
                // hide the crazy
                object blockGridItemInstance = InstantiateFromJson(scopeChange, controllerName);

                string formattedViewPath = string.Format("{0}.cshtml", controllerName);

                ViewEngineResult viewResult;
#if DEBUG
                views.Clear();
#endif
                // check if we have already instantiated the view (compiled it), if not, do it now
                if (!views.ContainsKey(formattedViewPath))
                {
                    viewResult = _razorViewEngine.GetView("", ViewPath + formattedViewPath, false);

                    if (viewResult.View != null)
                        views.Add(formattedViewPath, viewResult);
                    else return BadRequest(new { html = "could't find view" });
                }
                else viewResult = views[formattedViewPath];

                var actionContext = new ActionContext(ControllerContext.HttpContext, new RouteData(), new ActionDescriptor());

                // build Model and viewbag
                ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                {
                    Model = blockGridItemInstance
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

            return Ok(new { html = htmlString });
        }

        private object InstantiateFromJson(string? scopeChange, string? controllerName)
        {
            // try to deserialize to BlockItemData, while ignoring all errors
            BlockItemData? bid = JsonConvert.DeserializeObject<BlockItemData>(scopeChange!, new JsonSerializerSettings()
            {
                Error = new EventHandler<Newtonsoft.Json.Serialization.ErrorEventArgs>((sender, e) =>
                {
                    e.ErrorContext.Handled = true;
                })
            });

            // convert to IPublishedElement
            var model = _blockEditorConverter.ConvertToElement(bid!, PropertyCacheLevel.Element, true);

            // we cannot avoid using some reflection to make this dynamic
            Type? controllerType, blockItemType, blockElementType;
            if (!controllerToTypes.ContainsKey(controllerName!))
            {
                // we assume the models are in the same assembly as umbraco for now
                // todo, read the config and if models are moved to different project, find correct assembly to load
                var assembly = Assembly.GetEntryAssembly();
                // get the typed model of the controller/view
                controllerType = assembly!.GetType($"{ModelsNamespace!}.{controllerName!}");
                // create generic type BlockGridItem<T> where T is the typed model
                blockItemType = typeof(BlockGridItem<>);
                blockElementType = blockItemType.MakeGenericType(controllerType);
            }
            else
            {
                // or just load everything from the static dictionary since we've done this all before
                (controllerType, blockItemType, blockElementType) = controllerToTypes[controllerName];
            }

            // shut up the warnings, we know it's dangerous

#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
            ConstructorInfo ctor = blockElementType.GetConstructor(new[]
            {
                        typeof(Udi),
                        controllerType,
                        typeof(Udi),
                        typeof(IPublishedElement)
                    });
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.

            // use reflection to instantiate our BlockGridItem<T> with the typed model
            object blockGridItemInstance = ctor!.Invoke(new object[]
            {
                        Udi.Create("element"),
                model!,
                        Udi.Create("element"),
                        null! //todo something something block settings
            });
            return blockGridItemInstance;
        }
    }
}
