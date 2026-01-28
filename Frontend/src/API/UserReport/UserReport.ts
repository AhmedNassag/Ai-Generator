import API from "../API";
declare const USERSERVICE : string;

export default class UserReport extends API {
  constructor() {
    super('user-report',USERSERVICE)
  }
 
}
