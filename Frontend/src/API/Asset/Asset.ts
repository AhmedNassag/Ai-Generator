import axios from "axios";
import API from "../API";
declare const BASEPATH: string;

export default class Asset extends API {
  constructor() {
    super("asset");
  }

  async getAssetsByIp(ipAddress: any): Promise<any> {
    axios.defaults.baseURL = BASEPATH;

    const response = await axios.get(`/asset/getAssetsByIp/${ipAddress}`);

    return response.data;
  }
}
