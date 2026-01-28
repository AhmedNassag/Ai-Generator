import axios from "axios";
import API from "../API";
declare const BASEPATH: string;

export default class Course extends API {
  constructor() {
    super("course");
  }

  async getLevels(courseId: string): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    const response: { data: any } = await axios.get(
      `/lms-level/get-levels/${courseId}`
    );
    return response.data;
  }

  async checkMandatoryModules(userId: string): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    const response: { data: any } = await axios.get(`/course/${userId}`);
    return response.data.data;
  }

  async addTrainingModule() {
    console.log("addTrainingModule");
  }
}
