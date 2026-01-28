export default [

     {
          path: '/physical-course',
          name: 'PhysicalCourse',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourse.vue"),
           meta: {
               title: 'PhysicalCourse',
          },
     },

     {
          path: '/physical-courses-requests/:courseId',
          name: 'PhysicalCourseRequests',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseRequests.vue"),
           meta: {
               title: 'PhysicalCourseRequests',
          },
     },

     {
          path: '/physical-course-attendance/:courseId',
          name: 'PhysicalCourseAttendance',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseAttendance.vue"),
           meta: {
               title: 'PhysicalCourseAttendance',
          },
     },

     {
          path: '/physical-course-grades/:courseId',
          name: 'PhysicalCourseGrades',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseGrades.vue"),
           meta: {
               title: 'PhysicalCourseGrades',
          },
     },

     {
          path: '/physical-course-statistics/:courseId',
          name: 'PhysicalCourseStatistics',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseStatistics.vue"),
           meta: {
               title: 'PhysicalCourseStatistics',
          },
     },

     {
          path: '/physical-course-certificates/:courseId',
          name: 'PhysicalCourseCertificates',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseCertificates.vue"),
           meta: {
               title: 'PhysicalCourseCertificates',
          },
     },

     {
          path: '/physical-course-survey/:courseId',
          name: 'PhysicalCourseSurvey',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseSurvey.vue"),
           meta: {
               title: 'PhysicalCourseSurvey',
          },
     },

     {
          path: '/physical-course-survey-details/:surveyId',
          name: 'PhysicalCourseSurveyData',
          component: () => import("@/views/Page/PhysicalCourse/PhysicalCourseSurveyData.vue"),
           meta: {
               title: 'PhysicalCourseSurveyData',
          },
     },

     

     
     

     // User Physical Course 
     {
          path: '/user-physical-course',
          name: 'UserPhysicalCourse',
          component: () => import("@/views/Page/PhysicalCourse/UserPhysicalCourse.vue"),
           meta: {
               title: 'UserPhysicalCourse',
          },
     },

     
     {
          path: '/user-physical-course-certificates',
          name: 'UserPhysicalCourseCertificates',
          component: () => import("@/views/Page/PhysicalCourse/UserPhysicalCourseCertificates.vue"),
           meta: {
               title: 'UserPhysicalCourseCertificates',
          },
     },

     {
          path: '/user-physical-course-details/:courseId',
          name: 'UserPhysicalCourseDetails',
          component: () => import("@/views/Page/PhysicalCourse/UserPhysicalCourseDetails.vue"),
           meta: {
               title: 'UserPhysicalCourseDetails',
          },
     },

     {
          path: '/user-physical-course-survey/:surveyId',
          name: 'UserPhysicalCourseSurveyShow',
          component: () => import("@/views/Page/PhysicalCourse/UserPhysicalCourseSurveyShow.vue"),
           meta: {
               title: 'UserPhysicalCourseSurveyShow',
          },
     },
     

    

];