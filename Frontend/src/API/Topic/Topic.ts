import API from "../API";
import axios from "axios";

declare const BASEPATH: string;
export default class Topic extends API {
  constructor() {
    super("topic");
  }
  async changeStatus(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/${itemId}/changeStatus`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async takeDecision(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/${itemId}/takeDecision`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async addNote(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/${itemId}/addNote`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async updateManyTopics(data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/updateManyTopics`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async startVoting(agendaId: string): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/startVoting/${agendaId}`);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async endVoting(agendaId: string): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/endVoting/${agendaId}`);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async vote(itemId: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/topic/${itemId}/vote`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
}
