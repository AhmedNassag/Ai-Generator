export default [

     {
          path: '/email-config',
          name: 'EmailConfig',
          component: () => import("@/views/Page/EmailConfig/EmailConfig.vue"),
           meta: {
               title: 'Email Config',
          },
     }
];