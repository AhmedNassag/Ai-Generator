export default [
  {
    path: "/task-details/:id",
    name: "TaskDetails",
    component: () => import("@/views/Page/SPTask/TaskDetails.vue"),
    meta: {
      title: "GRC | TaskDetails",
    },
  },
];