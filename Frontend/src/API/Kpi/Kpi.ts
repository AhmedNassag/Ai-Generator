import API from "../API";
import axios from "axios";

declare const BASEPATH: string;

export default class Kpi extends API {
  constructor() {
    super('kpi')
  }



  async initiateKpi(id: string, data: any): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      const response = await axios.post(`/kpi/initiateKpi/${id}`, data);
      return response; // Return full response object
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
 
}