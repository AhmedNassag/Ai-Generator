export default [

     {
          path: '/third-party-questionnaire-result',
          name: 'ThirdPartyQuestionnaireResult',
          component: () => import("@/views/Page/ThirdPartyQuestionnaireResult/ThirdPartyQuestionnaireResult.vue"),
           meta: {
               title: 'ThirdPartyQuestionnaireResult',
          },
     },    
     {
          path: '/third-party-questionnaire-answer/:id',
          name: 'ThirdPartyQuestionnaireAnswer',
          component: () => import("@/views/Page/ThirdPartyQuestionnaireResult/ThirdPartyQuestionnaireAnswer.vue"),
           meta: {
               title: 'Questionnaire Result',
          },
     }
];