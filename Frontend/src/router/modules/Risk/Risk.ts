export default [

     {
          path: '/Risk',
          name: 'Risk',
          component: () => import("@/views/Page/Risk/Risk.vue"),
           meta: {
               title: 'Risk Management',
          },
         
     },
      //simpleWizard
      {
          path: '/CreateRisk',
          name: 'CreateRisk',
          component: () => import("@/views/Page/Risk/CreateRisk.vue"),
           meta: {
               title: 'Create Risk',
          },
     },
     {
          path: '/RiskManagement/:id',
          name: 'RiskManagement',
          component: () => import("@/views/Page/Risk/RiskManagement.vue"),
           meta: {
               title: 'Risk Management',
          },
     }
];