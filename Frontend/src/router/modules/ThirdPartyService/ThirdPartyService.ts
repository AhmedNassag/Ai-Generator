export default [

     {
          path: '/third-party-service',
          name: 'ThirdPartyService',
          component: () => import("@/views/Page/ThirdPartyService/ThirdPartyService.vue"),
           meta: {
               title: 'third Party Service',
          },
     }
];