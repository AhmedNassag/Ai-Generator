import API from "../API";
declare const NOTIFICATIONlOGS: string;

export default class EmailConfig extends API {
  constructor() {
    super("email-config", NOTIFICATIONlOGS);
  }
}
