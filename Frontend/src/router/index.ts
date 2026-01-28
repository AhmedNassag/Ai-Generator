import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import StrategicPlan_Task from "@/router/modules/Task/Task";
import Deliverable from "@/router/modules/Deliverable/Deliverable";
import StrategicPlan from "@/router/modules/StrategicPlan/StrategicPlan";
import StrategicPlanDetails from "@/router/modules/StrategicPlanDetails/StrategicPlanDetails";
import Program from "@/router/modules/Program/Program";
import ObjectiveType from "@/router/modules/ObjectiveType/ObjectiveType";
import Initiative from "@/router/modules/Initiative/Initiative";
import Project from "@/router/modules/Project/Project";
import ProjectDetails from "@/router/modules/ProjectDetails/ProjectDetails";
import MilestoneSetting from "@/router/modules/MilestoneSetting/MilestoneSetting";
import Milestone from "@/router/modules/Milestone/Milestone";
import MilestoneDetails from "@/router/modules/MilestoneDetails/MilestoneDetails";
import ObjectiveDetails from "@/router/modules/ObjectiveDetails/ObjectiveDetails";
import InitiativeDetails from "@/router/modules/InitiativeDetails/InitiativeDetails";
import DeliverableDetails from "@/router/modules/DeliverableDetails/DeliverableDetails";
import TaskDetails from "@/router/modules/TaskDetails/TaskDetails";
import ProgramDetails from "@/router/modules/ProgramDetails/ProgramDetails";
import Objective from "@/router/modules/Objective/Objective";

