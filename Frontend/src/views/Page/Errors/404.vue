<template>
  <div class="error-page-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card error-card shadow-lg">
            <div class="card-body text-center p-5">
              <div class="error-icon mb-4">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              
              <h1 class="error-code">404</h1>
              <h2 class="error-title mb-4">Page Not Found</h2>
              
              <p class="error-description mb-4">
                The page you are looking for doesn't exist or has been moved.
              </p>
              
              <div class="error-actions">
                <button @click="goBack" class="btn btn-outline-secondary me-2">
                  <i class="fas fa-arrow-left me-2"></i>Go Back
                </button>
                <router-link to="/" class="btn btn-primary">
                  <i class="fas fa-home me-2"></i>Return to Dashboard
                </router-link>
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
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
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