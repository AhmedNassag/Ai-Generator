export default [

     {
          path: '/assessments-results',
          name: 'AssessmentsResults',
          component: () => import("@/views/Page/AssessmentsResults/AssessmentsResults.vue"),
           meta: {
               title: 'Assessments Results',
          },
     },
      //questionnaire-results
      {
          path: '/questionnaire-results',
          name: 'QuestionnaireResults',
          component: () => import("@/views/Page/AssessmentsResults/QuestionnaireResults.vue"),
           meta: {
               title: 'Risk',
          },
     }
];
