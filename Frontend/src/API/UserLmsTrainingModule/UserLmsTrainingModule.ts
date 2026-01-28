import axios from "axios";
import API from "../API";
declare const BASEPATH : string; // Ensure TypeScript knows about it

export default class UserLmsTrainingModule extends API {
  constructor() {
    super("user-lms-training-module",BASEPATH);
  }

  async getModules(): Promise<any> {
    console.log("BASEPATH", BASEPATH);

     axios.defaults.baseURL  = BASEPATH;
    const response: { data: any } = await axios.get(`/campaign/get-modules`);
    return response.data;
  }

}
