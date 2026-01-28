import API from "../API";
declare const USERSERVICE : string;

export default class Permission extends API {
  constructor() {
    super('permission', USERSERVICE);
  }
 
}
