export default [

     {
          path: '/change-request',
          name: 'ChangeRequest',
          component: () => import("@/views/Page/ChangeRequest/ChangeRequest.vue"),
           meta: {
               title: 'ChangeRequest',
          },
     },

     {
          path: '/change-request/edit-responsible-department',
          name: 'ChangeRequestResponsibleDepartment',
          component: () => import("@/views/Page/ChangeRequest/ChangeRequestResponsibleDepartment.vue"),
           meta: {
               title: 'ChangeRequestResponsibleDepartment',
          },
     }
];