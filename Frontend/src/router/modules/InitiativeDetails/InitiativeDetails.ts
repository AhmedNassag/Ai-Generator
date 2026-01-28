export default [

     {
          path: '/initiative-details/:id',
          name: 'InitiativeDetails',
          component: () => import("@/views/Page/Initiative/InitiativeDetails.vue"),
           meta: {
               title: 'GRC | InitiativeDetails',
          },
     }
];