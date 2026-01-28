export default [
     {
          path: '/category',
          name: 'Category',
          component: () => import("@/views/Page/Category/Category.vue"),
          meta: {
               title: '#Default# | Category'
          },
     }
];