export default [

     {
          path: '/campaign',
          name: 'Campaign',
          component: () => import("@/views/Page/Campaign/Campaign.vue"),
          meta: {
               title: 'Campaign',
          },
     }
];