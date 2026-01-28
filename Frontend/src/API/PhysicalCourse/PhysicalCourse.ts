import API from "../API";
import axios from "axios";
declare const BASEPATH: string;

export default class PhysicalCourse extends API {
  constructor() {
    super("physical-course");
  }

  // toggle course registeration
  async toggleRegistration(courseId: string): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.get(
        `physical-course/toggle-registration/${courseId}`
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while changing the status.");
    }
  }

  // toggle course completion
  async toggleCompletion(courseId: string, data: any): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `physical-course/toggle-completeion/${courseId}`,
        {
          eligible_users: data,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while changing the status.");
    }
  }
  //

  async getCourseCertificates(courseId: string): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.get(
        `user-certificate?with[]=template&filter=certificateable_id|${courseId}|=`
      );

      return response.data;
    } catch (error) {
      throw new Error("An error occurred while changing the status.");
    }
  }

  // register user in course
  async registerInCourse(courseId: string, userId: string): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `physical-course/${courseId}/register`,
        {
          user_id: userId,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while registering for the course.");
    }
  }

  // Approve a course request
  async approveRequest(requestId: string | number): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.get(`/requests/${requestId}/approve`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "An error occurred while approving the request."
      );
    }
  }

  // Cancel a course request
  async cancelRequest(requestId: string | number): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.get(`/requests/${requestId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "An error occurred while canceling the request."
      );
    }
  }

  // Transfer a course request
  async transferRequest(
    requestId: string | number,
    data: any = {}
  ): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `/requests/${requestId}/transfer`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "An error occurred while transferring the request."
      );
    }
  }

  // store Attendance for course
  async storeAttendance(
    courseId: string | number,
    data: any = {}
  ): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `/physical-course/${courseId}/attendance/save`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "An error occurred while transferring the request."
      );
    }
  }

  async storeGrade(courseId: string | number, data: any = {}): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `/physical-course/${courseId}/grades/save`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "An error occurred while transferring the request."
      );
    }
  }

  async submitSurveyResponse(
    survey: string | number,
    type: string,
    id: string | number,
    data: any = {}
  ): Promise<any> {
    axios.defaults.baseURL = BASEPATH;
    try {
      const response = await axios.post(
        `physical-course/${survey}/${type}/${id}/submit`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "An error occurred while transferring the request."
      );
    }
  }

  async viewCourseRequests() {
    console.log("view viewCourseRequests button clicked");
  }

  async getCourseAttendance() {
    console.log("view getCourseAttendance button clicked");
  }

  async getCourseGrades() {
    console.log("view getCourseGrades button clicked");
  }

  async getCourseStatistic() {
    console.log("view getCourseStatistic button clicked");
  }
  async getCourseSurvey() {
    console.log("view getCourseSurvey button clicked");
  }
}
