export default [

     {
          path: '/lms-level',
          name: 'LMS Courses',
          component: () => import("@/views/Page/Course/Course.vue"),
           meta: {
               title: 'LMS Courses',
          },
     }
];