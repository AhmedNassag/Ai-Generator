<template>
     <!-- Main Page component where the layout and page structure are set -->
     <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('color.configurations')"
          :mainSubPage="$t('color.department')" :subPage="$t('color.color')" :titlePage="$t('color.title')">
          <!-- Slot for rendering the DataTable -->
          <template #datatable>


               <div v-if="isLoading" class="loading-state">
                    <VProgressCircular indeterminate color="#44235C" size="48" />
                    <p class="mt-4 text-subtitle-1">{{ $t('common.loading') }}</p>
               </div>

               <!-- Statistics Header -->

               <group v-else :api="api" :apiParams="apiParams" :baseModle="baseModle" :group="group"
                    :groupFields="groupFields" :tableColumns="tableColumns" :openForm="openForm" :name="name"></group>
          </template>

          <!-- Slot for rendering the form -->
          <template #form>
               <button class="main-btn d-flex align-items-center justify-center mr-2 ml-2 " @click="isFlipped = false"
                    title="Configs.">
                    <v-icon left class="icon-add mr-2 ml-2">mdi-cog</v-icon>
                    Configs.
               </button>
               gggggggggg

          </template>
     </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import Group from './Group.vue';
import Auth from '../../../API/Auth';
import userreport from "@/API/UserReport/UserReport";

export default {
     components: {

          Group,
          MainPage,

     },
     setup() {
          // Initialize API and other required properties
          const api = new userreport();

          // Return properties for setup to be used in the template
          return {
               api,

          };
     },
     data() {
          return {
               api: {},
               apiParams: {},
               tableColumns: [],
               baseModle: "",
               apiParams: {},
               filterGroups: [],
               group: [],
               groupFields: [],
               name: "",
               isFlipped: false,
               isLoading: false


          };
     },

     async created() {
          this.isLoading = true;
          const res = await this.api.show(this.$route.params.id);
          const data = res.data;
      
          this.tableColumns = data.tableColumns;
          this.baseModle = data.baseModle;
          this.apiParams = data.apiParams;
          this.filterGroups = data.filterGroups;
          this.group = data.group;
          this.groupFields = data.groupFields;
          this.name = res.name;
          this.isLoading = false;
     },
     methods: {
          openForm() {

               const data = {
                    apiParams: {},
                    baseModle: "User",
                    apiParams: { filter: [], with: ["department:id,name", "job:id,name", 'teams'] },
                    filterGroups: [],
                    group: ["department_id", "job_id"],
                    groupFields: [
                         {
                              type: "options",
                              name: "department_id",
                              label: "user.department",
                              options: "Department",
                              optionLabel: "name",
                              col: 6,
                              rules: "required",
                              list: [],
                              description: "user.SelectDepartmentDescription",
                         },
                         {
                              type: "options",
                              name: "job_id",
                              label: "user.job",
                              options: "Job",
                              optionLabel: "name",
                              col: 6,
                              rules: "required",
                              list: [],
                              description: "user.SelectJobDescription",
                         },
                    ],
                    tableColumns: [
                         { title: "user.email", data: "email", defaultContent: "N/A" },
                         { title: "user.full_name", data: "full_name", defaultContent: "N/A" },
                         { title: "user.phone", data: "phone", defaultContent: "N/A" },
                         { title: "user.type", data: "type", defaultContent: "N/A" },
                         {
                              id: "status",
                              title: "user.status",
                              data: "status",
                              defaultContent: "N/A",
                         },

                         {
                              id: "is_locked",
                              title: "user.is_locked",
                              data: "is_locked",
                              defaultContent: "N/A",
                         },

                         { id: "Department", title: "user.Department", data: "department.name", defaultContent: "N/A" },
                         { id: "Job", title: "user.Job", data: "job.name", defaultContent: "N/A" },
                         { id: "Teams", title: "user.Teams", data: "team.name", defaultContent: "N/A" },
                    ],
                    name: "User Report",
               }
               const api = new userreport();
               api.from({ "user_id": Auth.USER.id, "name": "test", data })
               this.isFlipped = true;  // Show the form
          },
         
     }

}
</script>
<style scoped></style>
