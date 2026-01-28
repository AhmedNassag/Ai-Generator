export default [

     {
          path: '/question',
          name: 'Question',
          component: () => import("@/views/Page/Question/Question.vue"),
           meta: {
               title: 'Question',
          },
     },
];