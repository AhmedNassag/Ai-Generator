import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import BodyView from "@/layout/bodyView.vue";
import indexDashboard from "@/pages/indexDashboard.vue";
import UserReport from "@/router/modules/UserReport/UserReport";
import Dashboard from '@/router/modules/Dashboard/Dashboard';
import Language from "@/router/modules/Language/Language";
import Translate from "@/router/modules/Translate/Translate";
import AllNotification from "@/router/modules/AllNotification/AllNotification";
import Log from "@/router/modules/Log/Log";
import LogSetting from "@/router/modules/LogSetting/LogSetting";
import NotificationSetting from "@/router/modules/NotificationSetting/NotificationSetting";
// import Notification from "@/router/modules/notification/notification";
import User from "@/router/modules/User/User";
import AuthRoute from "@/router/modules/Auth/Auth";
import Auth from "@/API/Auth";
import ExportTemplate from "@/router/modules/ExportTemplate/ExportTemplate";
import Permission from "@/router/modules/Permission/Permission";
import { generatePermissionHash } from "@/utils/hash";
import Job from "@/router/modules/Job/Job";
import Department from "@/router/modules/Department/Department";
import Role from "@/router/modules/Role/Role";
import Position from "@/router/modules/Position/Position";
import GeneralSettings from "@/router/modules/GeneralSettings/GeneralSettings";
import Location from "@/router/modules/Location/Location";
import Color from "@/router/modules/Color/Color";
import Team from "@/router/modules/Team/Team";
import EmailConfig from "@/router/modules/EmailConfig/EmailConfig";
import Cookies from "js-cookie";
import Errors from "./modules/Errors/Errors";
import { useTranslations } from "@/composables/useTranslations";

declare global {
  interface Window {
    routerData?: string;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: BodyView,
    meta: {
      title: "Default |  ",
    },
    children: [
      ///
      ...Dashboard,
      ...UserReport,
      ...AllNotification,
      ...User,
      // ...AuthRoute,
      ...Color,
      ...GeneralSettings,
      ...Location,
      ...User,
      ...Color,
      // ...Position,
      ...Team,
      ...Permission,
      ...Job,
      ...Role,
      ...Department,
      ...NotificationSetting,
      // ...Notification,
      ...LogSetting,
      ...Log,
      ...EmailConfig,
      ...Translate,
      ...Language,
      ...ExportTemplate,
    ],
  },
  {
    path: "/",
    name: "Home",
    component: BodyView,
    meta: { requiresAuth: true },
  },
  ...Errors,
  ...AuthRoute,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Utility functions
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function base64UrlDecode(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  return atob(base64);
}

function decodeJWT(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload };
}

// Function to get JWT token from cookies
function getTokenFromCookies(): string {
  let token = "";
  let i = 0;
  while (Cookies.get(`api_token_part${i + 1}`)) {
    token += Cookies.get(`api_token_part${i + 1}`);
    i++;
  }
  return token;
}

// Routes that don't require authentication
const publicRoutes = [
  "Login",
  "ForgotPassword",
  // "home",
  // "Home",
  "ThirdPartyQuestionnaireAnswer",
  "SurveyAnswer",
  "SurveyAnswerOut",
  "PreviewWebsitePage",
];

// Routes that bypass mandatory course check
const courseExemptRoutes = [
  "UserLmsTrainingModule",
  "ThirdPartyQuestionnaireAnswer",
  "SurveyAnswer",
  "SurveyAnswerOut",
];

// Load translations before each route if mainTrKeys meta is present
// const SHARED_MODULES = ["common", "datatable", "menu", "notification"];

// router.beforeEach(async (to, from, next) => {
//   const modules: any = to.meta.mainTrKeys || [];

