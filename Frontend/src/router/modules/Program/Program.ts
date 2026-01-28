export default [

     {
          path: '/program',
          name: 'Program',
          component: () => import("@/views/Page/Program/Program.vue"),
           meta: {
               title: 'GRC | Program',
          },
     }
];