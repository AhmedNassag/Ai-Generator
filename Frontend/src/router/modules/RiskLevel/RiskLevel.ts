export default [

     {
          path: '/risk-level',
          name: 'RiskLevel',
          component: () => import("@/views/Page/RiskLevel/RiskLevel.vue"),
           meta: {
               title: 'Risk Levels',
          },
     }
];