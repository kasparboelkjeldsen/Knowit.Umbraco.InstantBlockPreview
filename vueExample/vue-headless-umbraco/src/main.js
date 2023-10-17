import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // Ensure the path to router.js is correct

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

if(process.env.VUE_APP_BACKOFFICE === 'true') {
  console.log('I know I am in backoffice')
  window.initPreview = function(element) {
    app.mount(element);
  }
}
else app.mount('#vueapp');
