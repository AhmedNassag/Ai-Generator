export default [

     {
          path: '/milestone-details/:id',
          name: 'MilestoneDetails',
          component: () => import("@/views/Page/Milestone/MilestoneDetails.vue"),
           meta: {
               title: 'MilestoneDetails',
          },
     }
];