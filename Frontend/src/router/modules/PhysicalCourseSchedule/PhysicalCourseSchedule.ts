export default [

     {
          path: '/physical-course-schedule',
          name: 'PhysicalCourseSchedule',
          component: () => import("@/views/Page/PhysicalCourseSchedule/PhysicalCourseSchedule.vue"),
           meta: {
               title: 'GRC | PhysicalCourseSchedule',
          },
     }
];