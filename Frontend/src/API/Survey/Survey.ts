import API from "../API";
import axios from "axios";
declare const BASEPATH: string; // Ensure TypeScript knows about it

export default class Survey extends API {
  constructor() {
    super("survey", BASEPATH);
  }

  async takeAction(payload: {
    surveyId: string | number;
    status: string;
    reviewerId?: string | number;
    privacy?: string;
    sendToStakeholders?: boolean;
    sendToTeams?: boolean;
    sendToAllUsers?: boolean;
  }): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    // Construct the URL without including the payload in the path
    const url = `/survey/change-status/send`;

    // Send the payload as the request body
    const response = await axios.post(url, payload);
    console.log("Survey status updated:", response);

    return response;
  }

  async sendSurvey(
    surveyId: string,
    usersEmailByTeam_ids: string[],
    activatedUsersEmails: string[],
    stakeholdersEmails: string[],
    baseurl: string
  ): Promise<any> {
    // Construct the URL with baseurl as a query parameter
    const url = `/survey/send-survey/${surveyId}?baseurl=${encodeURIComponent(
      baseurl
    )}`;
    const payload = {
      usersEmailByTeam_ids: usersEmailByTeam_ids,
      activatedUsersEmails: activatedUsersEmails,
      stakeholdersEmails: stakeholdersEmails,
    };
    const response = await axios.post(url, payload);
    console.log("Response:", response);
    return response;
  }

  // async checkEmail(email: string): Promise<any> {
  //   const response = await axios.get(`/survey/check-email/${email}`);
  //   return response.data.data.message;
  // }

  async openDetailsModal() {
    console.log("openDetailsModal");
  }

  async surveyResult() {
    console.log("surveyResult");
  }

  async cloneSurvey() {
    console.log("cloneSurvey");
  }

  async generateLink() {
    console.log("generateLink");
  }
}
