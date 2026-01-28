export default [

     {
          path: '/committee',
          name: 'Committee',
          component: () => import("@/views/Page/Committee/Committee.vue"),
          meta: {
               title: 'Committee',
               mainTrKeys: ["committee"],
          },
     },

     {
          path: '/committee-details/:id',
          name: 'committeeDetails',
          component: () => import("@/views/Page/Committee/CommitteeDetails.vue"),
          meta: {
               title: 'Committee Details',
               mainTrKeys: ["committee", "agenda", "topic"],
          },
     }
];