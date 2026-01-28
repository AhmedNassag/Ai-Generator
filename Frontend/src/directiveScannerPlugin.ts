import { generatePermissionHash } from "@/utils/hash";
import { App, Plugin, VNode, DirectiveBinding, nextTick } from "vue";
import Cookies from 'js-cookie';
import Auth from './API/Auth';

// Extend the Window interface
declare global {
  interface Window {
    routerData?: string; // Define router as an optional object
  }
}

function base64UrlDecode(base64Url: string): string {
  // Convert Base64 URL-safe to Base64 standard encoding
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding to the Base64 string if necessary
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }

  // Decode the Base64 string
  return atob(base64);
}

function decodeJWT(token: string) {
  const parts = token.split('.'); // Split the JWT into its three parts

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(base64UrlDecode(parts[0]));  // Decode header
  const payload = JSON.parse(base64UrlDecode(parts[1])); // Decode payload
  // Signature is not used for decoding the JWT, so we ignore it.

  return {
    header,
    payload,
  };
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function getTokenFromCookieParts(): string | null {
  const cookiePrefix = 'api_token_part';
  let token = '';
  let index = 1;
  while (true) {
    const part = Cookies.get(`${cookiePrefix}${index}`);
    if (!part) break;
    token += part;
    index++;
  }
  return token || null;
}

interface ScannedDirective {
  componentName: string;
  directiveName: string;
  directiveValue: any | null;
  fileName?: string;
}

const DirectiveScannerPlugin: Plugin = {
  install(app: App) {
    const scannedDirectives: ScannedDirective[] = [];

    app.config.globalProperties.$scannedDirectives = scannedDirectives;

    app.directive("permission", {
      unmounted(el, binding: DirectiveBinding, vnode: VNode) {
        nextTick(() => {
          let componentName = "UnnamedComponent";
          let fileName: string | undefined;

          // Attempt to retrieve component name from vnode
          const children = vnode.children;
          const controllerPath = window.routerData;
          const requiredPermission = generatePermissionHash(`${controllerPath}${binding.arg || "show"}`);
          const token = getTokenFromCookieParts();
          if (token) {
            const decodedToken = decodeJWT(token);
            const permission = decodedToken.payload.permission || [];
            if (decodedToken.payload.super != true && !permission?.includes(requiredPermission)) {
              el.parentNode?.removeChild(el); // Remove element from DOM
            }
          }

          scannedDirectives.push({
            componentName,
            directiveName: `v-${binding.arg || "unknown"}`,
            directiveValue: binding.value || null,
            fileName,
          });
        });
      },
      beforeMount(el, binding: DirectiveBinding, vnode: VNode) {
        nextTick(() => {
          let componentName = "UnnamedComponent";
          let fileName: string | undefined;

          // Attempt to retrieve component name from vnode
          const children = vnode.children;
          const controllerPath = window.routerData?.split("/:id").join("");
          const requiredPermission = generatePermissionHash(`${controllerPath}${binding.arg || "show"}`);
          const requiredPermissionImport = generatePermissionHash(`${controllerPath}${"importFileData"}`);
          const requiredPermissionExport = generatePermissionHash(`${controllerPath}${"exportAllToExcel"}`);
          const requiredPermissionInsert = generatePermissionHash(`${controllerPath}${"insert"}`);
          const token = getTokenFromCookieParts();
          if (token) {
            const decodedToken = decodeJWT(token);
            const permission = decodedToken.payload.permission || [];
            Auth.TABLE_PERMISSIONS = {
                "import": decodedToken.payload.super == true || permission?.includes(requiredPermissionImport),
                "export": decodedToken.payload.super == true || permission?.includes(requiredPermissionExport),
                "insert": decodedToken.payload.super == true || permission?.includes(requiredPermissionInsert),
              };
            if (decodedToken.payload.super != true && !permission?.includes(requiredPermission)) {
              el.parentNode?.removeChild(el); // Remove element from DOM
            }
          }

          scannedDirectives.push({
            componentName,
            directiveName: `v-${binding.arg || "unknown"}`,
            directiveValue: binding.value || null,
            fileName,
          });
        });
      },
    });

    app.directive("internalPermission", {
      mounted(el, binding: DirectiveBinding, vnode: VNode) {
        nextTick(() => {
          let componentName = "UnnamedComponent";
          let fileName: string | undefined;

          // Attempt to retrieve component name from vnode
          const children = vnode.children;
          const controllerPath = window.routerData?.split("/:id").join("").split("\/").slice(-1).join("\/");
          const requiredPermission = generatePermissionHash(`${controllerPath}${binding.arg || "show"}`);
          const token = getTokenFromCookieParts();
          if (token) {
            const decodedToken = decodeJWT(token);
            let permission = decodedToken.payload.permission || [];
            if (decodedToken.payload.super != true && !permission?.includes(requiredPermission)) {
              if (el.tagName === 'OPTION' && el.parentNode && el.parentNode.tagName === 'SELECT') {
                el.parentNode.removeChild(el);
              } else if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }
          }

          scannedDirectives.push({
            componentName,
            directiveName: `v-${binding.arg || "unknown"}`,
            directiveValue: binding.value || null,
            fileName,
          });
        });
      },
      beforeMount(el, binding: DirectiveBinding, vnode: VNode) {
        nextTick(() => {
          let componentName = "UnnamedComponent";
          let fileName: string | undefined;

          // Attempt to retrieve component name from vnode
          const children = vnode.children;
          const controllerPath = window.routerData;

          const requiredPermission = generatePermissionHash(`${controllerPath}${binding.arg || "show"}`);
          const token = getTokenFromCookieParts();
          if (token) {
            const decodedToken = decodeJWT(token);
            const permission = decodedToken.payload.permission || [];
            if (decodedToken.payload.super != true && !permission?.includes(requiredPermission)) {
              el.parentNode?.removeChild(el); // Remove element from DOM
            }
          }

          scannedDirectives.push({
            componentName,
            directiveName: `v-${binding.arg || "unknown"}`,
            directiveValue: binding.value || null,
            fileName,
          });
        });
      },
    });

    app.directive("anyPermission", {
      mounted(el, binding: DirectiveBinding, vnode: VNode) {
        nextTick(() => {
          const permissions = binding.value as string[]; // Add type assertion here
          const token = getTokenFromCookieParts();
          if (token) {
            const decodedToken = decodeJWT(token);
            const userPermissions = decodedToken.payload.permission || [];
            const isSuperUser = decodedToken.payload.super === true;

            // Check if user has ANY of the required permissions
            const hasAnyPermission = permissions.some((perm: string) => { // Add explicit type here
              const controllerPath = window.routerData?.split("/:id").join("").split("\/").slice(-1).join("\/");
              const requiredPermission = generatePermissionHash(`${controllerPath}${perm}`);
              return userPermissions.includes(requiredPermission);
            });

            if (!isSuperUser && !hasAnyPermission) {
              if (el.tagName === 'OPTION' && el.parentNode && el.parentNode.tagName === 'SELECT') {
                el.parentNode.removeChild(el);
              } else if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }
          }
        });
      }
    });

    app.provide("$getScannedDirectives", () => scannedDirectives);
  },
};



export default DirectiveScannerPlugin;

