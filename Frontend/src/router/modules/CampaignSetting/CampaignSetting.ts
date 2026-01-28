export default [

     {
          path: '/campaign-setting',
          name: 'CampaignSetting',
          component: () => import("@/views/Page/CampaignSetting/CampaignSetting.vue"),
          meta: {
               title: 'Campaign Setting',
          },
     }
];