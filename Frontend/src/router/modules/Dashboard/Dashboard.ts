export default [

     {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import("@/views/Page/Dashboard/Dashboard.vue"),
           meta: {
               title: 'GRC | Dashboard',
          },
     }
];