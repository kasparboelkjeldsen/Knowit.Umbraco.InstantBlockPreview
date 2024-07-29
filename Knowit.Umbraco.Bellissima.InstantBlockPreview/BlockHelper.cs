using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using StackExchange.Profiling.Internal;
using System.Collections.Concurrent;
using System.Reflection;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core;
using HtmlAgilityPack;
using Fizzler.Systems.HtmlAgilityPack;
using System;

namespace Knowit.Umbraco.InstantBlockPreview.Shared
{
    public class BlockHelper
    {
        static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();

        private readonly BlockEditorConverter _blockEditorConverter;
        public BlockHelper(BlockEditorConverter blockEditorConverter)
        {
            _blockEditorConverter = blockEditorConverter;
        }
        public string ExtractValueFromHtml(string htmlContent, string cssSelector)
        {
            // Load the HTML content into an HtmlDocument
            var htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(htmlContent);

            // Use the QuerySelector method to find the element
            var node = htmlDocument.DocumentNode.QuerySelector(cssSelector);

            // If the node is found, return its inner content; otherwise, return null or an appropriate message
            return node != null ? node.InnerHtml : null;
        }
        public object InstantiateFromJson(string? content, string? settings, string? controllerName, string? blockType, string? layout)
        {
            // try to deserialize to BlockItemData, while ignoring all errors
            BlockItemData? bid = JsonConvert.DeserializeObject<BlockItemData>(content!);

            IPublishedElement? settingsModel = null;

            if (settings.HasValue())
            {
                BlockItemData? set = JsonConvert.DeserializeObject<BlockItemData>(settings!);
                settingsModel = _blockEditorConverter.ConvertToElement(set!, PropertyCacheLevel.Element, true);
            }

            var controllerKey = blockType + controllerName;
            // convert to IPublishedElement
            var model = _blockEditorConverter.ConvertToElement(bid!, PropertyCacheLevel.Element, true);

            // we cannot avoid using some reflection to make this dynamic
            Type? controllerType, blockItemType, blockElementType;
            if (!controllerToTypes.ContainsKey(controllerKey))
            {
                // get the typed model of the controller/view
                controllerType = model!.GetType();
                // create generic type BlockGridItem<T> where T is the typed model
                blockItemType = blockType == "grid" ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
                blockElementType = blockItemType.MakeGenericType(controllerType);

                controllerToTypes.TryAdd(controllerKey, (controllerType, blockItemType, blockElementType));
            }
            else
            {
                // or just load everything from the static dictionary since we've done this all before
                (controllerType, blockItemType, blockElementType) = controllerToTypes[controllerKey];
            }

            // create our constructor from this signature
            // public BlockGridItem(Udi contentUdi, T content, Udi settingsUdi, IPublishedElement settings)
            // public BlockListItem(Udi contentUdi, T content, Udi settingsUdi, IPublishedElement settings)
            ConstructorInfo? ctor = blockElementType.GetConstructor(new[]
            {
                typeof(Udi),
                controllerType,
                typeof(Udi),
                settingsModel != null ? settingsModel.GetType() : typeof(IPublishedElement)
            });

            // use reflection to instantiate our BlockGridItem<T> with the typed model
            object blockGridItemInstance = ctor!.Invoke(new object[]
            {
                Udi.Create("element",Guid.NewGuid()),
                model!,
                Udi.Create("element",Guid.NewGuid()),
                settingsModel! //todo something something block settings
            });

            if (layout != null)
            {
                try
                {
                    JObject jsonObject = JObject.Parse(layout);

                    // Retrieve the columnSpan and rowSpan values
                    int columnSpan = jsonObject["columnSpan"].Value<int>();
                    int rowSpan = jsonObject["rowSpan"].Value<int>();
                    PropertyInfo? columnSpanProperty = blockGridItemInstance.GetType().GetProperty("ColumnSpan");
                    if (columnSpanProperty != null && columnSpanProperty.CanWrite)
                    {
                        columnSpanProperty.SetValue(blockGridItemInstance, columnSpan);
                    }
                    PropertyInfo? rowSpanProperty = blockGridItemInstance.GetType().GetProperty("RowSpan");
                    if (rowSpanProperty != null && rowSpanProperty.CanWrite)
                    {
                        rowSpanProperty.SetValue(blockGridItemInstance, rowSpan);
                    }
                }
                catch { }
            }


            return blockGridItemInstance;
        }
    }
}
