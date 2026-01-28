export default [

     {
          path: '/assessment',
          name: 'Assessment',
          component: () => import("@/views/Page/Assessment/Assessment.vue"),
           meta: {
               title: 'Assessment',
          },
     },
     {
       path: "/assessment/:id",
       name: "Assessment Form",
       component: () => import("@/views/Page/Assessment/AssessmentForm.vue"),
       props: true, 
       meta: {
         title: "Assessment Form",
       },
     },
];
