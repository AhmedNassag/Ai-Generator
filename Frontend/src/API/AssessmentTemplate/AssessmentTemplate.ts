import API from "../API";

export default class AssessmentTemplate extends API {
  constructor() {
    super("assessment-template");
  }

  async addQuestions() {
    console.log("addQuestions");
  }

    async linkQuestions() {
    console.log("linkQuestions");
  }
}
