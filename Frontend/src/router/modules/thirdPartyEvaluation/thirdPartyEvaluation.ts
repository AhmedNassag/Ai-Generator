export default [

     {
          path: '/third-party-evaluation',
          name: 'ThirdPartyEvaluation',
          component: () => import("@/views/Page/thirdPartyEvaluation/thirdPartyEvaluation.vue"),
           meta: {
               title: 'Third Party Evaluation',
          },
     }
];