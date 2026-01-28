import API from "../API";
declare const USERSERVICE: string;
import axios from "axios";

export default class Team extends API {
  constructor() {
    super("team", USERSERVICE);
  }

  // async unassignFromTeam(userId: string, teamId: string): Promise<any> {
  //   const response: { data: any } = await axios.get(
  //     `/user/${userId}/team/${teamId}`
  //   );
  //   return response.data;
  // }
}
