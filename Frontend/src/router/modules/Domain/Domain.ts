export default [

     {
          path: '/domain',
          name: 'Domain',
          component: () => import("@/views/Page/Domain/Domain.vue"),
           meta: {
               title: "Domains",
          },
     }
];