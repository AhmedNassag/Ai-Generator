import API from "../API";
import axios from "axios";

declare const BASEPATH: string;
export default class Agenda extends API {
  constructor() {
    super("agenda");
  }
  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/agenda/${itemId}/changeStatus`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
  async changeRelatedTopicStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/agenda/${itemId}/changeRelatedTopicStatus`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
}
