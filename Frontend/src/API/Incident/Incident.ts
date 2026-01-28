import API from "../API";

export default class Incident extends API {
  constructor() {
    super("incident");
  }

  async openCommentsModal(id: string): Promise<any> {
    console.log(`open comments modal`);
  }

    async Response(id: string): Promise<any> {
    console.log(`Response`);
  }
}
