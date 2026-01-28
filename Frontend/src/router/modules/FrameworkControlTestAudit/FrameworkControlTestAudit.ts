export default [
  {
    path: "/framework-control-test-audit/:type",
    name: "FrameworkControlTestAudit",
    component: () =>
      import(
        "@/views/Page/FrameworkControlTestAudit/FrameworkControlTestAudit.vue"
      ),
    meta: {
      title: "FrameworkControlTestAudit",
    },
  },
  {
    path: "/framework-control-test-audit/result/:id",
    name: "FrameworkControlTestAudit-Result",
    component: () =>
      import(
        "@/views/Page/FrameworkControlTestAudit/componentResultAudit/mainStep.vue"
      ),
    meta: {
      title: "FrameworkControlTestAuditResult",
    },
  },
];
