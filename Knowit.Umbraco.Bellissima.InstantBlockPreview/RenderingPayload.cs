using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Knowit.Umbraco.InstantBlockPreview.Shared
{
    public class RenderingPayload
    {
        [JsonProperty("content")]
        public string? Content { get; set; }
        [JsonProperty("settings")]
        public string? Settings { get; set; }

        [JsonProperty("layout")]
        public string? Layout { get; set; }
        [JsonProperty("controllerName")]
        public string? ControllerName { get; set; }
        [JsonProperty("blockType")]
        public string? BlockType { get; set; }


        [JsonProperty("contentId")]
        public int ContentId { get; set; }
     
    }

	public class RenderingPayloadBellissima
	{
		
		public string? Content { get; set; }
		
		
		public string? ContentId { get; set; }

		
		public string? PropertyTypeAlias { get; set; }

		public string? ContentTypeId { get; set; }

	}

    public class PayloadContentExtractor
    {
		[JsonPropertyName("contentData")]
		public IEnumerable<PayloadContentExtractorContent> ContentData { get; set; }
    }
    public class PayloadContentExtractorContent
    {
		[JsonPropertyName("contentTypeKey")]
		public string? ContentTypeKey { get; set; }
	}
}
