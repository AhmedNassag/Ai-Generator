import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import BodyView from "@/layout/bodyView.vue";
import indexDashboard from "@/pages/indexDashboard.vue";
import FrameworkInstall from "@/router/modules/FrameworkInstall/FrameworkInstall";
////import
import Language from '@/router/modules/Language/Language';
import AuditPolicyCompliance from '@/router/modules/AuditPolicyCompliance/AuditPolicyCompliance';
import CenterPolicy from '@/router/modules/CenterPolicy/CenterPolicy';
import MyCertificate from "@/router/modules/MyCertificate/MyCertificate";
import Translate from '@/router/modules/Translate/Translate';
import ShowCertificate from '@/router/modules/ShowCertificate/ShowCertificate';
import AllNotification from '@/router/modules/AllNotification/AllNotification';
import CampaignSetting from "@/router/modules/CampaignSetting/CampaignSetting";
import CampaignStatistics from "@/router/modules/CampaignStatistics/CampaignStatistics";
import Log from "@/router/modules/Log/Log";
import LogSetting from "@/router/modules/LogSetting/LogSetting";
import NotificationSetting from "@/router/modules/NotificationSetting/NotificationSetting";
// import Notification from "@/router/modules/notification/notification";
import Campaign from "@/router/modules/Campaign/Campaign";
import PhishingTemplate from "@/router/modules/PhishingTemplate/PhishingTemplate";
import PhishingSenderProfile from "@/router/modules/PhishingSenderProfile/PhishingSenderProfile";
import PhishingWebsitePage from "@/router/modules/PhishingWebsitePage/PhishingWebsitePage";
import PhishingDomain from "@/router/modules/PhishingDomain/PhishingDomain";
import PhishingGroup from "@/router/modules/PhishingGroup/PhishingGroup";
import PhishingCategory from "@/router/modules/PhishingCategory/PhishingCategory";
import ChangeRequest from "@/router/modules/ChangeRequest/ChangeRequest";
import ThirdPartyContactQuestionnaireAnswer from "@/router/modules/ThirdPartyContactQuestionnaireAnswer/ThirdPartyContactQuestionnaireAnswer";
import RiskScoringHistory from "@/router/modules/RiskScoringHistory/RiskScoringHistory";
import ThirdPartyQuestionnaireResult from "@/router/modules/ThirdPartyQuestionnaireResult/ThirdPartyQuestionnaireResult";
import ThirdPartyQuestionnaire from "@/router/modules/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire";
import ThirdPartyProfile from "@/router/modules/ThirdPartyProfile/ThirdPartyProfile";
import ThirdPartyRequest from "@/router/modules/ThirdPartyRequest/ThirdPartyRequest";
import Assessment from "@/router/modules/Assessment/Assessment";
import AssessmentTemplate from "@/router/modules/AssessmentTemplate/AssessmentTemplate";
import AssessmentsResults from "@/router/modules/AssessmentsResults/AssessmentsResults";
import Risk from "@/router/modules/Risk/Risk";
import RiskCalculationMatrix from "@/router/modules/RiskCalculationMatrix/RiskCalculationMatrix";

import Document from "@/router/modules/Document/Document";
import LmsLevel from "@/router/modules/LmsLevel/LmsLevel";
import LmsModule from "@/router/modules/LmsModule/LmsModule";
import UserLmsTrainingModule from "@/router/modules/UserLmsTrainingModule/UserLmsTrainingModule";
import LmsUserAnswer from "@/router/modules/LmsUserAnswer/LmsUserAnswer";

import DocumentCategory from "@/router/modules/DocumentCategory/DocumentCategory";
import WorkflowCategory from "@/router/modules/WorkflowCategory/WorkflowCategory";
import Vulnerability from "@/router/modules/Vulnerability/Vulnerability";
import AssetGroup from "@/router/modules/AssetGroup/AssetGroup";
import Asset from "@/router/modules/Asset/Asset";
import RiskCatalog from "@/router/modules/RiskCatalog/RiskCatalog";
import RiskLevel from "@/router/modules/RiskLevel/RiskLevel";
import VSTIntegration from "@/router/modules/VSTIntegration/VSTIntegration";
////import
import assetValueLevel from "@/router/modules/assetValueLevel/assetValueLevel";
import assetCategory from "@/router/modules/assetCategory/assetCategory";
import thirdPartyEvaluation from "@/router/modules/thirdPartyEvaluation/thirdPartyEvaluation";
// import thirdPartyService from "@/router/modules/ThirdPartyService/ThirdPartyService";
import threatGroup from "@/router/modules/threatGroup/threatGroup";
import tag from "@/router/modules/tag/tag";
import ThreatCatalog from "@/router/modules/ThreatCatalog/ThreatCatalog";
import hostRegion from "@/router/modules/hostRegion/hostRegion";
import operatingSystem from "@/router/modules/operatingSystem/operatingSystem";
import Regulator from "@/router/modules/Regulator/Regulator";
import User from "@/router/modules/User/User";
import AuthRoute from "@/router/modules/Auth/Auth";
import Auth from "@/API/Auth";
import Control from "@/router/modules/Control/Control";
import Domain from "@/router/modules/Domain/Domain";
import Course from "@/router/modules/Course/Course";

