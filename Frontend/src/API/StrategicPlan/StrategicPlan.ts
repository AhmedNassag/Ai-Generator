import API from "../API";
import axios from "axios";

declare const STRATEGIC_PLAN_SERVICE: string;

export default class StrategicPlan extends API {
  constructor() {
    super("strategic-plan", STRATEGIC_PLAN_SERVICE);
  }

  async activeDeactive(id: string): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.get(`/strategic-plan/activeDeactive/${id}`);
      return response?.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
    }
  }

  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.post(
        `/strategic-plan/${itemId}/changeStatus`,
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
