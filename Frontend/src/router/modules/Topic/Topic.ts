export default [

     {
          path: '/topic',
          name: 'Topic',
          component: () => import("@/views/Page/Topic/Topic.vue"),
           meta: {
               title: '#Default# | Topic',
          },
     }
];