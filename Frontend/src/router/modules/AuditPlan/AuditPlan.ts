export default [
  {
    path: '/audit-plan',
    name: 'AuditPlan',
    component: () => import("@/views/Page/AuditPlan/AuditPlan.vue"),
    meta: { title: 'AuditPlan' },
  },
  {
    path: '/audit-summary/:frameworkId',
    name: 'AuditSummary',
    component: () => import("@/views/Page/AuditPlan/AuditSummary.vue"),
    meta: { title: 'AuditSummary' },
  },
  {
    path: '/audit-detail-graph-report/:frameworkId',
    name: 'AuditDetailGraphReport',
    component: () => import("@/views/Page/AuditPlan/AuditDetailGraphReport.vue"),
    meta: { title: 'AuditDetailGraphReport' },
  }
];
