export default [
  {
    path: "/audit-policy-compliance/:type",
    name: "AuditPolicyCompliance",
    component: () =>
      import("@/views/Page/AuditPolicyCompliance/AuditPolicyCompliance.vue"),
    meta: {
      title: "AuditPolicyCompliance",
    },
  },
  {
    path: "/audit-policy-compliance/result/:id/:audieeId",
       name: "AuditPolicyCompliance-Result",
    component: () =>
      import(
        "@/views/Page/AuditPolicyCompliance/ComplianceResultAudit.vue"
      ),
    meta: {
      title: "AuditPolicyCompliance",
    },
  }
];
