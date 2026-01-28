import API from "../API";
import axios from "axios";
import { serialize } from "object-to-formdata";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
declare const BASEPATH: string;
export default class Exception extends API {
  constructor() {
    super("exception");
  }

  // Method to take action on an exception
  async changeStatus(
    exceptionId: string,
    selectedAction: string,
    rejectionReason: string | null
  ): Promise<any> {
    const url = rejectionReason
      ? `/exception/change-status/${exceptionId}/${selectedAction}/${this.stripHtmlTags(
          rejectionReason
        )}`
      : `/exception/change-status/${exceptionId}/${selectedAction}`;

    const response = await axios.post(url);
    return response;
  }

  // Method to get policy exceptions
  async getPolicyExceptions(): Promise<any> {
    axios.defaults.baseURL  = BASEPATH;
    const response: { data: any } = await axios.get(
      `/exception/policy-exceptions/policy`
    );
    return response.data;
  }

  // Method to get policy exceptions
  async getControlExceptions(): Promise<any> {
    const response: { data: any } = await axios.get(
      `/exception/control-exceptions/control`
    );
    return response.data;
  }

    // Method to get policy exceptions
    async getRiskExceptions(): Promise<any> {
      const response: { data: any } = await axios.get(
        `/exception/risk-exceptions/risk`
      );
      return response.data;
    }

    async getAcceptors(): Promise<any> {
      const response: { data: any } = await axios.get(
        `/exception/getAcceptors`
      );
      return response.data;
    }

  stripHtmlTags(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }


  async delete(
    id: string,
    recordIds: string[] = [],
    allowConfirmation = true,
    stopPopup = false
  ): Promise<any> {
    try {
      let result: any;

      if (allowConfirmation) {
        result = await Swal.fire({
          title: "Are you sure?",
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonColor: "#44225c",
          cancelButtonColor: "#ffc107",
          confirmButtonText: "Yes, delete it!",
        });
      } else {
        result = { isConfirmed: true };
      }

      if (result.isConfirmed) {
        const response = await axios.delete(`/${this.route}/${id}`, {
          data: { recordIds },
        });
        if (!stopPopup) this.poup(response.data ,"Delete ");
        return response.data;
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);

        // Moustafa Mohamed
        const errorData = error.response.data; // Extract error details and show in the popup
        this.poup(errorData, "Delete");
        return errorData;
      }
    }
  }
}
