export default [

     {
          path: '/threat-group',
          name: 'threatGroup',
          component: () => import("@/views/Page/threatGroup/threatGroup.vue"),
           meta: {
               title: 'Threat Group',
          },
     }
];