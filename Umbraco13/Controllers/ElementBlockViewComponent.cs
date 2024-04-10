using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco13.Controllers
{
    public class ElementBlockViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(object model)
        {
            if (model is BlockGridItem<ElementBlock> grid)
            {
                grid.Content.PartialValue = "PARTIAL";

                return View("~/Views/Partials/blockgrid/Components/ElementBlock.cshtml", grid);
            }
            else if (model is BlockListItem<ElementBlock> block)
            {
                block.Content.PartialValue = "PARTIAL";

                return View("~/Views/Partials/blockgrid/Components/ElementBlock.cshtml", block);
            }
            else return View("~/Views/Partials/blocklist/Components/ElementBlock.cshtml");
        }

    }
}
