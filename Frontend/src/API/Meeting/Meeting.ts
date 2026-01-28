import API from "../API";
import axios from "axios";

declare const BASEPATH: string;

export default class Meeting extends API {
  constructor() {
    super("meeting");
  }

  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(
        `/meeting/${itemId}/changeStatus`,
        data
      );
      return response.data; // Return full response object
    } catch (error: any) {
      if (error?.response) {
        return error?.response?.data?.errors;
      }
    }
  }

  async approveMeetingMinutes(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(
        `/meeting/${itemId}/approveMeetingMinutes`,
        data
      );
      return response.data; // Return full response object
    } catch (error: any) {
      if (error?.response) {
        return error?.response?.data?.errors;
      }
    }
  }

  async changeParticipantStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(
        `/meeting/${itemId}/changeParticipantStatus`,
        data
      );
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async changeParticipantRSVPStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(
        `/meeting/${itemId}/changeParticipantRSVPStatus`,
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
