import API from "../API";
declare const REGULATORSERVICE: string;

export default class AuditRemidation extends API {
  constructor() {
    super("audit-remidation", REGULATORSERVICE);
  }
}
