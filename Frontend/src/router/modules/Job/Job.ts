export default [

     {
          path: '/job',
          name: 'Job',
          component: () => import("@/views/Page/Job/Job.vue"),
           meta: {
               title: 'Jobs Management',
          },
     }
];