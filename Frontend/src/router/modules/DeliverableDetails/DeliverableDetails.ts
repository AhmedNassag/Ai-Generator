export default [

     {
          path: '/deliverable-details/:id',
          name: 'DeliverableDetails',
          component: () => import("@/views/Page/Deliverable/DeliverableDetails.vue"),
           meta: {
               title: 'GRC | DeliverableDetails',
          },
     }
];