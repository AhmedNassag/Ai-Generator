export default [

     {
          path: '/user-lms-training-module',
          name: 'UserLmsTrainingModule',
          component: () => import("@/views/Page/UserLmsTrainingModule/UserLmsTrainingModule.vue"),
           meta: {
               title: 'Lms Training Modules',
          },
     }
];
