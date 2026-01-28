import API from "../API";
declare const USERSERVICE : string;

export default class Dashboard extends API {
  constructor() {
    super('dashboard',USERSERVICE)
  }
 
}
