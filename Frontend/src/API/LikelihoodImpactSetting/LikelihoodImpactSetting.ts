import API from "../API";
import axios from "axios";
declare const BASEPATH: string;

export default class LikelihoodSetting extends API {
  constructor() {
    super('system-setting')
  }
 
  async saveCompleteConfiguration(data: any) {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/saveCompleteConfiguration`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.error('Error saving configuration:', error.response.data.message);
        throw error; // Re-throw to handle in calling function
      }
      throw error;
    }
  }
}
