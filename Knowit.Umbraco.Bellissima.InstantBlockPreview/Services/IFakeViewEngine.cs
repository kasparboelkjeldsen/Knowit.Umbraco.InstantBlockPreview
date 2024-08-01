using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public interface IFakeViewEngine
    {
        Task<string> RenderView(HttpContext context, string viewPath, string controllerName, object model, string contentId, Dictionary<string, object> AddViewData);

        string BootstrapJs(string htmlString);

        string StripLinks(string htmlString);
    }
}
