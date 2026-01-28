import API from "../API";
import axios from "axios";
declare const BASEPATH: string;

export default class ThirdPartyContactQuestionnaireAnswer extends API {
  constructor() {
    super('contact-questionnaire-answer')
  }


  async updatestatus(id: number, data: any) {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `/contact-questionnaire-answer/updateStatus/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async viewQuestionnaireAnswer() {
    console.log("viewQuestionnaireAnswer button clicked");
  }

  async approveRequestAssessment() {
    console.log("approveRequestAssessment button clicked");
  }
  async sendRemediation() {
    console.log("sendRemediation button clicked");
  }
  async refuseRequestAssessment() {
    console.log("refuseRequestAssessment button clicked");
  }
 
}
