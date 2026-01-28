<template>
  <!-- MainPage component for breadcrumb functionality only -->
  <main-page
    ref="page"
    :isFlipped="false"
    :mainPage="$t('framework.Configuration')"
    :mainSubPage="$t('framework.Regulators')"
    :subPage="
      framework
        ? $t('framework.framework') + ' / ' + framework.title
        : $t('framework.Framework')
    "
    :titlePage="$t('framework.Regulators_Framework')"
    :loading="isLoadingPage"
    style="
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
    "
  >
    <template #modal></template>
    <template #datatable></template>
    <template #form></template>
    <template #filter></template>
    <template #statistics></template>
  </main-page>


  <!-- Main Content -->
  <div class="card">
    <div class="card-body">
      <div class="compliance-audit-section mb-4">
        <h3 class="compliance-title mb-3">
          {{ $t("framework.Compliance Audit") }}
        </h3>

        <!-- Loading State -->
        <div v-if="isLoadingCompliance" class="compliance-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="loading-text">Loading compliance data...</p>
        </div>

        <!-- Compliance Data -->
        <div v-else class="compliance-bars-container">
          <div class="compliance-bar-item">
            <div class="compliance-bar-header rtl">
              <span class="compliance-label">{{
                $t("framework.Current")
              }}</span>
              <div class="compliance-percentage-wrapper">
                <span class="compliance-percentage">{{
                  complianceData.current_progress
                }}</span>
                <span
                  v-if="
                    complianceData.progress_difference !== '0%' &&
                    isCurrentBigger()
                  "
                  class="progress-indicator"
                  :class="getProgressIndicatorClass()"
                >
                  <i :class="getProgressArrowIcon()"></i>
                  {{
                    Math.abs(parseFloat(complianceData.progress_difference))
                  }}%
                </span>
              </div>
            </div>
            <div class="progress-bar-wrapper">
              <div
                class="progress-bar-fill"
                :style="{ width: complianceData.current_progress }"
              ></div>
            </div>
          </div>

          <div class="compliance-bar-item">
            <div class="compliance-bar-header rtl">
              <span class="compliance-label">{{
                $t("framework.Previous")
              }}</span>
              <div class="compliance-percentage-wrapper">
                <span class="compliance-percentage">{{
                  complianceData.previous_progress
                }}</span>
                <span
                  v-if="
                    complianceData.progress_difference !== '0%' &&
                    !isCurrentBigger()
                  "
                  class="progress-indicator"
                  :class="getProgressIndicatorClass()"
                >
                  <i :class="getProgressArrowIcon()"></i>
                  {{
                    Math.abs(parseFloat(complianceData.progress_difference))
                  }}%
                </span>
              </div>
            </div>
            <div class="progress-bar-wrapper">
              <div
                class="progress-bar-fill previous-bar"
                :style="{ width: complianceData.previous_progress }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <div v-if="framework" class="framework-details">
            <div class="d-flex align-items-center justify-content-between mb-3 rtl">
              <h3 class="compliance-title mb-0">
                {{ $t("framework.framework_details") }}
              </h3>

              <router-link
                :to="`/frameworks/statistics/${framework.id}`"
                class="main-btn d-flex align-items-center justify-content-center gap-2 stats-btn"
                title="Statistics"
              >
                <v-icon class="icon-add" size="18">mdi-chart-box</v-icon>
                <span class="align-middle">Statistics</span>
              </router-link>
            </div>

            <div class="framework-header-row row">
              <div class="framework-info-item col">
                <div class="info-value-wrapper">
                  <label class="framework-label"
                    >{{ $t("framework.title") }}:</label
                  >
                  <span class="framework-value">{{ framework.title }}</span>
                </div>
              </div>
              <div class="framework-info-item col">
                <div class="info-value-wrapper">
                  <label class="framework-label"
                    >{{ $t("framework.owner") }}:</label
                  >
                  <span class="framework-value owner-value rtl">
                    <span class="owner-avatar">{{ ownerInitial }}</span>
                    {{ ownerName }}
                  </span>
                </div>
              </div>
            </div>

            <div class="framework-description-row">
              <label class="framework-label"
                >{{ $t("framework.description") }}:</label
              >
              <p class="framework-description">{{ framework.description }}</p>
            </div>

            <div class="framework-actions-row">
              <button
                class="btn btn-outline-danger delete-btn"
                v-permission:delete
                @click="deleteFramework(framework.id)"
              >
                {{ $t("framework.Delete") }}
              </button>
              <button
                class="btn update-btn"
                @click="openUpdateModal"
                v-permission:update
              >
                {{ $t("framework.Update") }}
              </button>
            </div>
          </div>

          <!-- Update Modal -->
          <div
            v-if="isUpdateModalOpen"
            class="modal-overlay"
            @scroll="handleScroll"
          >
            <div class="modal-wrapper">
              <div class="modal-content">
                <div class="modal-header">
                  <h2 class="modal-title">
                    {{ $t("framework.UpdateFramework") }}
                  </h2>
                  <span class="close" @click="closeUpdateModal">×</span>
                </div>

                <div class="modal-body" ref="modalBody" @scroll="handleScroll">
                  <form @submit.prevent="updateFramework">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="owner"
                            >{{ $t("framework.owner") }}:</label
                          >
                          <UserSelect
                            v-model="formData.owner"
                            :multiple="false"
                            :placeholder="$t('framework.select_owner')"
                          />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="title"
                            >{{ $t("framework.title") }}:</label
                          >
                          <input
                            id="title"
                            v-model="formData.title"
                            type="text"
                            class="form-control"
                            :placeholder="$t('framework.enter_title')"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div class="row mb-3">
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="domain"
                            >{{ $t("framework.domain") }}:</label
                          >
                          <v-multiselect
                            id="domain"
                            v-model="formData.domain"
                            :options="domains"
                            :multiple="true"
                            :close-on-select="true"
                            :placeholder="$t('framework.select_domains')"
                            class="custom-multiselect"
                            label="name"
                            track-by="id"
                          ></v-multiselect>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="subDomain"
                            >{{ $t("framework.subdomain") }}:</label
                          >
                          <v-multiselect
                            id="subDomain"
                            v-model="formData.sub_domain"
                            :options="filteredSubDomains"
                            :multiple="true"
                            :close-on-select="true"
                            :placeholder="$t('framework.select_subdomains')"
                            class="custom-multiselect"
                            label="name"
                            track-by="id"
                          ></v-multiselect>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <div class="form-group">
                          <label for="description"
                            >{{ $t("framework.description") }}:</label
                          >
                          <textarea
                            id="description"
                            v-model="formData.description"
                            class="form-control"
                            rows="4"
                            :placeholder="$t('framework.enter_description')"
                            required
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div
                  class="form-actions"
                  :class="{ 'form-actions-shadow': isScrolled }"
                >
                  <div class="form-actions-buttons">
                    <button
                      type="button"
                      class="btn btn-outline-danger delete-btn"
                      @click="closeUpdateModal"
                    >
                      {{ $t("common.cancel") || "Cancel" }}
                    </button>
                    <button
                      type="submit"
                      class="btn update-btn"
                      @click="updateFramework"
                      v-permission:update
                    >
                      {{ $t("framework.Update") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div v-if="framework" class="row g-2">
          <div
            v-for="(domain, index) in formData.domain"
            :key="index"
            class="col-12 col-sm-6 col-md-4 col-lg-3 pb-3"
          >
            <div class="course-widget h-100 d-flex flex-column domain-card p-2">
              <div class="flex-grow-1">
                <h5 class="mx-3 mt-3 domain-title" style="font-weight: 700">
                  {{ domain.name }}
                </h5>

                <!-- Domain Statistics -->
                <div v-if="domain.stats" class="domain-stats px-3 mb-2">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <small class="text-muted">Controls</small>
                      <div class="stat-value">
                        {{ domain.stats.total_controls || 0 }}
                      </div>
                    </div>
                    <div class="stat-item">
                      <small class="text-muted">Implemented</small>
                      <div class="stat-value text-success">
                        {{ domain.stats.implemented || 0 }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ms-auto mb-1 me-1">
                <!-- Show Details Button -->
                <button
                  class="btn btn-outline-primary show-details-btn w-100"
                  @click="fetchDataOfSpecificDomain(domain.id, framework.id)"
                  :disabled="isLoadingDomain && loadingDomainId === domain.id"
                  :class="{
                    loading: isLoadingDomain && loadingDomainId === domain.id,
                  }"
                >
                  <template
                    v-if="isLoadingDomain && loadingDomainId === domain.id"
                  >
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Loading...
                  </template>
                  <template v-else>
                    <i class="fa fa-circle-info"></i>

                    {{ $t("framework.details") }}
                  </template>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DataTable with Loading State -->
      <div v-if="!isLoadingAuditPlan" class="table-loading-container">
        <div class="table-loading-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="loading-text">Loading audit plan data...</p>
        </div>
      </div>

      <DataTable
        v-else
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="apiAudit"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :hideActions="hideActions"
      >
        <template #regulator="{ item }">{{ item?.regulator?.name }}</template>
        <template #framework="{ item }">{{ item?.framework?.title }}</template>
        <template #auditer_id="{ item }">{{ getAuditerName(item) }}</template>
        <template #responsible="{ item }">
          <div v-if="getResponsibleNames(item).length">
            <v-chip
              v-for="(name, index) in getResponsibleNames(item)"
              :key="index"
              small
              :color="item.responsible_type === 'teams' ? 'teal' : ''"
              :text-color="item.responsible_type === 'teams' ? 'white' : ''"
              class="mr-1 mb-1"
            >
              {{ name }}
            </v-chip>
          </div>
        </template>
        <template #addAction="{ item }">
          <a
            href="javascript:void(0)"
            @click="openDetailsModal(item)"
            title="Details"
            class="dropdown-item"
          >
            <i class="fa-solid fa-eye me-2"></i> {{ $t("framework.Details") }}
          </a>
        </template>
      </DataTable>
    </div>
  </div>

  <!-- Audit Plan Details Modal Component -->
  <AuditPlanDetailsModal
    :isOpen="isDetailsModalOpen"
    :auditPlan="selectedAuditPlan"
    :isLoading="isLoadingDetails"
    @close="closeDetailsModal"
  />

  <!-- Domain Details Modal Component -->
  <AuditPlanDetailsForDomainModal
    :isOpen="isDetailsDomainModalOpen"
    :auditPlan="selectedDomainAuditPlan"
    :isLoading="isLoadingDetailsDomain"
    @close="closeDetailsDomainModal"
  />
</template>

<script>
import Multiselect from "vue-multiselect";
import Frameworks from "@/API/FrameworkDetails/FrameworkDetails";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import auditPlan from "@/API/AuditPlan/AuditPlan";
import domain from "@/API/Domain/Domain";
import DataTable from "@/components/DataTable.vue";
import MainPage from "@/components/MainPage.vue";
import UserSelect from "@/components/UserSelect.vue";
import AuditPlanDetailsModal from "./AuditPlanDetailsModal.vue";
import AuditPlanDetailsForDomainModal from "./AuditPlanDetailsDomainModal.vue";

export default {
  components: {
    MainPage,
    DataTable,
    "v-multiselect": Multiselect,
    UserSelect,
    AuditPlanDetailsModal,
    AuditPlanDetailsForDomainModal,
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      isLoadingPage: true,
      owners: [],
      selectedOwner: null,
      framework: null,
      auditPlanData: null,
      isLoadingAuditPlan: false,
      isUpdateModalOpen: false,
      isScrolled: false,
      complianceData: {
        current_progress: "0%",
        previous_progress: "0%",
        progress_difference: "0%",
      },
      isLoadingCompliance: true,
      formData: {
        title: "",
        domain: [],
        sub_domain: [],
        owner: null,
        icon: "",
        description: "",
      },
      api: new Frameworks(),
      apiAudit: new auditPlan(),
      userApi: new auditPlan(),
      domains: [],
      filteredSubDomains: [],
      domainApi: new domain(),
      userApi: new User(),
      teamApi: new Team(),
      isDetailsModalOpen: false,
      selectedAuditPlan: null,
      isLoadingDetails: false,
      // Domain modal related data
      isDetailsDomainModalOpen: false,
      selectedDomainAuditPlan: null,
      isLoadingDetailsDomain: false,
      isLoadingDomain: false,
      loadingDomainId: null,
    };
  },
  methods: {
    async fetchFrameworkDetails() {
      try {
        const frameworkData = await this.api.show(this.id);
        this.framework = frameworkData;
        await this.fetchMainDomains();

        this.formData.domain = (frameworkData.domain || [])
          .filter((domain) => domain !== null)
          .map((domain) => {
            const fullDomain = this.domains.find((d) => d.id === domain.id);
            return fullDomain
              ? {
                  id: fullDomain.id,
                  name: fullDomain.name,
                  subDomains: domain["sub-domain"] || [],
                }
              : null;
          })
          .filter((domain) => domain !== null);

        await this.fetchSubDomainsForSelectedDomains();
        await this.fetchPercentageCompliance(this.id);

        this.formData.sub_domain = this.formData.domain
          .flatMap((domain) => domain.subDomains)
          .map((subDomain) => {
            const fullSubDomain = this.filteredSubDomains.find(
              (sd) => sd.id === subDomain.id
            );
            return fullSubDomain
              ? {
                  id: fullSubDomain.id,
                  name: fullSubDomain.name,
                  parent_id: fullSubDomain.parent_id,
                }
              : null;
          })
          .filter((subDomain) => subDomain !== null);

        this.formData.title = frameworkData.title;
        this.formData.icon = frameworkData.icon || "";
        this.formData.description = frameworkData.description || "";
        this.setSelectedOwner(frameworkData.owner);
      } catch (error) {
        console.error("Error fetching framework details:", error);
        this.$router.push("/regulator");
      }
    },
    async fetchAuditPlan() {
      try {
        this.isLoadingAuditPlan = false;
        const relations = ["regulator:name", "framework:title"];
        this.apiParams = {
          filter: `framework_id|${this.id}`,
          with: relations,
        };
        this.$refs.table?.refreshTable();
      } catch (error) {
        console.error("Error fetching audit plan details:", error);
      } finally {
        this.isLoadingAuditPlan = true;
      }
    },
    handleScroll(event) {
      const target = event.target;
      if (target.classList.contains("modal-body")) {
        this.isScrolled = target.scrollTop > 20;
      }
    },
    async deleteFramework(id) {
      try {
        const response = await this.api.delete(id);
        if (response.status === "success") {
          this.$router.push("/regulator");
        }
      } catch (error) {
        console.error("Error deleting framework:", error);
      }
    },
    async fetchPercentageCompliance(id) {
      try {
        this.isLoadingCompliance = true;
        const response = await this.api.fetchPercentageCompliance(id);
        if (response.data) {
          this.complianceData = {
            current_progress: response.data.data.current_progress || "0%",
            previous_progress: response.data.data.previous_progress || "0%",
            progress_difference: response.data.data.progress_difference || "0%",
          };
        }
      } catch (error) {
        console.error("Error fetching compliance:", error);
        this.complianceData = {
          current_progress: "0%",
          previous_progress: "0%",
          progress_difference: "0%",
        };
      } finally {
        this.isLoadingCompliance = false;
      }
    },
    setSelectedOwner(ownerId) {
      if (!this.userList || !ownerId) return;
      const owner = this.userList.find((owner) => owner.id == String(ownerId));
      this.selectedOwner = owner || null;
    },
    openUpdateModal() {
      this.isUpdateModalOpen = true;
      this.fetchSubDomainsForSelectedDomains();
    },
    closeUpdateModal() {
      this.isUpdateModalOpen = false;
      this.isScrolled = false;
      this.fetchFrameworkDetails();
    },
    async fetchSubDomainsForSelectedDomains() {
      try {
        this.filteredSubDomains = [];
        for (const domain of this.formData.domain) {
          const domainId = domain.id;
          const response = await this.domainApi.showSubDomainInDomain(domainId);
          const responseData = response.data || response;
          if (Array.isArray(responseData)) {
            const subDomains = responseData.map((item) => ({
              id: item.id,
              name: item.name,
              parent_id: item.parent_id,
            }));
            this.filteredSubDomains.push(...subDomains);
          }
        }
        this.formData.sub_domain = this.formData.sub_domain.filter(
          (subDomain) => {
            return this.formData.domain.some(
              (domain) => domain.id === subDomain.parent_id
            );
          }
        );
      } catch (error) {
        console.error("Error fetching sub-domains:", error);
      }
    },
    async updateFramework() {
      try {
        const updatedData = {
          ...this.formData,
          id: this.id,
          sub_domain: this.formData.sub_domain.map((subDomain) => ({
            id: subDomain.id,
            name: subDomain.name,
            parent_id: subDomain.parent_id,
          })),
        };
        const response = await this.api.update(updatedData);
        if (response) {
          this.framework = { ...updatedData };
          this.closeUpdateModal();
        }
      } catch (error) {
        console.error("Error updating framework:", error);
      }
    },
    async fetchMainDomains() {
      try {
        const response = await this.domainApi.getAll();
        if (response && Array.isArray(response)) {
          this.domains = response
            .filter((item) => item.parent_id === null)
            .map((item) => ({ id: item.id, name: item.name }));
        }
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    },
    async loadInitialData() {
      try {
        this.userList = await this.userApi.getAll({ select: "id|full_name" });
        this.teamList = await this.teamApi.getAll({ select: "id|name" });
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    },
    async openDetailsModal(item) {
      try {
        this.isDetailsModalOpen = true;
        this.selectedAuditPlan = null;
        this.isLoadingDetails = true;

        const response = await this.apiAudit.show(item.id, {
          with: ["frameworkControlTestAudit.domain:domain_id,name"],
        });

        const filteredResponse = {
          ...response,
          framework_control_test_audit:
            response.framework_control_test_audit.filter(
              (item) =>
                (item.is_parent === 0 && item.is_child === 0) ||
                (item.is_parent === 0 && item.is_child === 1)
            ),
        };

        const frameworkControls = filteredResponse.framework_control_test_audit;

        const statusCounts = {
          "Not Implemented": 0,
          Implemented: 0,
          "Partially Implemented": 0,
          "Not Applicable": 0,
        };

        const openClosedCounts = {
          open: 0,
          closed: 0,
        };

        const datatableRecords = frameworkControls.map((control) => {
          if (control.status === "Not Implemented") {
            statusCounts["Not Implemented"]++;
          } else if (control.status === "Implemented") {
            statusCounts["Implemented"]++;
          } else if (control.status === "Partially Implemented") {
            statusCounts["Partially Implemented"]++;
          } else if (control.status === "Not Applicable") {
            statusCounts["Not Applicable"]++;
          }

          if (control.open_closed_status === 0) {
            openClosedCounts["open"]++;
          } else if (control.open_closed_status === 1) {
            openClosedCounts["closed"]++;
          }

          const requirementWithEvidence =
            control.requirement_with_evidence || [];
          const totalRequirements = requirementWithEvidence.length;

          const approvedRequirements = requirementWithEvidence.filter(
            (req) => req.requirement && req.requirement.status === "approved"
          ).length;

          const totalEvidence = requirementWithEvidence.reduce((total, req) => {
            return total + (req.evidence ? req.evidence.length : 0);
          }, 0);

          const approvedEvidence = requirementWithEvidence.reduce(
            (total, req) => {
              if (req.evidence && Array.isArray(req.evidence)) {
                return (
                  total +
                  req.evidence.filter((ev) => ev.status === "approved").length
                );
              }
              return total;
            },
            0
          );

          return {
            id: control.id,
            control_id: control.control_id,
            name: control.name,
            domain_name: control.domain?.name || control.domain_name || "N/A",
            status: control.status || "Not Set",
            total_requirements: totalRequirements,
            approved_requirements: approvedRequirements,
            total_evidence: totalEvidence,
            approved_evidence: approvedEvidence,
            open_closed_status: control.open_closed_status,
            framework_name: control.framework_name,
            family_name: control.family_name,
            test_number: control.test_number,
            start_date: control.start_date,
            last_date: control.last_date,
          };
        });

        const totalControls = frameworkControls.length;
        const statusPercentages = {
          "Not Implemented":
            totalControls > 0
              ? (
                  (statusCounts["Not Implemented"] / totalControls) *
                  100
                ).toFixed(2)
              : 0,
          Implemented:
            totalControls > 0
              ? ((statusCounts["Implemented"] / totalControls) * 100).toFixed(2)
              : 0,
          "Partially Implemented":
            totalControls > 0
              ? (
                  (statusCounts["Partially Implemented"] / totalControls) *
                  100
                ).toFixed(2)
              : 0,
          "Not Applicable":
            totalControls > 0
              ? (
                  (statusCounts["Not Applicable"] / totalControls) *
                  100
                ).toFixed(2)
              : 0,
        };

        const openClosedPercentages = {
          open:
            totalControls > 0
              ? ((openClosedCounts["open"] / totalControls) * 100).toFixed(2)
              : 0,
          closed:
            totalControls > 0
              ? ((openClosedCounts["closed"] / totalControls) * 100).toFixed(2)
              : 0,
        };

        const statistics = {
          totalControls: totalControls,
          status: {
            counts: statusCounts,
            percentages: statusPercentages,
          },
          openClosed: {
            counts: openClosedCounts,
            percentages: openClosedPercentages,
          },
        };

        this.selectedAuditPlan = {
          ...filteredResponse,
          statistics: statistics,
          datatableRecords: datatableRecords,
        };
      } catch (error) {
        console.error("Error fetching audit plan details:", error);
        this.closeDetailsModal();
      } finally {
        this.isLoadingDetails = false;
      }
    },
    closeDetailsModal() {
      this.isDetailsModalOpen = false;
      this.selectedAuditPlan = null;
      this.isLoadingDetails = false;
    },
    async fetchDataOfSpecificDomain(domainId, frameworkId) {
      try {
        this.isLoadingDomain = true;
        this.loadingDomainId = domainId;

        // Fetch domain data from API
        const response = await this.api.fetchDataOfSpecificDomain(
          domainId,
          frameworkId
        );

        console.log("Domain API Response:", response);

        // Extract data - handle both direct response and wrapped response
        const data = response.data.data || response;

        // Process controls - handle Laravel Collection format
        const controlsData = data.controls?.items || data.controls || [];
        const controls = Array.isArray(controlsData) ? controlsData : [];

        console.log("Extracted Controls:", data);

        // Create datatable records from controls
        const datatableRecords = controls.map((control) => {
          // Get requirement and evidence counts from the API response
          const controlId = control.id;
          const requirementsCount =
            data.requirement_statistics?.requirements_per_control?.[
              controlId
            ] || 0;
          const evidencesCount =
            data.evidence_statistics?.evidences_per_control?.[controlId] || 0;

          return {
            id: control.id,
            control_id: control.id,
            name: control.short_name,
            domain_name: control.sub_domain?.name || "N/A",
            status: control.status || "Not Set",
            total_requirements: requirementsCount,
            approved_requirements: 0, // Not available in current API response
            total_evidence: evidencesCount,
            approved_evidence: 0, // Not available in current API response
            family_id: control.family_id,
            parent_id: control.parent_id,
          };
        });

        // Map backend status keys to frontend format
        const backendStatusCounts = data.status_statistics?.counts || {};
        const backendStatusPercentages =
          data.status_statistics?.percentages || {};

        const statusCounts = {
          implemented: backendStatusCounts.implemented || 0,
          not_implemented: backendStatusCounts.not_implemented || 0,
          partially_implemented: backendStatusCounts.partially_implemented || 0,
          not_applicable: backendStatusCounts.not_applicable || 0,
        };

        const statusPercentages = {
          implemented: backendStatusPercentages.implemented || 0,
          not_implemented: backendStatusPercentages.not_implemented || 0,
          partially_implemented:
            backendStatusPercentages.partially_implemented || 0,
          not_applicable: backendStatusPercentages.not_applicable || 0,
        };

        // Create the statistics object
        const statistics = {
          totalControls: data.total_controls || 0,
          totalRequirements: data.total_requirements || 0,
          totalEvidences: data.total_evidences || 0,
          controlsWithRequirements: data.controls_with_requirements || 0,
          controlsWithoutRequirements: data.controls_without_requirements || 0,
          controlsWithEvidence: data.controls_with_evidence || 0,
          controlsWithoutEvidence: data.controls_without_evidence || 0,
          status: {
            counts: statusCounts,
            percentages: statusPercentages,
          },
        };

        console.log("Processed Statistics:", statistics);
        console.log("Datatable Records:", datatableRecords);

        // Set the selected domain audit plan data
        this.selectedDomainAuditPlan = {
          domain_id: domainId,
          framework_id: frameworkId,
          statistics: statistics,
          datatableRecords: datatableRecords,
          rawResponse: data,
        };

        // Open the domain details modal
        this.isDetailsDomainModalOpen = true;
      } catch (error) {
        console.error("Error fetching domain data:", error);
        this.$toast?.error?.(
          "Failed to fetch domain details. Please try again."
        );
      } finally {
        this.isLoadingDomain = false;
        this.loadingDomainId = null;
      }
    },
    closeDetailsDomainModal() {
      this.isDetailsDomainModalOpen = false;
      this.selectedDomainAuditPlan = null;
      this.isLoadingDetailsDomain = false;
    },
    getResponsibleNames(item) {
      if (!item.responsible || item.responsible.length === 0) return ["N/A"];
      if (item.responsible_type === "users") {
        return item.responsible.map((id) => {
          const user = this.userList.find((u) => u.id === id);
          return user ? user.full_name : "Unknown User";
        });
      } else if (item.responsible_type === "teams") {
        return item.responsible.map((id) => {
          const team = this.teamList.find((t) => t.id === id);
          return team ? team.name : "Unknown Team";
        });
      }
      return ["N/A"];
    },
    getAuditerName(item) {
      const user = this.userList.find((u) => u.id === item.auditer_id);
      return user ? user.full_name : "Unknown User";
    },
    hideFlipContainers() {
      const flipElements = [
        ".flip-container",
        ".flip-container.flip",
        ".flipper",
        ".front",
        ".back",
      ];
      flipElements.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          element.style.display = "none";
          element.style.visibility = "hidden";
          element.style.opacity = "0";
          element.style.height = "0";
          element.style.overflow = "hidden";
          element.style.position = "absolute";
          element.style.top = "-9999px";
          element.style.left = "-9999px";
        });
      });
      const nestedContainers = document.querySelectorAll(
        ".container-fluid .container-fluid"
      );
      nestedContainers.forEach((element) => {
        element.style.display = "none";
      });
    },
    getProgressIndicatorClass() {
      const diff = parseFloat(this.complianceData.progress_difference);
      return diff > 0 ? "progress-up" : "progress-down";
    },
    getProgressArrowIcon() {
      const diff = parseFloat(this.complianceData.progress_difference);
      return diff > 0 ? "fa fa-arrow-up" : "fa fa-arrow-down";
    },
    isCurrentBigger() {
      const current = parseFloat(this.complianceData.current_progress);
      const previous = parseFloat(this.complianceData.previous_progress);
      return current > previous;
    },
  },
  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: true,
          delete: true,
        };
      };
    },
    ownerName() {
      if (!this.framework || !this.framework.owner || !this.userList.length) {
        return "Unknown";
      }
      const owner = this.userList.find(
        (owner) => owner.id == this.framework.owner
      );
      return owner ? owner.full_name : "Unknown";
    },
    ownerInitial() {
      if (this.ownerName && this.ownerName !== "Unknown") {
        return this.ownerName.charAt(0).toUpperCase();
      }
      return "U";
    },
  },
  watch: {
    selectedOwner(newVal) {
      this.formData.owner = newVal ? newVal.id : null;
    },
    "formData.domain": {
      handler() {
        this.fetchSubDomainsForSelectedDomains();
      },
      deep: true,
    },
  },
  async created() {
    this.tableColumns = [
      {
        title: this.$t("auditplan.audit_name"),
        data: "audit_name",
        defaultContent: "N/A",
      },
      {
        id: "regulator",
        title: this.$t("auditplan.Regulator"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "framework",
        title: this.$t("auditplan.Framework"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "auditer_id",
        title: this.$t("auditplan.Auditer"),
        data: "",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditplan.TypeOfResponsible"),
        data: "responsible_type",
        defaultContent: "N/A",
      },
      {
        id: "responsible",
        title: this.$t("auditplan.Assistant"),
        data: "",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditplan.Start-Date"),
        data: "start_date",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditplan.Due-Date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditplan.PeriodicalTime"),
        data: "periodical_time",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditplan.AuditNumberInitiated"),
        data: "test_number_initiated",
        defaultContent: "N/A",
      },
    ];

    try {
      this.isLoadingPage = true;
      await this.loadInitialData();
      await this.fetchFrameworkDetails();
      await this.fetchAuditPlan();
    } catch (error) {
      console.error("Error loading page:", error);
    } finally {
      this.isLoadingPage = false;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.hideFlipContainers();
    });
  },
  updated() {
    this.$nextTick(() => {
      this.hideFlipContainers();
    });
  },
};
</script>