import Requirement from "@/router/modules/Requirement/Requirement";
import ThirdPartyRequestSetting from "@/router/modules/ThirdPartyRequestSetting/ThirdPartyRequestSetting";
import RiskFunction from "@/router/modules/RiskFunction/RiskFunction";

import ThirdPartyClassification from "@/router/modules/ThirdPartyClassification/ThirdPartyClassification";
import AssetValuation from "@/router/modules/AssetValuation/AssetValuation";
import AssetEnvironmentCategory from "@/router/modules/AssetEnvironmentCategory/AssetEnvironmentCategory";

import RiskMitigationEffort from "@/router/modules/RiskMitigationEffort/RiskMitigationEffort";
import RiskCloseReason from "@/router/modules/RiskCloseReason/RiskCloseReason";
import RiskGroup from "@/router/modules/RiskGroup/RiskGroup";
import RiskCategory from "@/router/modules/RiskCategory/RiskCategory";
import RiskPlanningStrategy from "@/router/modules/RiskPlanningStrategy/RiskPlanningStrategy";

import Technology from "@/router/modules/Technology/Technology";
import Review from "@/router/modules/Review/Review";
import RiskSource from "@/router/modules/RiskSource/RiskSource";
import Exception from "@/router/modules/Exception/Exception";
import Permission from "@/router/modules/Permission/Permission";
import { generatePermissionHash } from "@/utils/hash"; // Import your hash function
////import
import ExceptionSetting from "@/router/modules/ExceptionSetting/ExceptionSetting";
import KpiAssessment from "@/router/modules/KpiAssessment/KpiAssessment";
import Kpi from "@/router/modules/Kpi/Kpi";

////import
import Hierarchy from "@/router/modules/Hierarchy/Hierarchy";
import Maturity from "@/router/modules/Maturity/Maturity";
import Job from "@/router/modules/Job/Job";
import Department from "@/router/modules/Department/Department";
import Role from "@/router/modules/Role/Role";
import Position from "@/router/modules/Position/Position";

import Task from "@/router/modules/Task/Task";
import Category from "@/router/modules/Category/Category";
import ControlType from "@/router/modules/ControlType/ControlType";
import GeneralSettings from "@/router/modules/GeneralSettings/GeneralSettings";
import Location from "@/router/modules/Location/Location";

import Ldap from "@/router/modules/Ldap/Ldap";

