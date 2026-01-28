export default [

     {
          path: '/my-works',
          name: 'MyWorks',
          component: () => import("@/views/Page/MyWorks/MyWorks.vue"),
           meta: {
               title: 'GRC | MyWorks',
          },
     }
];