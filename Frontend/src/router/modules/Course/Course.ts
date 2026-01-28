export default [

     {
          path: '/course',
          name: 'Course',
          component: () => import("@/views/Page/Course/Course.vue"),
           meta: {
               title: 'Courses Management',
          },
     }
];