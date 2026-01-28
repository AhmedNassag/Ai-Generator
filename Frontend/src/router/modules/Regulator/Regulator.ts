export default [

     {
          path: '/regulator',
          name: 'Regulator',
          component: () => import("@/views/Page/Regulator/Regulator.vue"),
           meta: {
               title: 'Regulator',
          },
     }
];