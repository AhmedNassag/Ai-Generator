export default [

     {
          path: '/framework-install',
          name: 'FrameworkInstall',
          component: () => import("@/views/Page/FrameworkInstall/FrameworkInstall.vue"),
           meta: {
               title: "Framework Install",
          },
     }
];