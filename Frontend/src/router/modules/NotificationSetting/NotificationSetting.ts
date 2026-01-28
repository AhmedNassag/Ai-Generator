export default [
  {
    path: "/notification-setting/:filterProp?",
    name: "NotificationSetting",
    component: () =>
      import("@/views/Page/NotificationSetting/NotificationSetting.vue"),
    meta: {
      title: "GRC | NotificationSetting",
      mainTrKeys: ["notificationsetting", "role"],
    },
    props: true,
  },
];
