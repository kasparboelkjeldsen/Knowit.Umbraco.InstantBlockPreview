using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using static Microsoft.AspNetCore.Razor.Language.TagHelperMetadata;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public class BlockHelper : IBlockHelper
    {
        static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();
        public object BlockInstance(string controllerName, string blockType, object block)
        {
            var controllerKey = string.Empty;
            var areas = block is BlockGridItem ? ((BlockGridItem)block).Areas : null;
            var model = block is BlockGridItem ? ((BlockGridItem)block).Content : ((BlockListItem)block).Content;
            var settings = block is BlockGridItem ? ((BlockGridItem)block).Settings : ((BlockListItem)block).Settings;

            Type controllerType, blockItemType, blockItemType2, blockElementType, settingsType;

            if (!controllerToTypes.ContainsKey(controllerKey))
            {
                controllerType = model!.GetType();
                settingsType = settings?.GetType();

                // todo, detect settings.

                blockItemType = blockItemType = blockType == PreviewConstants.BlockTypeGrid ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
                blockItemType2 = blockType == PreviewConstants.BlockTypeGrid ? typeof(BlockGridItem<,>) : typeof(BlockListItem<,>);

                Type[] typeArray = settingsType != null ? [controllerType, settingsType] : [controllerType];

                try
                {
                    blockElementType = blockItemType.MakeGenericType(typeArray);
                }
                catch
                {
                    blockElementType = blockItemType2.MakeGenericType(typeArray);
                }
            }
            else
            {
                // or just load everything from the static dictionary since we've done this all before
                (controllerType, blockItemType, blockElementType) = controllerToTypes[controllerKey];
            }

            ConstructorInfo? ctor = blockElementType.GetConstructor(new[]
                {
                    typeof(Udi),
                    controllerType,
                    typeof(Udi),
                    settings != null ? settings.GetType() : typeof(IPublishedElement)
                });

            object blockGridItemInstance = ctor!.Invoke(new object[]
            {
                    Udi.Create("element",Guid.NewGuid()),
                    model!,
                    Udi.Create("element",Guid.NewGuid()),
                    settings
            });
            if(areas != null)
            {
                var blockGridItemInstanceWithAreas = (BlockGridItem)blockGridItemInstance;
                blockGridItemInstanceWithAreas.Areas = areas;
                return blockGridItemInstanceWithAreas;
            }
            else
            {
                return blockGridItemInstance;
            }
        }

        public BlockGridItem DigForBlockGridItem(BlockGridItem model, string target)
        {

            if (model.ContentUdi.UriValue.ToString() == target) return model;

            foreach (var area in model.Areas)
            {
                foreach (var content in area)
                {
                    var dig = DigForBlockGridItem(content, target);
                    if (dig != null) return dig;
                }
            }

            return null;
        }

        public BlockListItem DigForBlockListItem(BlockListItem model, string target)
        {
            if (model.ContentUdi.UriValue.ToString() == target) return model;

            return null;
        }
    }
}
