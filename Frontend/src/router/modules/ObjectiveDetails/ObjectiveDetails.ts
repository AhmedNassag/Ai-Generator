export default [

     {
          path: '/objective-details/:id',
          name: 'ObjectiveDetails',
          component: () => import("@/views/Page/Objective/ObjectiveDetails.vue"),
           meta: {
               title: 'GRC | ObjectiveDetails',
          },
     }
];