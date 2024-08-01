using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Blocks;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public interface IBlockHelper
    {
        object BlockInstance(string controllerName, string blockType, object block);

        BlockGridItem DigForBlockGridItem(BlockGridItem model, string target);

        BlockListItem DigForBlockListItem(BlockListItem model, string target);
    }
}
