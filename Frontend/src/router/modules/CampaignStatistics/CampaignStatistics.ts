export default [

     {
          path: '/campaign-statistics',
          name: 'CampaignStatistics',
          component: () => import("@/views/Page/CampaignStatistics/CampaignStatistics.vue"),
           meta: {
               title: 'CampaignStatistics',
          },
     }
];