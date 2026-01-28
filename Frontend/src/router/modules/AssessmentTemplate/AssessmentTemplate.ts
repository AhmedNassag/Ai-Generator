export default [
  {
    path: "/assessment-template",
    name: "AssessmentTemplate",
    component: () =>
      import("@/views/Page/AssessmentTemplate/AssessmentTemplate.vue"),
    meta: {
      title: "Assessment Template",
    },
  },
  {
    path: "/add-questions/:id",
    name: "AddQuestions",
    component: () => import("@/views/Page/AssessmentTemplate/AddQuestions.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Add Questions",
    },
  },
];
