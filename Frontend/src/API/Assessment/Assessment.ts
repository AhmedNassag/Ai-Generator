import API from "../API";
import axios, { AxiosRequestConfig } from "axios";

export default class Assessment extends API {
  constructor() {
    super('assessment')
  }
 
  async sendAssessment(id: number) {
    try {
      axios.defaults.baseURL = this.baseUrl;
      console.log(this.baseUrl);
      const response = await axios.post(`/${this.route}/send/${id}`);
      return this.poup(response.data, "Send Assessment");
    } catch (error: any) {
      if (error.response) {
        return this.poup(error.response.data, "Send Assessment");
      }
    }
  }
}
