export default [

     {
          path: '/strategic-plan-details/:id',
          name: 'StrategicPlanDetails',
          component: () => import("@/views/Page/StrategicPlan/StrategicPlanDetails.vue"),
           meta: {
               title: 'StrategicPlanDetails',
          },
     }
];