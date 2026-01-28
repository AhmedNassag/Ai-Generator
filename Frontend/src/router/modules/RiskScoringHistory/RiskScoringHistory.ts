export default [

     {
          path: '/risk-scoring-history',
          name: 'RiskScoringHistory',
          component: () => import("@/views/Page/RiskScoringHistory/RiskScoringHistory.vue"),
           meta: {
               title: 'GRC | RiskScoringHistory',
          },
     }
];