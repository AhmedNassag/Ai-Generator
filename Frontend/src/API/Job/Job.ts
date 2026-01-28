import API from "../API";
declare const USERSERVICE : string;

export default class Job extends API {
  constructor() {
    super('job', USERSERVICE);
  }

  async openDetailsModal() {
    console.log('openDetailsModal');
  }
}
