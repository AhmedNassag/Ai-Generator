export default [

     {
          path: '/location',
          name: 'Location',
          component: () => import("@/views/Page/Location/Location.vue"),
           meta: {
               title: 'Location',
          },
     }
];