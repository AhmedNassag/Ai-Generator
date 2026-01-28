export default [
  {
    path: "/requirement",
    name: "Requirement",
    component: () => import("@/views/Page/Requirement/Requirement.vue"),
    meta: {
      title: "Requirement",
    },
  },

  {
    path: "/view-evidences/:id",
    name: "ViewEvidence",
    component: () => import("@/views/Page/Requirement/ViewEvidence.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Requirement Evidences",

    },
  },

  {
    path: "/evidences/:id",
    name: "Evidences",
    component: () => import("@/views/Page/Requirement/Evidences.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Requirement Evidences",
      mainTrKeys: ["ViewEvidence", "evidence"],

    },
  },
];
