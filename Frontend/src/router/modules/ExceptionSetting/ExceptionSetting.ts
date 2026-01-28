export default [

     {
          path: '/exception-setting',
          name: 'ExceptionSetting',
          component: () => import("@/views/Page/ExceptionSetting/ExceptionSetting.vue"),
           meta: {
               title: 'Exception Setting',
          },
     }
];