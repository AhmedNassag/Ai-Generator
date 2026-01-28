import API from "../API";
import axios from "axios";
declare const BASEPATH: string;

export default class ThirdPartyQuestionnaire extends API {
  constructor() {
    super("third-party-questionnaire");
  }

  async getQuestionnaireData(id:string) {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.get(`view-third-party-questionnaire-answer/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    }
  }

  async sendEmail() {
    console.log("Send email button clicked");
  }

  // async sendAssessment() {
  //   console.log("Send Assessment button clicked");
  // }

  async sendAssessment(id: number, baseUrl: string) {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `/third-party-questionnaire/sendEmail/${id}`,
        {
          baseurl: baseUrl,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async viewAssessment() {
    console.log("view Assessment button clicked");
  }
}
