using Knowit.Umbraco.InstantBlockPreview.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Web.Common.Controllers;

namespace Knowit.Umbraco.InstantBlockPreview.Headless.Controllers.API
{
    public class PreviewRenderingController : UmbracoApiController
    {
        

        private readonly IApiElementBuilder _apiElementBuilder;
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly Settings _settings;
        private readonly BlockHelper _blockHelper;
        public PreviewRenderingController(IApiElementBuilder apiElementBuilder, BlockEditorConverter blockEditorConverter, IConfiguration configuration)
        {
            _apiElementBuilder = apiElementBuilder;
            _blockEditorConverter = blockEditorConverter;
            _blockHelper = new BlockHelper(_blockEditorConverter);
            _settings = new Settings(configuration);
        }

        [HttpPost("umbraco/api/PreviewRendering/RenderComponent")]
        public async Task<IActionResult> RenderComponent(RenderingPayload scope)
        {
            if (scope == null || scope.ControllerName == null || scope.Content == null || scope.BlockType == null)
            {
                return Ok(new { html = "Missing parameters" });
            }

            var content = scope.Content;
            var settings = scope.Settings;

            // as we are (ab)using content delivery api, we need to bust the cache so it will refresh every time
            // changing the udi is only an issue if we were saving the data, but as we are just using it to generate previews
            // everything is fine
            var matches = Regex.Matches(content, @"umb://element/[\w\d]+");

            foreach (Match match in matches)
            {
                var cacheBusterUdi = Udi.Create("element", Guid.NewGuid());
                content = content.Replace(match.Value, cacheBusterUdi.ToString());
            }

            var controllerName = scope.ControllerName![0].ToString().ToUpper() + scope.ControllerName.Substring(1);

            var blockItemInstance = InstantiateAsContentDeliveryApiResponse(content, settings, controllerName, scope.BlockType);

            var ssrUrl = this._settings.PackageSettings.SSRUrl;
            var ssrSecret = this._settings.PackageSettings.SSRSecret;
            var ssrApi = this._settings.PackageSettings.SSRApiUrl;

            if(ssrUrl is null || ssrSecret is null || ssrApi is null)
            {
                return Ok(new { html = "SSR settings are not configured" });
            }

            // Create an instance of JsonSerializerSettings
            var jsSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

            var json = JsonConvert.SerializeObject(blockItemInstance, jsSettings);

            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
            };

            using (var client = new HttpClient(handler))
            {
                // Set the Authorization header with the bearer token
                client.DefaultRequestHeaders.Add("knowit-umbraco-instantblock-preview-secret", ssrSecret);

                // Set up the request content with the JSON payload
                var ssrcontent = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                // Perform the POST request to the specified URL
                var response = await client.PostAsync(ssrApi, ssrcontent);

                // Ensure the request was successful
                response.EnsureSuccessStatusCode();

                // Read the response content as a string (HTML in this case)
                var key = await response.Content.ReadAsStringAsync();


                if(string.IsNullOrEmpty(key))
                {
                    return Ok(new { html = "Failed to retrieve data" });
                }
                var htmlContent = await client.GetStringAsync(ssrUrl + "?key=" + key);

                
                var html = this._settings.PackageSettings.SSRSelector is not null ? _blockHelper.ExtractValueFromHtml(htmlContent, this._settings.PackageSettings.SSRSelector) : htmlContent;

                if(this._settings.PackageSettings.Injections is not null)
                {
                    html = string.Join("\n", this._settings.PackageSettings.Injections) + "\n" + html;
                }

                return Ok(new { html });

            }
        }

        private object? InstantiateAsContentDeliveryApiResponse(string? content, string? settings, string? controllerName, string? blockType)
        {
            var model = _blockHelper.InstantiateFromJson(content, settings, controllerName, blockType, null);

            if (model is BlockGridItem blockGridModel)
            {
                // borrowed from umbracos source code
                ApiBlockGridItem CreateApiBlockGridItem(BlockGridItem item)
                => new ApiBlockGridItem(
                    _apiElementBuilder.Build(item.Content),
                    item.Settings != null
                        ? _apiElementBuilder.Build(item.Settings)
                        : null,
                    item.RowSpan,
                    item.ColumnSpan,
                    item.AreaGridColumns ?? blockGridModel.GridColumns ?? 12,
                    item.Areas.Select(CreateApiBlockGridArea).ToArray());

                ApiBlockGridArea CreateApiBlockGridArea(BlockGridArea area)
                => new ApiBlockGridArea(
                    area.Alias,
                    area.RowSpan,
                    area.ColumnSpan,
                    area.Select(CreateApiBlockGridItem).ToArray());

                return new ApiBlockGridModel(blockGridModel.GridColumns ?? 12, new List<ApiBlockGridItem>() { CreateApiBlockGridItem(blockGridModel) });
            }
            // todo: add support for other models like BlockListItem
            return model;
        }

        
    }
}
