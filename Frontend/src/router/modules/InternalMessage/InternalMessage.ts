export default [

     {
          path: '/internal-message',
          name: 'InternalMessage',
          component: () => import("@/views/Page/InternalMessage/InternalMessage.vue"),
          meta: {
               title: 'Internal Messaging Center',
          },
     }
];