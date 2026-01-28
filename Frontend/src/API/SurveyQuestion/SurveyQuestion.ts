import API from "../API";

export default class SurveyQuestion extends API {
  constructor() {
    super("survey-question");
  }

  openDetailsModal() {
    console.log("openDetailsModal");
  }
}
