import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class AuditPlan extends API {
  constructor() {
    super("audit-plan", REGULATORSERVICE);
  }
  async saveAssignments(params: any) {
    try {
      const response = await axios.post("/saveAssignments", params);
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
  async getStatusImplementedForAllFrameworks() {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get(`/implementd-status/all-frameworks`);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async getAllStatusForAllFrameworks() {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get(`/all-status/all-frameworks-audit`);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async exportDataOfAudit(id: any) {
    axios.defaults.baseURL = REGULATORSERVICE;
    try {
      const response = await axios.get(`/exportDataOfAudit/${id}`, {
        responseType: "blob", // 🔥 THIS IS THE KEY!
      });
      return response; // Return full response, not response.data
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
  async fetchSpesificAuditResult(id: any) {
    axios.defaults.baseURL = REGULATORSERVICE;
    try {
      const response = await axios.get(`/fetchSpesificAuditResult/${id}`);
      return response; // Return full response, not response.data
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
