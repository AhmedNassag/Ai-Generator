import API from "../API";
declare const NOTIFICATIONlOGS:string;

export default class LogSetting extends API {
  constructor() {
    super('log-setting', NOTIFICATIONlOGS)
  }

}