<style scoped>
/* Page Loading Styles */
.page-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 15px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner-large {
  width: 60px;
  height: 60px;
}

.spinner-large .spinner-border {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.loading-text {
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Table Loading Styles */
.table-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background-color: #fff;
  border-radius: 10px;
  margin-top: 20px;
  border: 1px solid #e5e7eb;
}

.table-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* Force hide flip container and related elements */
div.container-fluid .flip-container,
div.container-fluid .flip-container.flip,
div.container-fluid .flipper,
div.container-fluid .front,
div.container-fluid .back,
::v-deep(div.container-fluid .flip-container),
::v-deep(div.container-fluid .flip-container.flip),
::v-deep(div.container-fluid .flipper),
::v-deep(div.container-fluid .front),
::v-deep(div.container-fluid .back) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
}

::v-deep(main-page) {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
}

::v-deep(.table-controls) {
  display: none !important;
}

/* Compliance Audit Styles */
.compliance-audit-section {
  padding: 25px;
  background-color: #f5f5f5;
  border-radius: 15px;
}

.compliance-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
}

.compliance-title {
  font-size: 17px;
  font-weight: bold;
  padding-bottom: 5px;
  margin: 0 0 20px 5px;
  border-bottom: 1px solid #d9d9d9;
}

.compliance-bars-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.compliance-bar-item {
  width: 100%;
}

