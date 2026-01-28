export default [

     {
          path: '/general-settings',
          name: 'GeneralSettings',
          component: () => import("@/views/Page/GeneralSettings/GeneralSettings.vue"),
           meta: {
               title: 'General Settings',
          },
     }
];