export default [

     {
          path: '/third-party-contact-questionnaire-answer',
          name: 'ThirdPartyContactQuestionnaireAnswer',
          component: () => import("@/views/Page/ThirdPartyContactQuestionnaireAnswer/ThirdPartyContactQuestionnaireAnswer.vue"),
           meta: {
               title: 'Questionnaire Result',
          },
     }
];