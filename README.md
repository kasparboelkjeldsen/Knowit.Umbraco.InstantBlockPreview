# Knowit.Umbraco.InstantBlockPreview

A package for Umbraco that enables instant previews in the back office for Block Grid and Block List element types, without the need to save the document first. This package was heavily inspired by [Rick Butterfield's Block Preview package](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview). It also introduces experimental support for generating previews using JavaScript frameworks like Vue or React.

## Features
- Instant preview for Block Grid and Block List element types.
- No document save required to perform a preview.
- Experimental support for preview generation through a JavaScript app.

## Configuration

Add the following section to your `appsettings.json`:

```json
"Knowit.Umbraco.InstantBlockPreview": {
  "renderType": "razor",
  "gridViewPath": "~/Views/Partials/blockgrid/Components/",
  "blockViewPath": "~/Views/Partials/blocklist/Components/",
  "appViewPath": "~/Views/Rendering/RenderingPreview.cshtml"
}
```

### Render Type
- `razor`: Use regular razor views for rendering.
- `app`: Render through a JavaScript app.

### Razor View
Implement your views normally. Set `gridView.html` for Block Grid and `listview.html` for Block List, which are installed by this package in `app_plugins/Knowit.Umbraco.InstantBlockPreview`. They render through a razor view engine in the frontend and show in the back office. You can include special code to run only in the back office like so:

```csharp
@if (ViewBag.blockPreview != null)
{
    <p style="color:red">I am only visible in backoffice</p>
}
```

### App Preview (Experimental)
For the experimental app preview, create your own `RenderingPreview.cshtml` and update the config accordingly. Here’s an example with a Vue app:

```html
@*Your app scripts go here*@
<script src="~/dist/vueExample/js/chunk-vendors.js"></script>
<script src="~/dist/vueExample/js/app.js"></script>

@{
    string appName = "app" + ViewBag.seed;
}
<div id="@appName"></div>

<script>
    const el = document.querySelector('#@appName');
    let event = new CustomEvent('init-preview-app', { detail: { element: el, seed: '@ViewBag.seed' } });
    window.dispatchEvent(event);

    function callWhenExists(funcName, el, timeout = 10) {
        if (typeof window[funcName] === 'function') {
            window[funcName](el);
        } else {
            setTimeout(() => callWhenExists(funcName, el, timeout), timeout);
        }
    }
    callWhenExists('init-preview-app' + '@ViewBag.seed', el);
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

## License
[MIT](LICENSE)
