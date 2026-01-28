import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";
(window as any).Pusher = Pusher;
import RoleApi from "@/API/Role/Role";
import Auth from "@/API/Auth";
// const roleApi = new RoleApi();
// console.log("Auth USER", Auth.USER);
// let role: any = {};
// const role : any = await roleApi.getRoleJobWithDepartment(Auth.USER.job_id, Auth.USER.department_id);
// if (Auth.USER?.job_id || Auth.USER?.department_id) {
//   roleApi
//     .getRoleJobWithDepartment(Auth.USER?.job_id, Auth.USER?.department_id)
//     .then((response: any) => {
//       role = response?.data;
//       console.log("Role", role);
//     })
//     .catch((error) => {
//       console.error("Error fetching role:", error);
//     });
// }
// Get bearer token from cookies
let bearerToken = "";
let i = 0;

console.log("Looking for token cookies...");
while (Cookies.get(`api_token_part${i + 1}`)) {
  let cookiePart = Cookies.get(`api_token_part${i + 1}`);
  bearerToken += cookiePart;
  i++;
}

// Create Echo instance with custom auth formatter
const echo = new Echo({
  broadcaster: "reverb",
  key: "eczq6mqamfp4rxpldpti",
  //  wsHost: "127.0.0.1",
  wsHost: "ksu-gateway.cybermode.advancedcontrols.tech",
  wsPort: 3000,
  //  wsPort: 9000,
  forceTLS: false,
  enabledTransports: ["ws", "wss"],
  //  authEndpoint: "http://127.0.0.1:8000/api/broadcasting/auth",
  authEndpoint:
    "http://ksu-gateway.cybermode.advancedcontrols.tech/api/notifications/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      Accept: "application/json",
    },
    params: {
      role_id: Auth.ROLE?.id,
      team_ids: Auth.USER?.team_ids?.map((id: string) => String(id)),
    },
  },
});

export default echo;
