export default [

     {
          path: '/translations',
          name: 'Translations',
          component: () => import("@/views/Page/Translations/Translations.vue"),
           meta: {
               title: 'Translations',
          },
     }
];