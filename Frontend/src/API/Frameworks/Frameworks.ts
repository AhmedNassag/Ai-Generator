import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class Frameworks extends API {
  constructor() {
    axios.defaults.baseURL = REGULATORSERVICE;
    super("frameworks", REGULATORSERVICE);
  }
  async controlsByFramework(frameworkId: number) {
    axios.defaults.baseURL = REGULATORSERVICE;
    try {
      const response = await axios.get(
        `/controls-by-framework?framework_id=${frameworkId}`
      );
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      return response;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  /**
   * Fetch domains by framework ID
   * @param frameworkId - The ID of the framework to filter by
   * @returns Promise with the domains list
   */
  async getDomainsByFramework(frameworkId: number) {
    try {
      axios.defaults.baseURL = REGULATORSERVICE;
      const response = await axios.get(`/domains?framework_id=${frameworkId}`);
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      return response;
    } catch (error) {
      console.error("Error fetching domains:", error);
      throw error;
    }
  }
}
