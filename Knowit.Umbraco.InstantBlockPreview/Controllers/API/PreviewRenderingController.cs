using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Web.Common.Controllers;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using System.Text.Encodings.Web;
using Knowit.Umbraco.InstantBlockPreview.Shared;

namespace Knowit.Umbraco.InstantBlockPreview.Controllers.API
{

    public class PreviewRenderingController : UmbracoApiController
    {
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly IViewComponentHelper _viewComponentHelper;
        private readonly Settings _settings;
        private readonly BlockHelper _blockHelper;
        public PreviewRenderingController(
            BlockEditorConverter blockEditorConverter,
            IRazorViewEngine razorViewEngine,
            ITempDataProvider tempDataProvider,
            IViewComponentSelector viewComponentSelector,
            IViewComponentHelper viewComponentHelper,
            IConfiguration configuration)
        {
            _razorViewEngine = razorViewEngine;
            _blockEditorConverter = blockEditorConverter;
            _tempDataProvider = tempDataProvider;
            _viewComponentSelector = viewComponentSelector;
            _viewComponentHelper = viewComponentHelper;
            _blockHelper = new BlockHelper(_blockEditorConverter);
            _settings = new Settings(configuration);
        }

        [HttpPost("umbraco/api/PreviewRendering/RenderComponent")]
        public async Task<IActionResult> RenderComponent(RenderingPayload scope)
        {
            if (scope == null || scope.ControllerName == null || scope.Content == null || scope.BlockType == null)
            {
                return Ok(new { html = "Missing parameters" });
            }

            var content = scope.Content;
            var settings = scope.Settings;
            var controllerName = scope.ControllerName![0].ToString().ToUpper() + scope.ControllerName.Substring(1);
            string htmlString = "";



            try
            {
                // hide the crazy
                object blockItemInstance = _blockHelper.InstantiateFromJson(content, settings, controllerName, scope.BlockType, scope.Layout);

                var formattedViewPath = string.Format("{0}.cshtml", controllerName);

                var viewPath = (scope.BlockType == "grid" ? _settings.PackageSettings.GridViewPath : _settings.PackageSettings.BlockViewPath) + formattedViewPath;


                // compile the view
                ViewEngineResult viewResult = _razorViewEngine.GetView("", viewPath, false);

                var actionContext = new ActionContext(ControllerContext.HttpContext, new Microsoft.AspNetCore.Routing.RouteData(), new ActionDescriptor());
                //BlockGridItem test = blockItemInstance as BlockGridItem;

                // build Model and viewbag
                ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
                {
                    Model = blockItemInstance
                };

                viewData["assignedContentId"] = scope.ContentId;
                viewData["blockPreview"] = true;

                await using var sw = new StringWriter();

                // see if there is a component
                var viewComponent = _viewComponentSelector.SelectComponent(controllerName);
                // deal with view component
                if (viewComponent != null)
                {
                    try
                    {
                        htmlString = await ExecuteViewComponent(controllerName, htmlString, blockItemInstance, actionContext, viewData);
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
            if (_settings.PackageSettings.Injections is not null)
            {
                htmlString = string.Join("\n", _settings.PackageSettings.Injections) + "\n" + htmlString;
            }
            return Ok(new { html = htmlString });
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

