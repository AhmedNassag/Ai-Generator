import API from "../API";
import axios from "axios";
declare const REGULATORSERVICE: string;

export default class Requirement extends API {
  constructor() {
    super("requirement", REGULATORSERVICE);
  }


  async viewEvidences() {
    console.log("View Evidences");
  }
}
