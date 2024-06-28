# Knowit.Umbraco.InstantBlockPreview (and Knowit.Umbraco.InstantBlockPreview.Headless)

A package-set for Umbraco that enables instant previews in the Umbraco Backoffice for Block Grid and Block List element types, without the need to save the document first. This package was heavily inspired by [Rick Butterfield's Block Preview package](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview).

Knowit.Umbraco.InstantBlockPreview currently supports Umbraco 10 to 13 - 14 is in the works
Knowit.Umbraco.InstantBlockPreview.Headless currently supports Umbraco 12 and 13 - 14 is in the works

The two packages are sharing this readme file, as they share a lot of code and functionality. 

With version 1.0 I've chosen to simplify things by splitting the functionality up in Knowit.Umbraco.InstantBlockPreview which is for tradition MVC and Knowit.Umbraco.InstantBlockPreview.Headless which is, you guessed it, headless.

## Features
- Instant preview for Block Grid and Block List element types.
- No document save required to perform a preview.
- MVC: Supports rendering through ViewComponents (Block Grid Only)
- Headless: Supports rendering with HTML fetched from an SSR app (if you're using Knowit.Umbraco.InstantBlockPreview.Headless)

## Configuration

MVC: Configuration is optional, if you are happy with the standard values, you don't need to add anything to your `appsettings.json`. 

Headless: Configuration is mandatory as the package has no way of knowing where to fetch the preview HTML from.


MVC: The following values are available for configuration:

```json
"Knowit.Umbraco.InstantBlockPreview": {
  "gridViewPath": "~/Views/Partials/blockgrid/Components/",
  "blockViewPath": "~/Views/Partials/blocklist/Components/",
  "injections": []
}
```

Headless: The following values are available for configuration:

```json
"Knowit.Umbraco.InstantBlockPreview": {
  "ssrApiUrl": "https://localhost:3000/api/blockPreview",
  "ssrUrl": "https://localhost:3000/blockPreview",
  "ssrSecret": "my-ssr-secret",
  "ssrSelector": "#__nuxt",
  "injections": []
}
```

### MVC Configuration values

gridviewPath - The path to the Block Grid views. Default is `~/Views/Partials/blockgrid/Components/`.

blockViewPath - The path to the Block List views. Default is `~/Views/Partials/blocklist/Components/`.

injections - In short, a way to add lines of code to the start of the preview-HTML. Use it to inject your web-components JS or your app or something else!


### Headless Configuration values

ssrApiUrl - The URL to the API that will recieve the JSON from Umbraco.

ssrUrl - The URL to the API that will return the HTML to Umbraco.

ssrSecret - A secret key that will be sent to the API to verify that the request is coming from Umbraco.

injections - In short, a way to add lines of code to the start of the preview-HTML. Use it to inject your web-components JS or your app or something else!

Read more under "Headless Preview"

### Umbraco Cloud
Currently to deploy this package on a Umbraco Cloud solution, the following is required to be added to your web projects .csproj file:

```xml
<PropertyGroup>
    <ErrorOnDuplicatePublishOutputFiles>false</ErrorOnDuplicatePublishOutputFiles>
</PropertyGroup>
```

### Razor View
Implement your views normally. Set `gridView.html` for Block Grid and `listview.html` for Block List, which are installed by this package in `app_plugins/Knowit.Umbraco.InstantBlockPreview`. They render through a razor view engine in the frontend and show in the back office. You can include special code to run only in the back office like so:

```csharp
@if (ViewBag.blockPreview != null)
{
    <p style="color:red">I am only visible in backoffice</p>
}
```

Umbraco.AssignedContentItem.Id will not work in your previews as the content is temporary and not assigned to anything.

A workaround if you must have a reference in your view to the content the element is assigned, something like this can be used.

```csharp
var id = ViewBag.blockPreview ? ViewBag.assignedContentId : Umbraco.AssignedContentItem.Id;
```

### Headless Preview

To allow an Headless app (Next/Nuxt etc) to provide a preview for the plugin, you will need to wire up some stuff yourself.

It will send a POST to the "ssrApiUrl" with whatever you've put in "ssrSecret" as an "knowit-umbraco-instantblock-preview-secret" header. The POST BODY will include standard Content Delivery API Json in the form of a Grid or Blocklist entry depending on what you're doing.

It will expect to receive a string back which will act as a key for the next call. It will then perform a GET call to "ssrUrl" with ?key=returnedKeyFromApi appended and again with the authorization header.

Your application needs to return server-side rendered HTML back from that request.

So on your end.

- Api needs to recieve JSON from POST and save/cache it somehow with a key, and return the key as response
- Preview Url needs to return preview-HTML when given the key through a GET request

"ssrSelector" is an optional option to narrow the amount of HTML returned to Umbraco. You can put in body/#__nuxt or any other valid css selector and the API will only return the INNERHTML of that selector to Umbraco for a cleaner HTML output.

#### Example

You've set up a grid element with a rich text editor to use Instant Block Preview and have just now entered some text and hit save.

1) The Javascript sends your changes to Instant Block Preview API 
2) Instant Block Preview API sends a POST request to https://localhost:3000/api/blockPreview with following BODY:
```json
{"gridColumns":12,"items":[{"rowSpan":0,"columnSpan":0,"areaGridColumns":12,"areas":[],"content":{"id":"554991cb-dfa4-43fd-85ba-9c9b0213438e","contentType":"text","properties":{"richText":{"markup":"<p>Test 123</p>","blocks":[]}}},"settings":null}]}
```
as well as an header with your secret key
3) Your app, whatever it may be, recieves the call, verifies the secret key and caches the json in a way where your app will be able to retrieve it with just a string key you've just generated. Could just be current time in microseconds or a guid or something else
4) Your app returns the string key as response (example key "lutvdx1hghiz4w9suye")
5) Instant Block Preview now makes a GET request to https://localhost:3000/blockPreview?key=lutvdx1hghiz4w9suye with the same authorization headers set
6) Your app retrieves the JSON from it's cache with the key, and renders the HTML just like you would with a normal response from the Content Delivery API
7) Instant Block Preview recieves the Html and (optionally) filters it down to the css selector you've sendt in "ssrSelector" and returns that Html to be previewed in Umbraco

## Umbraco Login
test@test.dk
instantblock

## FileWatcher
Is used to move App_Plugins from package to Umbraco 12 project.
Gulp 4 is required.
To get started:
npm install --global gulp-cli
npm install
npm i
gulp

## License
[MIT](LICENSE)
