import API from "../API";
declare const REGULATORSERVICE: string;

export default class ControlMapping extends API {
  constructor() {
    super("control-mapping", REGULATORSERVICE);
  }
}
