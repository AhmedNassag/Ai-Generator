<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="logo-container">
        <router-link to="/">
          <img class="logo-light" src="@/assets/images/logo/logo-1.png" alt="logo" v-permissoin:check/>
          <img class="logo-dark" src="@/assets/images/logo/logo.png" alt="logo" />
        </router-link>
      </div>
      <form class="reset-password-form" @submit.prevent="handleReset">
        <h2 class="form-title">Reset Your Password</h2>
        <p class="form-subtitle">
          Enter your email address to receive an OTP and reset your password.
        </p>

        <div v-if="backendError" class="alert alert-danger">{{ backendError }}</div>
        <div v-if="backendSuccess" class="alert alert-success">{{ backendSuccess }}</div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <input id="email" class="form-control" type="email" v-model="email" required
            :class="{ 'is-invalid': emailError }" placeholder="Enter your email" />
          <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
          <button class="btn btn-primary btn-send-otp" @click="sendOTP" type="button"
            :disabled="loadingOTP || otpSent || !isValidEmail">
            <span v-if="loadingOTP" class="spinner-border spinner-border-sm"></span>
            <span v-else>Send OTP</span>
          </button>
        </div>

        <!-- OTP Section -->
        <div v-if="otpSent" class="form-group otp-section">
          <label for="otp">Enter OTP</label>
          <input id="otp" class="form-control otp-input" type="text" v-model="otp" maxlength="4" required
            placeholder="Enter 4-digit OTP" />
          <p class="resend-otp">
            Didn't receive the OTP?
            <a @click.prevent="resendOTP" href="#" class="text-danger">Resend</a>
          </p>
        </div>

        <!-- New Password Section -->
        <div v-if="otpSent" class="password-section">
          <h4>Create New Password</h4>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input id="newPassword" class="form-control" type="password" v-model="newPassword" required
              placeholder="*********" />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" class="form-control" type="password" v-model="confirmPassword" required
              placeholder="*********" />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-group">
          <button class="btn btn-primary btn-block w-100" type="submit"
            :disabled="!otpSent || loadingResetPassword || !isPasswordsMatch">
            <span v-if="loadingResetPassword" class="spinner-border spinner-border-sm"></span>
            <span v-else>Reset Password</span>
          </button>
        </div>

        <p class="form-footer">
          Remember your password?
          <router-link to="{ name: 'Login' }" class="text-primary">Sign in</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      otpSent: false,
      loadingOTP: false,
      loadingResetPassword: false, 
      emailError: "",  
      backendError: "", 
      backendSuccess:"",
    };
  },
  computed: {
    isValidEmail() {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return emailPattern.test(this.email);
    },
    isPasswordsMatch() {
      return this.newPassword === this.confirmPassword;
    },
  },
  methods: {
    validateEmail() {
      if (!this.isValidEmail) {
        this.emailError = "Please enter a valid email address.";
        return false;
      }
      this.emailError = "";
      return true;
    },

    async sendOTP() {
      this.backendError = "";
      this.backendSuccess = "";
      if (!this.validateEmail()) return;

      this.loadingOTP = true;
      try {
        const response = await axios.post("/forgot-password", { email: this.email });
        console.log('response' + response)
        this.otpSent = true;
        this.backendSuccess = "OTP has been sent to your email.";
      } catch (error) {
        console.error("Error sending OTP:", error);
        this.backendError = error.response?.data?.errors[0][0] || "Failed to send OTP. Please try again.";
      } finally {
        this.loadingOTP = false;
      }
    },

    async resendOTP() {
      this.sendOTP();
    },

    async handleReset() {
      this.backendSuccess = "";
      this.backendError = "";
      if (!this.isPasswordsMatch) {
        alert("Passwords do not match.");
        return;
      }

      this.loadingResetPassword = true; 
      try {
        const response = await axios.post("/reset-password", {
          email: this.email,
          otp: this.otp,
          password: this.newPassword,
          password_confirmation: this.confirmPassword,
        });

        this.backendSuccess = "Password reset successfully.";
        this.$router.push({ name: "Login" });
      } catch (error) {
        console.error("Error resetting password:", error);
        this.backendSuccess = "";
        this.backendError = error.response?.data || "Failed to reset password. Please try again.";
      } finally {
        this.loadingResetPassword = false;
      }
    },
  },
};
</script>


<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
}

.reset-password-card {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-light,
.logo-dark {
  max-width: 150px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
}

.form-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
  border: none;
}

.btn-send-otp {
  margin-top: 0.5rem;
  width: 100%;
}

.spinner-border {
  margin-right: 0.5rem;
}

.otp-section {
  text-align: center;
}

.otp-input {
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.2rem;
}

.resend-otp {
  font-size: 0.9rem;
  color: #6c757d;
}

.resend-otp a {
  cursor: pointer;
  text-decoration: underline;
}

.password-section h4 {
  margin-bottom: 1rem;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}
</style>
