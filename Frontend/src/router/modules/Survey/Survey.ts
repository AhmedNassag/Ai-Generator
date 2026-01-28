export default [
  {
    path: "/survey",
    name: "Survey",
    component: () => import("@/views/Page/Survey/Survey.vue"),
    meta: {
      title: "Surveys",
    },
  },
  {
    path: "/view-questions/:id",
    name: "SurveyQuestion",
    component: () => import("@/views/Page/SurveyQuestion/SurveyQuestion.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Survey Questions",
    },
  },

    {
    path: "/questions-response/:id",
    name: "QuestionsResponse",
    component: () => import("@/views/Page/Survey/QuestionsResponse.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Survey Results",
    },
  },
];
