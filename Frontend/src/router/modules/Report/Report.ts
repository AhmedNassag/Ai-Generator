export default [

     {
          path: '/report',
          name: 'Report',
          component: () => import("@/views/Page/Report/Report.vue"),
           meta: {
               title: 'GRC | Report',
          },
     }
];