using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Knowit.Umbraco.InstantBlockPreview.Core.NotificationHandlers
{
    /*
    public class TreeRenderingNotificationHandler : INotificationHandler<TreeNodesRenderingNotification>
    {
        public void Handle(TreeNodesRenderingNotification notification)
        {
            if (!string.Equals(notification.TreeAlias, "staticFiles", StringComparison.Ordinal)
                || !string.Equals(notification.Id, "-1", StringComparison.Ordinal)) return;

            notification.Nodes.Add(new TreeNode(HttpUtility.HtmlEncode($"App_Plugins/Knowit.Umbraco.InstantBlockPreview/gridView.html"), null, null, null)
            {
                HasChildren = false,
                Icon = "icon-document",
                Name = "grid.html",
                ParentId = "-1"
            });
            notification.Nodes.Add(new TreeNode(HttpUtility.HtmlEncode($"App_Plugins/Knowit.Umbraco.InstantBlockPreview/blockView.html"), null, null, null)
            {
                HasChildren = false,
                Icon = "icon-document",
                Name = "block.html",
                ParentId = "-1"
            });
        }
    }

    internal class TreeRendering : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddNotificationHandler<TreeNodesRenderingNotification, TreeRenderingNotificationHandler>();
        }

    }*/
}
