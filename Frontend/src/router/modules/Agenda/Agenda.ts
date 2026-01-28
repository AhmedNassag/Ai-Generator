export default [

     {
          path: '/agenda',
          name: 'Agenda',
          component: () => import("@/views/Page/Agenda/Agenda.vue"),
          meta: {
               title: 'Agenda',
          },
     }
];