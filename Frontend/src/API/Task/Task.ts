import API from "../API";
import axios from "axios";
declare const BASEPATH: string;

export default class Task extends API {
  constructor() {
    super('task')
  }

  async changeStatus(id: string, status: string): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;

      const url = `task/change-status/${id}`;
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };

      const payload = status ? { 'status': status } : {};

      const response = await axios.post(url, payload, { headers });

      return response.data;
    } catch (error) {
      console.error("Error changing status:", error);
      throw error;
    }
  }
}
