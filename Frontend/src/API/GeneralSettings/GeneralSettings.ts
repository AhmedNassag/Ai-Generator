import API from "../API";

export default class GeneralSettings extends API {
  constructor() {
    super('system-setting')
  }
 
  async from(
    data: Record<string, any>,
    returnData = false,
    formData = true,
    stopPopup = false
  ): Promise<any> {
    try {
      const headers = {
        "Content-Type": "multipart/form-data", 
        charset: "utf-8"
      };

      const res = await this.insert(data, headers, formData);
      console.log("res", res);
      let action = data.id ? "Update" : "Insert";
    
      if (returnData) {
        if (!stopPopup) return { status: this.poup(res, action), data: res };
        return { data: res };
      }
      if (!stopPopup) return this.poup(res, action);
    } catch (error: any) {
      console.error("Error in from method:", error.response?.data || error.message);
      return error.response?.data;
    }
  }
  
  
}
