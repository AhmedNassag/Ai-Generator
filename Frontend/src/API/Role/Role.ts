import API from "../API";
import axios from "axios";
import { serialize } from "object-to-formdata";
declare const USERSERVICE: string;

export default class Role extends API {
  constructor() {
    super("role", USERSERVICE);
  }

  async getRoleJobWithDepartment(
    jobId: string,
    departmentId: string
  ): Promise<any[]> {
    try {
      axios.defaults.baseURL = USERSERVICE;
      const response = await axios.get(
        "/getRoleJobWithDepartment/" + jobId + "/" + departmentId
      );
      return response.data; // Assuming the API returns an array of color objects
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        console.error(
          "Axios error:",
          error.response?.data?.message || error.message
        );
      } else {
        // Handle other errors
        console.error("Unexpected error:", error);
      }
      return []; // Return an empty array in case of error
    }
  }


  async save(
    data: Record<string, any>
  ): Promise<any> {
    try {
      axios.defaults.baseURL = USERSERVICE;
      const response = await axios.post(
        `/role/save/colon`,
        data,
      );
      this.poup(response, "Role Saved Successfully");
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
        return error.response.data;
      }
    }
  }

  async applyToAllDepartments(
    data: Record<string, any>
  ): Promise<any> {
    try {
      axios.defaults.baseURL = USERSERVICE;
      const response = await axios.post(
        `/role/apply/to/all/departments`,
        data
      );
      this.poup(response, "Applied Successfully");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        console.error(
          "Axios error:",
          error.response?.data?.message || error.message
        );
      } else {
        // Handle other errors
        console.error("Unexpected error:", error);
      }
      return null; // Return null in case of error
    }
  }

  
}