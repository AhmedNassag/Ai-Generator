export default [

     {
          path: '/third-party-request-setting',
          name: 'ThirdPartyRequestSetting',
          component: () => import("@/views/Page/ThirdPartyRequestSetting/ThirdPartyRequestSetting.vue"),
           meta: {
               title: 'Third Party Request Setting',
          },
     }
];