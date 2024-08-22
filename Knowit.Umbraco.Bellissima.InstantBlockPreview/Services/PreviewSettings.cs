using Knowit.Umbraco.Bellissima.InstantBlockPreview.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public class PreviewSettings : IPreviewSettings
    {
        public PackageSettings PackageSettings { get; set; }

        public PreviewSettings(IConfiguration configuration)
        {
            var settings = configuration.GetSection("Knowit.Umbraco.InstantBlockPreview")?.Get<PackageSettings>();

            if (settings == null)
            {
                PackageSettings = new PackageSettings()
                {
                    BlockViewPath = "~/Views/Partials/blocklist/Components/",
                    GridViewPath = "~/Views/Partials/blockgrid/Components/",
                    RenderType = "razor",
                    AreaReplace = true,
                };
            }
            else PackageSettings = settings;

            if (PackageSettings.BlockViewPath == null)
            {
                PackageSettings.BlockViewPath = "~/Views/Partials/blocklist/Components/";
            }
            if (PackageSettings.GridViewPath == null)
            {
                PackageSettings.GridViewPath = "~/Views/Partials/blockgrid/Components/";
            }
            if (PackageSettings.RenderType == null)
            {
                PackageSettings.RenderType = "razor";
            }
            if(PackageSettings.AreaReplace == null  )
            {
                PackageSettings.AreaReplace = true;
            }
        }
    }
}
