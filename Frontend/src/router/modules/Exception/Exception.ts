export default [

     {
          path: '/exception',
          name: 'Exception',
          component: () => import("@/views/Page/Exception/Exception.vue"),
           meta: {
               title: 'Exception',
          },
     }
];