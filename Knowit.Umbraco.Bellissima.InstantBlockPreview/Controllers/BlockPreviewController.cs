using Knowit.Umbraco.Bellissima.InstantBlockPreview.Helpers;
using Knowit.Umbraco.Bellissima.InstantBlockPreview.Models;
using Knowit.Umbraco.Bellissima.InstantBlockPreview.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Controllers
{
    [ApiController]
    [Route("api/blockpreview")]
    public class BlockPreviewController : Controller
    {
        private readonly IPreviewSettings _settings;
        private readonly BlockGridPropertyValueConverter _blockGridPropertyValueConverter;
        private readonly BlockListPropertyValueConverter _blockListPropertyValueConverter;
        private readonly IContentTypeService _contentTypeService;
        private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
		private readonly ILogger _logger;
		private readonly IFakeViewEngine _fakeViewEngine;
		private readonly IBlockHelper _blockHelper;
        private readonly IPublishedValueFallback _publishedValueFallback;
        private readonly ModelsBuilderSettings modelsBuilderSettings;
        public BlockPreviewController(
			IFakeViewEngine fakeViewEngine,
            IPreviewSettings previewSettings,
            IBlockHelper blockHelper,
			IContentTypeService contentTypeService,
			IPublishedContentTypeFactory publishedContentTypeFactory,
            IPublishedValueFallback publishedValueFallback,

            BlockGridPropertyValueConverter blockGridPropertyValueConverter,
            BlockListPropertyValueConverter blockListPropertyValueConverter,
			ILogger logger)
        {
            _fakeViewEngine = fakeViewEngine;
            _settings = previewSettings;
            _blockHelper = blockHelper;
            _blockGridPropertyValueConverter = blockGridPropertyValueConverter;
			_blockListPropertyValueConverter = blockListPropertyValueConverter;
            _contentTypeService = contentTypeService;
			_publishedContentTypeFactory = publishedContentTypeFactory;
            _publishedValueFallback = publishedValueFallback;
            _logger = logger;
            modelsBuilderSettings = new ModelsBuilderSettings();
        }


        [HttpPost]
        public async Task<IActionResult> Render([FromBody] RenderingPayloadBellissima scope)
		{
			var content = scope.Content;
            var settings = scope.Settings;
            var elementTypeId = scope.ContentElementTypeKey;
            var settingsElementTypeId = scope.SettingsElementTypeKey;
            var controllerName = string.Empty;
            var blockType = scope.BlockType;
			var htmlString = string.Empty;
            
            
            try
			{
                var contentModel = _blockHelper.TypedIPublishedElement(elementTypeId, content);
                var settingsModel = settings != null ? _blockHelper.TypedIPublishedElement(settingsElementTypeId, settings) : null;
                controllerName = _contentTypeService.Get(Guid.Parse(elementTypeId)).Name;
                var blockItemType = blockType == PreviewConstants.BlockTypeGrid ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
                Type[] typeArray = settings != null ? [contentModel.GetType(), settingsModel.GetType()] : [contentModel.GetType()];
                Type blockElementType = blockItemType.MakeGenericType(typeArray);
                ConstructorInfo? ctor = blockElementType.GetConstructor(new[]
               {
                    typeof(Udi),
                    contentModel.GetType(),
                    typeof(Udi),
                    settings != null ? settings.GetType() : typeof(IPublishedElement)
                });

                object blockGridItemInstance = ctor!.Invoke(new object[]
                {
                        Udi.Create("element",Guid.NewGuid()),
                        contentModel!,
                        Udi.Create("element",Guid.NewGuid()),
                        settingsModel
                });
                //Type[] typeArray = settingsType != null ? [controllerType, settingsType] : [controllerType];
                //var blockElementType = blockItemType.MakeGenericType(typeArray);


                /*
            var ctype = _contentTypeService.Get(Guid.Parse(pageAlias));
            var ptype = _contentTypeService.Get(Guid.Parse(elementTypeId));
            var iptype = _publishedContentTypeFactory.CreateContentType(ctype);


            var test = iptype.GetType();
            var propType = iptype.GetPropertyType(propAlias);
            controllerName = ptype.Alias;
            */
                /*
				BlockGridModel bgm = null;
				BlockListModel blm = null;
				BlockGridItem bgi = null;
				BlockListItem bli = null;

                if (propType.DataType.EditorAlias == Constants.PropertyEditors.Aliases.BlockGrid)
				{
					bgm = (BlockGridModel)_blockGridPropertyValueConverter.ConvertIntermediateToObject(null, propType, PropertyCacheLevel.None, content, true);
					
					foreach (var item in bgm)
					{
						bgi = _blockHelper.DigForBlockGridItem(item, payloadContentExtractor.Target);
						if (bgi != null) break;
					}

					controllerName = bgi.Content.ContentType.Alias;
                    blockType = PreviewConstants.BlockTypeGrid;
				}
				else if (propType.DataType.EditorAlias == Constants.PropertyEditors.Aliases.BlockList)
				{
					blockType = PreviewConstants.BlockTypeList;
					blm = (BlockListModel)_blockListPropertyValueConverter.ConvertIntermediateToObject(null, propType, PropertyCacheLevel.None, content, true);

                    foreach (var item in blm)
                    {
                        bli = _blockHelper.DigForBlockListItem(item, payloadContentExtractor.Target);
                        if (bli != null) break;
                    }
                    controllerName = bli.Content.ContentType.Alias;
                }

				if (bgm == null && blm == null) return Ok(new { html = PreviewConstants.BlockBeamValue });

                // check if we need to filter on Alias
                if (_settings.PackageSettings.EnableFor != null && _settings.PackageSettings.EnableFor.Any())
                {
                    if (!_settings.PackageSettings.EnableFor.Contains(controllerName))
                    {
                        return Ok(new { html = PreviewConstants.BlockBeamValue });
                    }
                }
                if (_settings.PackageSettings.DisableFor != null && _settings.PackageSettings.DisableFor.Any())
                {
                    if (_settings.PackageSettings.DisableFor.Contains(controllerName))
                    {
                        return Ok(new { html = PreviewConstants.BlockBeamValue });
                    }
                }
				*/


                object blockInstanceItem = blockGridItemInstance;// _blockHelper.BlockInstance(controllerName, blockType, bgm != null ? bgi : bli);
                
                var formattedViewPath = string.Format("{0}.cshtml", controllerName);
				var viewPath = (blockType == PreviewConstants.BlockTypeGrid ? _settings.PackageSettings.GridViewPath : _settings.PackageSettings.BlockViewPath) + formattedViewPath;

				Dictionary<string, object> viewData = new Dictionary<string, object>();
				if (blockType == PreviewConstants.BlockTypeGrid && _settings.PackageSettings.AreaReplace.HasValue && _settings.PackageSettings.AreaReplace.Value)
                    viewData[PreviewConstants.ViewDataRenderGridAreaSlot] = PreviewConstants.RenderGridAreaSlotValue;
                
				htmlString = await _fakeViewEngine.RenderView(ControllerContext.HttpContext, viewPath, controllerName, blockInstanceItem, scope.ContentId, viewData);
				htmlString = _fakeViewEngine.BootstrapJs(htmlString);
				htmlString = _fakeViewEngine.StripLinks(htmlString);

				return Ok(new { html = htmlString });
			}
			catch (Exception e)
			{
				if(_settings.PackageSettings.Debug.HasValue && _settings.PackageSettings.Debug.Value)
                {
                    _logger.Error(e, "Error rendering block preview");
                }
                return Ok(new { html = PreviewConstants.BlockBeamValue });
			}
        }

		[HttpGet]
        public IActionResult Settings()
		{
			return Ok(_settings.PackageSettings);
        }
    }
}
