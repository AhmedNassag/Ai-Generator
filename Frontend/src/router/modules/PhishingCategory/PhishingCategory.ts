export default [

     {
          path: '/phishing-category',
          name: 'PhishingCategory',
          component: () => import("@/views/Page/PhishingCategory/PhishingCategory.vue"),
           meta: {
               title: 'PhishingCategory',
          },
     },

     {
          path: '/phishing-category-websites/:id',
          name: 'PhishingCategoryWebsistes',
          component: () => import("@/views/Page/PhishingCategory/PhishingWebsitePage.vue"),
           meta: {
               title: 'PhishingCategory Websites',
          },
     }
];