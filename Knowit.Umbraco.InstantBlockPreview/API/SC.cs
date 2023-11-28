using Newtonsoft.Json;

namespace Knowit.Umbraco.InstantBlockPreview.API
{
    public partial class GridViewRenderingController
    {
        public class SC
        {
            [JsonProperty("content")]
            public string? Content { get; set; }
            [JsonProperty("settings")]
            public string? Settings { get; set; }
            [JsonProperty("controllerName")]
            public string? ControllerName { get; set; }
            [JsonProperty("blockType")]
            public string? BlockType { get; set; }

            [JsonProperty("isApp")]
            public bool IsApp { get; set; }

            [JsonProperty("contentId")]
            public int ContentId { get; set; }
        }
    }
}

