using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco13.Controllers
{
	public class BlockListParagraphViewComponent : ViewComponent
	{
		internal readonly IUmbracoContextAccessor _umbracoContextAccessor;
		public IPublishedValueFallback Fallback { get; set; }
		public IUmbracoContext UmbracoContext { get; set; }

		public readonly string ViewPath;
		public BlockListParagraphViewComponent(IUmbracoContextAccessor umbracoContextAccessor, IPublishedValueFallback publishedValueFallback)
		{
			_umbracoContextAccessor = umbracoContextAccessor;
			_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext);

			UmbracoContext = umbracoContext!;
			Fallback = publishedValueFallback;
			ViewPath = $"~/Views/Partials/blocklist/Components/BlockListParagraph.cshtml";

		}

		public IViewComponentResult Invoke(BlockListItem<BlockListParagraph> model)
		{
            return View(ViewPath, model);

        }

	}
}
