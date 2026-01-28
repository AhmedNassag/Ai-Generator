import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class FrameworkInstall extends API {
  constructor() {
    super("framework-install", REGULATORSERVICE);
  }

  async installFrame(params: any) {
    axios.defaults.baseURL = REGULATORSERVICE;
    try {
      const response = await axios.post("/install-framework", params);
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
