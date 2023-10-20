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
        public string RenderType { get; set; } = "app";

        [JsonProperty("gridViewPath")]
        public string GridViewPath { get; set; } = "~/Views/Partials/blockgrid/Components/";

        [JsonProperty("blockViewPath")]
        public string BlockViewPath { get; set; } = "~/Views/Partials/blocklist/Components/";

        [JsonProperty("appViewPath")]
        public string AppViewPath { get; set; } = "~/Views/Rendering/RenderingPreview.cshtml";
    }
    public class ConfigurePackageSettings : IConfigureOptions<PackageSettings>
    {
        public void Configure(PackageSettings options)
        {
            // Set default values
            options.RenderType = "app";
            options.GridViewPath = "~/Views/Partials/blockgrid/Components/";
            options.BlockViewPath = "~/Views/Partials/blocklist/Components/";
            options.AppViewPath = "~/Views/Rendering/RenderingPreview.cshtml";
        }
    }

    public class CustomComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            var configuration = builder.Services.BuildServiceProvider().GetService<IConfiguration>();
            var section = configuration.GetSection("Knowit:Umbraco:InstantBlockPreview");

            if (section.Exists())
            {
                builder.Services.Configure<PackageSettings>(section);
            }
            else
            {
                builder.Services.AddSingleton<IConfigureOptions<PackageSettings>, ConfigurePackageSettings>();
            }
        }
    }
}
