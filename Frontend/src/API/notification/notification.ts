// import API from "../API";
// declare const NOTIFICATIONlOGS: string;
// export default class notification extends API {
//   constructor() {
//     super("notification", NOTIFICATIONlOGS);
//   }
// }
// src/API/notification.ts
import API from "../API";
import axios, { AxiosRequestConfig } from "axios";

declare const NOTIFICATIONlOGS: string;
export default class NotificationAPI extends API {
  constructor() {
    super("notification", NOTIFICATIONlOGS);
  }

  async getUserNotifications(
    userId: string,
    roleId: string,
    teamIds: string[]
  ) {
    axios.defaults.baseURL = NOTIFICATIONlOGS;
    // return axios.get(`get/user/notification/${userId}`);
    return axios.get(`get/user/notification/${userId}`, {
      params: {
        role_id: roleId,
        team_ids: teamIds, // Axios will serialize array properly
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    axios.defaults.baseURL = NOTIFICATIONlOGS;

    return axios.post(`mark-notification-read/${id}`, { user_id: userId });
  }

  async markAllAsRead(userId: string) {
    axios.defaults.baseURL = NOTIFICATIONlOGS;
    return axios.post(`mark-all-notifications-read/${userId}`);
  }
}
