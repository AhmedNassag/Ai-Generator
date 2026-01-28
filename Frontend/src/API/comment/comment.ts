import API from "../API";

export default class Comment extends API {
  constructor() {

    super('comment');
  }
 

 

  /**
   * Publish a comment for a risk
   * @param commentData - The comment data to publish
   * @returns The response from the API
   */
  async publishComment(commentData: any): Promise<any> {
    try {
      const response = await this.from(commentData); // Ensure insert method exists
      return response;
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error;
    }
  }

  /**
   * Fetch comments for a specific risk
   * @param riskId - The ID of the risk
   * @returns The list of comments
   */
  async fetchComments(riskId: string): Promise<any> {
    try {
      const response = await this.getAll({ 
        with: [], 
        filter: `commentable_id|${riskId}`
      }); 
      return response;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }
}
