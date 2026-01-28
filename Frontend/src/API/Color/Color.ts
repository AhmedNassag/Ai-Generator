import API from "../API";
declare const USERSERVICE : string;


export default class Color extends API {
  constructor() {
    super('color', USERSERVICE);
  }
 
}