//   if (modules?.length == 0) {
//     const routeName: any = to?.name?.toString()?.toLocaleLowerCase();
//     //if the name is committe Details , delete the Details part
//     const mainKey = routeName.replace("details", "");
//     modules.push(mainKey);
//   }
//   // Always include shared modules
//   modules.push(...SHARED_MODULES);
//   if (modules && modules.length > 0) {
//     try {
//       const { loadMultipleModules } = useTranslations();
//       await loadMultipleModules(modules);
//     } catch (error) {
//       console.error("Failed to load translations:", error);
//     }
//   }

//   next();
// });

// Main authentication guard
router.beforeEach(async (to, from, next) => {
  try {
    // Skip authentication for routes marked with requiresAuth: false
    if (
      to.matched.some(
        (record) => record.meta && record.meta.requiresAuth === false
      )
    ) {
      return next();
    }

    // Check if user is authenticated
    const isAuthenticated = await Auth.loggedIn();

    if (
      isAuthenticated &&
      (to.name === "Login" || to.name === "ForgotPassword")
    ) {
      return next({ name: "home" });
    }

    // Allow public routes without authentication
    if (publicRoutes.includes(to.name as string)) {
      return next();
    }

    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      return next({ name: "Login" });
    }

    // Get JWT token
    const token = getTokenFromCookies();
    if (!token) {
      console.log("No token found, redirecting to login");
      return next({ name: "Login" });
    }

    // Decode JWT token
    let decodedToken;
    try {
      decodedToken = decodeJWT(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return next({ name: "Login" });
    }

    // Check for mandatory courses (unless it's a course exempt route)
    // if (!courseExemptRoutes.includes(to.name as string)) {
    //   const response = await api.checkMandatoryModules(Auth.USER.id);
    //   if (
    //     response.hasIncompleteMandatoryCourses &&
    //     to.name !== "UserLmsTrainingModule"
    //   ) {
    //     console.log(
    //       "User has incomplete mandatory courses, redirecting to training"
    //     );
    //     return next({ name: "UserLmsTrainingModule" });
    //   }
    // }

    // Check if user is super admin
    if (decodedToken.payload.super === true) {
      // Super admin has access to all routes
      if (to.matched && to.matched.length > 1) {
        const component = to.matched[1];
        if (component && component.name && typeof component.name === "string") {
          const convertedPath = component.name
            .replace("/", "")
            .split("/")
            .map((part: string) => part)
            .join("\\")
            .split("\\:id")
            .join("");
          window.routerData =
            convertedPath + "\\" + convertedPath + "Controller\\";
          return next();
        } else {
          return next({ name: "NotFound" });
        }
      } else {
        return next({ name: "NotFound" });
      }
    }

    // Regular user - check permissions
    const permissions = decodedToken.payload.permission || [];

    if (to.matched && to.matched.length > 1) {
      const component = to.matched[1];
      if (component && component.name && typeof component.name === "string") {
        const convertedPath = component.name
          .replace("/", "")
          .split("/")
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("\\")
          .split("\\:id")
          .join("");

        // Special cases that don't require permission check
        if (
          courseExemptRoutes.includes(to.name as string) ||
          convertedPath === "UserLmsTrainingModule"
        ) {
          window.routerData =
            convertedPath + "\\" + convertedPath + "Controller\\";
          return next();
        }
        // Check permissions
        const requiredPermission = generatePermissionHash(
          convertedPath + "\\" + convertedPath + "Controller\\show"
        );
        if (permissions.includes(requiredPermission)) {
          window.routerData =
            convertedPath + "\\" + convertedPath + "Controller\\";
          return next();
        } else {
          console.log("User does not have required permissions");
          return next({ name: "NotAuthorized" });
        }
      } else {
        return next({ name: "NotFound" });
      }
    } else {
      return next({ name: "NotFound" });
    }
  } catch (error) {
    console.error("Router guard error:", error);
    return next({ name: "Login" });
  }
});

// Update document title based on route meta
router.beforeEach((to) => {
  if (typeof to.meta?.title === "string") {
    document.title = to.meta.title;
  }
});

export default router;
