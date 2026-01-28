import API from "../API";
import axios from "axios";
declare const USERSERVICE : string;

export default class User extends API {
  constructor() {
    super("user" ,USERSERVICE);
  }

  // Method to unassign a user from a team


  async activeDeactive(userId: string): Promise<any> {
    try {
      const response = await axios.get(`user/activeDeactive/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while changing the status.");
    }
  }

  async updatePassword(userId: string, formData: {
    old_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`/user/profile/updatePssword/${userId}`, formData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.[0] || "Failed to reset password. Please try again.";
      throw new Error(message);
    }
  }

    async getProfile(userId: number) {
    try {
      const response = await axios.get(`/user/profile/${userId}`);
      if (!response.data) {
        throw new Error("Empty response from server");
      }
      return response;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }


}
