<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'user'" :subPage="'profile'" :titlePage="'User Profile'" v-permission:show>

    <template #datatable>
      <!-- Tabs Section -->
      <TabsComponent
        :tabs="availableTabs"
        v-model="selectedTab"
      />

      <!-- User Data Tab -->
      <div v-if="selectedTab === 'userData'" class="tab-content">
        <!-- Basic Information Section -->
        <div class="info-card">
          <h4 class="section-title">Basic Information</h4>
          <div class="info-grid">
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Email :</label>
              <p class="info-value">{{ userDetails.email || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Full Name:</label>
              <p class="info-value">{{ userDetails.full_name || userDetails.name || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Username :</label>
              <p class="info-value">{{ userDetails.username || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Phone :</label>
              <p class="info-value">{{ userDetails.phone || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Job Details Section -->
        <div class="info-card">
          <h4 class="section-title">Job Details</h4>
          <div class="info-grid">
            <!-- <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Department Id :</label>
              <p class="info-value">{{ userDetails.department_id || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Job ID:</label>
              <p class="info-value">{{ userDetails.job_id || 'N/A' }}</p>
            </div> -->
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Department :</label>
              <p class="info-value">{{ formatValue(userDetails.department) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Role:</label>
              <p class="info-value">{{ formatValue(userDetails.role) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Job :</label>
              <p class="info-value">{{ formatValue(userDetails.job) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Manager:</label>
              <p class="info-value">{{ formatValue(userDetails.manager) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Is Manager :</label>
              <p class="info-value">{{ userDetails.is_manager ? 'Yes' : 'No' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Teams:</label>
              <p class="info-value">{{ formatValue(userDetails.teams) }}</p>
            </div>
          </div>
        </div>

        <!-- Account Status Section -->
        <div class="info-card">
          <h4 class="section-title">Account Status</h4>
          <div class="info-grid">
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Type :</label>
              <p class="info-value">{{ userDetails.type || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Is Locked:</label>
              <p class="info-value">{{ userDetails.is_locked ? 'Yes' : 'No' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Status :</label>
              <p class="info-value">{{ userDetails.status || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Failed Attempts:</label>
              <p class="info-value">{{ userDetails.failed_attempts || '0' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Lock Until :</label>
              <p class="info-value">{{ userDetails.lock_until || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Email Verified At:</label>
              <p class="info-value">{{ formatDateTime(userDetails.email_verified_at) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Super :</label>
              <p class="info-value">{{ userDetails.super ? 'True' : 'False' }}</p>
            </div>
          </div>
        </div>

        <!-- System Information Section -->
        <div class="info-card">
          <h4 class="section-title">System Information</h4>
          <div class="info-grid">
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Created At :</label>
              <p class="info-value">{{ formatDateTime(userDetails.created_at) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Updated At:</label>
              <p class="info-value">{{ formatDateTime(userDetails.updated_at) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Last Failed Attempt :</label>
              <p class="info-value">{{ formatDate(userDetails.last_failed_attempt) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Assigned To:</label>
              <p class="info-value">{{ formatValue(userDetails.assigned_to) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Department Joining Date:</label>
              <p class="info-value">{{ formatDate(userDetails.department_joining_date) }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Full Image Path :</label>
              <p class="info-value">{{ userDetails.full_image_path || 'N/A' }}</p>
            </div>
            <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Phishing Group IDs:</label>
              <p class="info-value">{{ formatValue(userDetails.phishing_group_ids) }}</p>
            </div>
            <!-- <div class="d-flex flex-md-column rtl-content">
              <label class="info-label">Team IDs :</label>
              <p class="info-value">{{ formatValue(userDetails.team_ids) }}</p>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Permissions Tab -->
      <div v-if="selectedTab === 'permissions'" class="tab-content">
        <div class="permissions-wrapper">
          <div v-for="(permissions, category) in permissionsList" :key="category" class="permission-category-card">
            <h4 class="category-title">{{ category }}</h4>
            <div class="permissions-grid">
              <div v-for="permission in permissions" :key="permission.id" class="permission-toggle-item">
                      <label class="toggle-switch">
                  <input
                    type="checkbox"
                    :value="permission.id"
                    v-model="selectedPermissions"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <span class="permission-label">{{ permission.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-danger" v-if="permissionsErrorMessage">{{ permissionsErrorMessage }}</div>
        <div class="alert alert-success" v-if="permissionsSuccessMessage">{{ permissionsSuccessMessage }}</div>
        <div class="d-flex justify-content-end mt-4">
          <button class="btn-saveChanged" type="button" @click="savePermissions">Save Changes</button>
        </div>
      </div>

      <!-- Password Management Tab -->
      <div v-if="selectedTab === 'passwordManagement'" class="tab-content">
        <form @submit.prevent="updatePassword" class="password-form">
          <div class="tab-container">
            <div class="form-group">
              <label class="label-title">Current Password</label>
              <div class="password-wrapper">
                <input :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="passwordForm.currentPassword" required class="form-control" />
                <span class="toggle-password" @click="showCurrentPassword = !showCurrentPassword">
                  <svg v-if="showCurrentPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.03182 3.40091C8.595 3.26908 9.1716 3.20319 9.75 3.20455C15.4773 3.20455 18.75 9.75 18.75 9.75C18.2533 10.6791 17.661 11.5539 16.9827 12.36M11.4845 11.4845C11.2598 11.7257 10.9888 11.9191 10.6878 12.0533C10.3867 12.1874 10.0616 12.2596 9.73207 12.2654C9.4025 12.2712 9.07513 12.2106 8.7695 12.0871C8.46387 11.9637 8.18623 11.7799 7.95315 11.5469C7.72007 11.3138 7.53632 11.0361 7.41287 10.7305C7.28942 10.4249 7.22879 10.0975 7.23461 9.76793C7.24042 9.43835 7.31256 9.11333 7.44672 8.81224C7.58087 8.51115 7.7743 8.24017 8.01545 8.01545M0.75 0.75L18.75 18.75M14.61 14.61C13.2114 15.6761 11.5084 16.2667 9.75 16.2955C4.02273 16.2955 0.75 9.75 0.75 9.75C1.76773 7.85337 3.17929 6.19632 4.89 4.89L14.61 14.61Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.833496 10C0.833496 10 4.16683 3.33337 10.0002 3.33337C15.8335 3.33337 19.1668 10 19.1668 10C19.1668 10 15.8335 16.6667 10.0002 16.6667C4.16683 16.6667 0.833496 10 0.833496 10Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.0002 12.5C11.381 12.5 12.5002 11.3807 12.5002 10C12.5002 8.61929 11.381 7.5 10.0002 7.5C8.61945 7.5 7.50016 8.61929 7.50016 10C7.50016 11.3807 8.61945 12.5 10.0002 12.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label class="label-title" for="new_password">New Password</label>
              <div class="password-wrapper">
                <input :type="showNewPassword ? 'text' : 'password'" id="new_password" v-model="passwordForm.newPassword"
                  required class="form-control" />
                <span class="toggle-password" @click="showNewPassword = !showNewPassword">
                  <svg v-if="showNewPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.03182 3.40091C8.595 3.26908 9.1716 3.20319 9.75 3.20455C15.4773 3.20455 18.75 9.75 18.75 9.75C18.2533 10.6791 17.661 11.5539 16.9827 12.36M11.4845 11.4845C11.2598 11.7257 10.9888 11.9191 10.6878 12.0533C10.3867 12.1874 10.0616 12.2596 9.73207 12.2654C9.4025 12.2712 9.07513 12.2106 8.7695 12.0871C8.46387 11.9637 8.18623 11.7799 7.95315 11.5469C7.72007 11.3138 7.53632 11.0361 7.41287 10.7305C7.28942 10.4249 7.22879 10.0975 7.23461 9.76793C7.24042 9.43835 7.31256 9.11333 7.44672 8.81224C7.58087 8.51115 7.7743 8.24017 8.01545 8.01545M0.75 0.75L18.75 18.75M14.61 14.61C13.2114 15.6761 11.5084 16.2667 9.75 16.2955C4.02273 16.2955 0.75 9.75 0.75 9.75C1.76773 7.85337 3.17929 6.19632 4.89 4.89L14.61 14.61Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.833496 10C0.833496 10 4.16683 3.33337 10.0002 3.33337C15.8335 3.33337 19.1668 10 19.1668 10C19.1668 10 15.8335 16.6667 10.0002 16.6667C4.16683 16.6667 0.833496 10 0.833496 10Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.0002 12.5C11.381 12.5 12.5002 11.3807 12.5002 10C12.5002 8.61929 11.381 7.5 10.0002 7.5C8.61945 7.5 7.50016 8.61929 7.50016 10C7.50016 11.3807 8.61945 12.5 10.0002 12.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label class="label-title" for="confirm_password">Confirm Password</label>
              <div class="password-wrapper">
                <input :type="showConfirmPassword ? 'text' : 'password'" id="confirm_password"
                  v-model="passwordForm.confirmPassword" required class="form-control" />
                <span class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                  <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.03182 3.40091C8.595 3.26908 9.1716 3.20319 9.75 3.20455C15.4773 3.20455 18.75 9.75 18.75 9.75C18.2533 10.6791 17.661 11.5539 16.9827 12.36M11.4845 11.4845C11.2598 11.7257 10.9888 11.9191 10.6878 12.0533C10.3867 12.1874 10.0616 12.2596 9.73207 12.2654C9.4025 12.2712 9.07513 12.2106 8.7695 12.0871C8.46387 11.9637 8.18623 11.7799 7.95315 11.5469C7.72007 11.3138 7.53632 11.0361 7.41287 10.7305C7.28942 10.4249 7.22879 10.0975 7.23461 9.76793C7.24042 9.43835 7.31256 9.11333 7.44672 8.81224C7.58087 8.51115 7.7743 8.24017 8.01545 8.01545M0.75 0.75L18.75 18.75M14.61 14.61C13.2114 15.6761 11.5084 16.2667 9.75 16.2955C4.02273 16.2955 0.75 9.75 0.75 9.75C1.76773 7.85337 3.17929 6.19632 4.89 4.89L14.61 14.61Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.833496 10C0.833496 10 4.16683 3.33337 10.0002 3.33337C15.8335 3.33337 19.1668 10 19.1668 10C19.1668 10 15.8335 16.6667 10.0002 16.6667C4.16683 16.6667 0.833496 10 0.833496 10Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.0002 12.5C11.381 12.5 12.5002 11.3807 12.5002 10C12.5002 8.61929 11.381 7.5 10.0002 7.5C8.61945 7.5 7.50016 8.61929 7.50016 10C7.50016 11.3807 8.61945 12.5 10.0002 12.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            <div class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</div>
            <div class="alert alert-success" v-if="successMessage">{{ successMessage }}</div>
          </div>
          <div class="d-flex justify-content-end mt-3"><button class="btn-saveChanged" type="submit">Save Changed</button></div>
        </form>
      </div>
    </template>
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import Auth from "@/API/Auth";
import axios from "axios";

export default {
  components: {
    MainPage,
    TabsComponent,
  },

  data() {
    return {
      selectedTab: "userData",
      userDetails: Auth.user,
      selectedPermissions: [],
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      errorMessage: "",
      successMessage: "",
      permissionsErrorMessage: "",
      permissionsSuccessMessage: "",
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      permissionsList: {
        "User Management": [
          { id: 1, name: "Create User" },
          { id: 2, name: "Edit User" },
          { id: 3, name: "Delete User" },
        ],
        "Product Management": [
          { id: 4, name: "Add Product" },
          { id: 5, name: "Edit Product" },
          { id: 6, name: "Delete Product" },
        ],
        "Order Management": [
          { id: 7, name: "Create Order" },
          { id: 8, name: "Update Order" },
          { id: 9, name: "Cancel Order" },
        ],
      },
    };
  },

  computed: {
    availableTabs() {
      const tabs = [
        { id: 'userData', label: 'User Data' },
        { id: 'permissions', label: 'Permissions' }
      ];

      if (this.userDetails.type === 'GRC') {
        tabs.push({ id: 'passwordManagement', label: 'Password Management' });
      }

      return tabs;
    }
  },

  methods: {
    selectTab(tab) {
      this.selectedTab = tab;
    },

    formatValue(value) {
      if (!value) return 'N/A';
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // Filter out null/undefined values and map to names
          return value
            .filter(item => item != null)
            .map(item => {
              if (typeof item === 'object' && item !== null) {
                return item.name || item.full_name || JSON.stringify(item);
              }
              return item;
            })
            .join(', ') || 'N/A';
        }
        return value.name || value.full_name || JSON.stringify(value);
      }
      return value || 'N/A';
    },

    formatDateTime(value) {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true 
        });
      } catch (error) {
        return 'N/A';
      }
    },

    formatDate(value) {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        });
      } catch (error) {
        return 'N/A';
      }
    },

    savePermissions() {
      this.permissionsErrorMessage = "";
      this.permissionsSuccessMessage = "";

      axios.post(`/user/profile/updatePermissions/${this.userDetails.id}`, {
        permissions: this.selectedPermissions
      }).then(res => {
        this.permissionsSuccessMessage = "Permissions updated successfully";
        console.log('Permissions saved:', res.data);
      }).catch(err => {
        console.error('Full error object:', err);
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response?.data);

        // معالجة الأخطاء بشكل آمن تماماً
        let errorMsg = 'Failed to update permissions. Please try again.';

        try {
          if (err.response?.data) {
            const data = err.response.data;

            // حاول الحصول على رسالة الخطأ
            if (data.message) {
              errorMsg = data.message;
            } else if (data.errors) {
              const errors = data.errors;

              // في حالة array of arrays
              if (Array.isArray(errors)) {
                if (errors.length > 0) {
                  if (Array.isArray(errors[0])) {
                    errorMsg = errors[0][0] || errorMsg;
                  } else if (typeof errors[0] === 'string') {
                    errorMsg = errors[0];
                  }
                }
              }
              // في حالة object
              else if (typeof errors === 'object') {
                const keys = Object.keys(errors);
                if (keys.length > 0) {
                  const firstError = errors[keys[0]];
                  if (Array.isArray(firstError) && firstError.length > 0) {
                    errorMsg = firstError[0];
                  } else if (typeof firstError === 'string') {
                    errorMsg = firstError;
                  }
                }
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
        }

        this.permissionsErrorMessage = errorMsg;
      });
    },

    updatePassword() {
      this.errorMessage = "";
      this.successMessage = "";

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.errorMessage = "Passwords do not match!";
        return;
      }
      try {
        axios.post(`/user/profile/updatePssword/${this.userDetails.id}`, {
          old_password: this.passwordForm.currentPassword,
          password: this.passwordForm.newPassword,
          password_confirmation: this.passwordForm.confirmPassword,
        }).then(res => {
          this.successMessage = "Password Changed successfully.";
          Auth.logOut();
        }).catch(err => {
          this.errorMessage = err.response?.data?.errors[0][0];
          console.log('enter catch');
        });
      } catch (error) {
        console.error("Error resetting password:", error);
        this.errorMessage = error.response?.data?.errors[0][0] || "Failed to reset password. Please try again.";
      }
    },
  },
  
  created() {
    this.userDetails = Auth.USER
    console.log(Auth.USER)
    console.log(this.userDetails)
  }
};
</script>

<style scoped>
/* User Data Tab Styles */
.info-card {
  background: #f5f5f5;
  border: 2px solid #D9D9D9;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  font-size: 16px;
  color: #000000;
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E5E5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.info-label {
  font-weight: 500;
  font-size: 12px;
  color: #6B7280;
  margin: 0;
}

.info-value {
  font-weight: 500;
  font-size: 14px;
  color: #121212;
  margin: 0;
  word-break: break-word;
}

/* Form Styles */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  padding: 0 40px 0 16px;
  box-sizing: border-box;
  border-radius: 10px;
}

[dir="rtl"] .password-wrapper input {
  padding: 0 16px 0 40px;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

[dir="rtl"] .toggle-password {
  right: auto;
  left: 10px;
}

.toggle-password svg {
  display: block;
}

.label-title {
  font-weight: 500;
  font-size: 14px;
  color: #000000;
}

.btn-saveChanged {
  background: #6E3894;
  border-radius: 10px;
  color: #fff;
  padding: 0px 12px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  height: 25px;
}

.tab-container {
  border: 2px solid #D9D9D9;
  margin-top: 20px;
  padding: 1rem;
  border-radius: 10px;
}

/* Permissions Tab Styles */
.permissions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.permission-category-card {
  border: 2px solid #D9D9D9;
  border-radius: 10px;
  padding: 16px;
}

.category-title {
  font-weight: 600;
  font-size: 18px;
  color: #000000;
  border-bottom: 1px solid #D9D9D9;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  row-gap: 20px;
}
[dir="rtl"] .permissions-grid {
    direction: rtl;
}

.permission-toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.permission-label {
  font-weight: 500;
  font-size: 14px;
  color: #000000;
  flex: 1;
  text-align: start;
}

[dir="rtl"] .permission-label {
  text-align: start;
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #D9D9D9;
  border-radius: 34px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

[dir="rtl"] .toggle-slider:before {
  left: auto;
  right: 3px;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #6E3894;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

[dir="rtl"] .toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(-20px);
}
[dir="rtl"] .rtl-content {
align-items:normal;
}
 [dir="rtl"] .info-card , [dir="rtl"] .form-group label , [dir="rtl"] .category-title{
    text-align: end;
}
/* Responsive Design */
@media (max-width: 768px) {
  .permissions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
