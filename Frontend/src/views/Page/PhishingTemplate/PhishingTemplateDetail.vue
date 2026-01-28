<template>
  <v-card class="pa-5">
    <div v-if="loading" class="text-center my-5">
      <v-progress-circular indeterminate color="primary" size="60" width="6" />
    </div>
    <div v-else>
      <div v-if="template">
        <!-- <h4>{{ template.name }}</h4> -->
        <div 
          v-if="phishingWebsiteBody" 
          class="phishing-website-preview" 
          v-html="phishingWebsiteBody"
          @click="handleSubmitButtonClick"
        ></div>
      </div>
      <div v-else class="text-grey">No template data found.</div>
    </div>
  </v-card>
</template>

<script>
import phishingtemplate from '@/API/PhishingTemplate/PhishingTemplate';
import axios from "axios";

export default {
  name: 'PhishingTemplateDetail',
  data() {
    return {
      loading: true,
      template: null,
      phishingWebsiteBody: '',
      userId: this.$route.params.userId,
      campaignId: this.$route.params.campaignId,
      templateId: this.$route.params.templateId

    };
  },
  async created() {
    axios.defaults.baseURL = BASEPATH;
    this.loading = true;
    
    try {
      // Send initial tracking request with status=3 (page view)
      await this.sendTrackingRequest(3);
      
      const response = await axios.get(`getWebsiteData/${this.templateId}`);
      this.template = response.data;
      this.phishingWebsiteBody = response.data.phishing_website_page?.html_code || '';
      
    } catch (e) {
      console.error('Error:', e);
      this.template = null;
      this.phishingWebsiteBody = '';
    }
    
    this.loading = false;
  },
  methods: {
    async sendTrackingRequest(status) {
    try {
      await axios.get(`/previwe-mail/${this.userId}/${this.campaignId}/${this.templateId}/${status}`);
    } catch (error) {
      console.error('Error sending tracking request:', error);
    }
  },
    
  async handleSubmitButtonClick(event) {
  const submitButton = event.target.closest('button[type="submit"], input[type="submit"]');
  const form = submitButton?.closest('form');
  
  if (submitButton && form) {
        event.preventDefault(); // Prevent the default form submission
        
        try {
          // Send tracking request with status=4 (submit button clicked)
          await this.sendTrackingRequest(4);
          
          // Show the alert message
          // alert('This is a simulated phishing exercise. Your action has been recorded.');
          
          // After the tracking is complete and user acknowledges, submit the form
          form.submit();
        } catch (error) {
          console.error('Error during tracking:', error);
          // Optionally show an error message to the user
        }
      }
    }
  }
};
</script>

<style scoped>
.text-grey { color: #888; }
</style>