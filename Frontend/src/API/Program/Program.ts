import API from "../API";
import axios from "axios";

declare const STRATEGIC_PLAN_SERVICE: string;
export default class Program extends API {
  constructor() {
    super("program", STRATEGIC_PLAN_SERVICE);
  }
  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = STRATEGIC_PLAN_SERVICE;
      const response = await axios.post(
        `/program/${itemId}/changeStatus`,
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
