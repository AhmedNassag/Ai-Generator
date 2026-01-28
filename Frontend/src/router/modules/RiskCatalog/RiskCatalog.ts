export default [

     {
          path: '/risk-catalog',
          name: 'RiskCatalog',
          component: () => import("@/views/Page/RiskCatalog/RiskCatalog.vue"),
           meta: {
               title: 'Risk Catalog',
          },
     }
];