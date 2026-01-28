export default [

     {
          path: '/internal-audit-result',
          name: 'InternalAuditResult',
          component: () => import("@/views/Page/InternalAudit/InternalAuditResult.vue"),
           meta: {
               title: 'GRC | InternalAuditResult',
          },
     }
];