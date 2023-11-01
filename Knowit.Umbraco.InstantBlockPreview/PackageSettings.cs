using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Knowit.Umbraco.InstantBlockPreview
{
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;

    public class PackageSettings
    {
        [JsonProperty("renderType")]
        public string RenderType { get; set; }

        [JsonProperty("gridViewPath")]
        public string GridViewPath { get; set; }

        [JsonProperty("blockViewPath")]
        public string BlockViewPath { get; set; }

        [JsonProperty("appViewPath")]
        public string AppViewPath { get; set; }

        [JsonProperty("enableBlockEdit")]
        public bool EnableBlockEdit { get; set; }
    }
}
