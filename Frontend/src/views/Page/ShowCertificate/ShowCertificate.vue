<template>
  <div class="certificate-container">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-if="certificate" class="certificate-view">
     
      
      <div class="certificate-content">
        <div class="certificate-preview-container">
          <!-- Display certificate HTML with replaced placeholders -->
          <div v-html="processedCertificateHtml" class="certificate-preview"></div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
  </div>
</template>

<script>
import showcertificate from "@/API/ShowCertificate/ShowCertificate";
import Swal from 'sweetalert2';
import axios from "axios";
import User from "@/API/User/User";
export default {
  setup() {
    const api = new showcertificate();
    const userApi = new User();
    return { api,userApi };
  },
 
  data() {
    return {
      loading: false,
      certificate: null,
      processedCertificateHtml: '',
      error: null,
      id: this.$route.params.id,
      certificateUrl: '',
      users:[],
    };
  },
  
  async created() {
    // this.users = await this.userApi.getAll();
    this.loading = true;
    axios.defaults.baseURL = BASEPATH;
    
    try {
      // Get certificate data
      // const response = await axios.get(`user-certificate/${this.id}`, {
      //   params: {
      //     with: ['certificateable','template']
      //   }
      // });   
        const response = await axios.get(`user-certificate/${this.id}`, {
        params: {
          with: ['certificateable','template']
        }
      });     
      this.certificate = response.data;
      this.certificate.user =await  this.userApi.show(this.certificate.user_id);
      
      // Generate certificate URL for QR code
      this.certificateUrl = `${window.location.origin}/user-certificate/${this.id}`;
      
       if (this.certificate.template.template_html && this.certificate.template.fullBackgroundPath) {
          this.certificate.template.template_html = this.certificate.template.template_html.replace(
            /(background-image:\s*url\()['"][^'"]*['"](\))/,
            `$1'${this.certificate.template.fullBackgroundPath}'$2`
          );
        }

      // Process the certificate HTML to replace placeholders
      if (this.certificate?.template?.template_html) {
        this.processedCertificateHtml = this.replacePlaceholders(
          this.certificate.template.template_html,
          this.certificate.user,
          this.certificate.created_at,
          this.certificate
        );
       
          
      }
    } catch (e) {
      console.error('Error:', e);
      this.error = 'Failed to load certificate. Please try again later.';
    }
    
    this.loading = false;
  },
  
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    
    replacePlaceholders(html, user, createdDate,data) {
        if (!html) return '';
        
        // Replace user name
        html = html.replace(/#UserName/g, user?.full_name || '');
        // Replace user email
        html = html.replace(/#TraineeEmail/g, user?.email || '');
        
        // Replace department
        html = html.replace(/#UserDepartment/g, user?.department?.name || '');

        if(data.certificateable){
          // Replace course name
          html = html.replace(/#courseName/g, data.certificateable?.name || '');
        } else {
          html = html.replace(/#courseName/g, 'N/A');
        }

        if(data.certificate_number){
          // Replace certificate number
          html = html.replace(/#CertNumber/g, data.certificate_number || 'N/A');
        } else {
          html = html.replace(/#CertNumber/g, 'N/A');
        }

        if(data.grade){
          // Replace grade
          html = html.replace(/#Grade/g, data.grade || 'N/A');
          // replace percentage
          html = html.replace(/#Percentage/g,Math.round((data.grade / data?.certificateable?.grade) * 100) || 'N/A');

        } else {
          html = html.replace(/#Grade/g, 'N/A');
        }

        


        
        // Replace completion date
        const formattedDate = this.formatDate(createdDate);
        html = html.replace(/#Date/g, formattedDate);
        
        // Generate QR code URL
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(this.certificateUrl)}`;
        console.log('Generated QR URL:', qrCodeUrl);
        
        // Check for both encoded and unencoded versions of the placeholder
        const hasPlaceholder = html.includes('#QRCODELINK') || html.includes('%23QRCODELINK');
        console.log('Contains placeholder:', hasPlaceholder);
        
        // Replace the QR code image src - handle both encoded and unencoded versions
        html = html.replace(
          /(<img[^>]*src=["'])([^"']*)(#|%23)QRCODELINK([^"']*)(["'][^>]*>)/g,
          `$1${qrCodeUrl}$5`
        );

         
        console.log('After replacement:', html);
        return html;
      },
    
    async downloadCertificate() {
      try {
        const response = await this.api.downloadCertificate(this.id);
        
        if (response) {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `certificate_${this.id}.pdf`;
          link.click();
        }
      } catch (error) {
        console.error('Error downloading certificate:', error);
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: error.response?.data?.message || 'Could not download the certificate',
        });
      }
    }
  }
};
</script>

<style scoped>
.certificate-container {
  margin: 0 auto;
  padding: 20px;
}

.certificate-view {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.certificate-content {
  margin-top: 20px;
}

.certificate-info {
  margin-bottom: 20px;
}

.certificate-preview-container {
  width: 100%;
  overflow-x: auto;
  padding: 10px 0;
}

.certificate-preview {
  margin: 0 auto;
  transform-origin: top center;
}

.btn {
  margin-top: 10px;
}

/* Certificate display adjustments */
.certificate-preview >>> .certificate-container {
  margin: 0 auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.certificate-preview >>> .draggable-element {
  user-select: none;
  pointer-events: none;
}
</style>