export default [

     {
          path: '/internal-audit',
          name: 'InternalAudit',
          component: () => import("@/views/Page/InternalAudit/InternalAudit.vue"),
           meta: {
               title: 'GRC | InternalAudit',
          },
     },
     {
          path: '/internal-audit/:id',
          name: 'InternalAuditDetails',
          component: () => import("@/views/Page/InternalAudit/InternalAuditResult.vue"),
           meta: {
               title: 'GRC | InternalAudit',
          },
     }
];