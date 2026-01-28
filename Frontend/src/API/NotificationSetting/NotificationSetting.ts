import axios from "axios";
import API from "../API";
declare const NOTIFICATIONlOGS: string;
export default class NotificationSetting extends API {
  constructor() {
    super("notification-setting", NOTIFICATIONlOGS);
  }
}