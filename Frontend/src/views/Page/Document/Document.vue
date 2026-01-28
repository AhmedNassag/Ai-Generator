<template>
  <div v-permission:index v-permission:show v-permission:create v-permission:update v-permission:delete>
    <PurpleDotsLoader v-if="pageLoading" />
   <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="'Document'" :subPage="'Document mgmt'" :titlePage="'Document mgmt'">
      <template #datatable>
        <!-- ==================== 1. CATEGORIES SECTION ==================== -->
        <div class="card categories-card">
          <div class="card-body">
            <!-- Section Header -->
            <div class="section-header">
              <div class="header-actions">
                <div class="search-input-modern">
                  <i class="fa fa-search search-icon"></i>
                  <input type="text" v-model="searchQuery" placeholder="Search categories..." class="form-control" />
                </div>
                <button class="action-icon-btn edit-btn" v-if="activeCategoryData.id"
                  @click="openEditCategoryModal(activeCategoryData)" title="Edit Category">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="action-icon-btn delete-btn" v-if="activeCategoryData.id"
                  @click="deleteCategory(activeCategoryData.id)" title="Delete Category">
                  <i class="fa fa-trash"></i>
                </button>
                <button class="primary-btn" @click="openCategoryModal">
                  <i class="fa fa-plus-circle"></i>
                  Add Category
                </button>
              </div>
            </div>

            <!-- Categories Slider -->
            <div class="categories-row">
              <button class="scroll-btn scroll-btn-left" @click="slideLeft" v-if="categories.length > 1">
                <i class="fa fa-chevron-left"></i>
              </button>
              <div class="categories" ref="categoriesContainer">
                <div class="categories-scroll-container" :class="{ 'single-item': categories.length === 1 }">
                  <button v-for="(category, index) in categories" :key="index"
                    :class="['category-card-btn', { active: activeCategory === index, 'full-width': categories.length === 1 }]"
                    @click="setActiveCategory(index)">
                    <span class="category-name">{{ category.name }}</span>
                  </button>
                </div>
              </div>
              <button class="scroll-btn scroll-btn-right" @click="slideRight" v-if="categories.length > 1">
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== 2. STATISTICS SECTION ==================== -->
        <div class="card stats-card">
          <div class="card-body">
            <div class="section-header-stac mb-4">
              <h2 class="section-title d-flex rtl">
                <i class="fa fa-chart-bar"></i>
                Statistics Overview
              </h2>
            </div>

            <div class="statistics-container">
              <!-- Loading Overlay -->
              <div v-if="countsLoading" class="loading-overlay">
                <i class="fa fa-spinner fa-spin fa-3x"></i>
              </div>

              <!-- Statistics Scrollable Row -->
              <div class="statistics-row">
                <button class="scroll-btn scroll-btn-left" @click="slideStatsLeft" v-if="workflowSteps.length > 1">
                  <i class="fa fa-chevron-left"></i>
                </button>
                <div class="statistics-wrapper" ref="statisticsContainer">
                  <div class="status-cards-scroll-container" :class="{
                    'single-item': workflowSteps.length === 0,
                    'two-items': workflowSteps.length === 1
                  }">
                    <!-- Total Documents Card -->
                    <div class="modern-status-card total-card" :class="{
                      'full-width': workflowSteps.length === 0,
                      'half-width': workflowSteps.length === 1
                    }">
                      <div class="status-icon-wrapper">
                        <div class="status-icon-circle total">
                          <i class="fa fa-file-text"></i>
                        </div>
                      </div>
                      <div class="status-content">
                        <div class="status-label">Total Documents</div>
                        <div class="status-number">
                          {{ totalDocumentCount }}
                        </div>
                      </div>
                    </div>

                    <!-- Dynamic Status Cards -->
                    <div v-for="(step, index) in workflowSteps" :key="index" class="modern-status-card" :class="{
                      'full-width': workflowSteps.length === 0,
                      'half-width': workflowSteps.length === 1
                    }">
                      <div class="status-icon-wrapper">
                        <div class="status-icon-circle" :style="{ 'background-color': stepClass(step.name).bg }">
                          <i :class="stepIcon(step.name)"></i>
                        </div>
                      </div>
                      <div class="status-content">
                        <div class="status-label">{{ step.name }}</div>
                        <div class="status-number">
                          {{ documentCounts[step.code] || 0 }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button class="scroll-btn scroll-btn-right" @click="slideStatsRight" v-if="workflowSteps.length > 1">
                  <i class="fa fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- ==================== 4. DATA TABLE SECTION ==================== -->
        <div class="card table-card">
          <div class="card-body">
            <!-- Category Info Bar -->
            <div class="category-info-bar" v-if="activeCategoryData && activeCategoryData.name">
              <div class="info-pills">
                <div class="info-pill">
                  <span class="pill-label">Name:</span>
                  <span class="pill-value">{{ activeCategoryData.name }}</span>
                </div>
                <div class="info-pill">
                  <span class="pill-label">Type:</span>
                  <span class="pill-value">{{ activeCategoryData.type }}</span>
                </div>
              </div>
              <router-link :to="`/category-adoption/${activeCategoryData.id}`">
                <span v-for="n in 1" :key="n">
                  <i class="fa-solid fa-circle-check category-icon" title="Adoption Policies"></i>
                </span>
              </router-link>
              <button class="primary-btn" v-if="activeCategoryData.id" @click="openForm">
                <i class="fa fa-plus-circle"></i>
                Add
              </button>

            </div>
            <!-- ==================== 3. WORKFLOW STEPS SECTION ==================== -->
            <div class="workflow-steps-section">
              <button class="scroll-btn scroll-btn-left" @click="slideWorkflowLeft" v-if="workflowSteps.length > 1">
                <i class="fa fa-chevron-left"></i>
              </button>
              <div class="workflow-steps-wrapper-grid" ref="workflowContainer">
                <div class="workflow-scroll-container" :class="{
                  'single-item': workflowSteps.length === 0,
                  'two-items': workflowSteps.length === 1
                }">
                  <!-- Workflow Step Buttons -->
                  <button v-for="(step, stepIndex) in workflowSteps" :key="stepIndex" :class="['workflow-step-card', {
                    active: activeWorkflowStep === stepIndex,
                    'full-width': workflowSteps.length === 0,
                    'half-width': workflowSteps.length === 1
                  }]" @click="setActiveWorkflowStep(stepIndex)">
                    <span class="step-name">{{ step.name }}</span>
                  </button>

                  <!-- All Button -->
                  <button class="workflow-step-card all-step" :class="{
                    active: activeWorkflowStep === -1,
                    'full-width': workflowSteps.length === 0,
                    'half-width': workflowSteps.length === 1
                  }" @click="showAllSteps()">
                    <span class="step-name">All Steps</span>
                  </button>
                </div>
              </div>
              <button class="scroll-btn scroll-btn-right" @click="slideWorkflowRight" v-if="workflowSteps.length > 1">
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>

            <DataTable v-if="showTable" ref="table" id="example-table"
              :tableClass="'table table-striped table-bordered'" :columns="tableColumns" :api="api"
              :apiParams="apiParams" :editItem="editItem" :openForm="openForm" :hideAddNewButton="true"
              :hideActions="hideActions">
              <template #Creation-Date="{ item }">
                {{ formatDate(item.created_at) }}
              </template>
              <template #Published-Date="{ item }">
                {{ formatDate(item.published_date) }}
              </template>
              <template #Next-Review-Date="{ item }">
                {{ formatDate(item.next_review_date) }}
              </template>
              <template #document.status="{ item }">
                <v-badge :content="item.status" inline class="status-badge"></v-badge>
              </template>
              <template #Name="{ item }">
                <template v-if="isDocumentAccessible(item)">
                  <router-link :to="{ path: `/document/${item.id}` }" class="clickable-name">
                    {{ item.name }}
                  </router-link>
                </template>
                <template v-else>
                  <span class="non-clickable-name">{{ item.name }}</span>
                </template>
              </template>

              <template #Transitions="{ item }">
                <v-btn size="small" color="primary" v-if="hasAvailableTransitions(item)"
                  @click="openTransitionModal(item)" :disabled="transitionLoading">
                  <v-icon icon="mdi-swap-horizontal" class="me-1"></v-icon>
                  Transitions
                </v-btn>
              </template>

              <template #Stakeholder="{ item }">
                <div>
                  <span v-if="getStakeholdersArray(item.stakeholder_ids).length > 0">
                    {{ getStakeholdersArray(item.stakeholder_ids).join(', ') }}
                  </span>
                  <span v-else class="text-muted">N/A</span>
                </div>
              </template>

              <template #Team="{ item }">
                <div>
                  <span v-if="getTeamsArray(item.team_ids).length > 0">
                    {{ getTeamsArray(item.team_ids).join(', ') }}
                  </span>
                  <span v-else class="text-muted">N/A</span>
                </div>
              </template>
              <template #Owner="{ item }">
                {{ getOwnerName(item.owner_id) }}
              </template>
              <template #Reviewer="{ item }">
                {{ getOwnerName(item.reviewer_id) }}
              </template>


              <template #Framework="{ item }">
                <div class="badges-wrapper">
                  <span v-for="(framework, index) in getFrameworksArray(item.framework_id)" :key="index"
                    class="badge badge-info mr-1 mb-1">
                    {{ framework }}
                  </span>
                  <span
                    v-if="!item.framework_id || (Array.isArray(item.framework_id) && item.framework_id.length === 0)"
                    class="text-muted">N/A</span>
                </div>
              </template>
              <template #Control="{ item }">
                <div class="badges-wrapper">
                  <span v-for="(control, index) in getControlsArray(item.control_id)" :key="index"
                    class="badge badge-info mr-1 mb-1">
                    {{ control }}
                  </span>
                  <span v-if="!item.control_id || (Array.isArray(item.control_id) && item.control_id.length === 0)"
                    class="text-muted">N/A</span>
                </div>
              </template>

              <template #File="{ item }">
                <a href="javascript:void(0)" @click="downloadFile(item.file_url)" class="file-download-link">
                  {{ item.filename }}
                </a>
              </template>
            </DataTable>
          </div>
        </div>
      </template>

      <template #form>
        <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
          <template #category_id="{ item }">
            <input id="category_id" v-model="newItem.category_id" type="hidden" />
          </template>
          <template #document_category_id="{ item }">
            <input id="document_category_id" name="document_category_id" v-model="activeCategoryData.id" type="hidden"
              class="form-control" />
          </template>

          <Field name="framework_id" :rules="getFieldStatus('framework_id')?.rules === 'required' ? 'required' : ''
            " v-model="newItem.framework_id" v-slot="{ field: fieldProps, errorMessage, handleChange, handleBlur }">
            <div v-if="getFieldStatus('framework_id')?.type !== 'hidden'" class="col-6 mb-2">
              <label>Framework</label>
              <select id="framework_id" class="form-control" :class="{ 'is-invalid': errorMessage }"
                v-model="newItem.framework_id" @change="handleChange" @blur="handleBlur" multiple size="5"
                :disabled="getFieldStatus('framework_id')?.disabled"
                :required="getFieldStatus('framework_id')?.rules === 'required'">
                <option v-for="framework in frameworkList" :key="framework.id" :value="framework.id">
                  {{ framework.title }}
                </option>
              </select>
              <small class="form-text text-muted">Hold Ctrl/Cmd to select multiple</small>
              <div v-if="errorMessage" class="invalid-feedback">
                {{ errorMessage }}
              </div>
            </div>
          </Field>

          <template #control_id="{ item }">
            <div class="col-md-6 mb-3">
              <label for="control_id">Control</label>
              <v-select id="control_id" v-model="newItem.control_id" :options="controlList"
                :reduce="(option) => option.id" placeholder="Select control" label="short_name" multiple
                :disabled="getFieldStatus('control_id')?.disabled || controlList.length === 0"
                :key="`control-select-${controlListKey}`">
                <template #no-options>
                  {{ controlList.length === 0 ? 'Select framework first' : 'No options available' }}
                </template>
              </v-select>
              <small class="form-text text-muted" v-if="controlList.length === 0">Select framework first</small>
            </div>
          </template>

          <Field name="team_ids" :rules="getFieldStatus('team_ids')?.rules === 'required' ? 'required' : ''
            " v-model="newItem.team_ids" v-slot="{ field: fieldProps, errorMessage, handleChange, handleBlur }">
            <div v-if="getFieldStatus('team_ids')?.type !== 'hidden'" class="col-6 mb-2">
              <label>Team</label>
              <v-select id="team_ids" class="flex-grow-1" :class="{ 'is-invalid': errorMessage }"
                :value="fieldProps.value" @update:modelValue="handleChange" @blur="handleBlur" :items="teamList"
                item-title="name" item-value="id" multiple :disabled="getFieldStatus('team_ids')?.disabled" chips
                placeholder="Select team" :required="getFieldStatus('team_ids')?.rules === 'required'" />
              <div v-if="errorMessage" class="invalid-feedback">
                {{ errorMessage }}
              </div>
            </div>
          </Field>

          <Field name="stakeholder_ids" :rules="getFieldStatus('stakeholder_ids')?.rules === 'required'
            ? 'required'
            : ''
            " v-model="newItem.stakeholder_ids" v-slot="{ field: fieldProps, errorMessage, handleChange, handleBlur }">
            <div v-if="getFieldStatus('stakeholder_ids')?.type !== 'hidden'" class="col-6 mb-2">
              <label>Stakeholder</label>
              <v-select :items="userList" id="stakeholder_ids" class="flex-grow-1"
                :class="{ 'is-invalid': errorMessage }" :value="fieldProps.value" @update:modelValue="handleChange"
                @blur="handleBlur" item-title="full_name" item-value="id" v-model="newItem.stakeholder_ids" multiple
                :disabled="getFieldStatus('stakeholder_ids')?.disabled" chips placeholder="Select team" :required="getFieldStatus('stakeholder_ids')?.rules === 'required'
                  " />
              <div v-if="errorMessage" class="invalid-feedback">
                {{ errorMessage }}
              </div>
            </div>
          </Field>
          <Field name="owner_id" :rules="getFieldStatus('owner_id')?.rules === 'required' ? 'required' : ''
            " v-model="newItem.owner_id" v-slot="{ field: fieldProps, errorMessage, handleChange, handleBlur }">
            <div v-if="getFieldStatus('owner_id')?.type !== 'hidden'" class="col-6 mb-2">
              <label>Owner</label>
              <v-select :items="userList" id="owner_id" class="flex-grow-1" :class="{ 'is-invalid': errorMessage }"
                :value="fieldProps.value" @update:modelValue="handleChange" @blur="handleBlur" item-title="full_name"
                item-value="id" v-model="newItem.owner_id" :disabled="getFieldStatus('owner_id')?.disabled" chips
                placeholder="Select Owner" :required="getFieldStatus('owner_id')?.rules === 'required'" />
              <div v-if="errorMessage" class="invalid-feedback">
                {{ errorMessage }}
              </div>
            </div>
          </Field>
          <Field name="reviewer_id" :rules="getFieldStatus('reviewer_id')?.rules === 'required'
            ? 'required'
            : ''
            " v-model="newItem.reviewer_id" v-slot="{ field: fieldProps, errorMessage, handleChange, handleBlur }">
            <div v-if="getFieldStatus('reviewer_id')?.type !== 'hidden'" class="col-6 mb-2">
              <label>Reviewer</label>
              <v-select :items="userList" id="reviewer_id" class="flex-grow-1" :class="{ 'is-invalid': errorMessage }"
                :value="fieldProps.value" @update:modelValue="handleChange" @blur="handleBlur" item-title="full_name"
                item-value="id" v-model="newItem.reviewer_id" :disabled="getFieldStatus('reviewer_id')?.disabled" chips
                placeholder="Select reviewer" :required="getFieldStatus('reviewer_id')?.rules === 'required'" />
              <div v-if="errorMessage" class="invalid-feedback">
                {{ errorMessage }}
              </div>
            </div>
          </Field>

          <template #clauses>
            <div v-if="getFieldStatus('clauses')?.type !== 'hidden'" class="col-12 mb-5 clauses-container" :style="{
              opacity: getFieldStatus('clauses')?.disabled ? 0.7 : 1,
              pointerEvents: getFieldStatus('clauses')?.disabled
                ? 'none'
                : 'auto',
            }">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="form-label mb-0">Clauses</label>
                <v-tooltip text="Right-click on selected text to add to clauses" location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip v-bind="props" size="small" color="info" variant="outlined">
                      <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                      Right-click to add clause
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
              <div v-for="(clause, index) in newItem.clauses" :key="index" class="clause-item">
                <div class="editor-wrapper">
                  <ckeditor :editor="editor" v-model="newItem.clauses[index]" :config="editorConfig"
                    class="fixed-width-editor" :required="getFieldStatus('clauses')?.required" ref="clauseEditor" />
                </div>
                <button type="button" class="btn btn-danger remove-btn" @click="removeClause(index)"
                  :disabled="getFieldStatus('clauses')?.disabled" v-if="newItem.clauses.length > 1">
                  <i class="fas fa-minus"></i>
                </button>
              </div>
            </div>
          </template>

          <template #content>
            <div v-if="getFieldStatus('content')?.type !== 'hidden'" class="col-12 mb-2 clauses-container">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="form-label mb-0">Content</label>
                <v-tooltip text="Right-click on selected text to add to clauses" location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip v-bind="props" size="small" color="info" variant="outlined">
                      <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                      Right-click to add clause
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
              <ckeditor :editor="editor" v-model="newItem.content" :config="editorConfig"
                :disabled="getFieldStatus('content')?.disabled" :required="getFieldStatus('content')?.required" />
            </div>
          </template>

          <template #notes>
            <div v-if="getFieldStatus('notes')?.type !== 'hidden'" class="col-12 mb-2 clauses-container">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="form-label mb-0">notes</label>
                <v-tooltip text="Right-click on selected text to add to clauses" location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip v-bind="props" size="small" color="info" variant="outlined">
                      <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                      Right-click to add clause
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
              <ckeditor :editor="editor" v-model="newItem.notes" :config="editorConfig"
                :disabled="getFieldStatus('notes')?.disabled" :required="getFieldStatus('notes')?.required" />
            </div>
          </template>

          <template #file_url="{ item }">
            <div class="file-display-wrapper" v-if="getFieldStatus('file_url')?.type !== 'hidden'"
              :disabled="getFieldStatus('file_url')?.disabled">
              <label class="file-label">
                <v-icon small class="mr-1">mdi-paperclip</v-icon>
                <span class="text-uppercase font-weight-medium">{{
                  $t("attachment")
                }}</span>
              </label>

              <div class="file-preview-container elevation-2 rounded-lg pa-3" v-if="
                newItem.file_url && !newItem.file_url.includes('default.png')
              ">
                <template v-if="isImage(newItem.file_url)">
                  <div class="image-preview-wrapper">
                    <v-hover v-slot="{ isHovering, props }">
                      <div class="image-container" v-bind="props">
                        <img :src="newItem.file_url" :alt="$t('file_preview')" class="preview-image" />
                        <v-fade-transition>
                          <div v-if="isHovering" class="image-overlay">
                            <v-btn icon="mdi-magnify-plus-outline" variant="flat" color="white" size="small"
                              :href="newItem.file_url" target="_blank"
                              :disabled="getFieldStatus('file_url')?.disabled"></v-btn>
                          </div>
                        </v-fade-transition>
                      </div>
                    </v-hover>
                    <div class="file-meta mt-2">
                      <div class="filename text-truncate font-weight-regular text-caption">
                        {{ newItem.filename }}
                      </div>
                      <div class="file-actions mt-2">
                        <v-btn variant="outlined" size="small" color="primary" prepend-icon="mdi-download"
                          :href="newItem.file_url" download target="_blank"
                          :disabled="getFieldStatus('file_url')?.disabled">
                          Download
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="document-preview d-flex align-center">
                    <v-icon color="red darken-2" size="48" class="mr-3">
                      {{ getFileIcon(newItem.file_url) }}
                    </v-icon>
                    <div class="file-info">
                      <div class="filename text-truncate font-weight-medium">
                        {{ newItem.filename }}
                      </div>
                      <div class="file-actions mt-2">
                        <v-btn variant="outlined" size="small" color="primary" class="mr-2" prepend-icon="mdi-eye"
                          :href="newItem.file_url" target="_blank" :disabled="getFieldStatus('file_url')?.disabled">
                          View
                        </v-btn>
                        <v-btn variant="outlined" size="small" prepend-icon="mdi-download" :href="newItem.file_url"
                          download :disabled="getFieldStatus('file_url')?.disabled">
                          Download
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div v-else class="empty-state rounded-lg pa-4 text-center">
                <v-icon size="large" color="grey lighten-1">mdi-cloud-upload-outline</v-icon>
                <div class="text-grey mt-2">{{ $t("no_file_uploaded") }}</div>
              </div>
            </div>
          </template>
        </Form>
      </template>
    </main-page>

    <!-- Modals -->
    <CategoryModal v-model:show="categoryModal.show" :categoryData="categoryModal.data"
      :workflowCategories="workflowCategories" :workflowsApi="workflowsApi" :categoriesApi="categoriesApi"
      @success="onCategorySuccess" />

    <TransitionModal v-model:show="transitionModal.show" :currentItem="transitionModal.currentItem"
      :transitions="currentTransitions" :workflowSteps="workflowSteps" :activeWorkflowStep="activeWorkflowStep"
      :documentApi="api" @success="onTransitionSuccess" @error="onTransitionError" @navigate="navigateTransition"
      :loading="transitionLoading" />

    <ContentModal v-model:show="contentModal.show" :title="contentModal.title" :content="contentModal.content" />
  </div>
