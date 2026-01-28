export default [

     {
          path: '/user-report',
          name: 'UserReport',
          component: () => import("@/views/Page/UserReport/UserReport.vue"),
          meta: {
               title: 'GRC | UserReport',
          },

     },
     {
          path: '/user-report/:id',
          name: 'UserReportDetails',
          component: () => import("@/views/Page/UserReport/Report.vue"),
          meta: {
               title: 'GRC | UserReport',
          },
     }
];