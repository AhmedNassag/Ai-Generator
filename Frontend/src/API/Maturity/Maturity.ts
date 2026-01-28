import API from "../API";
declare const REGULATORSERVICE: string;

export default class Maturity extends API {
  constructor() {
    super("maturity", REGULATORSERVICE);
  }
}
