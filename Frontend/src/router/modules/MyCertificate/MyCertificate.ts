export default [

     {
          path: '/my-certificate',
          name: 'MyCertificate',
          component: () => import("@/views/Page/MyCertificate/MyCertificate.vue"),
           meta: {
               title: ' MyCertificate',
          },
     }
];