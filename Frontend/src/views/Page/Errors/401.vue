<template>
  <div class="error-page-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card error-card shadow-lg">
            <div class="card-body text-center p-5">
              <div class="error-icon mb-4">
                <i class="fas fa-lock"></i>
              </div>
              
              <h1 class="error-code">401</h1>
              <h2 class="error-title mb-4">Unauthorized Access</h2>
              
              <p class="error-description mb-4">
                You don't have permission to access this resource. Please make sure you have the necessary access rights.
              </p>
              
              <div class="error-actions">
                <button @click="goBack" class="btn btn-outline-secondary me-2">
                  <i class="fas fa-arrow-left me-2"></i>Go Back
                </button>
                <router-link to="/" class="btn btn-primary">
                  <i class="fas fa-home me-2"></i>Return to Dashboard
                </router-link>
              </div>
              
              <div class="mt-4 error-help">
                <p class="small text-muted">
                  If you believe you should have access to this page, please contact your system administrator 
                  or <a href="mailto:support@example.com" class="text-decoration-none">support team</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.error-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 1rem;
}

.error-card {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  background-color: #fff;
}

.error-icon {
  font-size: 5rem;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.error-code {
  font-size: 4rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0;
}

.error-title {
  font-size: 1.75rem;
  color: #5c5c5c;
  font-weight: 500;
}

.error-description {
  color: #6c757d;
  font-size: 1.1rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.error-actions {
  margin-top: 2rem;
}

.error-actions .btn {
  padding: 0.6rem 1.5rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.error-actions .btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.error-actions .btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.error-actions .btn-outline-secondary:hover {
  background-color: #6c757d;
  color: #fff;
}

.error-help a {
  color: #0d6efd;
}

.error-help a:hover {
  color: #0a58ca;
}

@media (max-width: 767.98px) {
  .error-code {
    font-size: 3.5rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-icon {
    font-size: 4rem;
    width: 100px;
    height: 100px;
  }
  
  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 100%;
    margin: 0;
  }
}
</style>