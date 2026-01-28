export default [

     {
          path: '/risk-close-reason',
          name: 'RiskCloseReason',
          component: () => import("@/views/Page/RiskCloseReason/RiskCloseReason.vue"),
          meta: {
               title: 'Risk Close Reason',
          },
     }
];