export default [

     {
          path: '/phishing-group',
          name: 'PhishingGroup',
          component: () => import("@/views/Page/PhishingGroup/PhishingGroup.vue"),
           meta: {
               title: 'PhishingGroup',
          },
     }
];