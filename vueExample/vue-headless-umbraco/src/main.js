import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // Ensure the path to router.js is correct


if(process.env.VUE_APP_BACKOFFICE === 'true') {

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

}
else { 
  const app = createApp(App);

  app.use(router);  // Ensure Vue Router is registered before mounting the app
  // Global click event listener to intercept <a> tag clicks
  document.addEventListener('click', event => {
    const { target } = event;
    if (target.tagName === 'A') {
      event.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        router.push(href);
      }
    }
  });

  app.mount('#vueapp');

}
