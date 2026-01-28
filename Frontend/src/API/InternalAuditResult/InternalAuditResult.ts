import axios from "axios";
import API from "../API";

export default class InternalAuditResult extends API {
  constructor() {
    super("internal-audit-result");
  }
  async bulckUpdateDataOfAudit(params: any) {
    try {
      const response = await axios.post(`/bulckUpdateDataOfAudit`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error checking controls status:", error);
      throw error;
    }
  }
}
