import API from "../API";
import axios from "axios";

declare const STRATEGIC_PLAN_SERVICE: string;

export default class Task extends API {
  constructor() {
    super("sp_task", STRATEGIC_PLAN_SERVICE);
  }

  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.post(`/sp_task/${itemId}/changeStatus`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
}
