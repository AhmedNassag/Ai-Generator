export default [

     {
          path: '/asset',
          name: 'Asset',
          component: () => import("@/views/Page/Asset/Asset.vue"),
          meta: {
               title: 'Asset Management',
          },
     }
];