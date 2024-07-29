using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Knowit.Umbraco.InstantBlockPreview.Shared
{
    public class Settings
    {
        public PackageSettings PackageSettings { get; set; }
        public Settings(IConfiguration configuration)
        {
            var settings = configuration.GetSection("Knowit.Umbraco.InstantBlockPreview")?.Get<PackageSettings>();

            if (settings == null)
            {
                PackageSettings = new PackageSettings()
                {
                    BlockViewPath = "~/Views/Partials/blocklist/Components/",
                    GridViewPath = "~/Views/Partials/blockgrid/Components/",
                    RenderType = "razor",
                };
              
            }
            else PackageSettings = settings;
        }
    }
}
