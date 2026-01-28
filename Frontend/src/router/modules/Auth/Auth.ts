export default [

     {
          path: '/login',
          name: 'Login',
          component: () => import("@/views/Page/Auth/login.vue"),
          // component: () => import("@/views/Page/Auth/login.vue"),
           meta: {
               title: 'Login',
          },
     },

     {
          path: "/forgot-password",
          name: "ForgotPassword",
          component: () => import("@/views/Page/Auth/ForgotPassword.vue"),
     },
];