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

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Helpers
{
    public class BlockHelper
    {
        static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();
        public static object BlockInstance(string controller, string blockType, object blockGridItem, bool comma)
        {
            var controllerKey = blockType + controller + comma;
            try
            {
                IPublishedElement model = blockGridItem is BlockGridItem ? ((BlockGridItem)blockGridItem).Content : ((BlockListItem)blockGridItem).Content;
                object settings = blockGridItem is BlockGridItem ? ((BlockGridItem)blockGridItem).Settings : ((BlockListItem)blockGridItem).Settings;

                Type? controllerType, blockItemType, blockElementType;


                if (!controllerToTypes.ContainsKey(controllerKey))
                {
                    // get the typed model of the controller/view
                    controllerType = model!.GetType();
                    var settingsType = settings?.GetType();
                    // create generic type BlockGridItem<T> where T is the typed model
                    if (!comma)
                        blockItemType = blockType == "grid" ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
                    else
                        blockItemType = blockType == "grid" ? typeof(BlockGridItem<,>) : typeof(BlockListItem<,>);

                    Type[] typeArray = settingsType != null ? [controllerType, settingsType] : [controllerType];
                    blockElementType = blockItemType.MakeGenericType(typeArray);

                    controllerToTypes.TryAdd(controllerKey, (controllerType, blockItemType, blockElementType));
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
                return blockGridItemInstance;
            }
            catch
            {
                controllerToTypes.Remove(controllerKey, out _);

                return null;
            }
        }
        public static BlockGridItem DigForBlockGridItem(BlockGridItem model, string target)
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
    }

   
}