</template>

<script>
import Swal from "sweetalert2";
import documentApi from "@/API/Document/Document";
import documentcategory from "@/API/DocumentCategory/DocumentCategory";
import workflowCategory from "@/API/WorkflowCategory/WorkflowCategory";
import workflow from "@/API/WorkflowCategory/Workflow";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import framework from "@/API/Frameworks/Frameworks";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Chart from "chart.js/auto";
import Auth from "@/API/Auth";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import LogSetting from "@/API/LogSetting/LogSetting";
import { notify } from "@kyvg/vue3-notification";
import CategoryModal from "./components/CategoryModal.vue";
import TransitionModal from "./components/TransitionModal.vue";
import ContentModal from "./components/ContentModal.vue";
import VueSelect from "vue-select";
import CenterPolicy from "@/API/CenterPolicy/CenterPolicy";
import PurpleDotsLoader from '@/components/PurpleDotsLoader.vue';

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    CategoryModal,
    TransitionModal,
    ContentModal,
    "v-select": VueSelect,
    PurpleDotsLoader
  },

  setup() {
    const api = new documentApi();
    const categoriesApi = new documentcategory();
    const LogSettingApi = new LogSetting();
    const userApi = new user();
    const teamApi = new team();
    const frameworkApi = new framework();
    const CenterPolicyApi = new CenterPolicy();
    const apiParams = {};
    const tableColumns = [];
    const fromFields = [];
    const customRoles = [];
    const moduleActions = [];

    return {
      api,
      apiParams,
      tableColumns,
      userApi,
      teamApi,
      fromFields,
      customRoles,
      moduleActions,
      categoriesApi,
      LogSettingApi,
      frameworkApi,
      CenterPolicyApi,
    };
  },

  async mounted() {
    try {
      this.pageLoading = true;

      this.userList = await this.userApi.getAll({ select: "id|full_name" });
      this.teamList = await this.teamApi.getAll({ select: "id|name" });
      this.frameworkList = await this.frameworkApi.getAll({
        select: "id|title",
        with: ["control:id,short_name,framework_id"],
      });
      await this.initializeData();

      this.$nextTick(() => {
        this.initializeContextMenu();
      });
    } catch (error) {
      console.error("Error in mounted hook:", error);
    } finally {
      this.pageLoading = false;
    }
  },

  beforeUnmount() {
    if (this.countRefreshInterval) {
      clearInterval(this.countRefreshInterval);
    }

    if (this.clauseContextMenuCleanup) {
      this.clauseContextMenuCleanup.cleanup();
    }
  },

  data() {
    return {
      defaultColumns: [],
      workflowSteps: [],
      workflowCategories: [],
      userList: [],
      teamList: [],
      documents: [],
      workflows: [],
      workflowService: new workflow(),
      workflowsApi: null,
      workflowCategoriesApi: null,
      isFlipped: false,
      isReadonly: false,
      isFetchingDocuments: false,
      isFormOpen: false,
      savedApiParams: null,
      savedWorkflowStep: null,
      savedCategoryId: null,
      newItem: {
        name: "",
        file: null,
        category_id: null,
        owner_id: null,
        reviewer_id: null,
        team_ids: [],
        expiry_days: null,
        content: "",
        notes: "",
        clauses: [""],
        step_code: "",
        versionNotes: "",
        versionnotes: [],
      },
      searchQuery: "",
      activeCategory: 0,
      activeWorkflowStep: 0,
      showAll: false,
      categories: [],
      transitionLoading: false,
      user: Auth.user,
      editor: ClassicEditor,
      editorConfig: {
        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "indent",
            "outdent",
            "|",
            "blockQuote",
            "insertTable",
            "undo",
            "redo",
          ],
          shouldNotGroupWhenFull: true,
        },
        licenseKey: "GPL",
        height: 200,
      },
      readyToLoad: false,
      isReady: false,
      currentRequest: null,
      debounceTimer: null,
      LatestStepInWorkflow: null,
      documentCounts: {},
      previousCounts: {},
      trendData: {},
      totalDocumentCount: 0,
      previousTotalCount: 0,
      totalTrendData: {},
      countsLoading: false,
      pageLoading: true,
      logs: [],
      showTable: true,

      categoryModal: {
        show: false,
        data: null,
      },
      transitionModal: {
        show: false,
        currentItem: null,
      },
      contentModal: {
        show: false,
        title: "",
        content: "",
      },
      currentTransitions: [],
      frameworkList: [],
      controlList: [],
      controlListKey: 0,

      clauseContextMenuCleanup: null,
    };
  },

  computed: {
    showClausesField() {
      return this.fromFields.find((f) => f.name === "clauses") || {};
    },
    activeCategoryData() {
      return this.categories.length > 0
        ? this.categories[this.activeCategory] || {}
        : {};
    },
    activeCategoryId() {
      if (this.activeCategoryData && this.activeCategoryData.id) {
        this.newItem.category_id = this.activeCategoryData.id;
      }
      return this.activeCategoryData.id || null;
    },
    activeWorkflowStepData() {
      return this.workflowSteps[this.activeWorkflowStep] || {};
    },
    hideActions() {
      return (row) => {
        const { canPerformAction } = this.api.getUserPermissionChecker(
          row,
          this.workflowSteps
        );

        const canEdit = canPerformAction("update");
        const canDelete = canPerformAction("delete");

        return {
          edit: !canEdit,
          delete: !canDelete,
        };
      };
    },
  },

  created() {
    this.workflowCategoriesApi = new workflowCategory();
    this.workflowsApi = new workflow();

    this.defaultColumns = [
      { title: "Name", data: "name", defaultContent: "N/A" },
      { title: "document.status", data: "status", defaultContent: "N/A" },
      { title: "Transitions", data: null, defaultContent: "N/A" },
      { title: "Creation-Date", data: "created_at", defaultContent: "N/A" },
      { title: "Published-Date", data: "published_date", defaultContent: "N/A", },
      { title: "Next-Review-Date", data: "next_review_date", defaultContent: "N/A" },
      { title: "Framework", data: "framework", defaultContent: "N/A" },
      { title: "Control", data: "control", defaultContent: "N/A" },
      { title: "File", data: "file", defaultContent: "N/A" },
      { title: "Owner", data: "owner_id", defaultContent: "N/A" },
      { title: "Reviewer", data: "reviewer_id", defaultContent: "N/A" },
      { title: "Stakeholder", data: "stakeholder_ids", defaultContent: "N/A" },
      { title: "Team", data: "team_ids", defaultContent: "N/A" },
      { title: "Expiration", data: "expiration_date", defaultContent: "N/A" },
      { title: "Content", data: "content", defaultContent: "N/A" },
      { title: "Notes", data: "notes", defaultContent: "N/A" },
      { title: "Clauses", data: "clauses", defaultContent: "N/A" },
    ];

    this.customRoles = [
      { id: "creator", name: "Creator", selected: false },
      { id: "owner", name: "Owner", selected: false },
      { id: "reviewer", name: "Reviewer", selected: false },
      { id: "stakeholders", name: "Stakeholders", selected: false },
      { id: "teams", name: "Teams", selected: false },
    ];

    this.moduleActions = [
      { id: "update", name: "Update Document" },
      { id: "delete", name: "Delete Document" },
      { id: "createNewDocumentVersion", name: "Document Version Create" },
      { id: "updateVersion", name: "Document Version Update" },
      { id: "activeVersionOrDeactivate", name: "Activate And Deactivate Version" },
      { id: "addCommentForVersionOrDocument", name: "Document Version Add Comment" },
    ];

    this.fetchFields();
    this.fetchTableFields();
    this.user = Auth.USER;
  },

  methods: {
    async initializeData() {
      await Promise.all([this.fetchData()]);
      if (this.categories.length > 0) {
        await this.setActiveCategory(0);
      }
      this.initPieChart();
      if (this.categories.length > 0) {
        if (this.workflowSteps.length > 0) {
          this.newItem.step_code = this.workflowSteps[0].code;
          this.fetchTableFields();
        }
      } else {
        this.workflowSteps = [];
      }
      this.readyToLoad = true;
    },

    openCategoryModal() {
      this.categoryModal.data = null;
      this.categoryModal.show = true;
    },

    openEditCategoryModal(category) {
      this.categoryModal.data = category;
      this.categoryModal.show = true;
    },

    async onCategorySuccess() {
      await this.initializeData();
    },

    async deleteCategory(id) {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          const result = await this.categoriesApi.delete(id);
          if (!result.errors || result.errors.length === 0) {
            await this.initializeData();
          }
        }
      } catch (error) {
        console.error("Error deleting workflow category:", error);
        Swal.fire("Error!", "Failed to delete category.", "error");
      }
    },

    openTransitionModal(item) {
      this.transitionModal.currentItem = item;
      this.currentTransitions = this.getTransitions(item);
      this.transitionModal.show = true;
    },

    async onTransitionSuccess({ categoryId, stepCode, workflowStep }) {
      await this.fetchDocuments(categoryId, stepCode, workflowStep);
    },

    onTransitionError(errorMessage) {
      notify({
        type: "error",
        title: "Transition Error",
        text: errorMessage,
      });
    },

    openContentModal(title, content) {
      this.contentModal.title = title;
      this.contentModal.content = content;
      this.contentModal.show = true;
    },

    fetchFields() {
      this.fromFields = [
        { section: "Document Details", name: "name", label: "document.name", type: "text", rules: "", disabled: false, description: "Please enter name.", col: 6 },
        { section: "Document Details", name: "file", label: "document.file", type: "file", rules: "", disabled: false, description: "Please upload file.", col: 6 },
        { section: "Document Details", name: "file_url", label: "document.file View", rules: "", col: 6, type: "file", hidden: true },
        { section: "Document Details", name: "category_id", type: "options", label: "document.category", workFlow: false, optionLabel: "name", rules: "required", disabled: false, description: "Please select category.", col: 6 },
        { section: "Document Details", name: "framework_id", type: "options", label: "document.framework", optionLabel: "title", options: this.frameworkList, rules: "", disabled: false, multiple: true, description: "Please select framework.", col: 6 },
        { section: "Document Details", name: "control_id", type: "options", label: "document.control", optionLabel: "name", rules: "", disabled: false, multiple: true, description: "Please select control.", col: 6 },
        { section: "Document Details", name: "owner_id", type: "options", label: "document.owner", options: this.userList, optionLabel: "full_name", rules: "", disabled: false, description: "Please select owner.", col: 6 },
        { section: "Document Details", name: "reviewer_id", type: "options", label: "document.reviewer", options: this.userList, optionLabel: "full_name", rules: "", disabled: false, description: "Please select reviewer.", col: 6 },
        { section: "Document Details", name: "stakeholder_ids", type: "options", label: "document.stakeholders", options: this.userList, optionLabel: "full_name", multiple: "multiple", rules: "", disabled: false, description: "Please select stakeholders.", col: 6 },
        { section: "Document Details", name: "team_ids", type: "options", label: "document.teams", options: this.teamList, optionLabel: "name", multiple: "multiple", rules: "", disabled: false, description: "Please select team.", col: 6 },
        { section: "Document Details", name: "expiry_days", label: "document.expiration", type: "number", rules: "", disabled: false, description: "Please enter your expiration in days.", col: 6 },
        { section: "Document Details", name: "content", label: "document.content", type: "textarea", rules: "", disabled: false, description: "Please enter content.", col: 12 },
        { section: "Document Details", name: "notes", label: "document.notes", type: "textarea", rules: "", disabled: false, description: "Please enter notes.", col: 12 },
        { section: "Document Details", name: "clauses", label: "document.clauses", type: "textarea", rules: "", disabled: false, description: "Please enter clauses.", col: 12 },
        { section: "Document Details", name: "privacy", label: "Public/Private", type: "checkbox", rules: "", description: "Check to mark Private, Uncheck for Public", col: 6, default: false },
        { section: "Document Details", name: "step_code", type: "hidden", workFlow: false, col: 6, rules: "", disabled: false, description: "" },
      ];
    },


    fetchTableFields() {
      this.showTable = false;
      if (this.showAll) {
        this.tableColumns = [
          { title: "Name", data: "name", defaultContent: "N/A" },
          { title: "document.status", data: "status", defaultContent: "N/A" },
        ];
        this.$nextTick(() => {
          this.showTable = true;
        });
        return;
      }

      if (
        !this.activeWorkflowStepData ||
        !this.activeWorkflowStepData.tableColumns
      ) {
        this.tableColumns = [];
        this.$nextTick(() => {
          this.showTable = true;
        });
        return;
      }

      this.tableColumns = this.activeWorkflowStepData.tableColumns
        .filter(
          (column) => column && column.status && column.status !== "hidden"
        )
        .map((column) => ({
          title: column.name || column.title,
          data: this.getDataField(column.name),
          defaultContent: "N/A",
        }));

      this.$nextTick(() => {
        this.showTable = true;
      });
    },

    getDataField(columnName) {
      const mapping = {
        Name: "name",
        "document.status": "status",
        Transitions: null,
        "Creation-Date": "created_at",
        "Published-Date": "published_date",
        "Next-Review-Date": "next_review_date",
        File: "file",
        Owner: "owner_id",
        Reviewer: "reviewer_id",
        Stakeholder: "stakeholder_ids",
        Team: "team_ids",
        Expiration: "expiry_days",
        Content: "content",
        Notes: "notes",
        Clauses: "clauses",
      };

      return (
        mapping[columnName] || columnName.toLowerCase().replace(/-/g, "_")
      );
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newItem.file = file;
      }
    },

    initPieChart() {
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }
      const ctx = this.$refs.pieChart?.getContext("2d");

      const policyCount = this.categories.filter(
        (cat) => cat.type === "policy"
      ).length;
      const standardCount = this.categories.filter(
        (cat) => cat.type === "standard"
      ).length;
      const otherCount = this.categories.filter(
        (cat) => !["policy", "standard"].includes(cat.type)
      ).length;

      this.pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Policy", "Standard", "Others"],
          datasets: [
            {
              data: [policyCount, standardCount, otherCount],
              backgroundColor: ["#6e3894", "#fbbf24", "#3b82f6"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    },

    async calculateDocumentCounts() {
      if (!this.activeCategoryData?.id) return;
      this.countsLoading = true;

      try {
        const allDocuments = await this.api.getAll({
          filter: `category_id|${this.activeCategoryData.id}|=`,
          select: "id|step_code",
        });

        this.totalDocumentCount = allDocuments.length;

        const counts = {};
        this.workflowSteps.forEach((step) => {
          counts[step.code] = allDocuments.filter(
            (doc) => doc.step_code === step.code
          ).length;
        });

        this.documentCounts = counts;
      } catch (error) {
        console.error("Error calculating document counts:", error);
        this.totalDocumentCount = 0;
        this.workflowSteps.forEach((step) => {
          this.documentCounts[step.code] = 0;
        });
      } finally {
        this.countsLoading = false;
      }
    },

    stepClass(stepName) {
      const hash = this.createStepHash(stepName);
      const colorPalette = [
        { bg: "#fbbf24", text: "#ffffff" },
        { bg: "#3b82f6", text: "#ffffff" },
        { bg: "#10b981", text: "#ffffff" },
        { bg: "#8b5cf6", text: "#ffffff" },
        { bg: "#64748b", text: "#ffffff" },
        { bg: "#f59e0b", text: "#ffffff" },
        { bg: "#ec4899", text: "#ffffff" },
        { bg: "#14b8a6", text: "#ffffff" },
        { bg: "#f97316", text: "#ffffff" },
        { bg: "#6366f1", text: "#ffffff" },
      ];

      const colorIndex = Math.abs(hash) % colorPalette.length;
      return colorPalette[colorIndex];
    },

    createStepHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    },

    stepIcon(stepName) {
      const iconOptions = [
        "fa fa-layer-group",     // Generic grouping / section
        "fa fa-cogs",            // Settings / process
        "fa fa-clipboard-list",  // Step / checklist
        "fa fa-route",           // Journey / path
        "fa fa-shapes",          // Generic element / stage
        "fa fa-stream",          // Flow / sequence
        "fa fa-puzzle-piece",    // Component / part of process
        "fa fa-network-wired",   // Connection / flow
        "fa fa-sitemap",         // Structure / hierarchy
        "fa fa-cube",            // Single step / unit
      ];

      const hash = Array.from(stepName).reduce(
        (hash, char) =>
          char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash,
        0
      );

      const randomIndex = Math.abs(hash) % iconOptions.length;
      return iconOptions[randomIndex];
    },

    filteredSteps(step, item) {
      if (!step || !step.transitions || !this.user?.job_id) {
        return [];
      }

      return step.transitions.filter((transition) => {
        if (
          !transition.permissions ||
          Object.keys(transition.permissions).length === 0
        ) {
          return false;
        }

        const permissions = transition.permissions;

        if (permissions.jobs && Array.isArray(permissions.jobs)) {
          const hasJobPermission = permissions.jobs.some(
            (jobId) => jobId === this.user.job_id
          );
          if (hasJobPermission) return true;
        }

        if (
          permissions.customRoles &&
          Array.isArray(permissions.customRoles)
        ) {
          const hasCustomRolePermission = permissions.customRoles.some(
            (role) => {
              switch (role) {
                case "owner":
                  return item?.owner_id && this.user.id === item.owner_id;
                case "creator":
                  return item?.created_by && this.user.id === item.created_by;
                case "reviewer":
                  return (
                    item?.reviewer_id && this.user.id === item.reviewer_id
                  );
                case "stakeholders":
                  return (
                    item?.stakeholder_ids &&
                    Array.isArray(item.stakeholder_ids) &&
                    item.stakeholder_ids.includes(this.user.id)
                  );
                case "teams":
                  return (
                    item?.team_ids &&
                    Array.isArray(item.team_ids) &&
                    this.user?.team_ids &&
                    Array.isArray(this.user.team_ids) &&
                    item.team_ids.some((teamId) =>
                      this.user.team_ids.includes(teamId)
                    )
                  );
                default:
                  return false;
              }
            }
          );
          if (hasCustomRolePermission) return true;
        }

        return false;
      });
    },

    getFieldStatus(fieldName) {
      return this.fromFields.find((f) => f.name === fieldName);
    },

    async fetchDocuments(categoryId, stepCode, workflowSteps = []) {
      if (this.isFetchingDocuments) return;

      try {
        this.isFetchingDocuments = true;

        if (!this.user?.id) {
          alert("User data is missing");
          return;
        }

        let filter = `category_id|${categoryId}|=`;
        if (stepCode) filter += `&&step_code|${stepCode}|=`;

        const jobsIds = Array.isArray(workflowSteps.datatable_job_ids)
          ? workflowSteps.datatable_job_ids.filter(Boolean)
          : [];

        const customRoles = Array.isArray(
          workflowSteps.datatable_custom_roles_control
        )
          ? workflowSteps.datatable_custom_roles_control.filter(Boolean)
          : [];
        const jobMatch =
          jobsIds.length > 0 && jobsIds.includes(this.user.job_id);
        const isPublishedStep =
          this.activeCategoryData?.step_publish === stepCode;
        const filterJsonData = 'versionnotes|{"active":1}|json_contains';

        let filterOrData = !jobMatch
          ? this.buildFilterIn(this.user, customRoles)
          : null;

        if (!isPublishedStep && !filterOrData && !jobMatch) {
          filterOrData = "id|1|=";
        }

        this.apiParams = {
          filter,
          ...(isPublishedStep ? { filterJson: filterJsonData } : {}),
          ...(filterOrData ? { filterOr: filterOrData } : {}),
        };

        this.$refs.table?.refreshTable();
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setTimeout(() => {
          this.isFetchingDocuments = false;
        }, 300);
      }
    },

    async fetchDocumentsForAll(categoryId) {
      if (this.isFetchingDocuments) {
        return;
      }

      try {
        this.isFetchingDocuments = true;

        if (!this.user?.id) {
          alert("User data is missing");
          return;
        }

        let filter = `category_id|${categoryId}|=`;
        this.apiParams = {
          filter,
        };
        this.$refs.table?.refreshTable();
      } catch (error) {
        console.error("Error fetching documents (All):", error);
      } finally {
        setTimeout(() => {
          this.isFetchingDocuments = false;
        }, 300);
      }
    },

    buildFilterIn(user, customRoles = []) {
      const parts = [];

      if (user && user.id) {
        const teamIds = Array.isArray(user.team_ids)
          ? user.team_ids.join(",")
          : user.team_ids;
        if (teamIds && customRoles.includes("teams")) {
          parts.push(`team_ids|${teamIds}|=`);
        }
        if (customRoles.includes("stakeholders")) {
          parts.push(`stakeholder_ids|${user.id}|=`);
        }
        if (customRoles.includes("owner")) {
          parts.push(`owner_id|${user.id}|=`);
        }
        if (customRoles.includes("creator")) {
          parts.push(`created_by|${user.id}|=`);
        }
        if (customRoles.includes("reviewer")) {
          parts.push(`reviewer_id|${user.id}|=`);
        }
      }

      return parts.length > 0 ? parts.join("||") : undefined;
    },

    getFileIcon(url) {
      if (!url) return "mdi-file-outline";
      const ext = url.split(".").pop().toLowerCase();
      const icons = {
        pdf: "mdi-file-pdf-box",
        doc: "mdi-file-word-box",
        docx: "mdi-file-word-box",
        xls: "mdi-file-excel-box",
        xlsx: "mdi-file-excel-box",
        ppt: "mdi-file-powerpoint-box",
        pptx: "mdi-file-powerpoint-box",
        zip: "mdi-zip-box",
        txt: "mdi-file-document-outline",
      };
      return icons[ext] || "mdi-file-outline";
    },

    async fetchData() {
      this.loading = true;
      try {
        const response = await this.categoriesApi.getAll({
          with: ["workflow.workflowCategory"],
        });
        this.categories = response;
        const workflowCategoriesResponse =
          await this.workflowCategoriesApi.getAll({
            filter: "model_type|Document",
            select: "id|name",
          });
        this.workflowCategories = workflowCategoriesResponse;
      } catch (error) {
        console.error("Error fetching document categories:", error);
      } finally {
        this.loading = false;
      }
    },

    isImage(path) {
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
      return imageExtensions.some((ext) => path.toLowerCase().endsWith(ext));
    },

    async fetchDataWorkflow(id) {
      try {
        this.activeWorkflowStep = 0;
        const response = await this.workflowService.getAll({
          filter: `id|${id}|=`,
        });
        if (response.length > 0) {
          this.workflowSteps = response[0].steps;
          const firstStep = response[0].steps[0];
          const latestStep = response[0].steps[response[0].steps.length - 1];
          this.latestStepInWorkflow = latestStep.name;
          const fieldsFromFirstStep = firstStep.fields;

          this.fromFields = this.fromFields.map((field) => {
            const correspondingField = fieldsFromFirstStep.find(
              (f) => f.name === field.name
            );
            if (correspondingField) {
              if (correspondingField.status !== "default") {
                if (correspondingField.status === "disabled") {
                  field.type = correspondingField.status + " disabled";
                  field.disabled = true;
                } else if (correspondingField.status === "hidden") {
                  field.type = correspondingField.status;
                  field.description = null;
                  field.label = null;
                } else if (correspondingField.status === "required") {
                  field.rules = correspondingField.status;
                }
              }
            }
            return field;
          });
        }
        return response;
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      }
    },

    fetchAndProcessFields(workflowStep) {
      this.fetchFields();
      const fieldConfigurations = workflowStep?.fields || [];
      const transitionFields = workflowStep?.transitions[0]?.feilds || [];
      const fieldsFromTargetStep = [
        ...fieldConfigurations,
        ...transitionFields,
      ];

      this.fromFields = this.fromFields
        .filter((field) => {
          const correspondingField = fieldsFromTargetStep.find(
            (f) => f.name === field.name
          );
          return (
            correspondingField && correspondingField.status !== undefined
          );
        })
        .map((field) => {
          const correspondingField = fieldsFromTargetStep.find(
            (f) => f.name === field.name
          );
          if (correspondingField && correspondingField.status) {
            switch (correspondingField.status) {
              case "disabled":
                field.type = "disabled";
                field.disabled = true;
                break;
              case "hidden":
                field.type = "hidden";
                field.description = null;
                field.label = null;
                break;
              case "required":
                field.rules = "required";
                break;
              case "default":
                break;
            }
          }
          return field;
        })
        .sort((a, b) => {
          const aIsHidden = a.type === "hidden";
          const bIsHidden = b.type === "hidden";
          if (aIsHidden && !bIsHidden) return 1;
          if (!aIsHidden && bIsHidden) return -1;
          return 0;
        });
    },

    editItem(data) {
      const currentStep = this.workflowSteps.find(
        (step) => step.code === data.step_code
      );
      if (!currentStep) {
        return;
      }
      this.fetchAndProcessFields(currentStep);
      this.newItem = {
        ...data,
        content: data.content || "",
        notes: data.notes || "",
        clauses: data.clauses?.length ? data.clauses : [""],
      };

      this.savedApiParams = { ...this.apiParams };
      this.savedWorkflowStep = this.activeWorkflowStep;
      this.savedCategoryId = this.activeCategoryData.id;

      this.isFormOpen = true;

      this.isFlipped = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    openForm() {
      const workflowStep = this.workflowSteps[0];
      this.fetchAndProcessFields(workflowStep);

      this.savedApiParams = { ...this.apiParams };
      this.savedWorkflowStep = this.activeWorkflowStep;
      this.savedCategoryId = this.activeCategoryData.id;

      this.isFormOpen = true;

      this.newItem = {
        created_by: this.user.id,
        category_id: this.activeCategoryData.id,
        step_code: workflowStep?.code,
        clauses: [""],
      };
      this.isFlipped = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    closeForm() {
      this.fetchFields();
      this.isFlipped = false;

      this.isFormOpen = false;

      this.$nextTick(() => {
        if (
          this.savedApiParams &&
          this.savedWorkflowStep !== null &&
          this.savedCategoryId
        ) {
          this.apiParams = { ...this.savedApiParams };

          if (this.activeCategoryData.id === this.savedCategoryId) {
            this.$nextTick(() => {
              this.$refs.table?.refreshTable();
            });
          } else {
            const savedStep = this.workflowSteps[this.savedWorkflowStep];
            if (savedStep) {
              this.fetchDocuments(
                this.savedCategoryId,
                savedStep.code,
                savedStep
              );
            }
          }

          this.savedApiParams = null;
          this.savedWorkflowStep = null;
          this.savedCategoryId = null;
        } else {
          this.$refs.table?.refreshTable();
        }
      });

      this.newItem = {
        category_id: this.activeCategoryData.id,
        step_code: this.workflowSteps[0]?.code,
        clauses: [""],
      };
    },

    updateSelectedUsers(selectedUserId) {
      this.newItem.responsible_id = selectedUserId;
    },

    async updateDocument() {
      try {
        const document = this.newItem;
        const versionData = {
          ...document,
          notes: this.newItem.versionNotes,
        };

        this.newItem.versionnotes = this.newItem.versionnotes || [];
        this.newItem.versionnotes.push(versionData);

        const response = await this.api.update(this.newItem);

        if (response) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Document updated successfully",
            showConfirmButton: false,
            timer: 1500,
          });
          this.$refs.table.refreshTable();
          this.closeForm();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while submitting the form",
        });
      }
    },

    async setActiveCategory(index) {
      if (this.categories.length === 0) return;

      this.previousCounts = { ...this.documentCounts };
      this.previousTotalCount = this.totalDocumentCount;

      this.activeCategory = index;
      this.showAll = false;
      const category = this.categories[index];

      if (category) {
        this.isFormOpen = true;

        await this.fetchDataWorkflow(category.workflow_id);
        await this.calculateDocumentCounts();

        if (this.workflowSteps.length > 0) {
          this.activeWorkflowStep = 0;
          this.newItem.step_code = this.workflowSteps[0].code;
          this.fetchTableFields();

          this.isFormOpen = false;

          this.$nextTick(() => {
            this.fetchDocuments(
              this.activeCategoryData.id,
              this.workflowSteps[0].code,
              this.workflowSteps[0]
            );
          });
        } else {
          this.isFormOpen = false;
        }
      }
    },

    async navigateTransition(transition) {
      if (this.transitionLoading || !this.transitionModal.currentItem) return;
      this.transitionLoading = true;
      const document = this.transitionModal.currentItem;
      const documentCategoryId = document?.category_id;
      try {
        const targetStep = this.workflowSteps.find(
          (step) => step.name === transition.to_step_name
        );
        if (targetStep) {
          const updateData = {
            ...document,
            step_code: targetStep.code,
            status: targetStep.name,
            category_id: documentCategoryId,
          };
          const response = await this.api.update(updateData);
          if (response) {
            if (
              targetStep.code === this.activeCategoryData?.step_publish &&
              (this.activeCategoryData.type === "standard" ||
                this.activeCategoryData.type === "policy") &&
              !this.activeCategoryData.versionnotes
            ) {
              const documentData = this.document || document;
              if (
                documentData?.clauses &&
                Array.isArray(documentData.clauses) &&
                documentData.clauses.length > 0
              ) {
                for (const clause of documentData.clauses) {
                  const data = {
                    name: clause,
                    document_ids: [documentData.id],
                  };
                  try {
                    await this.CenterPolicyApi.insert(data);
                  } catch (err) {
                    console.error(
                      "Error inserting clause into Policy Center:",
                      err
                    );
                  }
                }
              } else {
                console.warn(
                  "No clauses found — skipping Policy Center insert"
                );
              }
            }

            await this.fetchDocuments(
              this.activeCategoryData.id,
              this.workflowSteps[this.activeWorkflowStep].code
            );
            this.transitionModal.show = false;
          }
        }
      } catch (error) {
        console.error("Error handling transition:", error);
        this.$toast.error(
          "Transition failed: " + (error.message || "Unknown error")
        );
      } finally {
        this.transitionLoading = false;
      }
    },

    setActiveWorkflowStep(index) {
      this.activeWorkflowStep = index;
    },

    showAllSteps() {
      this.showAll = true;
      this.activeWorkflowStep = -1;
      this.tableColumns = [];
      this.showTable = false;

      this.$nextTick(() => {
        this.fetchTableFields();
      });
    },

    slideLeft() {
      const container = this.$refs.categoriesContainer;
      if (container) {
        const scrollContainer = container.querySelector(
          ".categories-scroll-container"
        );
        if (scrollContainer) {
          scrollContainer.scrollLeft -= 400;
        }
      }
    },

    slideRight() {
      const container = this.$refs.categoriesContainer;
      if (container) {
        const scrollContainer = container.querySelector(
          ".categories-scroll-container"
        );
        if (scrollContainer) {
          scrollContainer.scrollLeft += 400;
        }
      }
    },

    slideWorkflowLeft() {
      const container = this.$refs.workflowContainer;
      if (container) {
        const scrollContainer = container.querySelector(
          ".workflow-scroll-container"
        );
        if (scrollContainer) {
          scrollContainer.scrollLeft -= 400;
        }
      }
    },

    slideWorkflowRight() {
      const container = this.$refs.workflowContainer;
      if (container) {
        const scrollContainer = container.querySelector(
          ".workflow-scroll-container"
        );
        if (scrollContainer) {
          scrollContainer.scrollLeft += 400;
        }
      }
    },

    slideStatsLeft() {
      const container = this.$refs.statisticsContainer;
      if (container) {
        const scrollContainer = container.querySelector(
          ".status-cards-scroll-container"
        );
        if (scrollContainer) {
          scrollContainer.scrollLeft -= 400;
        }
      }
    },

    slideStatsRight() {
      const container = this.$refs.statisticsContainer;
      if (container) {
        const scrollContainer = container.querySelector(
          ".status-cards-scroll-container"
        );
        if (scrollContainer) {
          scrollContainer.scrollLeft += 400;
        }
      }
    },

    async filterControlsByFrameworks(frameworkIds) {
      try {
        const result = this.api.filterControlsByFrameworksBase(
          frameworkIds,
          this.frameworkList,
          this.newItem.control_id
        );

        this.controlList = result.filteredControls;
        this.newItem.control_id = result.validControlIds;
        this.controlListKey++;

        console.log("Filtered controls:", this.controlList);
      } catch (error) {
        console.error("Error in filterControlsByFrameworks:", error);
        this.controlList = [];
        this.newItem.control_id = [];
        this.controlListKey++;
      }
    },

    initializeContextMenu() {
      if (this.clauseContextMenuCleanup) {
        this.clauseContextMenuCleanup.cleanup();
      }

      this.clauseContextMenuCleanup = this.api.initializeClauseContextMenu(
        (selectedText) => this.handleAddClauseFromContextMenu(selectedText),
        (target) => this.isInEditableArea(target)
      );
    },

    isInEditableArea(target) {
      const ckEditorElement = target.closest(".ck-editor__editable");
      if (!ckEditorElement) return false;

      const contentEditor = ckEditorElement.closest(".clauses-container");
      const isContentOrNotes =
        ckEditorElement.closest('[class*="content"]') ||
        ckEditorElement.closest('[class*="notes"]');

      return !!(contentEditor || isContentOrNotes);
    },

    handleAddClauseFromContextMenu(selectedText) {
      const result = this.api.addTextToClausesArray(
        selectedText,
        this.newItem.clauses
      );

      this.newItem.clauses = result.clauses;

      notify({
        type: "success",
        title: "Success",
        text: "Text added to clauses successfully!",
      });

      this.$nextTick(() => {
        this.api.focusClauseEditor(
          this.$refs.clauseEditor,
          result.targetIndex
        );
      });
    },

    addClause() {
      if (!this.newItem.clauses) {
        this.newItem.clauses = [""];
      }

      let selectedContent = "";
      try {
        if (window.getSelection) {
          selectedContent = window.getSelection().toString().trim();
        }
      } catch (error) {
        console.error("Error getting selection:", error);
      }

      if (selectedContent) {
        const result = this.api.addTextToClausesArray(
          selectedContent,
          this.newItem.clauses
        );
        this.newItem.clauses = result.clauses;

        notify({
          type: "success",
          title: "Success",
          text: "Selected text added to clause",
        });

        this.$nextTick(() => {
          this.api.focusClauseEditor(
            this.$refs.clauseEditor,
            result.targetIndex
          );
        });
        return;
      }

      this.newItem.clauses.push("");

      this.$nextTick(() => {
        this.api.focusClauseEditor(
          this.$refs.clauseEditor,
          this.newItem.clauses.length - 1
        );
      });
    },

    removeClause(index) {
      if (this.newItem.clauses && this.newItem.clauses.length > 1) {
        this.newItem.clauses.splice(index, 1);
      }
    },

    scrollToActiveCategory() {
      const container = this.$refs.categoriesContainer;
      const activeButton = container.querySelector(".category-btn.active");

      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    },

    getTransitions(item) {
      if (
        !Array.isArray(this.workflowSteps) ||
        this.workflowSteps.length === 0 ||
        typeof this.activeWorkflowStep !== "number" ||
        this.activeWorkflowStep < 0 ||
        this.activeWorkflowStep >= this.workflowSteps.length
      ) {
        return [];
      }
      const currentStep = this.workflowSteps[this.activeWorkflowStep];
      if (!currentStep) return [];
      return this.filteredSteps(currentStep, item);
    },

    hasAvailableTransitions(version) {
      return this.getTransitions(version).length > 0;
    },

    fetchStakeholdersSelected(stakeholderIds) {
      if (!stakeholderIds || !this.userList) return "N/A";
      return this.userList
        .filter((user) => stakeholderIds.includes(user.id))
        .map((user) => user.full_name)
        .join(", ");
    },

    getStakeholdersArray(stakeholderIds) {
      if (
        !stakeholderIds ||
        !Array.isArray(stakeholderIds) ||
        stakeholderIds.length === 0
      )
        return [];
      if (!this.userList || this.userList.length === 0) return [];

      return this.userList
        .filter((user) => stakeholderIds.includes(user.id))
        .map((user) => user.full_name);
    },

    getTeamsArray(teamIds) {
      if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0)
        return [];
      if (!this.teamList || this.teamList.length === 0) return [];

      return this.teamList
        .filter((team) => teamIds.includes(team.id))
        .map((team) => team.name);
    },

    fetchFrameworksSelected(frameworkIds) {
      if (
        !frameworkIds ||
        !Array.isArray(frameworkIds) ||
        frameworkIds.length === 0
      )
        return "N/A";
      if (!this.frameworkList || this.frameworkList.length === 0)
        return "N/A";

      return (
        this.frameworkList
          .filter((framework) => frameworkIds.includes(framework.id))
          .map((framework) => framework.title)
          .join(", ") || "N/A"
      );
    },

    getFrameworksArray(frameworkIds) {
      if (
        !frameworkIds ||
        !Array.isArray(frameworkIds) ||
        frameworkIds.length === 0
      )
        return [];
      if (!this.frameworkList || this.frameworkList.length === 0) return [];

      return this.frameworkList
        .filter((framework) => frameworkIds.includes(framework.id))
        .map((framework) => framework.title);
    },

    fetchControlsSelected(controlIds) {
      if (
        !controlIds ||
        !Array.isArray(controlIds) ||
        controlIds.length === 0
      )
        return "N/A";

      const allControls = [];
      if (this.frameworkList && Array.isArray(this.frameworkList)) {
        this.frameworkList.forEach((framework) => {
          if (framework.control && Array.isArray(framework.control)) {
            allControls.push(...framework.control);
          }
        });
      }

      if (allControls.length === 0) return "N/A";

      return (
        allControls
          .filter((control) => controlIds.includes(control.id))
          .map((control) => control.short_name)
          .join(", ") || "N/A"
      );
    },

    getControlsArray(controlIds) {
      if (
        !controlIds ||
        !Array.isArray(controlIds) ||
        controlIds.length === 0
      )
        return [];

      const allControls = [];
      if (this.frameworkList && Array.isArray(this.frameworkList)) {
        this.frameworkList.forEach((framework) => {
          if (framework.control && Array.isArray(framework.control)) {
            allControls.push(...framework.control);
          }
        });
      }

      if (allControls.length === 0) return [];

      return allControls
        .filter((control) => controlIds.includes(control.id))
        .map((control) => control.short_name);
    },

    isDocumentAccessible(document) {
      return (
        document &&
        document.step_code === this.activeCategoryData?.step_publish
      );
    },

    fetchTeamsSelected(teamIds) {
      if (!teamIds || !this.teamList) return "N/A";
      return this.teamList
        .filter((team) => teamIds.includes(team.id))
        .map((team) => team.name)
        .join(", ");
    },

    getOwnerName(item) {
      const user = this.userList.find((d) => d.id == item);
      return user?.full_name || "---";
    },

    formatContentPreview(content) {
      if (!content) return "N/A";
      const stripped = this.stripHtml(content);
      return this.truncateText(stripped, 30);
    },

    formatClausesPreview(clauses) {
      if (!clauses || !clauses.length) return "N/A";
      const content = Array.isArray(clauses) ? clauses.join(" ") : clauses;
      const stripped = this.stripHtml(content);
      return this.truncateText(stripped, 30);
    },

    stripHtml(html) {
      if (!html) return "";
      return html
        .toString()
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    },

    truncateText(text, maxLength) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },

    downloadFile(url) {
      const fileUrl = url;
      const link = window.document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.style.display = "none";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    },
  },

  watch: {
    activeCategoryData: {
      async handler(newVal) {
        if (newVal && newVal.id) {
          this.newItem.category_id = newVal.id;
        }
      },
      deep: true,
      immediate: true,
    },
    workflowSteps: {
      handler(newSteps) {
        if (newSteps.length > 0) {
          this.fetchTableFields();
        }
      },
      deep: true,
    },
    activeWorkflowStep: {
      handler(newStepIndex, oldStepIndex) {
        if (this.isFormOpen) return;

        if (newStepIndex === oldStepIndex) return;
        this.showTable = false;

        if (newStepIndex === -1) {
          this.showAll = true;
          this.fetchTableFields();
          this.$nextTick(() => {
            this.fetchDocumentsForAll(this.activeCategoryData.id);
          });
          return;
        }

        this.showAll = false;
        this.fetchTableFields();

        this.$nextTick(() => {
          if (
            this.workflowSteps &&
            this.workflowSteps.length > 0 &&
            newStepIndex !== null &&
            newStepIndex !== undefined &&
            this.workflowSteps[newStepIndex]
          ) {
            const currentStep = this.workflowSteps[newStepIndex];
            this.fetchDocuments(
              this.activeCategoryData.id,
              currentStep.code,
              currentStep
            );
          }
        });
      },
      immediate: false,
    },
    searchQuery(newQuery) {
      if (newQuery.trim() === "") {
        this.activeCategory = 0;
        return;
      }
      const index = this.categories.findIndex((category) =>
        category.name.toLowerCase().includes(newQuery.toLowerCase())
      );
      if (index !== -1) {
        this.activeCategory = index;
        this.$nextTick(() => {
          this.scrollToActiveCategory();
        });
      }
    },
    workflowSteps(newSteps) {
      if (newSteps.length > 0) {
        this.newItem.step_code = newSteps[0].code;
      }
    },
    "newItem.framework_id": {
      async handler(newFrameworkIds, oldFrameworkIds) {
        if (!newFrameworkIds || newFrameworkIds.length === 0) {
          this.controlList = [];
          this.newItem.control_id = [];
          this.controlListKey++;
          return;
        }

        if (
          JSON.stringify(newFrameworkIds) === JSON.stringify(oldFrameworkIds)
        ) {
          return;
        }

        if (
          oldFrameworkIds &&
          Array.isArray(oldFrameworkIds) &&
          oldFrameworkIds.length > newFrameworkIds.length
        ) {
          const removedFrameworkIds = oldFrameworkIds.filter(
            (id) => !newFrameworkIds.includes(id)
          );

          if (
            removedFrameworkIds.length > 0 &&
            this.newItem.control_id &&
            Array.isArray(this.newItem.control_id)
          ) {
            const removedFrameworks = this.frameworkList.filter((f) =>
              removedFrameworkIds.includes(f.id)
            );
            const controlsToRemove = [];

            removedFrameworks.forEach((framework) => {
              if (framework.control && Array.isArray(framework.control)) {
                framework.control.forEach((control) => {
                  controlsToRemove.push(control.id);
                });
              }
            });

            this.newItem.control_id = this.newItem.control_id.filter(
              (controlId) => !controlsToRemove.includes(controlId)
            );
          }
        }

        await this.filterControlsByFrameworks(newFrameworkIds);
      },
      deep: true,
      immediate: false,
    },
  },
};
</script>

