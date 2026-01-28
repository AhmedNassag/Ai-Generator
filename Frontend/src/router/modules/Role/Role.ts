export default [

     {
          path: '/role',
          name: 'Role',
          component: () => import("@/views/Page/Role/Role.vue"),
          meta: { title: "Role Management" }
     }
];