export default [
  {
    path: "/frameworks/:id",
    name: "FrameworkDetails",
    component: () =>
      import("@/views/Page/FrameworkDetails/FrameworkDetails.vue"),
    props: true,
    meta: {
      title: "Framework Details",
    },
  },
  {
    path: "/frameworks/statistics/:id",
    name: "FrameworkStatistics",
    component: () =>
      import("@/views/Page/FrameworkDetails/FrameworkStatistics.vue"),
    props: true,
    meta: {
      title: "Framework Details",
    },
  },
];
