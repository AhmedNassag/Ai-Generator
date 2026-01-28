export default [

     {
          path: '/asset-category',
          name: 'assetCategory',
          component: () => import("@/views/Page/assetCategory/assetCategory.vue"),
           meta: {
               title: 'Asset Category',
          },
     }
];