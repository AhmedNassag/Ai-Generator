import API from "../API";
import axios from "axios";
declare const BASEPATH: string;

export default class TopicRecommendation extends API {
  constructor() {
    super("topic-recommendation");
  }

  async delete(id: string, recordIds: string[] = []): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;

      const response = await axios.delete(`/${this.route}/${id}`, {
        data: { recordIds },
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
        const errorData = error.response.data;
        this.poup(errorData, "Delete");
        return errorData;
      }
    }
  }

  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(
        `/topic-recommendation/${itemId}/change-status`,
        data
      );
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
}
