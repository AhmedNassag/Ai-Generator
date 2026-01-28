export default [
     {
          path: '/strategic-plan',
          name: 'StrategicPlan',
          component: () => import("@/views/Page/StrategicPlan/StrategicPlan.vue"),
          meta: {
               title: 'Strategic Plan',
          },
     }
];