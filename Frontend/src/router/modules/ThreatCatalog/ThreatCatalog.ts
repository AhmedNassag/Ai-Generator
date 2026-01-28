export default [

     {
          path: '/threat-catalog',
          name: 'ThreatCatalog',
          component: () => import("@/views/Page/ThreatCatalog/ThreatCatalog.vue"),
           meta: {
               title: 'Threat Catalog',
          },
     }
];