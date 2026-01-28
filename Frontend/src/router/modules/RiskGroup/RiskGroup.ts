export default [

     {
          path: '/group-risk',
          name: 'RiskGroup',
          component: () => import("@/views/Page/RiskGroup/RiskGroup.vue"),
          meta: {
               title: 'Risk Group',
          },
     }
];