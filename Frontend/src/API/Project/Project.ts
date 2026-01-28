import API from "../API";
import axios from "axios";

declare const STRATEGIC_PLAN_SERVICE: string;

export default class Project extends API {
  constructor() {
    super("project", STRATEGIC_PLAN_SERVICE);
  }

  async setRealBudget(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.post(
        `/project/${itemId}/setRealBudget`,
        data
      );
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.post(
        `/project/${itemId}/changeStatus`,
        data
      );
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
}
