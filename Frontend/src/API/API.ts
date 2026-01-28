import APIService from "./APIService";
import axios, { AxiosRequestConfig } from "axios";
import { serialize } from "object-to-formdata";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import Auth from "./Auth";
declare const BASEPATH: string; // Ensure TypeScript knows about it

// Import the custom notification component
import CustomNotification from "../components/CustomNotification.vue";
import { createApp, h } from "vue";
import { getI18n } from "../main";
import { ext } from "@vee-validate/rules";

// Create a notification instance
let notificationInstance: any = null;

function getNotificationInstance() {
  if (!notificationInstance) {
    try {
      // Create a simple app with the component
      const app = createApp({
        render() {
          return h(CustomNotification, {
            ref: "notificationRef",
          });
        },
        mounted() {
          // Get the component instance
          const vm = this.$refs.notificationRef;
          if (vm && typeof vm.showSuccess === "function") {
            notificationInstance = vm;
            console.log(
              "Custom notification component initialized successfully"
            );
          } else {
            console.error(
              "Custom notification component failed to initialize properly"
            );
            notificationInstance = null;
          }
        },
      });

      const container = document.createElement("div");
      document.body.appendChild(container);

      // Mount the app
      app.mount(container);

      // Wait for the component to be ready
      return new Promise((resolve) => {
        const checkReady = () => {
          if (
            notificationInstance &&
            typeof notificationInstance.showSuccess === "function"
          ) {
            resolve(notificationInstance);
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      });
    } catch (error) {
      console.error("Error initializing custom notification component:", error);
      notificationInstance = null;
      return null;
    }
  }
  return Promise.resolve(notificationInstance);
}

interface ExportOptions {
  exportAll?: boolean;
  columns?: string[];
  filters?: Record<string, any>;
  async?: boolean;
  email?: string;
  with?: string[];
  withCount?: string[];
}

interface ExportResponse {
  message?: string;
  estimated_time?: string;
  job_id?: number;
}


export default class API  extends APIService{
  public route: string;
  public baseUrl: string;
  private options: {
    indices: boolean;
    nullsAsUndefineds: boolean;
    booleansAsIntegers: boolean;
    allowEmptyArrays: boolean;
  };
  private headers: Record<string, string>;

  constructor(route: string, baseUrl?: string | null) {
    super();
    this.baseUrl = baseUrl ?? BASEPATH;

    this.route = route;
    this.options = {
      indices: true,
      nullsAsUndefineds: false,
      booleansAsIntegers: false,
      allowEmptyArrays: true,
    };
    this.headers = {
      "Content-Type": "multipart/form-data",
      charset: "utf-8",
      // boundary: Math.random().toString().substr(2),
    };
  }

  async from(
    data: Record<string, any>,
    returnData = false,
    formData = true,
    stopPopup = false
  ): Promise<any> {
    let res: any;

    let action = "insert";
    if (data.id) {
      action = "update";
      if (formData) {
        res = await this.update(data, this.headers, formData);
      } else {
        res = await this.updataPut(data, this.headers);
      }
    } else {
      res = await this.insert(data, this.headers, formData);
    }

    if (returnData) {
      if (!stopPopup) {
        const status = await this.poup(res, action);
        return { status, data: res };
      }
      return { data: res };
    }

    if (!stopPopup) return await this.poup(res, action);
  }

  /*//////////////////////////////////////////////////*/
  async fetchFileData(
    data: Record<string, any>,
    headers: Record<string, string> = {},
    formDataType = true
  ): Promise<any> {
    try {
      const formData = serialize(data, this.options);
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(
       `/${this.route}/import-fetchFileData`,
        formDataType ? formData : data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
        return error.response.data;
      }
    }
  }

  async importFileData(
    data: Record<string, any>,
    headers: Record<string, string> = {},
    formDataType = true
  ): Promise<any> {
    try {
      const plainData = Object.assign({}, data);
      console.log('Plain data:', plainData);
      console.log('Stringified:', JSON.stringify(plainData));
      
      axios.defaults.baseURL = this.baseUrl;
      const formData = new FormData();
      formData.append('fields', JSON.stringify(plainData));

      const response = await axios.post(
        `/${this.route}/import-storeFileData`,
        formData,
        { headers }
      );

      console.log('response from import job')
      console.log(response)
      if (response.data.data.success !== false && response.data.data.batch_id) {
        notify({
          title: "Import Started",
          text: "Import is processing in background. You will be notified when complete.",
          type: "info",
          duration: 5000,
        });
        
        // Start polling for status
        this.pollImportStatus(response.data.data.batch_id);
        
        return response.data;
      }
      
      this.handleImportErrors(response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log('Import error response:', error.response.data);
        this.handleImportErrors(error.response.data);
        return error.response.data;
      }
      notify({
        title: "Import Error",
        text: "An unexpected error occurred during import",
        type: "error",
        duration: 5000,
      });
      throw error;
    }
  }

   private pollImportStatus(batchId: string): void {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `/${this.route}/import-status/${batchId}`
        );
        
        const status = response.data;
        
        console.log(`Import Progress: ${status.percentage}%`);
        
        // Check if finished
        if (status.is_finished) {
          clearInterval(pollInterval);
          
          if (status.status === 'completed') {
            notify({
              title: "Import Completed",
              text: `Successfully imported ${status.processed} records. ${status.failed} failed.`,
              type: "success",
              duration: 8000,
            });
            
            // Show errors if any
            if (status.failed > 0 && status.errors.length > 0) {
              this.showImportErrors(status.errors);
            }
          } else if (status.status === 'failed') {
            notify({
              title: "Import Failed",
              text: "Import process failed. Check console for details.",
              type: "error",
              duration: 8000,
            });
            console.error('Import errors:', status.errors);
          }
        }
      } catch (error) {
        console.error('Error polling import status:', error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
  }
 
  private showImportErrors(errors: any[]): void {
    const maxNotifications = 5;
    let notificationCount = 0;
    
    errors.forEach((error: any) => {
      if (notificationCount < maxNotifications) {
        notify({
          title: `Row ${error.row} Error`,
          text: error.error,
          type: "error",
          duration: 6000,
        });
        notificationCount++;
      }
    });
    
    if (errors.length > maxNotifications) {
      notify({
        title: "Additional Errors",
        text: `${errors.length - maxNotifications} more errors. Check console for details.`,
        type: "warning",
        duration: 8000,
      });
      console.error("All import errors:", errors);
    }
  }
  private handleImportErrors(responseData: any): void {
    if (responseData.message) {
      notify({
        title: "Import Error",
        text: responseData.message,
        type: "error",
        duration: 8000,
      });
    }
    if (responseData.errors && typeof responseData.errors === "object") {
      const errorCount = Object.keys(responseData.errors).length;
      const maxNotifications = 5;
      let notificationCount = 0;
      for (const field in responseData.errors) {
        if (responseData.errors.hasOwnProperty(field) && notificationCount < maxNotifications) {
          const messages = responseData.errors[field];
          
          messages.forEach((message: string) => {
            if (notificationCount < maxNotifications) {
              notify({
                title: "Validation Error",
                text: message,
                type: "error",
                duration: 6000,
              });
              notificationCount++;
            }
          });
        }
      }
      if (errorCount > maxNotifications) {
        notify({
          title: "Additional Errors",
          text: `${errorCount - maxNotifications} more validation errors found. Check console for details.`,
          type: "warning",
          duration: 8000,
        });
        console.error("All validation errors:", responseData.errors);
      }
      }
    }
  /*//////////////////////////////////////////////////*/

  async getAll(params?: Record<string, any>): Promise<any> {
    try {
      console.log(params);
      axios.defaults.baseURL = this.baseUrl;

      const response = await axios.get(`/${this.route}`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async show(id: string, params?: Record<string, any>): Promise<any> {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.get(`/${this.route}/${id}`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  async insert(
    data: Record<string, any>,
    headers: Record<string, string> = {},
    formDataType = true
  ): Promise<any> {
    try {
      const formData = serialize(data, this.options);
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(
        `/${this.route}`,
        formDataType ? formData : data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
        return error.response.data;
      }
    }
  }

  async update(
    data: Record<string, any>,
    headers: Record<string, string> = {},
    formDataType = true
  ): Promise<any> {
    headers = { ...this.headers, ...headers };
    const formData = serialize(data, this.options);
    const id = formData.get("id");
    formData.append("_method", "PUT");

    try {
      axios.defaults.baseURL = this.baseUrl;
      console.log(this.baseUrl);
      const response = await axios.post(`/${this.route}/${id}`, formData, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
    }
  }

  /**
   * Added By Ahmed Nour
   * Sends a POST request to update or create a resource.
   *
   * This method attempts to either update an existing resource
   * or create a new one by sending a POST request to the
   * `updateOrCreate` endpoint of the current route.
   *
   * @returns {Promise<any>} The response data from the server.
   *
   * @throws Will log an error message if the request fails.
   */

  async CreateOrUpdate(
    data: Record<string, any>,
    headers: Record<string, string> = {},
    formData = true
  ) {
    try {
      const formDataObject = formData ? serialize(data) : data;
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.post(
        `/${this.route}/updateOrCreate`,
        formDataObject,
        { headers }
      );
      return response;
    } catch (error: any) {
      console.error(
        "Error in CreateOrUpdate:",
        error.response?.data || error.message
      );
      return error.response?.data;
    }
  }

  async updataPut(
    data: Record<string, any>,
    headers: Record<string, string> = {}
  ): Promise<any> {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.put(`/${this.route}/${data.id}`, data, {
        headers,
      });
      return response;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
        return error.response.data;
      }
    }
  }

  /**
   * Show custom delete confirmation modal
   */
  private showDeleteConfirmation(): Promise < boolean > {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement("div");
      overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: background 0.3s ease;
        `;

      // Create modal content
      const modal = document.createElement("div");
      modal.style.cssText = `
          background: white;
          border-radius: 16px;
          padding: 25px;
          max-width: 545px;
          width: 80%;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transform: scale(0.7);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

      modal.innerHTML = `
          <button id="closeBtn" style="
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            color: black;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">✕</button>

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.2));
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 60px;
                height: 60px;
                background: rgba(220, 53, 69, 0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
              <svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4.16675" y="4.16663" width="50" height="50" rx="25" fill="#E2B6B6"/>
                <rect x="4.16675" y="4.16663" width="50" height="50" rx="25" stroke="#EED3D3" stroke-width="8.33333"/>
                <path d="M29.1668 34.3752H29.1772M29.1668 26.0418V30.2085M27.3856 20.6877L18.5626 35.4168C18.3807 35.7319 18.2845 36.089 18.2835 36.4528C18.2824 36.8166 18.3767 37.1743 18.5568 37.4903C18.737 37.8063 18.9967 38.0697 19.3102 38.2542C19.6238 38.4387 19.9801 38.5378 20.3439 38.5418H37.9897C38.3535 38.5378 38.7098 38.4387 39.0234 38.2542C39.3369 38.0697 39.5966 37.8063 39.7768 37.4903C39.9569 37.1743 40.0512 36.8166 40.0501 36.4528C40.0491 36.089 39.9529 35.7319 39.771 35.4168L30.948 20.6877C30.7624 20.3815 30.5009 20.1284 30.1889 19.9528C29.8769 19.7771 29.5249 19.6848 29.1668 19.6848C28.8087 19.6848 28.4567 19.7771 28.1447 19.9528C27.8327 20.1284 27.5712 20.3815 27.3856 20.6877Z" stroke="#A92525" stroke-width="2.08333" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              </div>
            </div>

            <h2 style="
              font-size: 24px;
              font-weight: 600;
              color: #1a1a1a;
              margin: 0 0 12px 0;
            ">Are You Sure You Want To Delete This Item?</h2>

            <p style="
              font-size: 15px;
              color: #666;
              margin: 0;
              line-height: 1.5;
            ">"This Action Cannot Be Undone. The Selected Item Will Be<br>Permanently Removed From The System."</p>
          </div>

          <div style="
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          ">
            <button id="cancelBtn" style="
              padding: 0px 12px;
              font-size: 16px;
              font-weight: 500;
              border: 2px solid #404040;
              background: white;
              color: #333;
              border-radius: 11px;
              cursor: pointer;
              transition: all 0.2s;
              width: 94px;
            ">Cancel</button>

            <button id="deleteBtn" style="
              padding: 0px 12px;
              font-size: 16px;
              font-weight: 500;
              border: none;
              background: #A92525;
              color: white;
              border-radius: 11px;
              cursor: pointer;
              transition: all 0.2s;
               width: 94px;
            ">Delete</button>
          </div>
        `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Trigger animation after a small delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.background = "rgba(0, 0, 0, 0.5)";
          modal.style.transform = "scale(1)";
          modal.style.opacity = "1";
        });
      });

      // Add hover effects
      const cancelBtn = modal.querySelector("#cancelBtn") as HTMLElement;
      const deleteBtn = modal.querySelector("#deleteBtn") as HTMLElement;
      const closeBtn = modal.querySelector("#closeBtn") as HTMLElement;

      deleteBtn.addEventListener("mouseenter", () => {
        deleteBtn.style.background = "#8B1E1E";
      });
      deleteBtn.addEventListener("mouseleave", () => {
        deleteBtn.style.background = "#A92525";
      });

      closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.color = "#000";
      });
      closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.color = "#666";
      });

      // Handle button clicks
      const cleanup = () => {
        overlay.style.background = "rgba(0, 0, 0, 0)";
        modal.style.transform = "scale(0.7)";
        modal.style.opacity = "0";

        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      };

      cancelBtn.addEventListener("click", () => {
        cleanup();
        resolve(false);
      });

      closeBtn.addEventListener("click", () => {
        cleanup();
        resolve(false);
      });

      deleteBtn.addEventListener("click", () => {
        cleanup();
        resolve(true);
      });

      // Close on overlay click
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          cleanup();
          resolve(false);
        }
      });
    });
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
        const isConfirmed = await this.showDeleteConfirmation();
        result = { isConfirmed };
      } else {
        result = { isConfirmed: true };
      }

      if (result.isConfirmed) {
        axios.defaults.baseURL = this.baseUrl;
        const response = await axios.delete(`/${this.route}/${id}`, {
          data: { recordIds },
        });
        if (!stopPopup) this.poup(response.data, "Delete ");
        return response.data;
      }
    } catch (error: any) {
      // Moustafa Mohamed
      // const errorData = error.response.data; // Extract error details and show in the popup
      // if (error.response) {
      //   console.log(error.response.data);

      //   // Moustafa Mohamed
      //   const errorData = error.response.data; // Extract error details and show in the popup
      //   this.poup(errorData, "Delete");
      //   return errorData;
      // }

      // Fix Issue :- Khaled
      if (error.response) {
        let errorData = error.response.data;
        if (Array.isArray(errorData.errors)) {
          errorData = {
            status: false,
            message: errorData.errors[0][0],
            errors: { general: [errorData.errors[0][0]] }
          };
        }
        this.poup(errorData, "Delete");
        return errorData;
      }
    }
  }
  // Mohamed Ibrahiim
  protected async poup(
    res: any,
    action: string
  ): Promise<boolean | [boolean, any]> {
    try {
      const notification = await getNotificationInstance();

      // Handle array format errors: {"errors": [["model.key"]]}
      if (res.errors && Array.isArray(res.errors)) {
        const errorMessage = res.errors[0]?.[0] || res.message || "An error occurred.";
        res = {
          ...res,
          status: false,
          message: errorMessage,
          errors: { general: [errorMessage] }
        };
      }

      if (res.status) {
        if (
          notification &&
          typeof (notification as any).showSuccess === "function"
        ) {

          (notification as any).showSuccess(action, res.message);
        } else {
          // Fallback to original notify
          notify({
            title: `common.${action}_successfully`,
            text: "The operation was completed successfully!",
            type: "success",
          });
        }
        return [true, res];
      } else {
        // Check if `res.errors` is an object and not empty
        if (
          res.errors &&
          typeof res.errors === "object" &&
          Object.keys(res.errors).length > 0
        ) {
          if (
            notification &&
            typeof (notification as any).showError === "function"
          ) {
            (notification as any).showError(action, res.message);
          } else {
            // Fallback to original notify
            for (const field in res.errors) {
              if (res.errors.hasOwnProperty(field)) {
                const messages = res.errors[field];
                messages.forEach((message: string) => {
                  notify({
                    title: `${action} Error`,
                    text: message,
                    type: "error",
                  });
                });
              }
            }
          }
        } else {
          if (
            notification &&
            typeof (notification as any).showError === "function"
          ) {
            (notification as any).showError(action, res.message);
          } else {
            notify({
              title: `${action} Error`,
              text: res.message || "An error occurred.",
              type: "error",
            });
          }

        }

        return false;
      }
    } catch (error) {
      console.error("Notification error:", error);
      // Fallback to original notify
      if (res.status) {
        notify({
          title: `common.${action}_successfully`,
          text: "The operation was completed successfully!",
          type: "success",
        });
      } else {
        notify({
          title: `${action} Error`,
          text: res.message || "An error occurred.",
          type: "error",
        });
      }
      return res.status ? [true, res] : false;
    }
  }

  exportAllToExcel() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.route}/export-data`, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "exported_data.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.poup(response, "Exported Successfully!");
          resolve(response);
        })
        .catch((error) => {
          this.poup(
            {
              status: false,
              message: "An error occurred while Exporting Data.",
            },
            "Error"
          );
          reject(error);
        });
    });
  }
  
   async exportToExcel(options: ExportOptions = {}): Promise<void> {
    try {
      const {
        exportAll = true,
        columns = [],
        filters = {},
        async = true,
        email = this.getUserEmail(),
        with: withRelations = [],
        withCount = []
      } = options;

      axios.defaults.baseURL = this.baseUrl;

      const requestPayload = {
        exportAll,
        columns,
        email,
        async,
        with: withRelations,
        withCount,
        ...filters,
      };

      const response = await axios.post(
        `${this.route}/export-data`,
        requestPayload,
        {
          responseType: async ? 'json' : 'blob',
          headers: {
            'Accept': 'application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        }
      );

      // Handle async export (job queued)
      if (response.headers['content-type']?.includes('application/json')) {
        const data: ExportResponse = response.data;
        
        this.showExportStartedNotification(data);
      } 
      // Handle sync export (immediate download)
      else {
        this.downloadFile(response.data, 'xlsx', this.route);
        
        notify({
          title: "Export Successful",
          text: "Data exported successfully!",
          type: "success",
        });
      }
    } catch (error: any) {
      await this.handleExportError(error, 'Excel');
      throw error;
    }
  }

  async exportToPdf(options: ExportOptions = {}): Promise<void> {
    try {
      const {
        exportAll = true,
        columns = [],
        filters = {},
        async = true,
        email = this.getUserEmail(),
        with: withRelations = [],
        withCount = []
      } = options;

      axios.defaults.baseURL = this.baseUrl;

      const requestPayload = {
        exportAll,
        columns,
        email,
        async,
        with: withRelations,
        withCount,
        ...filters,
      };

      const response = await axios.post(
        `${this.route}/export-pdf`,
        requestPayload,
        {
          responseType: async ? 'json' : 'blob',
          headers: {
            'Accept': 'application/json, application/pdf',
          },
        }
      );

      // Handle async export
      if (response.headers['content-type']?.includes('application/json')) {
        const data: ExportResponse = response.data;
        
        this.showExportStartedNotification(data);
      } 
      // Handle sync export
      else {
        this.downloadFile(response.data, 'pdf', this.route);
        
        notify({
          title: "PDF Export Successful",
          text: "PDF exported successfully!",
          type: "success",
        });
      }
    } catch (error: any) {
      await this.handleExportError(error, 'PDF');
      throw error;
    }
  }

  private downloadFile(data: Blob, extension: string, prefix: string): void {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${prefix}_export_${timestamp}.${extension}`;
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private showExportStartedNotification(data: ExportResponse): void {
    notify({
      title: "Export Started",
      text: data.message || "Export is being processed. You will receive an email when ready.",
      type: "info",
      duration: 8000,
    });

    if (data.estimated_time) {
      notify({
        title: "Estimated Time",
        text: `Expected completion: ${data.estimated_time}`,
        type: "info",
        duration: 5000,
      });
    }
  }

  private async handleExportError(error: any, type: string): Promise<void> {
    console.error(`${type} Export error:`, error);

    let errorMessage = `Failed to export ${type}`;

    // Handle blob error responses
    if (error.response?.data instanceof Blob) {
      try {
        const errorText = await error.response.data.text();
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `Failed to export ${type}`;
      }
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    notify({
      title: `${type} Export Error`,
      text: errorMessage,
      type: "error",
      duration: 8000,
    });
  }

  private getUserEmail(): string {
    return Auth.USER?.email || '';
  }

    async fetchModelField() {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const apiUrl = `model-fillable/${this.route}`;
      let response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching model field details:", error);
      throw error;
    }
  }
  async group(params: Record<string, any>): Promise<any> {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.get(`/${this.route}-group`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }
  async fillable(params: Record<string, any>): Promise<any> {
    try {
      axios.defaults.baseURL = this.baseUrl;
      const response = await axios.get(`/${this.route}-fillable`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  }

  // ============================================================
  // CROSS-SERVICE NESTED RELATIONS LOADING
  // (Delegating to APIService base class)
  // ============================================================

  /**
   * Get all records with cross-service nested relations
   * 
   * @example
   * // Get risks with owner and owner's department
   * await api.getAllWithRelations({ 
   *   filter: 'status|active',
   *   withRelations: ['owner.department', 'department', 'stakeholders']
   * });
   * 
   * // With field selection
   * await api.getAllWithRelations({
   *   withRelations: ['owner:id|full_name|department_id.department:id|name']
   * });
   * 
   * @param params - Query parameters including 'withRelations' for nested loading
   * @returns Data with nested relations populated
   */
  async getAllWithRelations(params?: Record<string, any>): Promise<any> {
    return super.getAllWithRelations(params, this.getAll.bind(this));
  }

  /**
   * Parallel loading of multiple independent relations
   * More efficient when loading multiple unrelated paths
   */
  async getAllWithRelationsParallel(params?: Record<string, any>): Promise<any> {
    return super.getAllWithRelationsParallel(params, this.getAll.bind(this));
  }

  /**
   * Get single record with cross-service nested relations
   */
  async showWithRelations(id: string, params?: Record<string, any>): Promise<any> {
    return super.showWithRelations(id, params, this.show.bind(this));
  }
}
