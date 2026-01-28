export default [
  {
    path: "/team",
    name: "Team",
    component: () => import("@/views/Page/Team/Team.vue"), // the component path
    meta: {
      title: "Team",
    },
  },
];
