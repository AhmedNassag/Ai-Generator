export default [

     {
          path: '/control',
          name: 'Control',
          component: () => import("@/views/Page/Control/Control.vue"),
           meta: {
               title: "Control",
          },
     },

     {
          path: "/view-requirements/:id",
          name: "ViewRequirements",
          component: () => import("@/views/Page/Control/ViewRequirements.vue"),
          props: true, // Pass the route parameter as a prop
          meta: {
            title: "Requirement Requirements",
          },
        },
];