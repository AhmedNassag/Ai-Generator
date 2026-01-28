import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class CenterPolicy extends API {
  constructor() {
    axios.defaults.baseURL = REGULATORSERVICE;
    super("center-policy", REGULATORSERVICE);
  }
}
