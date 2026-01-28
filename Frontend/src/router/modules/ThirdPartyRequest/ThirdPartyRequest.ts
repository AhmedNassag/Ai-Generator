export default [

     {
          path: '/third-party-request',
          name: 'ThirdPartyRequest',
          component: () => import("@/views/Page/ThirdPartyRequest/ThirdPartyRequest.vue"),
           meta: {
               title: 'Request',
          },
     }
];