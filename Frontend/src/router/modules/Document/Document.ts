export default [
  {
    path: "/document",
    name: "Document",
    component: () => import("@/views/Page/Document/Document.vue"),
    meta: {
      title: "Document",
    },
  },
  {
    path: "/document/:id",
    name: "Document-Details",
    component: () => import("@/views/Page/Document/DocumentDetails.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Document Details",
    },
  },
  {
    path: "/category-adoption/:id",
    name: "PolicyAdoption-Details",
    component: () => import("@/views/Page/Document/PolicyAdoption.vue"),
    props: true, // Pass the route parameter as a prop
    meta: {
      title: "Policy Adoption Details",
    },
  },
];
