export default [

     {
          path: '/phishing-sender-profile',
          name: 'PhishingSenderProfile',
          component: () => import("@/views/Page/PhishingSenderProfile/PhishingSenderProfile.vue"),
           meta: {
               title: 'PhishingSenderProfile',
          },
     }
];