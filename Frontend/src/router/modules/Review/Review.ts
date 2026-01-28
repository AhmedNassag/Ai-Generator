export default [

     {
          path: '/review',
          name: 'Review',
          component: () => import("@/views/Page/Review/Review.vue"),
           meta: {
               title: 'Review',
          },
     }
];