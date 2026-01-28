import axios from "axios";
import API from "../API";
declare const USERSERVICE: string;

export default class Department extends API {
  constructor() {
    super("department", USERSERVICE);
  }
  async getProfileSepartment(depId: number) {
    try {
      const response = await axios.get(`/department/profile/${depId}`);
      if (!response.data) {
        throw new Error("Empty response from server");
      }
      return response;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  
  async getDepartmentManagers(departmentId: number) {
    axios.defaults.baseURL = USERSERVICE;
    console.log("Fetching department managers for department ID:", departmentId);
    
    try {
      const response = await axios.get(`/department/Managers/${departmentId}`);
       console.log("response data:", response.data);
      return response.data;
     
      
    } catch (error) {
      throw error;
    }
  }

   
}
