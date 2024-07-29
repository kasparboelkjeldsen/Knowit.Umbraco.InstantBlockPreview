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

namespace Knowit.Umbraco.InstantBlockPreview.Shared
{
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;

    public class PackageSettings
    {
        [JsonProperty("renderType")]
        public string? RenderType { get; set; }

        [JsonProperty("gridViewPath")]
        public string? GridViewPath { get; set; }

        [JsonProperty("blockViewPath")]
        public string? BlockViewPath { get; set; }

        [JsonProperty("injections")]
        public IEnumerable<string> Injections { get; set; }

        [JsonProperty("ssrUrl")]
        public string? SSRUrl { get; set; }

        [JsonProperty("ssrApiUrl")]
        public string? SSRApiUrl { get; set; }
        [JsonProperty("ssrSecret")]
        public string? SSRSecret { get; set;}

        [JsonProperty("ssrSelector")]
        public string? SSRSelector { get; set; }

        [JsonProperty("enableFor")]
		public IEnumerable<string> EnableFor { get; set; }

        [JsonProperty("disableFor")]
		public IEnumerable<string> DisableFor { get; set; }
	}
}
