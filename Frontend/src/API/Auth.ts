import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
declare const BASEPATH: string;
declare const USERSERVICE: string;

const WEBSOCKET_PORT = 6001,
  WEBSOCKET_KEY = "websocket_key";
import RoleApi from "@/API/Role/Role";
const roleApi = new RoleApi();

export default class Auth {
  static USER: Record<string, any> = {};
  static AUTHORIZED: boolean = false;
  static SESSON: Record<string, any> = {};
  static ROLE: Record<string, any> = {};
  static logoutTimer: ReturnType<typeof setTimeout> | null = null;
  static warningTimer: ReturnType<typeof setTimeout> | null = null;
  static isCheckingAuth: boolean = false; // Prevent multiple simultaneous auth checks
  static isWarningShown: boolean = false; // Prevent multiple warning alerts

  static LANGUAGE = [
    { name: "English", code: "en" },
    { name: "Arabic", code: "ar" },
  ];
  
  static SETTINGS = {
    user: {},
    system: {
      comment_approve: true,
    },
  };
  
  static PERMISSIONS: string[] = [];
  static TABLE_PERMISSIONS = {};

  // static baseURL: string = BASEPATH;
  static baseURL: string = BASEPATH;

  static run() {
    axios.defaults.baseURL = this.baseURL;
    // Set up axios interceptors for better error handling
    this.setupAxiosInterceptors();
  }

  /**
   * Setup axios interceptors for automatic token refresh and error handling
   */
  static setupAxiosInterceptors() {
    // Request interceptor to add token to requests
    axios.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling 401 errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && this.AUTHORIZED) {
          console.log('Token expired, logging out...');
          this.logOut();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get stored token from cookies
   */
  static getStoredToken(): string {
    let fullToken = "";
    let i = 1;
    while (Cookies.get(`api_token_part${i}`)) {
      fullToken += Cookies.get(`api_token_part${i}`);
      i++;
    }
    return fullToken;
  }

  /**
   * Store token in cookies with chunking
   */
  static storeToken(token: string, remember_me: boolean = false): void {
    // Clear existing token parts first
    this.clearStoredToken();
    
    const partSize = 3000;
    const totalParts = Math.ceil(token.length / partSize);
    const expires = remember_me ? 30 : 1; // 30 days if remember me, 1 day otherwise

    for (let i = 0; i < totalParts; i++) {
      const part = token.substring(i * partSize, (i + 1) * partSize);
      Cookies.set(`api_token_part${i + 1}`, part, { expires });
    }
  }

  /**
   * Clear stored token from cookies
   */
  static clearStoredToken(): void {
    let i = 1;
    while (Cookies.get(`api_token_part${i}`)) {
      Cookies.remove(`api_token_part${i}`);
      i++;
    }
  }

  /**
   * Login user with credentials
   */
  static async logIn(
    login: string,
    password: string,
    remember_me = false
  ): Promise<boolean> {
    try {
      axios.defaults.baseURL = USERSERVICE;
      const response: AxiosResponse = await axios.post("login", {
        login,
        password,
        remember_me,
      });

      if (response.data.data.department && response.data.data.job) {
        response.data.data.is_manager =
          response.data.data?.department?.manager_id ==
          response.data.data?.job?.position_id;
      }

      const token = response.data.data.token;
      
      // Store token in cookies
      this.storeToken(token, remember_me);
      
      // Set axios default header
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Set user data
      await this.setData(response);

      // Setup auto logout timer (1 hour)
      this.setupLogoutTimer();

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        const { status, data } = error.response;
        throw new Error(data.errors?.[0]?.[0] || data.message || "Login failed");
      } else {
        throw new Error("An unexpected error occurred during login.");
      }
    }
  }

  /**
   * Check if user is logged in
   */
  static async loggedIn(): Promise<boolean> {
    // If already authorized and user data exists, return immediately
    if (this.AUTHORIZED && this.USER && Object.keys(this.USER).length > 0) {
      return true;
    }

    // Prevent multiple simultaneous auth checks
    if (this.isCheckingAuth) {
      // Wait for ongoing check to complete
      while (this.isCheckingAuth) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.AUTHORIZED;
    }

    this.isCheckingAuth = true;

    try {
      axios.defaults.baseURL = this.baseURL;
      
      const fullToken = this.getStoredToken();
      
      if (!fullToken) {
        this.isCheckingAuth = false;
        this.AUTHORIZED = false;
        return false;
      }

      // Check if token is already set in axios headers
      if (!axios.defaults.headers.common.Authorization) {
        axios.defaults.headers.common.Authorization = `Bearer ${fullToken}`;
      }

      // Only fetch user info if we don't have it
      if (!this.USER || Object.keys(this.USER).length === 0) {
        const params = {
          "with[]": ["department", "role", "job", "manager", "teams"],
        };
        
        axios.defaults.baseURL = USERSERVICE;
        const response: AxiosResponse = await axios.get("user-info", { params });
        if (response.data.data.department && response.data.data.job) {
          response.data.data.is_manager =
            response.data.data?.department?.manager_id ==
            response.data.data?.job?.position_id;
        }
        await this.setData(response);
      }
      
      this.setupLogoutTimer();
      this.isCheckingAuth = false;
      return true;
      
    } catch (error) {
      console.error('Auth check failed:', error);
      this.AUTHORIZED = false;
      this.USER = {};
      this.clearStoredToken();
      this.isCheckingAuth = false;
      return false;
    }
  }
  /**
   * Set user data from response
   */
  static async setData(response: AxiosResponse): Promise<void> {
    try {
      this.PERMISSIONS = response.data.data.permissions || [];
      this.AUTHORIZED = true;
      this.USER = response.data.data;
      
      // Get role data if user has job_id and department_id
      if (this.USER.job_id && this.USER.department_id) {
        try {
          this.ROLE = await roleApi.getRoleJobWithDepartment(
            this.USER.job_id,
            this.USER.department_id
          );
        } catch (roleError) {
          console.warn('Failed to fetch role data:', roleError);
          this.ROLE = {};
        }
      }
    } catch (error) {
      console.error('Error setting user data:', error);
      throw error;
    }
  }

