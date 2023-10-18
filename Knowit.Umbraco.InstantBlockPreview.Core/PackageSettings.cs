using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Knowit.Umbraco.InstantBlockPreview.Core
{
    public class PackageSettings
    {
        [JsonProperty("renderType")]
        public string? RenderType { get; set; }
        [JsonProperty("gridViewPath")]
        public string? GridViewPath { get; set; }
        [JsonProperty("blockViewPath")]
        public string? BlockViewPath { get; set; }
        [JsonProperty("appViewPath")]
        public string? AppViewPath { get; set; }
    }
}
