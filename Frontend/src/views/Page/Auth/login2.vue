<template>
  <div class="login-container">
    <div class="login-left">
      <div class="left-content">
        <div class="logo-section">
          <img class="company-logo" src="@/assets/images/logo/logo5.png" alt="Advanced Controls" />
          <h1 class="welcome-title">Welcome Back To <br><span class="grc-text">Our System</span></h1>
          <p class="welcome-subtitle">Please Login To Your Account</p>
        </div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <form class="theme-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email Or Phone</label>
            <input class="form-control" type="text" v-model="login" required placeholder="Email Or Phone" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="form-input position-relative">
              <input class="form-control" :type="passwordType" v-model="password" required placeholder="**********" />
              <span class="show-hide" @click="togglePasswordVisibility">
                <svg v-if="passwordType === 'password'" width="17" height="16" viewBox="0 0 17 16" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5.13458 8.15988L1.87019 4.97785C0.58507 6.34346 0.0980753 7.71155 0.0896205 7.73957L0 8L0.0887751 8.26043C0.107376 8.31565 2.0469 13.769 8.50042 13.769C9.28587 13.769 10.0011 13.685 10.6581 13.544L8.3364 11.2809C7.50046 11.241 6.70966 10.8993 6.11786 10.3225C5.52605 9.74558 5.17556 8.97473 5.13458 8.15988ZM8.50042 2.23097C6.93206 2.23097 5.64694 2.56392 4.57572 3.05347L1.44323 0L0.247725 1.16534L15.4663 16L16.6618 14.8347L13.8734 12.1166C16.1038 10.5071 16.8994 8.29504 16.9112 8.26043L17 8L16.9112 7.73957C16.8926 7.68435 14.9539 2.23097 8.50042 2.23097ZM10.1119 8.44998C10.27 7.89204 10.1356 7.26404 9.69593 6.83466C9.25628 6.40527 8.61118 6.27506 8.03879 6.42917L6.76381 5.18636C7.28638 4.87336 7.8871 4.7063 8.50042 4.70341C10.3655 4.70341 11.8823 6.18193 11.8823 8C11.8798 8.59777 11.7081 9.18326 11.386 9.69197L10.1119 8.44998Z"
                    fill="#6E3894" />
                </svg>
                <svg v-else width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.5 2.23077C2.04648 2.23077 0.107778 7.68435 0.0891783 7.73957L0 8L0.0891783 8.26043C0.107778 8.31565 2.04648 13.7692 8.5 13.7692C14.9535 13.7692 16.8922 8.31565 16.9108 8.26043L17 8L16.9108 7.73957C16.8922 7.68435 14.9535 2.23077 8.5 2.23077ZM8.5 12C6.01472 12 4 9.98528 4 7.5C4 5.01472 6.01472 3 8.5 3C10.9853 3 13 5.01472 13 7.5C13 9.98528 10.9853 12 8.5 12ZM8.5 4.5C6.84315 4.5 5.5 5.84315 5.5 7.5C5.5 9.15685 6.84315 10.5 8.5 10.5C10.1569 10.5 11.5 9.15685 11.5 7.5C11.5 5.84315 10.1569 4.5 8.5 4.5Z"
                    fill="#6E3894" />
                </svg>
              </span>
            </div>
          </div>
          <p v-if="message" class="text-danger">{{ message }}</p>
          <div class="form-group checkbox-container">
            <input id="rememberMe" type="checkbox" v-model="remember_me" />
            <label for="rememberMe" class="mb-0 ms-2 ">Remember Me</label>
          </div>
          <button class="btn btn-purple btn-block w-100" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Sign In</span>
          </button>
          <!-- <div class="forgot-password">
            Forgot Your Password? <router-link to="/forgot-password" class="main-color">Forgot Password</router-link>
          </div> -->
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import Auth from "@/API/Auth";
// import GeneralSettings from "@/API/GeneralSettings/GeneralSettings";

