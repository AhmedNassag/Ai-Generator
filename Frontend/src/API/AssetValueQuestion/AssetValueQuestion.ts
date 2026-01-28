import axios from "axios";
import API from "../API";

export default class AssetValueQuestion extends API {
  constructor() {
    super("asset-value-question");
  }

  async saveQuestion(questionData: any): Promise<any> {
    const response = await axios.post(
      `/asset-value-question/save-question`,
      questionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    this.poup(response.data,'Asset value question saved');
    
    return response.data;
  }
}
