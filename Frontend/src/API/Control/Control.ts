import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class Control extends API {
  constructor() {
    super("control", REGULATORSERVICE);
  }

  async viewRequirements(controlId: string): Promise<any> {
    console.log(`view requirements`);
  }
  async linkRequirement(controlId: string): Promise<any> {
    console.log(`view requirements`);
  }

    // Method to unlink a requirement from a control
  async unlinkControlRequirement(
    requirementId: string,
    controlId: string
  ): Promise<any> {
    const response: { data: any } = await axios.get(
      `/control/${requirementId}/requirement/${controlId}`
    );
    return response.data;
  }
}