.compliance-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.compliance-label {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.compliance-percentage-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compliance-percentage {
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
}

.progress-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.progress-up {
  background-color: #d4edda;
  color: #155724;
}

.progress-down {
  background-color: #f8d7da;
  color: #721c24;
}

.progress-bar-wrapper {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background-color: #6e3894;
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
  position: relative;
}

.progress-bar-fill.previous-bar {
  background-color: #9b67c4;
}

/* Framework Details Styles */
.framework-details {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 10px;
}

.framework-header-row {
  display: flex;
  gap: 40px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.info-value-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.framework-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin: 0;
  display: block;
}

.framework-value {
  font-size: 14px;
  color: #000000;
  font-weight: 500;
}

.owner-value {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.owner-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #d0b5e3;
  color: #43235c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  font-size: 8px;
  margin-bottom: 5px;
}

.card .card-body p:last-child {
  margin-bottom: 10px;
}

.framework-description {
  font-size: 16px;
  color: #000000;
  line-height: 1.6;
  margin: 8px 0 0 0;
  text-align: justify;
  font-weight: 500;
}

.framework-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #d9d9d9;
}

.delete-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 10px;
  border: 1px solid #6e3894;
  color: #6e3894;
  background-color: transparent;
  transition: all 0.3s ease;
  height: auto;
  min-width: 80px;
  white-space: nowrap;
}

