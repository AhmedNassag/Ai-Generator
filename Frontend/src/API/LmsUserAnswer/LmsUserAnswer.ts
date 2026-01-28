import API from "../API";
import axios from "axios";


export default class LmsUserAnswer extends API {
  constructor() {
    super('lms-user-answer')
  }

  async getStatusByModuleIdAndUserId(moduleId: string, userId: string): Promise<any> {
    const response: { data: any } = await axios.get(`/lms-user-answer/get-status/${moduleId}/${userId}`);
    return response.data;
  }

}
