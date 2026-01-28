export default [

     {
          path: '/third-party-profile',
          name: 'ThirdPartyProfile',
          component: () => import("@/views/Page/ThirdPartyProfile/ThirdPartyProfile.vue"),
           meta: {
               title: 'Profile',
          },
     }
];