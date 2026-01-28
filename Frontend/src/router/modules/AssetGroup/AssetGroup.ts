export default [

     {
          path: '/group-asset',
          name: 'AssetGroup',
          component: () => import("@/views/Page/AssetGroup/AssetGroup.vue"),
          meta: {
               title: 'Asset Group',
          },
     }
];