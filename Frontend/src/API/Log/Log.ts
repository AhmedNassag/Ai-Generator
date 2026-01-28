import axios from "axios";
import API from "../API";
declare const NOTIFICATIONlOGS: string;
 export default class Log extends API {
   constructor() {
     super("log", NOTIFICATIONlOGS);
   }

   async getLogMultiModels(params: any) {
     axios.defaults.baseURL = NOTIFICATIONlOGS;

     try {
       const response = await axios.get(`/log/multi/models/show`, {
         params,
       });
       return response;
     } catch (error) {
       console.error(error);
       throw error;
     }
   }

   async getModelLogs(modelName: string, ItemId: string): Promise<any> {
     try {
       axios.defaults.baseURL = NOTIFICATIONlOGS;

       const response = await axios.get(`log/${modelName}/${ItemId}`);
       return response.data;
     } catch (error: any) {
       if (error.response) {
         console.log(error.response.data.message);
       }
     }
   }
 }
