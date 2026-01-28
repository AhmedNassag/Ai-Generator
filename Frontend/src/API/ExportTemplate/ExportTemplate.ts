import API from "../API";
import axios from "axios";
declare const BASEPATH: string;
declare const USERSERVICE: string;
export default class ExportTemplate extends API {
  constructor() {
    super('export-template' , USERSERVICE)
  }
 
   async changeStatus(itemId: string): Promise<any> {
    try {
      axios.defaults.baseURL = USERSERVICE;
      const response = await axios.get(
        `/export-template/update-status/${itemId}`
      );
      return response;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
  
}
