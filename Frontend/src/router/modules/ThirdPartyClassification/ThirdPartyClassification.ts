export default [

     {
          path: '/third-party-classification',
          name: 'ThirdPartyClassification',
          component: () => import("@/views/Page/ThirdPartyClassification/ThirdPartyClassification.vue"),
           meta: {
               title: 'Third Party Classification',
          },
     }
];