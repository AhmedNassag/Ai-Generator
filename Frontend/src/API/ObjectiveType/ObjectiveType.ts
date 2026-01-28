import API from "../API";
declare const STRATEGIC_PLAN_SERVICE: string;

export default class ObjectiveType extends API {
  constructor() {
    super("objective-type", STRATEGIC_PLAN_SERVICE);
  }
}
