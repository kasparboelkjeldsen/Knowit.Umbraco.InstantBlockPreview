using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview
{
    public class PreviewConstants
    {
        public const string BlockBeamValue = "blockbeam";
        public const string ViewDataRenderGridAreaSlot = "renderGridAreaSlots";
        public const string RenderGridAreaSlotValue = "###renderGridAreaSlots";
        public const string ViewDataBlockPreview = "blockPreview";
        public const string ViewDataAssignedContentId = "assignedContentId";
        public const string BlockTypeGrid = "grid";
        public const string BlockTypeList = "list";

        // regex
        public const string RegexMatchHref = @"href\s*=\s*[""'].*?[""']";
        public const string RegexMatchOnClick = @"href\s*=\s*[""'].*?[""']";

        // bootstrap
        public const string ScriptBootStrap = "<script></script>";
    }
}
