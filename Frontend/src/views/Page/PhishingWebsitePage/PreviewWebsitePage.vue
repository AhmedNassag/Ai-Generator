  <template>
      <div v-html="phishingWebsite.html_code"></div>

       <div v-if="loading" class="text-center my-5">
        <v-progress-circular indeterminate color="primary" size="60" width="6" />
      </div>

    </template>

<script>
import MainPage from "@/components/MainPage.vue";

import phishingwebsitepage from "@/API/PhishingWebsitePage/PhishingWebsitePage";
export default {
   components: {
    MainPage,  // Main page layout component
  },

  setup() {
    const api = new phishingwebsitepage();
    return {
      api,
    };
  },

  data() {
    return {
      phishingWebsite: {},
      loading: false,
    };
  },

  async mounted() {
    await this.fetchPhishingwebsite();
  },

  methods: {
    async fetchPhishingwebsite() {
      this.loading = true;
      try {
        const response = await this.api.show(this.$route.params.id);
        this.phishingWebsite = response;
      } catch (error) {
        console.error("Error fetching phishing website:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
