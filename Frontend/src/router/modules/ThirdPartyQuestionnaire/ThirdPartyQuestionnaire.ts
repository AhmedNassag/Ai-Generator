export default [

     {
          path: '/third-party-questionnaire',
          name: 'ThirdPartyQuestionnaire',
          component: () => import("@/views/Page/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire.vue"),
           meta: {
               title: 'Questionnaire',
          },
     }
];