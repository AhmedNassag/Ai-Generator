import API from "../API";
declare const USERSERVICE: string;

export default class Location extends API {
  constructor() {
    super('location');
    // super('location',USERSERVICE);
  }

}