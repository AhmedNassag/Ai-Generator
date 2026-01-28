export default [

     {
          path: '/phishing-domain',
          name: 'PhishingDomain',
          component: () => import("@/views/Page/PhishingDomain/PhishingDomain.vue"),
           meta: {
               title: 'PhishingDomain',
          },
     },
     {
          path: '/domain-websites/:id',
          name: 'DomainWebsites',
          component: () => import("@/views/Page/PhishingDomain/PhishingWebsitePage.vue"),
           meta: {
               title: "Phishing Domain Websites",
          },
     }
];