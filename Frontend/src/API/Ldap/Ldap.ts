import API from "../API";
import axios from "axios";
declare const USERSERVICE: string;

export default class Ldap extends API {
  constructor() {
    super("ldap", USERSERVICE);
  }

  async from(
    data: Record<string, any>,
    returnData = false,
    formData = true,
    stopPopup = false
  ): Promise<any> {
    try {
      const headers = {
        "Content-Type": "multipart/form-data",
        charset: "utf-8",
      };

      const res = await this.CreateOrUpdate(data, headers, formData);
      console.log("res", res);
      let action = data.id ? "Update" : "Insert";

      if (returnData) {
        if (!stopPopup) return { status: this.poup(res, action), data: res };
        return { data: res };
      }
      if (!stopPopup) return this.poup(res, action);
    } catch (error: any) {
      return error.response?.data;
    }
  }

  async getDepartments(): Promise<any> {
    try {
      const response = await axios.get(`/${this.route}/get-departments`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error in getDepartments method:",
        error.response?.data || error.message
      );
      return error.response?.data;
    }
  }

  async getUsers(): Promise<any> {
    try {
      const response = await axios.get(`/${this.route}/get-users`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error in getUsers method:",
        error.response?.data || error.message
      );
      return error.response?.data;
    }
  }

  async importDepartments(data: { departments: string[] }): Promise<any> {
    try {
      const response = await axios.post(
        `/${this.route}/import-departments`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}