import BodyView from "@/layout/bodyView.vue";
import indexDashboard from "@/pages/indexDashboard.vue";
import FrameworkInstall from "@/router/modules/FrameworkInstall/FrameworkInstall";
////import
import InternalAuditResult from '@/router/modules/InternalAuditResult/InternalAuditResult';
import GeneralRelation from '@/router/modules/GeneralRelation/GeneralRelation';
import InternalAudit from '@/router/modules/InternalAudit/InternalAudit';
import ControlClass from "@/router/modules/ControlClass/ControlClass";
import ControlPhase from "@/router/modules/ControlPhase/ControlPhase";
import UserReport from "@/router/modules/UserReport/UserReport";
import appetiteTolerance from "@/router/modules/appetiteTolerance/appetiteTolerance";
import VulnerabilityCatalogue from "@/router/modules/VulnerabilityCatalogue/VulnerabilityCatalogue";
import InternalMessage from "@/router/modules/InternalMessage/InternalMessage";
import Dashboard from '@/router/modules/Dashboard/Dashboard';
import MyWorks from "@/router/modules/MyWorks/MyWorks";
import PhysicalCourseSchedule from "@/router/modules/PhysicalCourseSchedule/PhysicalCourseSchedule";
import PhysicalCourseAttendance from "@/router/modules/PhysicalCourseAttendance/PhysicalCourseAttendance";
import PhysicalCourseGrade from "@/router/modules/PhysicalCourseGrade/PhysicalCourseGrade";
import PhysicalCourseRequest from "@/router/modules/PhysicalCourseRequest/PhysicalCourseRequest";
import PhysicalCourseMaterial from "@/router/modules/PhysicalCourseMaterial/PhysicalCourseMaterial";
import PhysicalCourse from "@/router/modules/PhysicalCourse/PhysicalCourse";
import Language from "@/router/modules/Language/Language";
import AuditPolicyCompliance from "@/router/modules/AuditPolicyCompliance/AuditPolicyCompliance";
import CenterPolicy from "@/router/modules/CenterPolicy/CenterPolicy";
import MyCertificate from "@/router/modules/MyCertificate/MyCertificate";
import Translate from "@/router/modules/Translate/Translate";
import ShowCertificate from "@/router/modules/ShowCertificate/ShowCertificate";
import AllNotification from "@/router/modules/AllNotification/AllNotification";
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
// import ChangeRequest from "@/router/modules/ChangeRequest/ChangeRequest";
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
import thirdPartyService from "@/router/modules/ThirdPartyService/ThirdPartyService";
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
import ExportTemplate from "@/router/modules/ExportTemplate/ExportTemplate";
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
import SurveyAnswerOut from "@/router/modules/SurveyResponse/SurveyAnswerOut";
import Evidence from "@/router/modules/Evidence/Evidence";
import Incident from "@/router/modules/Incident/Incident";
import IncidentSetting from "@/router/modules/IncidentSetting/IncidentSetting";
import Cookies from "js-cookie";
import Errors from "./modules/Errors/Errors";
import CertifiateTemplete from "./modules/CertifiateTemplete/CertifiateTemplete";
import AuditRemidation from "@/router/modules/AuditRemidation/AuditRemidation";
import FrameworkControlTestAudit from "@/router/modules/FrameworkControlTestAudit/FrameworkControlTestAudit";
import AuditPlan from "@/router/modules/AuditPlan/AuditPlan";
import LikelihoodImpactSetting from "@/router/modules/LikelihoodImpactSetting/LikelihoodImpactSetting";
import KpiAssessment from "@/router/modules/KpiAssessment/KpiAssessment";
import Kpi from "@/router/modules/Kpi/Kpi";
import { useTranslations } from "@/composables/useTranslations"; // ADD THIS
import Topic from "@/router/modules/Topic/Topic";
import Committee from "@/router/modules/Committee/Committee";
import AgendaDetails from "@/router/modules/AgendaDetails/AgendaDetails";
import Meeting from "@/router/modules/Meeting/Meeting";
import TopicRecommendation from "@/router/modules/TopicRecommendation/TopicRecommendation";
import Phone from "@/router/modules/Phone/Phone";
// ...Topic,
// ...Committee,
// // ...Agenda,
// ...AgendaDetails,
// ...Meeting,
// ...TopicRecommendation,
  

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
      ...Phone,
       
      ///
      ...Dashboard,
      ...UserReport,
      ...AllNotification,
      ...ThirdPartyContactQuestionnaireAnswer,
      ...ThirdPartyRequest,
      ...RiskMitigationEffort,
      ...Assessment,
      ...AssessmentTemplate,
      ...AssessmentsResults,
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
      ...VulnerabilityCatalogue,
      ...AssetGroup,
      ...Asset,
      ...hostRegion,
      ...operatingSystem,
      ...assetValueLevel,
      ...assetCategory,
      ...thirdPartyEvaluation,
      ...FrameworkInstall,
      ...Regulator,
      ...thirdPartyService,
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
      // ...Position,
      ...FrameworkInstall,
      ...Frameworks,
      ...Translations,
      ...assetValueLevel,
      ...assetCategory,
      ...thirdPartyEvaluation,
      ...thirdPartyService,
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
      // ...ChangeRequest,
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

      // Physical Course Modules
      ...PhysicalCourseSchedule,
      ...PhysicalCourseAttendance,
      ...PhysicalCourseGrade,
      ...PhysicalCourseRequest,
      ...PhysicalCourseMaterial,
      ...PhysicalCourse,

      ...LikelihoodImpactSetting,
      //strategic plan and objectives modules
      ...ObjectiveType,
      ...Objective,
      ...StrategicPlan,
      ...StrategicPlanDetails,
      ...ObjectiveDetails,
      ...Program,
      ...Initiative,
      ...ProgramDetails,
      ...Deliverable,
      ...DeliverableDetails,
      ...StrategicPlan_Task,
      ...TaskDetails,
      ...Project,
      ...ProjectDetails,
      ...MilestoneSetting,
      ...Milestone,
      ...MilestoneDetails,
      ...InitiativeDetails,
      ...appetiteTolerance,
      ...KpiAssessment,
      ...Kpi,
      ...MyWorks,
      ...InternalMessage,
      ...ControlPhase,
      ...ControlClass,
      //Committee Modules
      ...Topic,
      ...Committee,
      ...AgendaDetails,
      ...Meeting,
      ...TopicRecommendation,
      ...InternalAudit,
      ...InternalAuditResult,
      ...ExportTemplate,
      ...GeneralRelation,
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
  ...ThirdPartyQuestionnaireResult,
  ...SurveyAnswer,
  ...SurveyAnswerOut,
  {
    path: "/PreviewWebsitePage/:id",
    name: "PreviewWebsitePage",
    component: () =>
      import("@/views/Page/PhishingWebsitePage/PreviewWebsitePage.vue"),
    meta: { title: "PreviewWebsitePage" },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

import courseModule from "@/API/Course/Course";

const api = new courseModule();

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
