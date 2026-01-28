import API from "../API";
declare const USERSERVICE : string;

export default class Position extends API {
  constructor() {
    super('position',USERSERVICE);
  }
 
}

