import API from "../API";
import axios from "axios";

declare const BASEPATH: string;
export default class PhishingGroup extends API {
  constructor() {
    super('phishing-group')
  }

   async addUsers(data: any): Promise<any> {
      try {
        axios.defaults.baseURL = BASEPATH;
        const response = await axios.post(`/phishing-groups/users`, data);
        return response; // Return full response object
      } catch (error: any) {
        if (error.response) {
          console.log(error.response.data.message);
        }
      }
    }
}
