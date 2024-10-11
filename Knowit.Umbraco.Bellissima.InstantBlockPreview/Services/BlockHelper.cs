using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;
using static Microsoft.AspNetCore.Razor.Language.TagHelperMetadata;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public class BlockHelper : IBlockHelper
    {
        static readonly ConcurrentDictionary<string, (Type, Type, Type)> controllerToTypes = new();
        private readonly IContentTypeService _contentTypeService;
        private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
        private readonly IPublishedValueFallback _publishedValueFallback;
        private readonly ModelsBuilderSettings modelsBuilderSettings;
        public BlockHelper(
            IContentTypeService contentTypeService,
            IPublishedContentTypeFactory publishedContentTypeFactory,
            IPublishedValueFallback publishedValueFallback)
        {
            _contentTypeService = contentTypeService;
            _publishedContentTypeFactory = publishedContentTypeFactory;
            _publishedValueFallback = publishedValueFallback;
            modelsBuilderSettings = new ModelsBuilderSettings();
        }

        public object TypedIPublishedElement(string type, string content)
        {
            var elementtype = _contentTypeService.Get(Guid.Parse(type));
            var publishedElementType = _publishedContentTypeFactory.CreateContentType(elementtype);


            Dictionary<string, object?> data = JsonSerializer.Deserialize<Dictionary<string, object?>>(content);
            Dictionary<string, object?> deserializedData = ConvertJsonElement(data);
            IPublishedElement publishedElement = new PublishedElement(publishedElementType, Guid.NewGuid(), deserializedData, true);

            var elementModelName = elementtype.Name;
            var modelsNameSpace = modelsBuilderSettings.ModelsNamespace;
            string fullTypeName = $"{modelsNameSpace}.{elementModelName}";
            Assembly targetAssembly = AppDomain.CurrentDomain
                .GetAssemblies()
                .FirstOrDefault(assembly => assembly.GetTypes().Any(t => t.FullName == fullTypeName));

            Type modelType = targetAssembly.GetType(fullTypeName);
            object[] constructorArgs = new object[] { publishedElement, _publishedValueFallback };
            object modelInstance = Activator.CreateInstance(modelType, constructorArgs);

            return modelInstance;
        }

        public static Dictionary<string, object?> ConvertJsonElement(Dictionary<string, object?> dictionary)
        {
            var result = new Dictionary<string, object?>();

            foreach (var kvp in dictionary)
            {
                if (kvp.Value is JsonElement element)
                {
                    result[kvp.Key] = ConvertJsonValue(element);
                }
                else if (kvp.Value is Dictionary<string, object?> nestedDict)
                {
                    result[kvp.Key] = ConvertJsonElement(nestedDict);
                }
                else
                {
                    result[kvp.Key] = kvp.Value;
                }
            }

            return result;
        }

        // Converts individual JsonElement to its base type
        public static object? ConvertJsonValue(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.Object => ConvertJsonElement(JsonSerializer.Deserialize<Dictionary<string, object?>>(element.GetRawText())),
                JsonValueKind.Array => ConvertJsonArray(element),
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.TryGetInt64(out long l) ? l : (object)element.GetDouble(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                _ => element.GetRawText(),
            };
        }

        // Handles conversion of JSON arrays
        public static object?[] ConvertJsonArray(JsonElement arrayElement)
        {
            var result = new List<object?>();

            foreach (var item in arrayElement.EnumerateArray())
            {
                result.Add(ConvertJsonValue(item));
            }

            return result.ToArray();
        }
    }
}
