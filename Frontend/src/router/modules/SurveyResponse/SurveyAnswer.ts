export default [
     {
          path: '/survey-response/answer/:id',
          name: 'SurveyAnswer',
          component: () => import("@/views/Page/SurveyResponse/SurveyAnswer.vue"),
           meta: {
               title: 'Survey Answer',
          },
     },
];