<style scoped>
/* ==================== GLOBAL RESET & BASE ==================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background: #f8f9fa;
  color: #1f2937;
}

/* ==================== LOADING OVERLAY ==================== */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.loading-content {
  text-align: center;
}

.loading-content p {
  margin-top: 20px;
  font-size: 18px;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f4f6;
  border-top-color: #6e3894;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background: #6e3894;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ==================== CARDS ==================== */
.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  overflow: visible;
}

.card-body {
  padding: 24px;
}

/* ==================== SECTION HEADERS ==================== */
.section-header {
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header-stac {
  display: flex;
  justify-content: first;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #6e3894;
  font-size: 18px;
}

.category-badge {
  background: #6e3894;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* ==================== SEARCH INPUT MODERN ==================== */
.search-input-modern {
  position: relative;
  min-width: 280px;
}

.search-input-modern input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #ffffff;
}

.search-input-modern input:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.search-input-modern .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
}

/* ==================== ACTION ICON BUTTONS ==================== */
.action-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  color: #6b7280;
}

.action-icon-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-icon-btn.edit-btn {
  color: #f59e0b;
  border-color: #fbbf24;
}

.action-icon-btn.edit-btn:hover {
  background: #fffbeb;
}

.action-icon-btn.delete-btn {
  color: #ef4444;
  border-color: #fca5a5;
}

