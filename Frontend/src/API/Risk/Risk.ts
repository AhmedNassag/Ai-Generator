import API from "../API";
import axios, { AxiosRequestConfig } from "axios";
declare const BASEPATH: string; // Ensure TypeScript knows about it

export default class Risk extends API {
  constructor() {
    super("risk");
  }

  async editMitigationRisk(items: any): Promise<any> {
    try {
      const response = await this.update(items);
      this.poup(response, "Risk updated");
      return response;
    } catch (error) {
      console.error("Error updating owner status:", error);
      throw error;
    }
  }

  async updateRiskImpact(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/updateRiskImpact`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async updateIdentification(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/updateIdentification`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async changeStatus(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/changeStatus`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async updateRiskAnalysis(data: Record<string, any> | FormData): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      // Determine if data is FormData (for file uploads) or regular object
      const isFormData = data instanceof FormData;

      // Set appropriate headers based on data type
      const config = isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            // Optional: Track upload progress for file uploads
            onUploadProgress: (progressEvent: any) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log("Upload progress:", percentCompleted + "%");
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
            },
          };

      const response = await axios.post(`/updateRiskAnalysis`, data, config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Update Risk Analysis");
        return error.response.data;
      }
      // Handle network errors or other errors without response
      console.error("Error updating risk analysis:", error);
      throw error;
    }
  }
  async resetMitigation(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/resetMitigation`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async editMitigation(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/editMitigation`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async preformReview(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/preformReview`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async resetReview(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/resetReview`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }

  async proccessReview(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/proccessReview`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }
  async previewReview(data: Record<string, any>): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/previewReview`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.poup(error.response.data, "Approve Request");
        return error.response.data;
      }
    }
  }

    async getInsights(data: Record<string, any>): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      console.log('dataaaaaaa', data);
      const response = await axios.get(`/risk/insights/get-all-insights`,data);
      return response.data;
    } catch (error) {
      console.error('Error fetching risk insights:', error);
      throw error;
    }
  }
}
