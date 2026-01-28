import API from "../API";
declare const USERSERVICE : string;

export default class Widget extends API {
  constructor() {
    super('widget',USERSERVICE)
  }
 
}
