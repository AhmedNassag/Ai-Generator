export default [

     {
          path: '/meeting',
          name: 'Meeting',
          component: () => import("@/views/Page/Meeting/Meeting.vue"),
          meta: {
               title: 'Meeting',
          },
     },
     {
          path: '/meeting-details/:id',
          name: 'MeetingDetails',
          component: () => import("@/views/Page/Meeting/MeetingDetails.vue"),
          meta: {
               title: 'MeetingDetails',
          },
     }
];