export default [

     {
          path: '/physical-course-attendance',
          name: 'PhysicalCourseAttendance',
          component: () => import("@/views/Page/PhysicalCourseAttendance/PhysicalCourseAttendance.vue"),
           meta: {
               title: 'GRC | PhysicalCourseAttendance',
          },
     }
];