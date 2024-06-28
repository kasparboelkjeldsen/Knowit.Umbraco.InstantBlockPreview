﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
}
