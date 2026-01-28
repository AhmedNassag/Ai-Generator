import API from "../API";
import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
declare const BASEPATH: string;
export default class Workflow extends API {
  constructor() {
    super("workflow");
  }

  async fetchModelField(){
    try {
      const response = await axios.get("/model-fillable/Document");
      return response.data;      
    } catch (error) {
      console.error("Error fetching model field details:", error);
      throw error;
    }
  }


  // custom function to get transition with  workflow Id and transition Code
  async getTransition(
    workflowId: string,
    transitionCode: string
  ): Promise<any> {
    try {
      axios.defaults.baseURL = BASEPATH;
      
      const response = await axios.get(
        `workflow/${workflowId}/findTransition/${transitionCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transition details:", error);
      throw error;
    }
  }

  // custom function to update transition with  workflow Id and transition Code
  async updateTransition(
    workflowId: string,
    transitionCode: string,
    updateData: any,
    headers: Record<string, string> = {}
  ): Promise<any> {
    try {
      const response = await axios.put(
        `workflow/${workflowId}/updateTransition/${transitionCode}`,
        updateData,
        { headers }
      );
      return this.myPoup(response.data, "Update Transition");
    } catch (error: any) {
      if (error.response) {
        return this.myPoup(error.response.data, "Update Transition");
      } else {
        console.error("Unexpected error:", error);
        notify({
          title: "Update Transition Error",
          text: "An unexpected error occurred. Please try again.",
          type: "error",
        });
        return false;
      }
    }
  }
  protected myPoup(res: any, action: string): boolean | [boolean, any] {
    if (res.success === true) {
      // Handle success case with green popup
      notify({
        title: action + " Successfully",
        text: res.message || "The operation was completed successfully!",
        type: "success", 
      });
      return [true, res];
    } else {
      if (
        res.errors &&
        typeof res.errors === "object" &&
        Object.keys(res.errors).length > 0
      ) {
        // Loop through each field in the errors object
        for (const field in res.errors) {
          if (res.errors.hasOwnProperty(field)) {
            // Get the error messages for the current field
            const messages = res.errors[field];
            // Display each error message individually
            messages.forEach((message: string) => {
              notify({
                title: `${action} Error`,
                text: `${field}: ${message}`,
                type: "error", 
              });
            });
          }
        }
      } else {
        notify({
          title: `${action} Error`,
          text: res.message || "An error occurred.",
          type: "error", 
        });
      }
      return false;
    }
  }
}