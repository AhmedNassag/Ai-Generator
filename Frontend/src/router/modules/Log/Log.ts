export default [

     {
          path: '/log',
          name: 'Log',
          component: () => import("@/views/Page/Log/Log.vue"),
          meta: {
               title: 'Log',
          },
     }
];