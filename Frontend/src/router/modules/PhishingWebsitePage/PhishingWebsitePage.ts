export default [

     {
          path: '/phishing-website-page',
          name: 'PhishingWebsitePage',
          component: () => import("@/views/Page/PhishingWebsitePage/PhishingWebsitePage.vue"),
           meta: {
               title: 'PhishingWebsitePage',
          },
     },

     // {
     //      path: '/:url/:id',
     //      name: 'PreviewWebsitePage',
     //      component: () => import("@/views/Page/PhishingWebsitePage/PreviewWebsitePage.vue"),
     //       meta: {
     //           title: 'PreviewWebsitePage',
     //      },
     // },

     {
          path: '/PreviewWebsitePage/:id',
          name: 'PreviewWebsitePage',
          component: () => import('@/views/Page/PhishingWebsitePage/PreviewWebsitePage.vue'),
          meta: { title: 'PreviewWebsitePage' }
     }
];