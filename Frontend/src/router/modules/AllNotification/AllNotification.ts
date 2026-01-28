export default [

     {
          path: '/all-notification',
          name: 'AllNotification',
          component: () => import("@/views/Page/AllNotification/AllNotification.vue"),
           meta: {
               title: 'GRC | AllNotification',
          },
     }
];