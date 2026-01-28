export default [

     {
          path: '/tag',
          name: 'tag',
          component: () => import("@/views/Page/tag/tag.vue"),
           meta: {
               title: 'Tag',
          },
     }
];