import Frameworks from "@/router/modules/Frameworks/Frameworks";
import Translations from "@/router/modules/Translations/Translations";
import Color from "@/router/modules/Color/Color";
import Question from "@/router/modules/Question/Question";
////import
import Team from "@/router/modules/Team/Team";
import EmailConfig from "@/router/modules/EmailConfig/EmailConfig";
import AssetValueQuestion from "@/router/modules/AssetValueQuestion/AssetValueQuestion";
import Survey from "@/router/modules/Survey/Survey";
import SurveyQuestion from "@/router/modules/SurveyQuestion/SurveyQuestion";
import SurveyResponse from "@/router/modules/SurveyResponse/SurveyResponse";
import SurveyAnswer from "@/router/modules/SurveyResponse/SurveyAnswer";
import Evidence from "@/router/modules/Evidence/Evidence";
import Incident from "@/router/modules/Incident/Incident";
import IncidentSetting from "@/router/modules/IncidentSetting/IncidentSetting";
import Cookies from "js-cookie";
import Errors from "./modules/Errors/Errors";
import CertifiateTemplete from "./modules/CertifiateTemplete/CertifiateTemplete";
import AuditRemidation from "@/router/modules/AuditRemidation/AuditRemidation";
import FrameworkControlTestAudit from "@/router/modules/FrameworkControlTestAudit/FrameworkControlTestAudit";
import AuditPlan from "@/router/modules/AuditPlan/AuditPlan";

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
      ...AllNotification,
      ...ThirdPartyContactQuestionnaireAnswer,
      ...ThirdPartyRequest,
      ...RiskMitigationEffort,
      ...Assessment,
      ...AssessmentTemplate,
      ...Document,
      ...Risk,
      ...Technology,
      ...Review,
      ...RiskSource,
      ...Task,
      ...DocumentCategory,
      ...WorkflowCategory,
      ...hostRegion,
      ...Vulnerability,
      ...AssetGroup,
      ...Asset,
      ...hostRegion,
      ...operatingSystem,
      ...assetValueLevel,
      ...assetCategory,
      ...thirdPartyEvaluation,
      ...FrameworkInstall,
      ...Regulator,
      // ...thirdPartyService,
      ...threatGroup,
      ...tag,
      ...ThreatCatalog,
      ...Regulator,
      ...User,
      // ...AuthRoute,
      ...Frameworks,
      ...Translations,
      ...Color,
      ...Question,
      ...Control,
      ...Domain,
      ...RiskCloseReason,
      ...RiskGroup,
      ...RiskCategory,
      ...RiskPlanningStrategy,
      ...Task,
      ...Technology,
      ...Review,
      ...RiskSource,
      ...Task,
      ...Category,
      ...ControlType,
      ...GeneralSettings,
      ...Location,
      ...Regulator,
      ...User,
      ...Domain,
      ...Color,
      ...ThreatCatalog,
      ...Position,
      ...FrameworkInstall,
      ...Frameworks,
      ...Translations,
      ...assetValueLevel,
      ...assetCategory,
      ...thirdPartyEvaluation,
      // ...thirdPartyService,
      ...threatGroup,
      ...tag,
      // new
      ...hostRegion,
      ...operatingSystem,
      ...Control,
      ...Requirement,
      ...Ldap,
      ...Hierarchy,
      ...Maturity,
      ...ExceptionSetting,
      ...KpiAssessment,
      ...Kpi,
      ...RiskCatalog,
      ...RiskLevel,
      ...VSTIntegration,
      ...Team,
      ...Exception,
      ...Permission,
      ...Job,
      ...Role,
      ...Department,
      ...AssetValuation,
      ...AssetEnvironmentCategory,
      ...ThirdPartyClassification,
      ...RiskFunction,
      ...ThirdPartyRequestSetting,
      ...RiskCalculationMatrix,
      ...AssetValueQuestion,
      ...Course,
      ...LmsLevel,
      ...LmsModule,
      ...UserLmsTrainingModule,
      ...LmsUserAnswer,
      ...ThirdPartyProfile,
      ...ThirdPartyQuestionnaire,
      ...RiskScoringHistory,
      ...Survey,
      ...SurveyQuestion,
      ...ChangeRequest,
      ...Evidence,
      ...PhishingCategory,
      ...PhishingGroup,
      ...PhishingDomain,
      ...PhishingTemplate,
      ...Campaign,
      ...PhishingWebsitePage,
      ...PhishingSenderProfile,
      ...CampaignSetting,
      ...NotificationSetting,
      // ...Notification,
      ...LogSetting,
      ...Log,
      ...EmailConfig,
      ...CampaignStatistics,
      ...CertifiateTemplete,
      ...ShowCertificate,
      ...MyCertificate,
      ...Incident,
      ...IncidentSetting,
      ...Translate,
      ...AuditPlan,
      ...FrameworkControlTestAudit,
      ...AuditRemidation,
      ...CenterPolicy,
      ...AuditPolicyCompliance,
      ...Language,
  ...SurveyResponse,

    ],
  },
  {
    path: "/",
    name: "Home",
    component: BodyView,
    meta: { requiresAuth: false },
  },
  ...Errors,
  ...AuthRoute,
  ...ThirdPartyQuestionnaireResult,
  ...SurveyAnswer,
  {
    path: '/:id',
    name: 'PreviewWebsitePage',
    component: () => import('@/views/Page/PhishingWebsitePage/PreviewWebsitePage.vue'),
    meta: { title: 'PreviewWebsitePage' }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function base64UrlDecode(base64Url: string): string {
  // Convert Base64 URL-safe to Base64 standard encoding
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding to the Base64 string if necessary
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }

  // Decode the Base64 string
  return atob(base64);
}

