export default [

     {
          path: '/department',
          name: 'Department',
          component: () => import("@/views/Page/Department/Department.vue"),
           meta: {
               title: 'Departments',
          },
     }
];