.action-icon-btn.delete-btn:hover {
  background: #fef2f2;
}

/* ==================== PRIMARY BUTTON ==================== */
.primary-btn {
  background: #6e3894;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.primary-btn:hover {
  background: #5a2d76;
}

.primary-btn i {
  font-size: 14px;
}

/* ==================== SCROLL BUTTONS ==================== */
.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #d1d5db;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.scroll-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.scroll-btn i {
  color: #6b7280;
  font-size: 14px;
}

.scroll-btn-left {
  left: -18px;
}

.scroll-btn-right {
  right: -18px;
}

/* ==================== CATEGORIES ROW ==================== */
.categories-row {
  position: relative;
  padding: 0 24px;
}

.categories {
  overflow: hidden;
}

.categories-scroll-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px 0;
}

.categories-scroll-container::-webkit-scrollbar {
  display: none;
}

.categories-scroll-container.single-item {
  justify-content: center;
}

.category-card-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: calc(33.333% - 8px);
}

.category-card-btn.full-width {
  flex: 1;
  min-width: 100%;
}

.category-card-btn:hover {
  background: #e5e7eb;
}

.category-card-btn.active {
  background: #6e3894;
  color: white;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

/* ==================== CATEGORY INFO BAR ==================== */
.category-info-bar {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.info-pills {
  display: flex;
  gap: 16px;
  flex: 1;
  flex-wrap: wrap;
}

.info-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.pill-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.pill-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

/* ==================== STATISTICS CONTAINER ==================== */
.statistics-container {
  position: relative;
  min-height: 150px;
}

.statistics-row {
  position: relative;
  padding: 0 24px;
}

.statistics-wrapper {
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
}

/* ==================== STATUS CARDS SCROLLABLE ==================== */
.status-cards-scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 4px 0 12px 0;

  /* Hide scrollbar but keep scroll functionality */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* Internet Explorer & Edge */
}

.status-cards-scroll-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.status-cards-scroll-container::-webkit-scrollbar {
  height: 8px;
}

.status-cards-scroll-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.status-cards-scroll-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.status-cards-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.status-cards-scroll-container.single-item {
  justify-content: center;
}

.status-cards-scroll-container.two-items {
  justify-content: center;
}

.modern-status-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 15px 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 0.9rem !important;
}

