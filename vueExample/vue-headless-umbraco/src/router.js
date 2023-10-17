import { createRouter, createWebHistory } from 'vue-router';
import DynamicLayout from '@/components/DynamicLayout.vue';
import { GetContent } from '@/util/getContent';
const routes = [
  {
      path: '/:pathMatch(.*)*',
      name: 'DynamicLayout',
      component: DynamicLayout,
      beforeEnter: async (to, from, next) => {
          try {
              to.params.data = await GetContent(to.path)
              next();
          } catch (error) {
              console.error(error);
              next(error);
          }
      }
  }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;  // Ensure the router instance is being exported
