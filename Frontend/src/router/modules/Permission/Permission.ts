export default [

     {
          path: '/permission',
          name: 'Permission',
          component: () => import("@/views/Page/Permission/Permission.vue"),
           meta: {
               title: 'Permission',
          },
     }
];