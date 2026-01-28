import axios from "axios";
import API from "../API";

export default class LmsModule extends API {
  constructor() {
    super("lms-module");
  }

  async getModules(moduleIds: string[]): Promise<any> {
    if (moduleIds.length > 0) {
      const response: { data: any } = await axios.get(
        `/lms-module/get-modules/${moduleIds}`
      );
      return response.data;
    }
    return [];
  }
}
