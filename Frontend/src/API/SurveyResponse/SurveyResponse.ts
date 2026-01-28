import axios from "axios";
import API from "../API";
declare const BASEPATH : string; // Ensure TypeScript knows about it

export default class SurveyResponse extends API {
  constructor() {
    super('survey-response')
  }


    async checkStatus(email: string, userEmail: string): Promise<any> {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.get(`/survey/check-status/${email}/${userEmail}`);
      return response.data;
    }

}
