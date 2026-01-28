export default [

     {
          path: '/project',
          name: 'Project',
          component: () => import("@/views/Page/Project/Project.vue"),
           meta: {
               title: 'Project',
          },
     }
];