// Function to decode JWT token
function decodeJWT(token: string) {
  const parts = token.split("."); // Split the JWT into its three parts

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const header = JSON.parse(base64UrlDecode(parts[0])); // Decode header
  const payload = JSON.parse(base64UrlDecode(parts[1])); // Decode payload
  // Signature is not used for decoding the JWT, so we ignore it.

  return {
    header,
    payload,
  };
}
// Handle authentication and permission checks in the `beforeEach` guard
router.beforeEach(async (to, from, next) => {
  try {
    // Allow access if route meta has requiresAuth set to false
    if (
      to.matched.some(
        (record) => record.meta && record.meta.requiresAuth === false
      )
    ) {
      next();
      return;
    }
    // Check if the user is authenticated
    const isAuthenticated = await Auth.loggedIn();
    // Decode the JWT token if the user is authenticated
    let permissions = [];

    let token = "";
    let i = 0;
    while (Cookies.get(`api_token_part${i + 1}`)) {
      token += Cookies.get(`api_token_part${i + 1}`);
      i++;
    }

    if (isAuthenticated && token) {
      if (to.name == "ThirdPartyQuestionnaireAnswer"|| to.name == "SurveyAnswer" || to.name == "PreviewWebsitePage") {
        next();
        return;
      }

      const hasIncompleteMandatoryCourses =
        Auth.USER.hasIncompleteMandatoryCourses;
      console.log("Has Incomplete Courses :", hasIncompleteMandatoryCourses);

      try {
        const decodedToken = decodeJWT(token); // Decode the token
        if (decodedToken.payload.super == true) {
          // If the user is a super admin, grant access to all routes
          // If Route not exist, redirect to 404 page
          if (to.matched && to.matched.length > 1) {
            const component = to.matched[1];
            if (component && component.path) {
              const convertedPath = component.path
                .replace("/", "") // Remove the leading '/'
                .split("/") // Split by '/'
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize the first letter
                .join("\\")
                .split("\\:id")
                .join(""); // Join with '\\' and add the suffix
              window.routerData =
                convertedPath + "\\" + convertedPath + "Controller\\";

              next(); // Proceed if the permission hash is found
            } else {
              next({ name: "NotFound" }); // Redirect to 404 if no matched route found}); // Use path for consistency
            }
          } else {
            next({ name: "NotFound" }); // Redirect to 404 if no matched route found
          }
        } else {
          permissions = decodedToken.payload.permission || [];
          // If route has permissions defined, check if user has the required permissions
          if (to.matched && to.matched.length > 1) {
            if (
              hasIncompleteMandatoryCourses &&
              to.name !== "UserLmsTrainingModule"
            ) {
              next({ name: "UserLmsTrainingModule" });
            }

            const component = to.matched[1];
            if (component && component.path) {
              const convertedPath = component.path
                .replace("/", "") // Remove the leading '/'
                .split("/") // Split by '/'
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize the first letter
                .join("\\")
                .split("\\:id")
                .join(""); // Join with '\\' and add the suffix
                if (convertedPath || to.name == "ThirdPartyQuestionnaireAnswer" || to.name == "SurveyAnswer") {
                  if (
                  permissions.includes(
                    generatePermissionHash(convertedPath + "\\" + convertedPath + "Controller\\show")
                  ) || convertedPath == "UserLmsTrainingModule"
                ) {
                  window.routerData = convertedPath + "\\" + convertedPath + "Controller\\";

                  next(); // Proceed if the permission hash is found
                } else {
                  // Fix: Use path instead of name for more reliable navigation to 401 page
                  next({ name: "NotAuthorized" }); // Redirect to 401 if permission not found
                }
              } else {
                next({ name: "NotFound" }); // Redirect to 404 if no matched route found}); // Use path for consistency
              }
            } else {
            }
          } else {
            next({ name: "NotFound" }); // Redirect to 404 if no matched route found
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        if (
          to.name === "Login" ||
          to.name === "ForgotPassword" ||
          to.name === "home" ||
          to.name === "ThirdPartyQuestionnaireAnswer" ||
          to.name === "SurveyAnswer"
        ) {
          next();
        } else {
          next({ name: "Login" }); // Redirect to login if not authenticated
        }
      }
    } else {
      if (
        to.name === "Login" ||
        to.name === "ForgotPassword" ||
        to.name == "ThirdPartyQuestionnaireAnswer" ||
        to.name == "SurveyAnswer"
      ) {
        next();
      } else {
        next({ name: "Login" }); // Redirect to login if not authenticated
      }
    }
  } catch (error) {
    console.error("Routing error:", error);
    next({ name: "Login" }); // In case of any error, redirect to Login page
  }
});

// Update the document title based on the route meta
router.beforeEach((to) => {
  if (typeof to.meta.title === "string") {
    document.title = to.meta.title;
  }
});

export default router;
