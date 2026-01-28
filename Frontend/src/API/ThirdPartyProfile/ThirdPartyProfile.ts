import API from "../API";
import axios from "axios";
declare const BASEPATH: string;


export default class ThirdPartyProfile extends API {
  constructor() {
    super('third-party-profile')
  }

  // Get third party classifications
  async getClassifications(): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    try {
      const response = await axios.get("/third-party-classification");
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  async viewProfile(): Promise<any> {
    console.log(`view viewProfile`);
  }
}