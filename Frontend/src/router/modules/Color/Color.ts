export default [

     {
          path: '/color',
          name: 'Color',
          component: () => import("@/views/Page/Color/Color.vue"),
           meta: {
               title: 'Department Color',
          },
     }
];