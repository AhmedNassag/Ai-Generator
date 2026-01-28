export default [
     {
          path: '/phone',
          name: 'Phone',
          component: () => import("@/views/Page/Phone/Phone.vue"),
          meta: {
               title: '#Default# | Phone'
          },
     }
];