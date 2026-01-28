export default [

     {
          path: '/ldap',
          name: 'Ldap',
          component: () => import("@/views/Page/Ldap/Ldap.vue"),
           meta: {
               title: 'Ldap Configuration',
          },
     },{
          path: '/ldap/get-departments',
          name: 'LdapImportDepartment',
          component: () => import("@/views/Page/Ldap/ImportDepartment.vue"),
           meta: {
               title: 'Ldap Import Department',
          },
     },{
          path: '/ldap/get-users',
          name: 'LdapImportUser',
          component: () => import("@/views/Page/Ldap/ImportUsers.vue"),
           meta: {
               title: 'Ldap Import Users',
          },
     }
     
];