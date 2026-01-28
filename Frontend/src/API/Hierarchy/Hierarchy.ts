import axios from "axios";
import API from "../API";
declare const USERSERVICE: string;

export default class Hierarchy extends API {
  constructor() {
    super("hierarchy",USERSERVICE);
  }

  async dragAndDrop(changes: []): Promise<any> {
    try {
      const response = await axios.post(
        `/drag-and-drop`,
        {
          changes,
        },
      );

      if (!response.data) {
        throw new Error("Server returned empty response");
      }
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