.delete-btn:hover {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
  font-weight: 700;
}

.update-btn {
  padding: 6px 20px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 10px;
  background-color: #6e3894;
  border: none;
  color: white;
  transition: all 0.3s ease;
  height: auto;
  min-width: 80px;
  white-space: nowrap;
}

.update-btn:hover {
  background-color: #5a2d7a;
  transform: translateY(-1px);
  font-weight: 700;
}

.course-widget {
  position: relative;
  /* padding-bottom: 5px; */
  outline: 2px solid #f0f0f0;
  /* margin-left: 10px; */
  border-radius: 20px;
  background-color: #f5f5f5;
  transition: all 0.4s ease;
}

.course-widget:hover {
  transform: translateY(-3px);
}

.domain-stats {
  margin: 12px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  margin-top: 4px;
}

.show-details-btn {
  background-color: #6e3894 !important;
  color: white;
  transition: all 0.3s ease;
  padding: 5px 25px;
  border-bottom-right-radius: 10px;
}

.show-details-btn:hover {
  font-weight: 700 !important;
}

.show-details-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

.show-details-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.show-details-btn.loading {
  position: relative;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 110vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-wrapper {
  min-height: min-content;
  max-height: 90vh;
  width: 100%;
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-direction: column;
}

.modal-content {
  background: white;
  border-radius: 25px;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: fadeIn 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 9px 20px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 25px 25px 0 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 16px;
  color: #093f75;
  font-weight: 700;
  margin: 0;
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 180px);
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #093f75;
  box-shadow: 0 0 0 2px rgba(9, 63, 117, 0.1);
  outline: none;
}

.close {
  font-size: 28px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.close:hover {
  color: #093f75;
}

.form-actions {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 15px 30px;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 25px 25px;
  transition: box-shadow 0.3s ease;
}

.form-actions-shadow {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-actions-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
}

@media (max-width: 768px) {
  .compliance-bars-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-wrapper {
    max-width: 95%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.stats-btn {
  background-color: #6e3894;
  color: #ffffff;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 14px;
  text-transform: capitalize !important;
  border: 1px solid #6e3894;
  height: 30px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.stats-btn .v-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
[dir="rtl"].course-widget {
    align-items: end;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row ,[dir="rtl"] .framework-description {
text-align: end;
}
@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>
