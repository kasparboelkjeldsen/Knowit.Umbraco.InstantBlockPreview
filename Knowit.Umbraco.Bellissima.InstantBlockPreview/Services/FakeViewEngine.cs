using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public class FakeViewEngine : IFakeViewEngine
    {
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly IViewComponentHelper _viewComponentHelper;
        private readonly IPreviewSettings _settings;
        public FakeViewEngine(
            IRazorViewEngine razorViewEngine,
            ITempDataProvider tempDataProvider,
            IViewComponentSelector viewComponentSelector,
            IViewComponentHelper viewComponentHelper,
            IPreviewSettings settings
            ) {
            _razorViewEngine = razorViewEngine;
            _tempDataProvider = tempDataProvider;
            _viewComponentSelector = viewComponentSelector;
            _viewComponentHelper = viewComponentHelper;
            _settings = settings;
        }
        public async Task<string> RenderView(HttpContext context, string viewPath, string controllerName, object model, string contentId, Dictionary<string,object> AddViewData)
        {
            var htmlString = string.Empty;

            ViewEngineResult viewResult = _razorViewEngine.GetView(string.Empty, viewPath, false);

            var actionContext = new ActionContext(context, new Microsoft.AspNetCore.Routing.RouteData(), new ActionDescriptor());

            ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = model
            };

            viewData[PreviewConstants.ViewDataAssignedContentId] = contentId;
            viewData[PreviewConstants.ViewDataBlockPreview] = true;

            foreach(var key in AddViewData.Keys)
            {
                viewData[key] = AddViewData[key];
            }

            var viewComponent = _viewComponentSelector.SelectComponent(controllerName);

            if (viewComponent != null)
            {
                try
                {
                    htmlString = await ExecuteViewComponent(controllerName, htmlString, model, actionContext, viewData);
                }
                catch
                {
                    htmlString = await ExecuteViewContext(htmlString, viewResult, actionContext, viewData, new StringWriter());
                }
            }
            else
            {
                // render the view and convert to string
                htmlString = await ExecuteViewContext(htmlString, viewResult, actionContext, viewData, new StringWriter());
            }

            return htmlString;
        }
        public string BootstrapJs(string htmlString)
        {
            if (!htmlString.ToLower().Contains("<script>")) htmlString += PreviewConstants.ScriptBootStrap;
            
            return htmlString;
        }

        public string StripLinks(string htmlString)
        {
            htmlString = Regex.Replace(htmlString, PreviewConstants.RegexMatchHref, string.Empty, RegexOptions.IgnoreCase);

            htmlString = Regex.Replace(htmlString, PreviewConstants.RegexMatchOnClick, string.Empty, RegexOptions.IgnoreCase);
            if (_settings.PackageSettings.Injections is not null)
            {
                htmlString = string.Join("\n", _settings.PackageSettings.Injections) + "\n" + htmlString;
            }

            return htmlString;
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
