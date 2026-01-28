export default [

     {
          path: '/document-category',
          name: 'DocumentCategory',
          component: () => import("@/views/Page/DocumentCategory/DocumentCategory.vue"),
           meta: {
               title: 'GRC | DocumentCategory',
          },
     }
];