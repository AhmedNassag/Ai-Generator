export default [

     {
          path: '/workflow',
          name: 'Workflow',
          component: () => import("@/views/Page/Workflow/Workflow.vue"),
           meta: {
               title: 'GRC | Workflow',
          },
     }
];