export default {
  setup() {
    // Initialize API and other required properties
    // const generalSettingApi = new GeneralSettings();

    // Return properties for setup to be used in the template
    return {
      // generalSettingApi
    };
  },
  data() {
    return {
      login: "",
      password: "",
      passwordType: "password",
      message: "",
      remember_me: false,
      loading: false,
      logo: "",
      favIcon: ""
    };
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },
  created() {
    // this.getImages();
  },
  methods: {
    async handleLogin() {
      this.message = "";
      if (this.login && this.password) {
        this.loading = true;
        try {
          const result = await Auth.logIn(this.login, this.password, this.remember_me);
          if (result === true) {
            // window.location.href = "/user";
            this.$router.push({ name: "User" });
          }
        } catch (error) {
          this.message = error;
        } finally {
          this.loading = false;
        }
      } else {
        this.message = "Enter credentials";
      }
    },
    togglePasswordVisibility() {
      this.passwordType = this.passwordType === "password" ? "text" : "password";
    },
    // async getImages(){
    //   const result = await this.generalSettingApi.getAll();
    //   // this.favIcon = result[0].FullImagePathFavicon;
    //   // this.logo = result[0].FullImagePathLogo;
    //   if (result && result.length > 0) {
    //     this.favIcon = result[0]?.FullImagePathFavicon || "";
    //     this.logo = result[0]?.FullImagePathLogo || "";
    //   } else {
    //     console.warn("No images found in settings.");
    //   }
    //   console.log("this.favIcon",this.favIcon);
    //   console.log("this.logo",this.logo);
    // }
  },
};
</script>


<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  background: #f5f5f5;
  gap: 30px;
}

.login-left {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px 15px 25px 25px;
}

.left-content {
  max-width: 800px;
  text-align: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.company-logo {
  max-width: 280px;
  height: auto;
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #000000;
  margin: -20px 0 0 0;
  line-height: 1.3;
}

.grc-text {
  color: #6E3894;
}

.welcome-subtitle {
  font-size: 18px;
  color: #757575;
  margin: -10px 0 0 0;
}

.image-overlay {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background-image {
  width: 100%;
  height: 100vh;
  object-fit: cover;
  opacity: 0.3;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 40px 40px 40px 15px;
}

.login-card {
  width: 100%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 38px 33px;
  background: #ffffff;
}

.logo {
  text-align: center;
  margin-bottom: 20px;
}

.logo-light,
.logo-dark {
  max-height: 50px;
}

.login-title {
  display: none;
}

.theme-form h3 {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-subtitle {
  text-align: center;
  color: #888;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #000000;
  font-weight: 400;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 11px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #000000;
}

.form-control:focus {
  border-color: #6E3894;
  outline: none;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

.form-control::placeholder {
  color: #9e9e9e;
}

.show-hide {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6E3894;
  font-size: 13px;
  font-weight: 500;
  user-select: none;
  display: flex;
  align-items: center;
}

.show-hide:hover {
  opacity: 0.7;
}

.show-hide svg {
  display: block;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.checkbox-container input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6E3894;
  border: 2px solid #6E3894;
  border-radius: 10px;
}

.checkbox-container label {
  margin-left: 8px;
  color: #8C8C8C;
  font-size: 14px;
  cursor: pointer;
  font-weight: 400;
}

.btn {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: #4facfe;
  color: #fff;
}

.btn-primary:hover {
  background: #00f2fe;
}

.btn-purple {
  background: #6E3894 !important;
  border: 1px solid #6E3894 !important;
  border-radius: 12px;
  color: #fff;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.btn-purple:hover:not(:disabled) {
  background-color: #5c2d7a !important;
  border-color: #5c2d7a !important;
}

.btn-purple:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #757575;
}

.forgot-password a {
  color: #6E3894;
  text-decoration: none;
  font-weight: 400;
  margin-left: 5px;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.spinner-border {
  margin-right: 10px;
  color: #fff;
}

.main-color {
  color: #6E3894;
  text-decoration: none;
}

.main-color:hover {
  color: #5c2d7a;
}

.text-center {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 30px;
}

.text-danger {
  color: #ef4444;
  font-size: 13px;
  margin-top: -10px;
  margin-bottom: 15px;
}

@media (max-width: 992px) {
  .login-left {
    display: none;
  }

  .login-right {
    flex: 1;
  }
}

@media (max-width: 576px) {
  .login-card {
    padding: 30px 20px;
  }

  .welcome-title {
    font-size: 28px;
  }
}
</style>