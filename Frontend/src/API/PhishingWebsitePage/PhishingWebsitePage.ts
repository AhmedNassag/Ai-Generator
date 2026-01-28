import API from "../API";

export default class PhishingWebsitePage extends API {
  constructor() {
    super('phishing-website-page')
  }

  
  async viewWebsite(): Promise<any> {
    console.log(`view viewWebsite`);
  }
 
}