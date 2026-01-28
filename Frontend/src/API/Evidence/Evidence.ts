import API from "../API";
declare const REGULATORSERVICE: string;
import axios from "axios";

export default class Evidence extends API {
  constructor() {
    super("evidence", REGULATORSERVICE);
  }

  async changeStatus(data: any): Promise<any> {
    axios.defaults.baseURL = REGULATORSERVICE;
    const response: { data: any } = await axios.post(
      `/evidence/${data.id}/change-status`, data // Send the entire data object as request body
    );
    return response.data;
  }
}
