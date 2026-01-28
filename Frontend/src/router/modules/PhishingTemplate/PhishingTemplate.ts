export default [

     {
          path: '/phishing-template',
          name: 'PhishingTemplate',
          component: () => import("@/views/Page/PhishingTemplate/PhishingTemplate.vue"),
           meta: {
               title: 'PhishingTemplate',
          },
     },
     {
          path: '/previwe-mail/:userId/:campaignId/:templateId/:status',
          name: 'PhishingTemplateDetail',
          component: () => import("@/views/Page/PhishingTemplate/PhishingTemplateDetail.vue"),
          meta: {
               title: 'PhishingTemplateDetail',
               requiresAuth: false,
               hideMenu: true,
               hideFooter: true
          },
     }
];