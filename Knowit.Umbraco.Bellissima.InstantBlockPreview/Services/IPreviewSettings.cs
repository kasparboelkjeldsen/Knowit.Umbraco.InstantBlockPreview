using Knowit.Umbraco.Bellissima.InstantBlockPreview.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public interface IPreviewSettings
    {
        public PackageSettings PackageSettings { get; set; }
    }
}
