export default [

     {
          path: '/project-details/:id',
          name: 'ProjectDetails',
          component: () => import("@/views/Page/Project/ProjectDetails.vue"),
           meta: {
               title: 'ProjectDetails',
          },
     }
];