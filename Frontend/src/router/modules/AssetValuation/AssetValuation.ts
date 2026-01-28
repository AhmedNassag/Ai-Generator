export default [

     {
          path: '/asset-valuation',
          name: 'AssetValuation',
          component: () => import("@/views/Page/AssetValuation/AssetValuation.vue"),
          meta: {
               title: 'Asset Valuation',
          },
     }
];