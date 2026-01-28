import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class Frameworks extends API {
  constructor() {
    super("frameworks", REGULATORSERVICE);
  }
  async update(updatedData: any) {
    const api = new API("frameworks", REGULATORSERVICE);
    // axios.defaults.baseURL = REGULATORSERVICE;
    try {
      const response = await api.from(updatedData);
      if (!response) {
        throw new Error("Empty response from server");
      }
      return response;
    } catch (error) {
      console.error("Error updating framework:", error);
      throw error;
    }
  }
  async delete(id: any) {
    const api = new API("frameworks", REGULATORSERVICE);
    // axios.defaults.baseURL = REGULATORSERVICE;
    try {
      const response = await api.delete(id);
      if (!response) {
        throw new Error("Empty response from server");
      }
      return response;
    } catch (error) {
      console.error("Error deleting framework:", error);
      throw error;
    }
  }
  async fetchPercentageCompliance(id: any) {
    try {
      const response = await axios.get(`/frame/audit/result/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching percentage compliance:", error);
      throw error;
    }
  }

  async fetchDataOfSpecificDomain(domainId: any,frameId : any,) {
    try {
      const response = await axios.get(`/domain/audit/result/${domainId}/${frameId}`);
      return response;
    } catch (error) {
      console.error("Error fetching percentage compliance:", error);
      throw error;
    }
  }
  async fetchTotalDataGraphsForFrameOwner(frameId: any){
    try {
      const response = await axios.get(`/frame/owner/statistic/${frameId}`);
      return response;
    } catch (error) {
      console.error("Error fetching percentage compliance:", error);
      throw error;
    }
  }
}
