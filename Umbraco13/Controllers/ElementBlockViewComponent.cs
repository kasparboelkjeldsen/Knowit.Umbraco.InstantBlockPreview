using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco13.Controllers
{
    public class ElementBlockViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(BlockGridItem<ElementBlock> model)
        {
            model.Content.PartialValue = "PARTIAL";

            return View("~/Views/Partials/blockgrid/Components/ElementBlock.cshtml",model);
        }

    }
}
