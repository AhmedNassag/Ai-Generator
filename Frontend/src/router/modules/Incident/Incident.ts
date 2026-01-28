export default [

     {
          path: '/incident',
          name: 'Incident',
          component: () => import("@/views/Page/Incident/Incident.vue"),
           meta: {
               title: 'Incident',
          },
     }
];