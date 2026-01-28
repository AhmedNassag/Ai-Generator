import API from "../API";
import axios from "axios";
declare const BASEPATH: string;
declare const USERSERVICE: string;

export default class ThirdPartyRequest extends API {
  constructor() {
    super("third-party-request");
  }

  // Get department managers for a specific department
  async getDepartmentManagers(departmentId: number) {
    axios.defaults.baseURL = USERSERVICE;

    try {
      const response = await axios.get(`/department/Managers/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reject a third party request
  async rejectRequest(requestId: number, rejectReason: string) {
    try {
      const response = await axios.post(
        `/third-party-request/reject/${requestId}`,
        {
          reject_reason: rejectReason,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createRequestAssesment() {
    console.log("createRequestAssesment button clicked");
  }

  async refuseRequestAssessment() {
    console.log("refuseRequestAssessment button clicked");
  }

  async viewRequest() {
    console.log("viewRequest button clicked");
  }
}