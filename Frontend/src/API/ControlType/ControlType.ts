import API from "../API";
declare const REGULATORSERVICE: string;

export default class ControlType extends API {
  constructor() {
    super("control-type", REGULATORSERVICE);
  }
}
