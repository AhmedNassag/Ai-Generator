export default [
     {
       path: "/workflow-category",
       name: "WorkflowCategory",
       component: () =>
         import("@/views/Page/WorkflowCategory/WorkflowCategory.vue"),
       meta: {
         title: "Workflow Category",
       },
     },
     {
       path: "/workflow-category/:id",
       name: "workflow",
       component: () => import("@/views/Page/WorkflowCategory/Workflow.vue"),
       props: true, // Pass the route parameter as a prop
       meta: {
         title: "Category Workflow",
       },
     },
     {
       path: "/workflow-details/:id",
       name: "WorkflowDetailes",
       component: () =>
         import("@/views/Page/WorkflowCategory/WorkflowDetailes.vue"),
       meta: {
         title: "Workflow Details",
       },
     },
     {
       path: "/transition/:id/:transitionCode",
       name: "TransitionDetails",
       component: () => import("@/views/Page/WorkflowCategory/Transition.vue"),
       meta: {
         title: "Transition Details",
       },
     },
     {
      path: "/main-step-transition/:id/:transitionCode",
       name: "MainStepTransitionDetail",
      component: () =>
        import("@/views/Page/WorkflowCategory/MainStepsTransition.vue"),
      meta: {
        title: "Main Steps Transition",
      },
    },

   ];