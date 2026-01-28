export default [

     {
          path: '/topic-recommendation',
          name: 'TopicRecommendation',
          component: () => import("@/views/Page/TopicRecommendation/TopicRecommendation.vue"),
          meta: {
               title: 'Topics Recommendations',
          },
     }
];