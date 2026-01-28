export default [
     {
          path: '/survey-response/answer/out/:id',
          name: 'SurveyAnswerOut',
          component: () => import("@/views/Page/SurveyResponse/SurveyAnswerOut.vue"),
           meta: {
               title: 'Survey Answer',
          },
     },
];