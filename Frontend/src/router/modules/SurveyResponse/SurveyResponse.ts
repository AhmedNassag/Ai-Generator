export default [

     {
          path: '/survey-response/:id',
          name: 'SurveyResponse',
          component: () => import("@/views/Page/SurveyResponse/SurveyResponse.vue"),
           meta: {
               title: 'Survey Responses',
          },
     },

];