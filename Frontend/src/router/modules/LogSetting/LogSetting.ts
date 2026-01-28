export default [
  {
    path: "/log-setting/:model",
    name: "LogSetting",
    component: () => import("@/views/Page/LogSetting/LogSetting.vue"),
    meta: {
      title: "Log Setting",
      mainTrKeys: ["logsetting", "role"],
    },
  },
];