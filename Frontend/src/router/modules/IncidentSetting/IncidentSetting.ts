export default [

     {
          path: '/incident-setting',
          name: 'IncidentSetting',
          component: () => import("@/views/Page/IncidentSetting/IncidentSetting.vue"),
           meta: {
               title: 'GRC | IncidentSetting',
          },
     }
];