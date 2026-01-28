export default [

     {
          path: '/host-region',
          name: 'hostRegion',
          component: () => import("@/views/Page/hostRegion/hostRegion.vue"),
           meta: {
               title: 'Host Region',
          },
     }
];