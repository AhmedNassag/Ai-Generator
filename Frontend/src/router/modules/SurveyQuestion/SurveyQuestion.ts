export default [

     {
    path: "/view-questions/:id",
    name: "SurveyQuestion",
    component: () => import("@/views/Page/SurveyQuestion/SurveyQuestion.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Survey Questions",
    },
     }
];