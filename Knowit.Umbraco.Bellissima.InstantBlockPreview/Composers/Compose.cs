using Knowit.Umbraco.Bellissima.InstantBlockPreview.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Composers
{
    public class Compose : IComposer
    {
        void IComposer.Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddScoped<IFakeViewEngine, FakeViewEngine>();
            builder.Services.AddScoped<IPreviewSettings, PreviewSettings>();
            builder.Services.AddScoped<IBlockHelper, BlockHelper>();
        }
    }
}
