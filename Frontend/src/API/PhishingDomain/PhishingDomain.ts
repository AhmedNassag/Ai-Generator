import API from "../API";

export default class PhishingDomain extends API {
  constructor() {
    super('phishing-domain')
  }

  
  async showWebsites(): Promise<any> {
    console.log(`view showWebsites`);
  }
 
}
