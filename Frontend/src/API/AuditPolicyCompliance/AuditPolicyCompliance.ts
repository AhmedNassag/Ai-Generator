import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class AuditPolicyCompliance extends API {
  constructor() {
    super("audit-policy-compliance", REGULATORSERVICE);
  }
async fetchAuditData(
  id: string,
  secondId: string,
  params?: Record<string, any>
): Promise<any> {
  try {
    axios.defaults.baseURL = REGULATORSERVICE;
    
    // Build query string from params
    const queryParams = {
      per_page: params?.per_page || 10,
      page: params?.page || 1,
      ...params // Include any other params
    };
    
    const response = await axios.get(`/fetch-data-audit/${id}/${secondId}`, {
      params: queryParams,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.data.message);
    }
    throw error;
  }
}
}