.modern-status-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.modern-status-card.total-card {
  background: #6e3894;
  border-color: #6e3894;
  color: white;
}

.modern-status-card.full-width {
  flex: 1;
  min-width: 100%;
  max-width: 100%;
}

.modern-status-card.half-width {
  flex: 1;
  min-width: calc(50% - 8px);
  max-width: calc(50% - 8px);
}

.status-icon-wrapper {
  flex-shrink: 0;
}

.status-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.status-icon-circle.total {
  background: rgba(255, 255, 255, 0.2);
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.modern-status-card.total-card .status-label {
  color: rgba(255, 255, 255, 0.9);
}

.status-number {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.modern-status-card.total-card .status-number {
  color: white;
}

/* ==================== WORKFLOW STEPS ==================== */
.workflow-steps-section {
  position: relative;
  padding: 0 24px;
  margin-bottom: 20px;
}

.workflow-steps-wrapper-grid {
  overflow: hidden;
}

.workflow-scroll-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px 0;
}

.workflow-scroll-container::-webkit-scrollbar {
  display: none;
}

.workflow-scroll-container.single-item {
  justify-content: center;
}

.workflow-scroll-container.two-items {
  justify-content: center;
}

.workflow-step-card {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: calc(33.333% - 8px);
}

.workflow-step-card.full-width {
  flex: 1;
  min-width: 100%;
  max-width: 100%;
}

.workflow-step-card.half-width {
  flex: 1;
  min-width: calc(50% - 6px);
  max-width: calc(50% - 6px);
}

.workflow-step-card:hover {
  background: #e5e7eb;
}

.workflow-step-card.active {
  background: #6e3894;
  color: white;
}

.workflow-step-card.all-step {
  background: #dbeafe;
  color: #1e40af;
}

.workflow-step-card.all-step:hover {
  background: #bfdbfe;
}

.workflow-step-card.all-step.active {
  background: #3b82f6;
  color: white;
}

.step-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

/* ==================== DATA TABLE ==================== */
.table-modern {
  width: 100%;
  margin-bottom: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
}

.table-modern thead th {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.table-modern tbody td {
  padding: 14px 16px;
  vertical-align: middle;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #f3f4f6;
  background: white;
}

.table-modern tbody tr:hover {
  background: #f9fafb;
}

.table-modern tbody tr:hover td {
  background: transparent;
}

.table-modern tbody tr:last-child td {
  border-bottom: none;
}

/* ==================== TABLE CELLS STYLING ==================== */
.clickable-name {
  color: #6e3894;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.clickable-name:hover {
  color: #5a2d76;
  text-decoration: underline;
}

.non-clickable-name {
  color: #6b7280;
  font-weight: 500;
}

/* ==================== BADGES ==================== */
.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
}

.badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: inline-block;
  margin: 2px;
  text-transform: uppercase;
}

