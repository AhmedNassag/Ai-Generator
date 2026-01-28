export default [

     {
          path: '/show-certificate/:id',
          name: 'ShowCertificate',
          component: () => import("@/views/Page/ShowCertificate/ShowCertificate.vue"),
           meta: {
               title: 'ShowCertificate',
               requiresAuth: false,
               hideMenu: true,
               hideFooter: true
          },
     }
];