import API from "../API";
import axios from "axios";
declare const REGULATORSERVICE: string;

export default class Regulator extends API {
  constructor() {
    super("regulator", REGULATORSERVICE);
  }

  async insertFramework(formData: any, config: any) {
    // axios.defaults.baseURL = this.baseUrl;

    try {
      const response = await axios.post(`/frameworks/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
    async fetchData() {
    // axios.defaults.baseURL = this.baseUrl;

    try {
      const response = await axios.get(`/regulator/frame/audit`);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async showFramework(frameworkId: number) {}
}
