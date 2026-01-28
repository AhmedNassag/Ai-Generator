import axios from "axios";
import API from "../API";

export default class Question extends API {
  constructor() {
    super('question')
  }


  async removeQuestionFromTemplate(questionId: string, templateId: string): Promise<any> {
    const response: { data: any } = await axios.get(`/question/${questionId}/template/${templateId}`);
    return response.data;
  }

    async addRisk() {
    console.log("addRisk");
  }

}
