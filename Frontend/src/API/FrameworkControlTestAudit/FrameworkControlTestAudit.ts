import API from "../API";
import axios, { AxiosResponse } from "axios";
declare const REGULATORSERVICE: string;

export default class FrameworkControlTestAudit extends API {
  constructor() {
    super("framework-control-test-audit", REGULATORSERVICE);
  }

  async checkAllControlsInClosed(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      console.log("Checking controls status with params:", params);
      const response = await axios.get(`/check-all-controls-closed`, {
        params,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to check controls");
      }

      console.log("Control check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error checking controls status:", error);
      throw error;
    }
  }
  async updateEvidenceStatus(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/evidence/status`, {
        params,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async updateRequirementStatus(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/requirement/status`, {
        params,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async UpdateAuditControlStatus(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/control/status`, {
        params,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async addNewRequirement(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get(`/add/requirement`, {
        params,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async addNewEvidence(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.post(`/add/evidence`, params, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async CloseAuditWorkNowInSpesificFrameId(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get(`/close-sepsific-audit`, {
        params,
      });
      console.log("CloseAuditWorkNowInSpesificFrameId response:", response);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async fetchFilteredDataParentAndMain(params: {
    audit_id: string;
    framework_id: string;
  }) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get("/fetch-filtered-data-parentAndMain", {
        params: params, // Axios will serialize this as ?audit_id=...&framework_id=...
      });

      console.log("fetchFilteredDataParentAndMain response:", response.data);
      return response.data; // usually you want response.data, not the whole response
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      throw error;
    }
  }
    async fetchControlWithDomainAndSubdomainDataAudit(params: {
    audit_id: string;
    framework_id: string;
  }) {
    axios.defaults.baseURL = REGULATORSERVICE;

    try {
      const response = await axios.get("/domain-subdomain-fetch-filtered-data-parentAndMain", {
        params: params, // Axios will serialize this as ?audit_id=...&framework_id=...
      });

      console.log("fetchFilteredDataParentAndMain response:", response.data);
      return response.data; // usually you want response.data, not the whole response
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      throw error;
    }
  }
  
}
