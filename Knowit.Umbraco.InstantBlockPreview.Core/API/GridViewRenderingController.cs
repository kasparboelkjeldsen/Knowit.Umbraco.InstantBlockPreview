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
        private string ModelsNamespace = "Umbraco.Cms.Web.Common.PublishedModels";
        private string ViewPath = "~/Views/Partials/blockgrid/Components/";

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
            scopeChange = scopeChange ?? "{}";
            string htmlString = "";


            if (scopeChange != "{}")
            {
                try
                {
                    object blockGridItemInstance = InstantiateFromJson(scopeChange, controllerName);

                    string formattedViewPath = string.Format("{0}.cshtml", controllerName);

                    ViewEngineResult viewResult;
                    
                    if (!views.ContainsKey(formattedViewPath))
                    {
                        viewResult = _razorViewEngine.GetView("", ViewPath + formattedViewPath, false);

                        if (viewResult.View != null)
                            views.Add(formattedViewPath, viewResult);
                        else return BadRequest(new { html = "could't find view" });
                    }
                    else viewResult = views[formattedViewPath];

                    var actionContext = new ActionContext(ControllerContext.HttpContext, new RouteData(), new ActionDescriptor());

                    ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                    {
                        Model = blockGridItemInstance
                    };

                    viewData["blockPreview"] = true;

                    await using var sw = new StringWriter();

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

            return Ok(new { html = htmlString });

        }

        private object InstantiateFromJson(string? scopeChange, string? controllerName)
        {
            BlockItemData? bid = JsonConvert.DeserializeObject<BlockItemData>(scopeChange!, new JsonSerializerSettings()
            {
                Error = new EventHandler<Newtonsoft.Json.Serialization.ErrorEventArgs>((sender, e) =>
                {
                    e.ErrorContext.Handled = true;
                })
            });

            var model = _blockEditorConverter.ConvertToElement(bid!, PropertyCacheLevel.Element, true);

            Type? controllerType, blockItemType, blockElementType;
            if (!controllerToTypes.ContainsKey(controllerName!))
            {
                
                var assembly = Assembly.GetEntryAssembly();
                controllerType = assembly.GetType($"{ModelsNamespace!}.{controllerName!}");
                blockItemType = typeof(BlockGridItem<>);
                blockElementType = blockItemType.MakeGenericType(controllerType);
            }
            else
            {
                (controllerType, blockItemType, blockElementType) = controllerToTypes[controllerName];
            }

#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
            ConstructorInfo ctor = blockElementType.GetConstructor(new[]
            {
                        typeof(Udi),
                        controllerType,
                        typeof(Udi),
                        typeof(IPublishedElement)
                    });
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.

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