.badge-primary {
  background: #dbeafe;
  color: #1e40af;
}

.badge-info {
  background: #e0e7ff;
  color: #4338ca;
}

.badges-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ==================== BUTTONS ==================== */
.v-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.v-btn[color="primary"] {
  background: #6e3894;
  color: white;
}

.v-btn[color="primary"]:hover {
  background: #5a2d76;
}

.v-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-btn[size="small"] {
  padding: 6px 12px;
  font-size: 12px;
}

/* ==================== FORM CONTROLS ==================== */
.form-control {
  width: 100%;
  padding: 10px 30px !important;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #ffffff;
}

.form-control:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

/* ==================== FILE LINKS ==================== */
.file-download-link {
  color: #6e3894;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.file-download-link:hover {
  color: #5a2d76;
  text-decoration: underline;
}

/* ==================== UTILITY CLASSES ==================== */
.text-muted {
  color: #9ca3af !important;
  font-style: italic;
}

.mb-4 {
  margin-bottom: 24px;
}

.ck-editor__editable {
  min-height: 200px !important;
  max-height: 500px !important;
}

.clauses-container {
  max-width: 100%;
}

.clause-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
}

.editor-wrapper {
  flex: 1;
  min-width: 0;
}

.fixed-width-editor {
  width: 100%;
  max-width: 100%;
}

