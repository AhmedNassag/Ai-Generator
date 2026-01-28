export default [

     {
          path: '/agenda-details/:id',
          name: 'AgendaDetails',
          component: () => import("@/views/Page/Agenda/AgendaDetails.vue"),
          meta: {
               title: 'AgendaDetails',
          },
     }
];