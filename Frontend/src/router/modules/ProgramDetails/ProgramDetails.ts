export default [
  {
    path: "/program-details/:id/:tabName?",
    name: "ProgramDetails",
    component: () => import("@/views/Page/Program/ProgramDetails.vue"),
    meta: {
      title: "GRC | ProgramDetails",
    },
  },
];
