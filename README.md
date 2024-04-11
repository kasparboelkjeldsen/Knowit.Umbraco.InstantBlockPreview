# Knowit.Umbraco.InstantBlockPreview

A package for Umbraco that enables instant previews in the back office for Block Grid and Block List element types, without the need to save the document first. This package was heavily inspired by [Rick Butterfield's Block Preview package](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview). It also introduces experimental support for generating previews using JavaScript frameworks like Vue or React.

The package supports Umbraco 10 (without headless capabilities as those rely on Content Delivery API)
Umbraco 12 and Umbraco 13

Umbraco 11 isn't possible as I differentiate the features on .net version and since both Umbraco 11 and 12 share .Net 7, I can't support Umbraco 11 as it doesn't include Content Delivery Api.

## Features
- Instant preview for Block Grid and Block List element types.
- No document save required to perform a preview.
- Supports rendering through ViewComponents (Block Grid Only)
- Supports rendering with HTML fetched from an SSR app
- Experimental support for preview generation through a JavaScript app.


## Configuration
Configuration is optional, if you are happy with the standard values, you don't need to add anything to your `appsettings.json`. 

The following values are available for configuration:

```json
"Knowit.Umbraco.InstantBlockPreview": {
  "renderType": "razor",
  "gridViewPath": "~/Views/Partials/blockgrid/Components/",
  "blockViewPath": "~/Views/Partials/blocklist/Components/",
  "appViewPath": "~/Views/Rendering/RenderingPreview.cshtml",
  "enableBlockEdit": false,
  "ssrApiUrl": "https://localhost:3000/api/blockPreview",
  "ssrUrl": "https://localhost:3000/blockPreview",
  "ssrSecret": "my-ssr-secret",
  "ssrSelector": "#__nuxt",
  "injections": []
}
```
### Configuration values

renderType - The type of rendering to use. Can be either `razor` or `app`. Default is `razor`.

gridviewPath - The path to the Block Grid views. Default is `~/Views/Partials/blockgrid/Components/`.

blockViewPath - The path to the Block List views. Default is `~/Views/Partials/blocklist/Components/`.

appViewPath - The path to the Rendering Preview view. Default is that the api just returns predefined HTML. See section about app-preview.

injections - In short, a way to add lines of code to the start of the preview-HTML. Use it to inject your web-components JS or your app or something else!

enableBlockEdit - If true, will trigger an edit overlay when clicking on a block item in backoffice. Default is `false`.

ssr* - see SSR section for description

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

### SSR Preview

To allow an SSR app (Next/Nuxt etc) to provide a preview for the plugin, you will need to wire up some stuff yourself.

When renderType is set to "ssr" the behavior of the preview api changes and will attempt to do the following

It will send a POST to the "ssrApiUrl" with whatever you've put in "ssrSecret" as an | Authorization: Bearer <your secret> | header. The POST BODY will include standard Content Delivery API Json in the form of a Grid or Blocklist entry depending on what you're doing.

It will expect to receive a string back which will act as a key for the next call. It will then perform a GET call to "ssrUrl" with ?key=returnedKeyFromApi appended and again with the authorization header.

Your application needs to return server-side rendered HTML back from that request.

So on your end.

- Api needs to recieve JSON from POST and save/cache it somehow with a key, and return the key as response
- Preview Url needs to return preview-HTML when given the key through a GET request

"ssrSelector" is an optional option to narrow the amount of HTML returned to Umbraco. You can put in #__next/#__nuxt or any other valid css selector and the API will only return the INNERHTML of that selector to Umbraco for a cleaner HTML output.

#### Example

You've set up a grid element with a rich text editor to use Instant Block Preview and have just now entered some text and hit save.

1) The Javascript sends your changes to Instant Block Preview API 
2) Instant Block Preview API sends a POST request to https://localhost:3000/api/blockPreview with following BODY:
```json
{"gridColumns":12,"items":[{"rowSpan":0,"columnSpan":0,"areaGridColumns":12,"areas":[],"content":{"id":"554991cb-dfa4-43fd-85ba-9c9b0213438e","contentType":"text","properties":{"richText":{"markup":"<p>Test 123</p>","blocks":[]}}},"settings":null}]}
```
as well as an Authorization header with your secret key
3) Your app, whatever it may be, recieves the call, verifies the secret key and caches the json in a way where your app will be able to retrieve it with just a string key you've just generated. Could just be current time in microseconds or a guid or something else
4) Your app returns the string key as response (example key "lutvdx1hghiz4w9suye")
5) Instant Block Preview now makes a GET request to https://localhost:3000/blockPreview?key=lutvdx1hghiz4w9suye with the same authorization headers set
6) Your app retrieves the JSON from it's cache with the key, and renders the HTML just like you would with a normal response from the Content Delivery API
7) Instant Block Preview recieves the Html and (optionally) filters it down to the css selector you've sendt in "ssrSelector" and returns that Html to be previewed in Umbraco



### App Preview (Experimental)
For the experimental app preview, make sure to use the injections parameter to insert the required JS of your app. 

If nothing else is defined in the configuration, the API will output the following HTML to boostrap your app
```html
<div id=""app{0}""></div>
<script>
    const el = document.querySelector('#app{0}');
    let event = new CustomEvent('init-preview-app', { detail: { element: el, seed: '{0}' } });
    window.dispatchEvent(event);

    function callWhenExists(funcName, el, timeout = 10) {
        if (typeof window[funcName] === 'function') {
            window[funcName](el);
        } else {
            setTimeout(() => callWhenExists(funcName, el, timeout), timeout);
        }
    }
    callWhenExists('init-preview-app' + '{0}', el);
</script>
```

JavaScript example for handling preview generation:

```javascript
window.addEventListener('init-preview-app', data => {
      const i = data.detail;
      const app = createApp(App);
      app.config.globalProperties.$seed = i.seed;

      window['init-preview-app'+i.seed] = function(element) {
        if(element) {
          app.mount(element);
        }
      }
    })
```
```javascript
mounted() {
    console.log('mount', this.isBackoffice)
    console.log('seed', this.$seed)
    if (this.isBackoffice) {
      window.addEventListener(`event-${this.$seed}`, data => {
        this.reloadPreview(JSON.parse(data.detail));
      })
    }
  },
```
## Demo
This repository contains a barebones Vue example using the Content Delivery API to build a headless version of the Vue app and a preview generating version of the same app.

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
