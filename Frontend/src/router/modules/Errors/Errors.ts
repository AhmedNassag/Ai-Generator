export default [

    {
         path: '/401',
         name: 'NotAuthorized',
         component: () => import("@/views/Page/Errors/401.vue"),
          meta: {
              title: 'Not Authorized',
              requiresAuth: false  // Add this to make sure the 401 page is accessible without auth
         },
    },
    {
         path: '/404',
         name: 'NotFound',
         component: () => import("@/views/Page/Errors/404.vue"),
          meta: {
              title: 'Not Found',
              requiresAuth: false  // Add this to ensure the 404 page is accessible
         },
    }
];