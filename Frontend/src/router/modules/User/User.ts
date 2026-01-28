export default [

     {
          path: 'user',
          name: 'User',
          component: () => import("@/views/Page/User/User.vue"),
           meta: {
               title: 'User Management',
          },
     },
     {
          path: 'profile',
          name: 'Profile',
          component: () => import("@/views/Page/User/Profile.vue"),
           meta: {
               title: 'Profile',
          },
     }
];