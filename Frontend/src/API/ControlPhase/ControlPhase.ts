import axios from "axios";
import API from "../API";
declare const REGULATORSERVICE: string;

export default class ControlPhase extends API {
  constructor() {
    axios.defaults.baseURL = REGULATORSERVICE;
    super("control-phase", REGULATORSERVICE);
  }
}
