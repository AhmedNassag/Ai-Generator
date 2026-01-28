import API from "../API";
import axios from "axios";

export default class AssessmentsResults extends API {
  constructor() {
    super('assessment-results')
  }

  // Submit assessment answers
  async submitAnswers(data: any) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(`/${this.route}/submit`, data);
      return this.poup(response.data, "Submit Assessment");
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Submit Assessment");
      }
    }
  }

  // Flag risks in assessment answers
  async flagRisks(id: string, riskItems: any) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(`/${this.route}/${id}/flag-risks`, { risk_items: riskItems });
      return this.poup(response.data, "Flag Risks");
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Flag Risks");
      }
    }
  }

  // Approve flagged risks
  async approveRisks(id: string) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(`/${this.route}/${id}/approve-risks`);
      return this.poup(response.data, "Approve Risks");
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Approve Risks");
      }
    }
  }

  // Reject flagged risks
  async rejectRisks(id: string) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(`/${this.route}/${id}/reject-risks`);
      return this.poup(response.data, "Reject Risks");
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Reject Risks");
      }
    }
  }

  // Convert approved risks to Risk module
  async convertToRisks(id: string, data: any) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(`/${this.route}/${id}/convert-to-risks`, data);
      return this.poup(response.data, "Convert to Risks");
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Convert to Risks");
      }
    }
  }

  // Get pending approvals
  async getPendingApprovals() {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.get(`/${this.route}/pending-approvals`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Get Pending Approvals");
      }
    }
  }

  // Get user's assessment result
  async getUserAssessmentResult(userId: string, assessmentId: string) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.get(`/${this.route}/user/${userId}/assessment/${assessmentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Get Assessment Result");
      }
    }
  }
}
