export default [
  {
    path: "/task",
    name: "Task",
    component: () => import("@/views/Page/Task/Task.vue"),
    meta: {
      title: "Task Management",
    },
  },
];