  /**
   * Setup automatic logout timer with warning
   */
  static setupLogoutTimer(): void {
    // Clear existing timers
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    // Reset warning state
    this.isWarningShown = false;

    const tokenDuration = 8 * 60 * 60 * 1000; // 8 hours (production setting)
    const warningTime = 5 * 60 * 1000; // 5 minutes before expiration

    // Set warning timer (5 minutes before token expires)
    this.warningTimer = setTimeout(() => {
      this.showTokenExpirationWarning();
    }, tokenDuration - warningTime);

    // Set logout timer (when token actually expires)
    this.logoutTimer = setTimeout(() => {
      console.log("Token expired, logging out automatically...");
      this.logOut();
    }, tokenDuration);
  }

  /**
   * Show token expiration warning to user
   */
  static async showTokenExpirationWarning(): Promise<void> {
    if (this.isWarningShown) {
      return; // Prevent multiple warnings
    }

    this.isWarningShown = true;

    try {
      const result = await Swal.fire({
        title: 'Session Expiring Soon!',
        text: 'Your session will expire in 5 minutes. Would you like to extend your session?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, extend session',
        cancelButtonText: 'No, logout now',
        timer: 300000, // Auto-close after 5 minutes (300 seconds)
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'session-warning-popup',
          title: 'session-warning-title'
        }
      });

      if (result.isConfirmed) {
        // User wants to extend session
        this.extendSession();
      } else {
        // User chose not to extend or timer expired, logout immediately
        console.log("User chose not to extend session or timer expired, logging out...");
        this.logOut();
      }
    } catch (error) {
      console.error("Error showing warning dialog:", error);
      // Fallback to browser confirm on error
      const userChoice = confirm("Your session will expire in 5 minutes. Would you like to extend your session?");
      
      if (userChoice) {
        this.extendSession();
      } else {
        console.log("User chose not to extend session, logging out...");
        this.logOut();
      }
    }
  }

  /**
   * Extend user session by refreshing token
   */
  static async extendSession(): Promise<void> {
    try {
      // Attempt to refresh user data which will validate token
      const refreshSuccess = await this.refreshUserData();
      
      if (refreshSuccess) {
        // Reset the timers for extended session
        this.setupLogoutTimer();
        
        // Show success message with SweetAlert2 toast
        Swal.fire({
          title: 'Session Extended!',
          text: 'Your session has been successfully extended.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: {
            popup: 'session-success-toast'
          }
        });
        
        console.log("Session extended successfully");
      } else {
        // Token is invalid, force logout
        console.log("Token validation failed, logging out...");
        this.logOut();
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      // If extension fails, logout
      this.logOut();
    }
  }

  /**
   * Logout user
   */
  static logOut(): boolean {
    try {
      // Clear stored tokens
      this.clearStoredToken();

      // Clear all timers
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }
      if (this.warningTimer) {
        clearTimeout(this.warningTimer);
        this.warningTimer = null;
      }

      // Reset auth state
      this.AUTHORIZED = false;
      this.USER = {};
      this.ROLE = {};
      this.PERMISSIONS = [];
      this.isCheckingAuth = false;
      this.isWarningShown = false;

      // Clear axios auth header
      delete axios.defaults.headers.common.Authorization;

      // Clear local storage
      localStorage.removeItem('navActiveState');
      localStorage.removeItem('selectedLanguageCode');

      // Redirect to login
      window.location.href = "/login";
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  /**
   * Get current auth token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return this.getStoredToken() || null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    return this.PERMISSIONS.includes(permission);
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(): boolean {
    return this.USER?.super === true;
  }

  /**
   * Get user info
   */
  static getUser(): Record<string, any> {
    return this.USER;
  }

  /**
   * Get user role
   */
  static getRole(): Record<string, any> {
    return this.ROLE;
  }

  /**
   * Get user permissions
   */
  static getPermissions(): string[] {
    return this.PERMISSIONS;
  }

  /**
   * Refresh user data
   */
  static async refreshUserData(): Promise<boolean> {
    try {
      const params = {
        "with[]": ["department", "role", "job", "manager", "teams"],
      };
      
      axios.defaults.baseURL = USERSERVICE;
      const response: AxiosResponse = await axios.get("user-info", { params });
      await this.setData(response);
      return true;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return false;
    }
  }

  /**
   * Setup WebSocket connection (placeholder for future implementation)
   */
  static setupWebSocketConnection(): void {
    // WebSocket implementation would go here
    // Currently commented out in the original code
  }
}