import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class AuditPolicyComplianceResult extends API {
  constructor() {
    super("audit-policy-compliance-result", REGULATORSERVICE);
  }
  async upsertEvidence(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/evidence-audit/insert`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async deleteEvidence(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get(`/evidence-audit/delete`, {
        params,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async UpdateAuditerStatus(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/update/auditer-status`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async importResultExcel(formData: any, config: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/import/result`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        ...config, // Spread the config to include onUploadProgress
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async calcTotalStatus(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/calc/total-status`, params);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async approveAllPolicies(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/approve/all-polices`, params);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async sendResults(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/send/result`, params);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
}
