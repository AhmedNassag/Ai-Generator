import axios from "axios";
import API from "../API";
// declare const BASEPATH: string;
declare const REGULATORSERVICE: string;

export default class Domain extends API {
  constructor() {
    super("domain", REGULATORSERVICE); // Call the parent class constructor with the route name
  }

  /**
   * Method to handle drag and drop of domains/subdomains
   * @param data - Object containing changes and newTreeData
   * @returns A promise that resolves to the response data
   */
  async dragDomainSubDomain(data: { changes: any[]; newTreeData: any[] }) {
    // axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        "/drag-and-drop/domain-subDomain",
        data // Send the entire data object as request body
      );

      if (!response.data) {
        throw new Error("Empty response from server");
      }

      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  /**
   * Fetch subdomains by domain ID
   * @param domainId - The ID of the domain to fetch subdomains for
   * @returns Array of subdomains with id, name, and parent_id
   */
  async showSubDomainInDomain(domainId: any) {
    try {
      axios.defaults.baseURL = REGULATORSERVICE;
      const response = await axios.get(`/get-subDomain-In-Domain/${domainId}`);

      // Access the `data` property of the response
      const responseData = response.data;

      // Check if the response data is an array
      if (Array.isArray(responseData)) {
        return responseData.map((item) => ({
          id: item.id,
          name: item.name,
          parent_id: item.parent_id,
        }));
      } else {
        console.error("Unexpected API response format:", responseData);
        return [];
      }
    } catch (error) {
      console.error("Error fetching sub-domains:", error);
      return [];
    }
  }
}