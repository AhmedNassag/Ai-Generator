import API from "../API";
import axios from "axios";

declare const BASEPATH: string;

export default class Campaign extends API {
  constructor() {
    super('campaign')
  }



  async changeStatusToApproved(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/campaign/${itemId}/changeStatusToApproved/`, data)
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }



  async changeStatusToReject(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/campaign/${itemId}/changeStatusToReject`, data)
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }



  async sendMail(itemId: string): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/campaign/${itemId}/sendMail`)
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
 
}
