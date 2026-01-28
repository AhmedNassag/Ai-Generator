import API from "../API";
import axios from "axios";

declare const STRATEGIC_PLAN_SERVICE: string;

export default class Deliverable extends API {
  constructor() {
    super("deliverable", STRATEGIC_PLAN_SERVICE);
  }

  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.post(
        `/deliverable/${itemId}/changeStatus`,
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
