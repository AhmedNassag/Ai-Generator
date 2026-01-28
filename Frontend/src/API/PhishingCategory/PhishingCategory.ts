import API from "../API";

export default class PhishingCategory extends API {
  constructor() {
    super('phishing-category')
  }

  
  async showWebsites(): Promise<any> {
    console.log(`view showWebsites`);
  }
 
}