.fixed-width-editor>>>.ck-editor__editable {
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.remove-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 137px;
}

.add-btn {
  margin-top: 10px;
}

.category-icon {
  color: #28a745;
  font-size: 22px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

/* ==================== RESPONSIVE DESIGN ==================== */
@media (max-width: 1200px) {
  .modern-status-card {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .card-body {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .search-input-modern {
    width: 100%;
    min-width: 100%;
  }

  .category-info-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .info-pills {
    flex-direction: column;
  }

  .category-card-btn {
    min-width: calc(50% - 6px);
  }

  .workflow-step-card {
    min-width: calc(50% - 6px);
  }

  .workflow-step-card.half-width {
    min-width: 100%;
    max-width: 100%;
  }

  .workflow-scroll-container.two-items {
    flex-direction: column;
  }

  .categories-row {
    padding: 0 12px;
  }

  .workflow-steps-section {
    padding: 0 12px;
  }

  .statistics-row {
    padding: 0 12px;
  }

  .scroll-btn-left {
    left: -12px;
  }

  .scroll-btn-right {
    right: -12px;
  }

  .modern-status-card {
    min-width: 200px;
  }

  .modern-status-card.half-width {
    min-width: 100%;
    max-width: 100%;
  }

  .status-cards-scroll-container.two-items {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .category-card-btn {
    min-width: 100%;
  }

  .workflow-step-card {
    min-width: 100%;
  }

  .modern-status-card {
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .status-cards-scroll-container {
    flex-direction: column;
  }
}

/* ==================== SCROLLBAR STYLING ==================== */
.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .clause-item {
    flex-direction: column;
  }

  .remove-btn {
    align-self: flex-end;
    margin-top: 5px;
  }
}

/* Apply Cairo only to specific elements, not globally */
body,
div,
span,
p,
h1,
h2,
h3,
h4,
h5,
h6,
a,
button,
input,
textarea,
select,
label {
  font-family: 'Cairo', sans-serif;
}

/* Or apply to body and let it inherit */
body {
  font-family: 'Cairo', sans-serif;
}
</style>
