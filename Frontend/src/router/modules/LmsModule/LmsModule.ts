export default [

     {
          path: '/lms-module',
          name: 'LMS Courses',
          component: () => import("@/views/Page/Course/Course.vue"),
           meta: {
               title: 'LMS Courses',
          },
     }
];