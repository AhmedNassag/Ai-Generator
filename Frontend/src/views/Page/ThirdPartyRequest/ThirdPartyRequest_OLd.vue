<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('thirdpartyrequest.risk_mgmt')"
    :mainSubPage="$t('thirdpartyrequest.third_party')" :subPage="$t('thirdpartyrequest.requests')"
    :titlePage="$t('thirdpartyrequest.requests')" v-permission:show>

    <!-- Slot for rendering the DataTable -->
    <div v-permission:update v-permission:delete></div>

    <template #datatable>

      <div v-if="!isDataReady" class="text-center p-5">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p>{{ $t('thirdpartyrequest.loading_data') }}...</p>
      </div>

      <DataTable v-else v-permission:show ref="table" id="example-table"
        :tableClass="'table table-striped table-bordered'" :columns="tableColumns" :api="api" :apiParams="apiParams"
        :editItem="openEditDialog" :openForm="openForm" :hideActions="hideActions">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #issue_date="{ item }"> {{ formatDate(item.created_at) }} </template>
        <template #requested_by="{ item }"> {{ getUserName(item.requested_by) || "no name" }} </template>
        <template #department="{ item }"> {{ getDepartmentName(item.department_id) }} </template>
        <template #job_title="{ item }"> {{ getJobName(item.job_id) }} </template>
        <template #third_party_profile="{ item }"> {{ item?.profile?.third_party_name }} </template>
        <template #third_party_service="{ item }"> {{ item?.service?.name }} </template>

        <template #status="{ item }">
          <span v-if="item.status === 1" class="badge text-bg-secondary w-75" style="display: block; margin: auto;">{{
            $t('thirdpartyrequest.pending') }}</span>
          <span v-else-if="item.status === 2" class="badge text-bg-primary w-75"
            style="display: block; margin: auto;">{{ $t('thirdpartyrequest.in_assessment') }}</span>
          <span v-else-if="item.status === 3" class="badge text-bg-danger w-75" style="display: block; margin: auto;">{{
            $t('thirdpartyrequest.refused') }}</span>
        </template>
        <template #addAction="{ item }">
          <li v-permission:viewRequest>
            <a @click="openModal(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="icofont icofont-eye me-2"></i> {{ $t('thirdpartyrequest.view') }}
            </a>
          </li>
        </template>

      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <!-- Create request modal -->
  <v-dialog v-model="opencreateModal" max-width="900px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t('thirdpartyrequest.create_request') }}</span>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="saveRequest" class="mb-3">
          <v-stepper v-model="currentStep">
            <v-stepper-header>
              <v-stepper-item :value="1" :title="$t('thirdpartyrequest.request_info')" />
              <v-divider></v-divider>
              <v-stepper-item :value="2" :title="$t('thirdpartyrequest.evaluation_checklist')" />
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item :value="1">
                <v-row>
                  <v-col cols="4">
                    <v-label>{{ $t('thirdpartyrequest.requested_by') }}</v-label>
                    <v-select required v-model="newItem.requested_by" :options="users" :reduce="option => option.id"
                      :placeholder="$t('thirdpartyrequest.requested_by')" label="full_name" clearable
                      disabled></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-label>{{ $t('thirdpartyrequest.department') }}</v-label>
                    <v-select id="department_id" v-model="newItem.department_id" :options="departments"
                      :placeholder="$t('thirdpartyrequest.select_department')" @update:modelValue="getJobs"
                      :reduce="option => option.id" label="name" clearable disabled></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-label>{{ $t('thirdpartyrequest.job_title') }}</v-label>
                    <v-select id="job_id" v-model="newItem.job_id" :options="jobs"
                      :placeholder="$t('thirdpartyrequest.select_job')" :reduce="option => option.id" label="name"
                      clearable disabled></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <v-label>{{ $t('thirdpartyrequest.third_party_profile') }}</v-label>
                    <v-select required id="third_party_profile_id" v-model="newItem.third_party_profile_id"
                      :options="thirdPartyProfiles" :placeholder="$t('thirdpartyrequest.select_profile')"
                      :reduce="option => option.id" label="third_party_name" clearable></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-label>{{ $t('thirdpartyrequest.third_party_service') }}</v-label>
                    <v-select required id="third_party_service_id" v-model="newItem.third_party_service_id"
                      :options="thirdPartyServices" :placeholder="$t('thirdpartyrequest.select_service')"
                      :reduce="option => option.id" label="name" clearable></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-label>{{ $t('thirdpartyrequest.business_info') }}</v-label>
                    <v-textarea required :label="$t('thirdpartyrequest.business_info')" variant="outlined"
                      v-model="newItem.business_info"></v-textarea>
                  </v-col>
                </v-row>
              </v-stepper-window-item>

              <v-stepper-window-item :value="2">
                <div v-for="(evaluation, index) in evaluations" :key="evaluation.id" class="row mb-3">
                  <div class="col-md-6">
                    <label :for="`question_${index}`" class="form-label">{{ $t('thirdpartyrequest.question') }} {{ index
                      +
                      1 }}</label>
                    <textarea :id="`question_${index}`" class="form-control" rows="2" readonly>{{ evaluation.name
                    }}</textarea>
                  </div>

                  <div class="col-md-1">
                    <label class="form-label">{{ $t('thirdpartyrequest.answer') }}</label>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" :name="`answer[${index}]`" value="yes"
                        :id="`yes_${index}`">
                      <label class="form-check-label" :for="`yes_${index}`">{{ $t('thirdpartyrequest.yes') }}</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" :name="`answer[${index}]`" value="no"
                        :id="`no_${index}`">
                      <label class="form-check-label" :for="`no_${index}`">{{ $t('thirdpartyrequest.no') }}</label>
                    </div>
                  </div>

                  <div class="col-md-5">
                    <label :for="`explanation_${index}`" class="form-label">{{ $t('thirdpartyrequest.explanation') }} {{
                      index + 1 }}</label>
                    <textarea :id="`explanation_${index}`" class="form-control" rows="2"></textarea>
                  </div>

                </div>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>

          <v-card-actions class="d-flex justify-end">
            <v-btn color="grey darken-2" variant="flat" rounded :disabled="currentStep === 1" @click="currentStep--">
              <v-icon left>mdi-arrow-left</v-icon> {{ $t('thirdpartyrequest.back') }}
            </v-btn>

            <v-btn v-if="currentStep < 2" color="#2e173e" variant="flat" rounded @click="nextStepInCreation">
              {{ $t('thirdpartyrequest.next') }} <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>

            <v-btn v-if="currentStep === 2" type="submit" color="success" variant="flat" rounded>
              <v-icon left>mdi-check</v-icon> {{ $t('thirdpartyrequest.submit') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>


  <!-- Edit request modal -->
  <v-dialog v-model="openEditModal" max-width="900px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t('thirdpartyrequest.edit_request') }}</span>
        <v-btn icon @click="openEditModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="updateRequest" class="mb-3">
          <v-stepper v-model="currentStep">
            <v-stepper-header>
              <v-stepper-item :value="1" :title="$t('thirdpartyrequest.request_info')" />
              <v-divider></v-divider>
              <v-stepper-item :value="2" :title="$t('thirdpartyrequest.evaluation_checklist')" />
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item :value="1">
                <v-row>
                  <v-col cols="4">
                    <v-label>{{ $t('thirdpartyrequest.requested_by') }}</v-label>
                    <v-select required v-model="editItem.requested_by" disabled :options="users"
                      :reduce="option => option.id" :placeholder="$t('thirdpartyrequest.requested_by')"
                      label="full_name" clearable></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-label>{{ $t('thirdpartyrequest.department') }}</v-label>
                    <v-select id="department_id" v-model="editItem.department_id" disabled :options="departments"
                      :placeholder="$t('thirdpartyrequest.select_department')" @update:modelValue="getJobs"
                      :reduce="option => option.id" label="name" clearable></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-label>{{ $t('thirdpartyrequest.job_title') }}</v-label>
                    <v-select id="job_id" v-model="editItem.job_id" disabled :options="jobs"
                      :placeholder="$t('thirdpartyrequest.select_job')" :reduce="option => option.id" label="name"
                      clearable></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <v-label>{{ $t('thirdpartyrequest.third_party_profile') }}</v-label>
                    <v-select id="third_party_profile_id" v-model="editItem.third_party_profile_id"
                      :options="thirdPartyProfiles" :placeholder="$t('thirdpartyrequest.select_profile')"
                      :reduce="option => option.id" label="third_party_name" clearable></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-label>{{ $t('thirdpartyrequest.third_party_service') }}</v-label>
                    <v-select id="third_party_service_id" v-model="editItem.third_party_service_id"
                      :options="thirdPartyServices" :placeholder="$t('thirdpartyrequest.select_service')"
                      :reduce="option => option.id" label="name" clearable></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-label>{{ $t('thirdpartyrequest.business_info') }}</v-label>
                    <v-textarea v-model="editItem.business_info" :label="$t('thirdpartyrequest.business_info')"
                      variant="outlined" required></v-textarea>
                  </v-col>
                </v-row>
              </v-stepper-window-item>

              <v-stepper-window-item :value="2">
                <div v-for="(evaluation, index) in editEvaluations" :key="evaluation.id" class="row mb-3">
                  <div class="col-md-6">
                    <label :for="`question_${index}`" class="form-label">{{ $t('thirdpartyrequest.question') }} {{ index
                      +
                      1 }}</label>
                    <textarea :id="`question_${index}`" class="form-control" rows="2" readonly>
                    {{ evaluation.name }}
                  </textarea>
                  </div>

                  <div class="col-md-1">
                    <label class="form-label">{{ $t('thirdpartyrequest.answer') }}</label>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" :name="`answer[${index}]`" value="yes"
                        v-model="editEvaluations[index].answer" :id="`yes_${index}`">
                      <label class="form-check-label">{{ $t('thirdpartyrequest.yes') }}</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" :name="`answer[${index}]`" value="no"
                        v-model="editEvaluations[index].answer" :id="`no_${index}`">
                      <label class="form-check-label">{{ $t('thirdpartyrequest.no') }}</label>
                    </div>

                  </div>

                  <div class="col-md-5">
                    <label :for="`explanation_${index}`" class="form-label">{{ $t('thirdpartyrequest.explanation') }} {{
                      index + 1 }}</label>
                    <textarea v-model="editEvaluations[index].explanation" class="form-control" rows="2"
                      :id="`explanation_${index}`"></textarea>
                  </div>
                </div>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>

          <v-card-actions class="d-flex justify-end">
            <v-btn color="grey darken-2" variant="flat" rounded :disabled="currentStep === 1" @click="currentStep--">
              <v-icon left>mdi-arrow-left</v-icon> {{ $t('thirdpartyrequest.back') }}
            </v-btn>

            <v-btn v-if="currentStep < 2" color="primary" variant="flat" rounded @click="currentStep++">
              {{ $t('thirdpartyrequest.next') }} <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>

            <v-btn v-if="currentStep === 2" type="submit" color="success" variant="flat" rounded>
              <v-icon left>mdi-check</v-icon> {{ $t('thirdpartyrequest.update') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>




  <!-- View request modal -->
  <v-dialog v-model="viewModal" max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">{{ $t('thirdpartyrequest.view_request') }}</h1>
        <v-btn icon @click="viewModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-expansion-panels multiple v-model="expandedPanels">
          <!-- Request Information Section -->
          <v-expansion-panel>
            <v-expansion-panel-title>{{ $t('thirdpartyrequest.request_info') }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="row mb-2">
                <div class="col">
                  <p><b class="me-1">{{ $t('thirdpartyrequest.requested_by')
                  }}:</b>{{ getUserName(requestData.requested_by) }}
                  </p>
                </div>
                <div class="col">
                  <p><b class="me-1">{{ $t('thirdpartyrequest.department')
                  }}:</b>{{ getDepartmentName(requestData.department_id) }}
                  </p>
                </div>
                <div class="col">
                  <p><b class="me-1">{{ $t('thirdpartyrequest.job_title') }}:</b>{{ getJobName(requestData.job_id) }}
                  </p>
                </div>
              </div>
              <hr>
              <div class="row mb-2">
                <div class="col">
                  <p><b class="me-1">{{ $t('thirdpartyrequest.third_party_profile') }}:</b>{{
                    requestData?.profile?.third_party_name }}</p>
                </div>
                <div class="col">
                  <p><b>{{ $t('thirdpartyrequest.status') }}:</b>
                    <v-chip v-if="requestData.status === 1" color="grey">{{ $t('thirdpartyrequest.pending') }}</v-chip>
                    <v-chip v-else-if="requestData.status === 2" color="blue">{{ $t('thirdpartyrequest.in_assessment')
                    }}</v-chip>
                    <v-chip v-else-if="requestData.status === 3" color="red">{{ $t('thirdpartyrequest.refused')
                    }}</v-chip>
                  </p>
                </div>
                <div class="col">
                  <p><b class="me-1">{{ $t('thirdpartyrequest.third_party_service') }}:</b>{{ requestData?.service?.name
                  }}</p>
                </div>
              </div>
              <hr>
              <div class="row mb-2">
                <div class="col">
                  <p><b class="me-1">{{ $t('thirdpartyrequest.business_info') }}:</b>{{
                    stripHtml(requestData.business_info) }}</p>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Evaluation Section -->
          <v-expansion-panel>
            <v-expansion-panel-title>{{ $t('thirdpartyrequest.evaluation_checklist') }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-for="evaluation in requestData.evaluations" :key="evaluation.id">
                <div class="row mb-2">
                  <div class="col-md-5">
                    <p><b>{{ $t('thirdpartyrequest.question') }}:</b> {{ evaluation.name }}</p>
                  </div>
                  <div class="col-md-2">
                    <p><b>{{ $t('thirdpartyrequest.answer') }}:</b>
                      <v-chip :color="evaluation.answer === 'yes' ? 'green' : 'red'">
                        {{ evaluation.answer === 'yes' ? $t('thirdpartyrequest.yes') : $t('thirdpartyrequest.no') }}
                      </v-chip>
                    </p>
                  </div>
                  <div class="col-md-5">
                    <p><b>{{ $t('thirdpartyrequest.explanation') }}:</b> {{ evaluation.explanation }}</p>
                  </div>
                </div>
                <hr>
              </div>

              <div class="d-flex justify-center mt-3" v-if="canTakeActionsButtons">
                <v-btn color="primary" v-permission:createRequestAssesment class="mx-2" v-if="requestData.status != 3"
                  @click="createRequestAssesment(requestData.id)">
                  <v-icon left>mdi-email</v-icon> {{ $t('thirdpartyrequest.create_assessment') }}
                </v-btn>
                <v-btn color="red" class="mx-2" v-if="requestData.status != 2 && requestData.status != 3"
                  @click="refuseRequestAssessment(requestData.id)" v-permission:refuseRequestAssessment>
                  <v-icon left>mdi-close</v-icon> {{ $t('thirdpartyrequest.refuse') }}
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red-darken-2" variant="elevated" size="large" rounded="lg" class="text-white mr-2"
          @click="viewModal = false">
          <v-icon left>mdi-close-circle</v-icon>
          {{ $t('thirdpartyrequest.close') }}
        </v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>



  <!-- reject request dialog -->
  <v-dialog v-model="rejectModal" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">{{ $t('thirdpartyrequest.enter_reject_reason') }}</h1>
        <v-btn icon @click="rejectModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-textarea v-model="rejectReason" rows="3" outlined class="mt-3"></v-textarea>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="rejectModal = false">{{ $t('thirdpartyrequest.close') }}</v-btn>
        <v-btn color="primary" :disabled="!rejectReason" @click="submitRejection">{{ $t('thirdpartyrequest.submit')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>



  <!-- create assessment dialog -->
  <v-dialog v-model="createAssessmentDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">{{ $t('thirdpartyrequest.create_assessment') }}</h1>
        <v-btn icon @click="closeAssessmentDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-label>{{ $t('thirdpartyrequest.assessment_name') }}</v-label>
          <v-text-field v-model="form.name" required></v-text-field>

          <v-label>{{ $t('thirdpartyrequest.instructions') }}</v-label>
          <v-textarea v-model="form.instructions" rows="2"></v-textarea>

          <v-label>{{ $t('thirdpartyrequest.assessment') }}</v-label>
          <v-select id="Assessments" v-model="form.assessment_id" :options="assessmentsData"
            :placeholder="$t('thirdpartyrequest.select_assessment')" :reduce="option => option.id" label="name"
            clearable></v-select>

          <v-label class="my-2">{{ $t('thirdpartyrequest.contacts') }}</v-label>
          <v-select id="Contacts" v-model="form.contact_id" :options="contactsData"
            :placeholder="$t('thirdpartyrequest.select_contact')" :reduce="option => option.id" label="name"
            clearable></v-select>

          <v-checkbox v-model="form.all_questions_mandatory"
            :label="$t('thirdpartyrequest.all_questions_mandatory')"></v-checkbox>
        </v-form>
      </v-card-text>

      <v-card-actions class="d-flex justify-end pa-4">
        <v-btn color="blue-darken-2" variant="elevated" size="large" rounded="lg" class="text-white"
          :disabled="!form.name" @click="createAssesment">
          <v-icon left>mdi-check-circle</v-icon>
          {{ $t('thirdpartyrequest.submit') }}
        </v-btn>

        <v-btn color="red-darken-2" variant="elevated" size="large" rounded="lg" class="text-white ml-2"
          @click="closeAssessmentDialog()">
          <v-icon left>mdi-close-circle</v-icon>
          {{ $t('thirdpartyrequest.close') }}
        </v-btn>
      </v-card-actions>


    </v-card>
  </v-dialog>



</template>

<script>
// Importing necessary components and API modules
import { Modal } from 'bootstrap';
import thirdpartyrequest from "@/API/ThirdPartyRequest/ThirdPartyRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
// import thirdPartyService from '@/API/thirdPartyService/thirdPartyService';
import User from '@/API/User/User';
import Job from '@/API/Job/Job';
import Department from '@/API/Department/Department';
import thirdPartyEvaluation from '@/API/thirdPartyEvaluation/thirdPartyEvaluation';
import thirdPartyProfile from '@/API/ThirdPartyProfile/ThirdPartyProfile';
import Assessment from '@/API/Assessment/Assessment';
import ThirdPartyQuestionnaire from '@/API/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire';
import Auth from '@/API/Auth';
import SystemSetting from '@/API/SystemSetting/SystemSetting';


export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    ckeditor: Ckeditor,
    vSelect
  },

  setup() {
    // Initialize API and other required properties
    const api = new thirdpartyrequest();
    //"department:id,name", "job:id,name", "uploader:id,full_name", 
    const apiParams = { with: ["service:id,name", "profile:id,third_party_name"] };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const userApi = new User();
    const jobApi = new Job();
    const departmentApi = new Department();
    // const thirdPartyServiceApi = new thirdPartyService();
    const thirdPartyProfileApi = new thirdPartyProfile();
    const thirdPartyEvaluationApi = new thirdPartyEvaluation();
    const assessmentApi = new Assessment();
    const thirdpartyquestionnaireApi = new ThirdPartyQuestionnaire();
    const USER_ID = Auth.USER.id;
    const systemSetting = new SystemSetting();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      jobApi,
      departmentApi,
      // thirdPartyServiceApi,
      thirdPartyProfileApi,
      thirdPartyEvaluationApi,
      assessmentApi,
      thirdpartyquestionnaireApi,
      USER_ID,
      systemSetting
    };
  },

  async mounted() {
    this.newItem.requested_by = Auth.USER.id
    this.newItem.department_id = Auth.USER.department_id
    this.newItem.job_id = Auth.USER.job_id
    await this.loadSelectsData();
    this.isDataReady = true;

    // Recipient of third part
    const requestReccipient = await this.systemSetting.getAll({
      filter: `type|thirdPartyRequests|=`,
    });
    this.requestReccipient = requestReccipient[0];

    if (this.requestReccipient.receiver_type == "department manager") {
      try {
        this.departmentManagers = await this.api.getDepartmentManagers(this.requestReccipient.department_id);
      } catch (error) {
        console.error("Failed to load department managers:", error);
      }
    } else {
      this.departmentManagers = this.requestReccipient.user_id;
    }

  },

  computed: {
    hideActions() {
      return (row) => ({
        edit: !(row.status == 1 && row.requested_by == Auth.USER.id),
        delete: !(row.status == 1 && row.requested_by == Auth.USER.id),
      });
    },

    canTakeActionsButtons() {
      if (Array.isArray(this.departmentManagers)) {
        return this.departmentManagers.some(manager => manager.id === Auth.USER.id);
      } else {
        return this.departmentManagers === Auth.USER.id;
      }
    },

  },
  data() {
    return {
      isDataReady:false,
      // CKEditor setup
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {
        requested_by: null,
        department_id: null,
        job_id: null,
        third_party_profile_id: null,
        third_party_service_id: null,
        business_info: null,
        evaluations: [],
      }, // Data object to store the currently selected item for editing or new item
      opencreateModal: false,
      currentStep: 1,
      totalSteps: 2,
      users: [],
      departments: [],
      jobs: [],
      thirdPartyServices: [],
      thirdPartyProfiles: [],
      assessmentsData: [],
      contactsData: [],
      evaluations: [],
      requestData: [],
      rejectReason: "",


      openEditModal: false,
      editItem: {},
      editEvaluations: [],
      viewModal: false,
      rejectModal: false,
      expandedPanels: [0],
      refused_request_id: null,
      assessment_request_id: null,
      createAssessmentDialog: false,
      form: {
        name: "",
        instructions: "",
        request_id: null,
        assessment_id: null,
        contact_id: null,
        all_questions_mandatory: false,
      },
      requestReccipient: null,
      departmentManagers: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "requested_by", title: this.$t("thirdpartyrequest.requested_by"), data: null, defaultContent: "N/A" },
      { id: "department", title: this.$t("thirdpartyrequest.department"), data: null, defaultContent: "N/A" },
      { id: "job_title", title: this.$t("thirdpartyrequest.job_title"), data: null, defaultContent: "N/A" },
      { id: "third_party_profile", title: this.$t("thirdpartyrequest.third_party_profile"), data: null, defaultContent: "N/A" },
      { id: "third_party_service", title: this.$t("thirdpartyrequest.third_party_service"), data: null, defaultContent: "N/A" },
      { id: "status", title: this.$t("thirdpartyrequest.status"), data: "status", defaultContent: "N/A" },
      { id: "issue_date", title: this.$t("thirdpartyrequest.issue_date"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      // this.isFlipped = true;  // Show the form
      this.currentStep = 1;
      this.opencreateModal = true;  // Show the form
    },

    validateStep1() {
      let isValid = true;
      if (!this.newItem.third_party_profile_id) {
        this.api.poup({ status: false, message: this.$t("thirdpartyrequest.third_party_profile_required") }, this.$t("thirdpartyrequest.error"));
        isValid = false;
      }
      if (!this.newItem.third_party_service_id) {
        this.api.poup({ status: false, message: this.$t("thirdpartyrequest.service_required") }, this.$t("thirdpartyrequest.error"));
        isValid = false;
      }
      if (!this.newItem.business_info) {
        this.api.poup({ status: false, message: this.$t("thirdpartyrequest.business_info_required") }, this.$t("thirdpartyrequest.error"));
        isValid = false;
      }
      return isValid;
    },

    nextStepInCreation() {
      if (this.currentStep === 1 && !this.validateStep1()) return;
      this.currentStep++;
    },

    closeAssessmentDialog() {
      this.form.name = "",
        this.form.instructions = "",
        this.form.request_id = "",
        this.form.assessment_id = "",
        this.form.contact_id = "",
        this.form.all_questions_mandatory = false,
        this.createAssessmentDialog = false;
    },

    async getJobs(id) {
      this.editItem.job_id = null;
      this.newItem.job_id = null;
      this.jobs = [];
      const data = await this.departmentApi.getAll(
        {
          filter: "id|" + id + "|= ",
          with: ['jobs']
        }
      );
      this.jobs = data[0]?.jobs;
    },


    closeModal() {
      // this.isFlipped = true;  // Show the form
      this.opencreateModal = false;  // Show the form
      this.newItem.third_party_profile_id = null;
      this.newItem.third_party_service_id = null;
      this.newItem.business_info = null;
    },

    closeEditModal() {
      this.currentStep = 1;
      this.openEditModal = false;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    nextStep() {
      if (this.currentStep < 2) this.currentStep++;
    },
    backStep() {
      if (this.currentStep > 1) this.currentStep--;
    },

    getUserName(user_id) {
      const user = this.users.find(user => user.id === user_id);
      return user ? user.full_name : "N/A";
    },
    getJobName(job_id) {
      const job = this.jobs.find(job => job.id === job_id);
      return job ? job.name : "N/A";
    },
    getDepartmentName(department_id) {
      const department = this.departments.find(department => department.id === department_id);
      return department ? department.name : "N/A";
    },

    async loadSelectsData() {
      try {
        // const thirdPartyServicesResponse = await this.thirdPartyServiceApi.getAll({
        //   select: "id|name",
        // });
        // this.thirdPartyServices = thirdPartyServicesResponse;

        const usersResponse = await this.userApi.getAll({
          select: "id|full_name",
        });
        this.users = usersResponse;

        const departmentsResponse = await this.departmentApi.getAll({
          select: "id|name",
        });
        this.departments = departmentsResponse;

        const jobsResponse = await this.jobApi.getAll({
          select: "id|name",
        });
        this.jobs = jobsResponse;

        const thirdPartyEvaluationResponse = await this.thirdPartyEvaluationApi.getAll({
          select: "id|name",
        });
        this.evaluations = thirdPartyEvaluationResponse;

        const thirdPartyProfilesResponse = await this.thirdPartyProfileApi.getAll({
          select: "id|third_party_name",
        });
        this.thirdPartyProfiles = thirdPartyProfilesResponse;


        const assessmentsResponse = await this.assessmentApi.getAll({
          // select: "id|name",
          with: 'template'
        });
        this.assessmentsData = assessmentsResponse;


      } catch (error) {
        console.error("Failed to load data:", error);
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));
    },

    async saveRequest() {
      this.newItem.evaluations = this.evaluations.map((evaluation, index) => {
        const answer = document.querySelector(`input[name='answer[${index}]']:checked`);
        const explanation = document.getElementById(`explanation_${index}`).value;

        return {
          evaluation_id: evaluation.id,
          name: evaluation.name,
          answer: answer ? answer.value : null,
          explanation: explanation || null
        };
      });

      const response = await this.api.insert(this.newItem);
      if (response.status == "success") {
        this.closeModal();
      }
      this.api.poup(response, this.$t("thirdpartyrequest.validation_error"));
      this.$refs.table.refreshTable();
    },

    openModal(selectedRow) {
      this.requestData = { ...selectedRow };
      this.viewModal = true;
      console.log("this.requestData", this.requestData);
    },

    stripHtml(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    },

    openEditDialog(request) {
      this.currentStep = 1;
      this.editItem = { ...request };
      console.log(this.editItem);
      this.editEvaluations = request.evaluations.map(evaluation => ({
        ...evaluation,
        answer: evaluation.answer || null,
        explanation: evaluation.explanation || "",
      }));
      this.openEditModal = true;
    },

    async updateRequest() {
      const updatedData = {
        id: this.editItem.id,
        requested_by: this.editItem.requested_by,
        department_id: this.editItem.department_id,
        job_id: this.editItem.job_id,
        third_party_profile_id: this.editItem.third_party_profile_id,
        third_party_service_id: this.editItem.third_party_service_id,
        business_info: this.editItem.business_info,
        evaluations: this.editEvaluations.map((evaluation) => ({
          evaluation_id: evaluation.evaluation_id,
          name: evaluation.name,
          answer: evaluation.answer || null,
          explanation: evaluation.explanation || "",
        })),
      };

      const response = await this.api.update(updatedData);
      if (response.status === "success") {
        this.openEditModal = false;
      }
      this.api.poup(response, this.$t("thirdpartyrequest.updated_successfully"));
      this.$refs.table.refreshTable();
    },

    async createRequestAssesment(id) {
      this.viewModal = false;
      this.createAssessmentDialog = true;
      this.assessment_request_id = id;
      this.contactsData = [];
      const data = await this.api.show(id, {
        with: "profile.contacts",
      });
      this.contactsData = data.profile?.contacts || [];
    },

    async createAssesment() {
      this.form.request_id = this.assessment_request_id;

      if (this.assessmentsData.template?.question_ids?.length == 0) {
        this.api.poup({ status: false, message: this.$t("thirdpartyrequest.cannot_create_assessment_without_questions") }, this.$t("thirdpartyrequest.error"));
        return;
      }

      try {
        const response = await this.thirdpartyquestionnaireApi.insert(this.form);
        this.api.poup(response, this.$t("thirdpartyrequest.saved_successfully"));
        if (response.status == "success") {
          this.createAssessmentDialog = false;
          this.closeAssessmentDialog()
          await this.api.getAll()
          this.$refs.table.refreshTable();
        }
      } catch (error) {
        this.api.poup(error.response || { message: this.$t("thirdpartyrequest.unexpected_error") }, this.$t("thirdpartyrequest.error"));
      }
    },

    refuseRequestAssessment(id) {
      this.viewModal = false;
      this.rejectModal = true;
      this.refused_request_id = id;
    },

    async submitRejection() {
      try {
        const response = await this.api.rejectRequest(this.refused_request_id, this.rejectReason);
        this.rejectModal = false;
        this.$refs.table.refreshTable();
        this.rejectReason = "";
        this.refused_request_id = null;
        this.api.poup({ status: "success", data: response }, this.$t("thirdpartyrequest.refused_successfully"));
      } catch (error) {
        console.log(error);
        this.api.poup({ status: false, message: error.response?.data?.message }, this.$t("thirdpartyrequest.error"));
      }
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.v-expansion-panel {
  background-color: transparent !important;
  color: black !important;
}

.v-expansion-panel-text {
  border-left: 0px solid #cccccc !important;
}

/* CKEditor minimum height */
.ck-editor__editable {
  min-height: 200px !important;
}
</style>
