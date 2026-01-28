export default [

     {
          path: '/operating-system',
          name: 'operatingSystem',
          component: () => import("@/views/Page/operatingSystem/operatingSystem.vue"),
           meta: {
               title: 'Operating System',
          },
     }
];