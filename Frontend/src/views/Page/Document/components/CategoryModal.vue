<template>
  <v-dialog v-model="localShow" max-width="600px" persistent>
    <v-card>
      <!-- Modal Header -->
      <v-card-title class="d-flex justify-space-between align-center rtl">
        <span class="text-h5">
          {{ isEditing ? "Edit Document Category" : "Add Document Category" }}
        </span>
        <v-btn icon @click="close" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Modal Body -->
      <v-card-text>
        <v-form @submit.prevent="submit" ref="form">
          <v-container>
            <v-row>
              <!-- Name Field -->
              <v-col cols="12">
                <v-text-field 
                  v-model="formData.name" 
                  label="Name" 
                  placeholder="Enter category name" 
                  required
                  :rules="[(v) => !!v || 'Name is required']" 
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <!-- Type Field -->
              <v-col cols="12">
                <v-select 
                  v-model="formData.type" 
                  label="Type" 
                  :items="typeOptions" 
                  item-title="text" 
                  item-value="value"
                  required 
                  :rules="[(v) => !!v || 'Type is required']" 
                  variant="outlined"
                ></v-select>
              </v-col>

              <!-- Workflow Category Field -->
              <v-col cols="12">
                <v-select 
                  v-model="formData.workflowCategory_id" 
                  label="Workflow Category" 
                  :items="workflowCategories"
                  item-title="name" 
                  item-value="id" 
                  required 
                  :rules="[(v) => !!v || 'Workflow Category is required']"
                  variant="outlined"
                  @update:modelValue="onWorkflowCategoryChange"
                ></v-select>
              </v-col>

              <!-- Workflow Field -->
              <v-col cols="12">
                <v-select 
                  v-model="formData.workflow_id" 
                  :key="formData.workflow_id" 
                  label="Workflow"
                  :items="workflowsForCategory" 
                  item-title="name" 
                  item-value="id" 
                  required
                  :rules="[(v) => !!v || 'Workflow is required']" 
                  variant="outlined"
                  @update:modelValue="onWorkflowChange"
                ></v-select>
              </v-col>

              <!-- Publish Step Field -->
              <v-col cols="12">
                <v-select 
                  v-model="formData.step_publish" 
                  label="Publish Step" 
                  :items="workflowStepsForCategory"
                  item-title="name" 
                  item-value="code" 
                  required 
                  :rules="[(v) => !!v || 'Publish Step is required']"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <!-- Modal Footer -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="outlined" @click="close">
          Close
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="submit">
          {{ isEditing ? "Update" : "Submit" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { notify } from "@kyvg/vue3-notification";

export default {
  name: "CategoryModal",
  props: {
    show: {
      type: Boolean,
      required: true
    },
    categoryData: {
      type: Object,
      default: null
    },
    workflowCategories: {
      type: Array,
      default: () => []
    },
    workflowsApi: {
      type: Object,
      required: true
    },
    categoriesApi: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localShow: this.show,
      formData: {
        id: null,
        name: "",
        type: "",
        workflowCategory_id: "",
        workflow_id: "",
        step_publish: "",
      },
      workflowsForCategory: [],
      workflowStepsForCategory: [],
      typeOptions: [
        { text: "Standard", value: "standard" },
        { text: "Policy", value: "policy" },
        { text: "Procedure", value: "procedure" },
        { text: "Other", value: "other" },
      ],
    };
  },
  computed: {
    isEditing() {
      return !!this.formData.id;
    }
  },
  watch: {
    show(val) {
      this.localShow = val;
      if (val && this.categoryData) {
        this.loadCategoryData();
      } else if (val) {
        this.resetForm();
      }
    },
    localShow(val) {
      if (!val) {
        this.$emit('update:show', false);
      }
    }
  },
  methods: {
    async loadCategoryData() {
      this.formData = {
        id: this.categoryData.id,
        name: this.categoryData.name,
        type: this.categoryData.type,
        workflowCategory_id: this.categoryData.workflow?.workflow_category?.id || "",
        workflow_id: this.categoryData.workflow_id || "",
      };
      
      await this.fetchWorkflows(this.formData.workflowCategory_id);
      
      this.$nextTick(() => {
        this.formData.step_publish = this.categoryData.step_publish;
      });
    },
    async onWorkflowCategoryChange(categoryId) {
      if (!categoryId) {
        this.workflowsForCategory = [];
        this.workflowStepsForCategory = [];
        this.formData.workflow_id = null;
        return;
      }
      await this.fetchWorkflows(categoryId);
    },
    async onWorkflowChange(workflowId) {
      if (workflowId) {
        const selectedWorkflow = this.workflowsForCategory.find(
          (workflow) => workflow.id === workflowId
        );
        this.workflowStepsForCategory = selectedWorkflow?.steps || [];
        this.formData.step_publish = null;
      }
    },
    async fetchWorkflows(categoryId) {
      if (!categoryId) return;
      
      const isActive = 1;
      const workflowsResponse = await this.workflowsApi.getAll({
        filter: `workflowCategory_id|${categoryId}|=&&isActive|${isActive}|=`,
        select: "id|name|steps",
      });
      
      this.workflowsForCategory = workflowsResponse;
      
      if (this.formData.workflow_id) {
        const selectedWorkflow = this.workflowsForCategory.find(
          (w) => w.id === this.formData.workflow_id
        );
        this.workflowStepsForCategory = selectedWorkflow ? selectedWorkflow.steps : [];
      }
    },
    async submit() {
      try {
        const { valid } = await this.$refs.form.validate();
        if (!valid) {
          notify({
            type: "error",
            title: "Validation Error",
            text: "Please fill all required fields correctly",
          });
          return;
        }

        if (this.isEditing) {
          const response = await this.categoriesApi.update(this.formData);
          if (response.status === "success") {
            notify({
              type: "success",
              title: "Success",
              text: "Category updated successfully",
            });
            this.$emit('success');
            this.close();
          } else {
            notify({
              type: "error",
              title: "Error",
              text: "Failed to update category",
            });
          }
        } else {
          const response = await this.categoriesApi.insert(this.formData);
          if (response.status === "success") {
            notify({
              type: "success",
              title: "Success",
              text: "Category created successfully",
            });
            this.$emit('success');
            this.close();
          } else {
            notify({
              type: "error",
              title: "Error",
              text: `Failed to create category: ${response.message || "Unknown error"}`,
            });
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred while submitting the form";
        notify({
          type: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    },
    close() {
      this.resetForm();
      this.$emit('update:show', false);
      this.$emit('close');
    },
    resetForm() {
      this.formData = {
        id: null,
        name: "",
        type: "",
        workflowCategory_id: "",
        workflow_id: "",
        step_publish: "",
      };
      this.workflowsForCategory = [];
      this.workflowStepsForCategory = [];
    }
  }
};
</script>
<style>
 [dir="rtl"] .v-messages__message{
    text-align: end !important;
}
 [dir="rtl"] .v-field__input {
    justify-content: end !important;
}
 [dir="rtl"] .v-text-field input {
    text-align: end !important;
}
</style>