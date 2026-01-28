export default [

     {
          path: '/system-setting',
          name: 'SystemSetting',
          component: () => import("@/views/Page/SystemSetting/SystemSetting.vue"),
           meta: {
               title: 'System Setting',
          },
     }
];