<template>
  <PurpleDotsLoader v-if="load" />
  <!-- Main Page component where the layout and page structure are set -->
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="this.$t('exception.governance')"
    :mainSubPage="this.$t('exception.exceptions')" :subPage="this.$t('exception.exceptionsmanagement')"
    :titlePage="this.$t('exception.exceptions')" v-permission:show :showInsightsTab="true">
    <div v-permission:update v-permission:delete></div>

    <template #statistics>
      <!-- Statistics Content -->
      <div class="statistics-content">
        <!-- Modern Metrics Cards -->
        <div class="card modern-card">
          <div class="card-body pt-2 pb-2 pl-3 pr-3">
            <div class="statistic-container">
              <div class="row g-3">
                <!-- Total Exceptions Card -->
                <div class="col-12 col-sm-6 col-lg-3">
                  <div class="stat-card-modern stat-card-purple">
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">
                        {{ $t("exception.total_exceptions") }}
                      </h6>
                      <div class="stat-icon-circle stat-icon-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">
                        {{ statisticsData.totalExceptions }}
                      </h2>
                      <span class="stat-percentage">100%</span>
                    </div>
                  </div>
                </div>

                <!-- Approved Card -->
                <div class="col-12 col-sm-6 col-lg-3">
                  <div class="stat-card-modern stat-card-green">
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">{{ $t("exception.approved") }}</h6>
                      <div class="stat-icon-circle stat-icon-green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">
                        {{ statisticsData.totalApproved }}
                      </h2>
                      <span class="stat-percentage">{{
                        getPercentage(statisticsData.totalApproved)
                      }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Rejected Card -->
                <div class="col-12 col-sm-6 col-lg-3">
                  <div class="stat-card-modern stat-card-red">
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">{{ $t("exception.rejected") }}</h6>
                      <div class="stat-icon-circle stat-icon-red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">
                        {{ statisticsData.totalRejected }}
                      </h2>
                      <span class="stat-percentage">{{
                        getPercentage(statisticsData.totalRejected)
                      }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Pending Card -->
                <div class="col-12 col-sm-6 col-lg-3">
                  <div class="stat-card-modern stat-card-yellow">
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">{{ $t("exception.pending") }}</h6>
                      <div class="stat-icon-circle stat-icon-yellow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">
                        {{ statisticsData.totalPending }}
                      </h2>
                      <span class="stat-percentage">{{ getPercentage(statisticsData.totalPending) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exception Acceptors Cards -->
        <div class="card modern-card mt-3">
          <div class="card-body pt-2 pb-2 pl-3 pr-3">
            <div class="statistic-container">
              <div class="row g-3">
                <!-- Policy Acceptor Card -->
                <div class="col-12 col-md-4">
                  <div class="acceptor-card acceptor-card-policy">
                    <div class="acceptor-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div class="acceptor-card-content">
                      <h6 class="acceptor-type">
                        {{ $t("exception.policy") || "Policy" }}
                      </h6>
                      <p class="acceptor-name" v-if="acceptors.policy_acceptor_id">
                        {{
                          getUserName(acceptors.policy_acceptor_id) ||
                          "Not Assigned"
                        }}
                      </p>
                      <p class="acceptor-name text-muted" v-else>
                        Not Assigned
                      </p>
                      <span class="acceptor-badge">{{
                        $t("exception.acceptor") || "Acceptor"
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Control Acceptor Card -->
                <div class="col-12 col-md-4">
                  <div class="acceptor-card acceptor-card-control">
                    <div class="acceptor-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>
                    <div class="acceptor-card-content">
                      <h6 class="acceptor-type">
                        {{ $t("exception.control") || "Control" }}
                      </h6>
                      <p class="acceptor-name" v-if="acceptors.control_acceptor_id">
                        {{
                          getUserName(acceptors.control_acceptor_id) ||
                          "Not Assigned"
                        }}
                      </p>
                      <p class="acceptor-name text-muted" v-else>
                        Not Assigned
                      </p>
                      <span class="acceptor-badge">{{
                        $t("exception.acceptor") || "Acceptor"
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Risk Acceptor Card -->
                <div class="col-12 col-md-4">
                  <div class="acceptor-card acceptor-card-risk">
                    <div class="acceptor-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
                        </path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <div class="acceptor-card-content">
                      <h6 class="acceptor-type">
                        {{ $t("exception.risk") || "Risk" }}
                      </h6>
                      <p class="acceptor-name" v-if="acceptors.risk_acceptor_id">
                        {{
                          getUserName(acceptors.risk_acceptor_id) ||
                          "Not Assigned"
                        }}
                      </p>
                      <p class="acceptor-name text-muted" v-else>
                        Not Assigned
                      </p>
                      <span class="acceptor-badge">{{
                        $t("exception.acceptor") || "Acceptor"
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Overall Status Distribution -->
          <div class="chart-container">
            <h5>{{ $t("exception.overall_status_distribution") }}</h5>
            <apexchart type="pie" :options="overallStatusChartOptions" :series="overallStatusChartSeries" height="300">
            </apexchart>
          </div>

          <!-- Exception Type Distribution -->
          <div class="chart-container">
            <h5>{{ $t("exception.exception_type_distribution") }}</h5>
            <apexchart type="pie" :options="typeDistributionChartOptions" :series="typeDistributionChartSeries"
              height="300"></apexchart>
          </div>

          <!-- Status by Type Chart -->
          <div class="chart-container full-width">
            <h5>{{ $t("exception.status_by_type") }}</h5>
            <apexchart type="bar" :options="statusByTypeChartOptions" :series="statusByTypeChartSeries" height="350">
            </apexchart>
          </div>

          <!-- Average Duration by Type -->
          <div class="chart-container">
            <h5>{{ $t("exception.average_duration_by_type") }}</h5>
            <apexchart type="bar" :options="durationChartOptions" :series="durationChartSeries" height="300">
            </apexchart>
          </div>

          <!-- Monthly Trend -->
          <div class="chart-container">
            <h5>{{ $t("exception.monthly_trend") }}</h5>
            <apexchart type="line" :options="monthlyTrendChartOptions" :series="monthlyTrendChartSeries" height="300">
            </apexchart>
          </div>

          <!-- Exceptions by Department -->
          <div class="chart-container full-width">
            <h5>{{ $t("exception.exceptions_by_department") }}</h5>
            <apexchart type="bar" :options="departmentChartOptions" :series="departmentChartSeries" height="400">
            </apexchart>
          </div>
        </div>
      </div>
    </template>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="card" style="background-color: #f8f8f8">
        <div class="card-header border-bottom p-1" style="background-color: #f8f8f8">
          <div class="head-label">
            <h3 class="card-title" style="background-color: #f8f8f8; padding: 10px">
              <i class="fa-solid fa-chart-simple"></i>
              {{ $t("exception.statistics") }}
            </h3>
          </div>
        </div>

        <div class="card-body mt-2 dashboard_default module_summary" style="margin-bottom: -20px">
          <!-- Loading skeleton -->
          <div v-if="chartsLoading" class="row dashboard widget-grid justify-content-center">
            <div class="col-xl-4 col-md-6 col-sm-12 box-col-4" v-for="i in 3" :key="'skeleton-' + i">
              <div class="summary card total-earning exception-card" style="padding: 12px !important">
                <div class="card-body" style="padding: 12px !important">
                  <div class="exception-card-header">
                    <div class="skeleton-title"></div>
                  </div>
                  <div class="exception-chart-container">
                    <div class="skeleton-chart"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actual charts -->
          <div v-else class="row dashboard widget-grid justify-content-center">
            <div class="col-xl-4 col-md-6 col-sm-12 box-col-4" v-if="policyChart.series.reduce((a, b) => a + b, 0) > 0">
              <div class="summary card total-earning exception-card" style="padding: 12px !important">
                <div class="card-body" style="padding: 12px !important">
                  <div class="exception-card-header">
                    <h5 class="exception-title" style="
                        font-weight: 600;
                        font-size: 20px !important;
                        margin: 0;
                      ">
                      {{ $t("exception.policyexceptions") }}
                      <span class="exception-count badge">{{
                        exceptionCounts.policy || 0
                      }}</span>
                    </h5>
                  </div>
                  <div class="exception-chart-container">
                    <apexchart type="donut" width="100%" height="260" :options="policyChart.chartOptions"
                      :series="policyChart.series"></apexchart>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-md-6 col-sm-12 box-col-4"
              v-if="controlChart.series.reduce((a, b) => a + b, 0) > 0">
              <div class="summary card total-earning exception-card" style="padding: 12px !important">
                <div class="card-body" style="padding: 12px !important">
                  <div class="exception-card-header">
                    <h5 class="exception-title" style="
                        font-weight: 600;
                        font-size: 20px !important;
                        margin: 0;
                      ">
                      {{ $t("exception.controlexceptions") }}
                      <span class="exception-count badge">{{
                        exceptionCounts.control || 0
                      }}</span>
                    </h5>
                  </div>
                  <div class="exception-chart-container">
                    <apexchart type="donut" width="100%" height="260" :options="controlChart.chartOptions"
                      :series="controlChart.series"></apexchart>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-md-6 col-sm-12 box-col-4" v-if="riskChart.series.reduce((a, b) => a + b, 0) > 0">
              <div class="summary card total-earning exception-card" style="padding: 12px !important">
                <div class="card-body" style="padding: 12px !important">
                  <div class="exception-card-header">
                    <h5 class="exception-title" style="
                        font-weight: 600;
                        font-size: 20px !important;
                        margin: 0;
                      ">
                      {{ $t("exception.riskexceptions") }}
                      <span class="exception-count badge">{{
                        exceptionCounts.risk || 0
                      }}</span>
                    </h5>
                  </div>
                  <div class="exception-chart-container">
                    <apexchart type="donut" width="100%" height="260" :options="riskChart.chartOptions"
                      :series="riskChart.series"></apexchart>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs for Policy, Control, and Risk Exceptions -->
      <div class="custom-tabs">
        <ul class="nav nav-tabs mb-3" id="exceptionTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'policy' }" id="policy-tab"
              @click="handleTabChange('Policy')" type="button" role="tab" aria-controls="policy">
              {{ $t("exception.policyexceptions") }} ({{
                exceptionCounts.policy || 0
              }})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'control' }" id="control-tab"
              @click="handleTabChange('Control')" type="button" role="tab" aria-controls="control">
              {{ $t("exception.controlexceptions") }} ({{
                exceptionCounts.control || 0
              }})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'risk' }" id="risk-tab"
              @click="handleTabChange('Risk')" type="button" role="tab" aria-controls="risk">
              {{ $t("exception.riskexceptions") }} ({{
                exceptionCounts.risk || 0
              }})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'unapproved' }" id="unapproved-tab"
              @click="handleTabChange('Unapproved')" type="button" role="tab" aria-controls="unapproved">
              {{ $t("exception.unapprovedexception") }}
            </button>
          </li>
        </ul>
      </div>
      <div id="space"></div>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :filters="exceptionFilters" :hideActions="hideActions" :Statistics="openStatisticsModal"
        :hideStatisticsButton="true">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #requestor="{ item }">
          <div class="user-info">
            <div class="user-avatar" :title="getUserName(item.requestor_id)"
              @click="openViewUserModal(item.requestor_id)">
              {{ getUserInitials(getRequestorName(item?.requestor_id || "-")) }}
            </div>
            <span class="user-fullname">{{
              getRequestorName(item?.requestor_id) || "-"
            }}</span>
          </div>
        </template>

        <template #name="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            <span>
              <a style="color: #6e3894; cursor: pointer" href="javascript:void(0)" @click="openDetailsModal(item)"
                title="View Exception" class="dropdown-item">
                <span>
                  {{ item?.name }}
                </span>
              </a>
            </span>
          </div>
        </template>
        <template #duration="{ item }">
          {{ item.duration }} {{ $t("exception.days") }}
        </template>
        <template #type="{ item }">
          <span style="width: 60%" v-if="item.type == 1">
            {{ $t("exception.policy") }}
          </span>
          <span style="width: 60%" v-else-if="item.type == 2">
            {{ $t("exception.risk") }}
          </span>
          <span style="width: 60%" v-else-if="item.type == 3">
            {{ $t("exception.control") }}
          </span>
        </template>

        <template #status="{ item }">
          <span style="width: 70%" v-if="item.status === 'Pending'" class="badge text-bg-warning text-dark">
            {{ $t("exception.pending") }}
          </span>
          <span style="width: 70%" v-else-if="item.status === 'Approved'" class="badge text-bg-success text-light">
            {{ $t("exception.approved") }}
          </span>
          <span style="width: 70%" v-else class="badge text-bg-danger text-light">
            {{ $t("exception.rejected") }}
          </span>
        </template>

        <template #addAction="{ item }">
          <v-list-item v-anyPermission="['changeStatus']" v-if="
            ((item.type == '1' &&
              this.acceptors.policy_acceptor_id == this.userID) ||
              (item.type == '2' &&
                this.acceptors.risk_acceptor_id == this.userID) ||
              (item.type == '3' &&
                this.acceptors.control_acceptor_id == this.userID)) &&
            item.status == 'Pending'
          " @click="openModal(item)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-autorenew</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("exception.changestatus") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <div class="create-exception-modal">
        <div class="create-modal-header">
          <h5 class="modal-title" style="font-weight: 600; font-size: 25px; color: #000000">
            New Exception
          </h5>
          <button @click="closeForm" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="create-modal-body">
          <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
            <template #policy_id="{ item }">
              <div v-show="isPolicySelected" class="col-md-12 mb-3 position-relative">
                <label for="policy">{{ $t("exception.policy") }}</label>
                <LazySelectField name="policy" v-model="newItem.policy" :placeholder="$t('exception.selectpolicy') || 'Select a policy'
                  " options="Document" option-label="name" option-value="id" />
              </div>
            </template>
            <template #risk="{ item }">
              <div v-show="isRiskSelected" class="col-md-12 mb-3 position-relative">
                <label for="risk">{{ $t("exception.risk") }}</label>
                <LazySelectField name="risk" v-model="newItem.risk"
                  :placeholder="$t('exception.selectrisk') || 'Select a risk'" options="Risk" option-label="subject"
                  option-value="id" />
              </div>
            </template>

            <template #regulator_id="{ item }">
              <div v-show="isRegulatorSelected" class="col-md-4 mb-3">
                <label for="regulator">{{ $t("exception.regulator") }}</label>
                <LazySelectField name="regulator" v-model="newItem.regulator" :placeholder="$t('exception.selectregulator') || 'Select a regulator'
                  " :options="regulatorList" option-label="name" option-value="id" :on-update="onRegulatorChange" />
              </div>
            </template>

            <!-- Framework Select -->
            <template #framework_id="{ item }">
              <div v-show="isRegulatorSelected" class="col-md-4 mb-3">
                <label for="framework">{{ $t("exception.framework") }}</label>
                <LazySelectField ref="frameworkSelect" name="framework" v-model="newItem.framework"
                  :placeholder="$t('exception.selectframework') || 'Select a framework'" options="Frameworks"
                  option-label="title" option-value="id" :disabled="isFrameworkDisabled" :on-update="onFrameworkChange"
                  :api-params="frameworkApiParams" :per-page="10" @open="onFrameworkSelectOpen" />
              </div>
            </template>

            <!-- Control Select -->
            <template #control="{ item }">
              <div v-show="isRegulatorSelected" class="col-md-4 mb-3">
                <label for="control">{{ $t("exception.control") }}</label>
                <LazySelectField ref="controlSelect" name="control" v-model="newItem.control"
                  :placeholder="$t('exception.selectcontrol') || 'Select a control'" options="Control"
                  option-label="long_name" option-value="id" :disabled="isControlDisabled"
                  :api-params="controlApiParams" :per-page="10" @open="onControlSelectOpen" />
              </div>
            </template>

            <!-- <template #description="{ item }">
              <div class="col-lg-12">
                <div class="form-group">
                  <label for="description">{{
                    $t("exception.description")
                  }}</label>
                  <textarea
                    id="description"
                    class="form-control form-textarea"
                    v-model="newItem.description"
                    rows="4"
                    placeholder=""
                  ></textarea>
                </div>
              </div>
            </template> -->

            <!-- <template #justification="{ item }">
              <div class="col-lg-12">
                <div class="form-group">
                  <label for="justification">{{
                    $t("exception.justification")
                  }}</label>
                  <textarea
                    id="justification"
                    class="form-control form-textarea"
                    v-model="newItem.justification"
                    rows="4"
                    placeholder=""
                  ></textarea>
                </div>
              </div>
            </template> -->
          </Form>
        </div>
      </div>
    </template>
  </main-page>

  <!-- Accept or Reject Modal -->
  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content approval-modal">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("exception.exceptionapproval") }}</h5>
        <button @click="closeModal" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="modal-body" style="background-color: #f8f8f8">
        <div class="row mb-3 justify-content-center">
          <div class="col-md-12" style="
              background: white;
              /* height: 120px; */
              padding: 20px;
              border-radius: 10px;
            ">
            <label for="exception-status">{{
              $t("exception.changestatus")
            }}</label>
            <LazySelectField name="exception-status" v-model="selectedAction"
              :placeholder="$t('exception.select') || 'Select'" :options="[
                { id: 'Approved', name: $t('exception.accept') },
                { id: 'Rejected', name: $t('exception.reject') },
              ]" option-label="name" option-value="id" :clearable="false" />

            <!-- Show CKEditor only if "Reject" is selected -->
            <div v-show="selectedAction === 'Rejected'" class="mt-3">
              <label for="rejectionReason">{{
                $t("exception.rejectionreason")
              }}</label>
              <ckeditor :editor="editor" v-model="rejectionReason" :config="editorConfig"></ckeditor>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" type="button" @click="closeModal">
            {{ $t("exception.cancel") }}
          </button>
          <button v-permission:changeStatus @click="
            takeAction(selectedExceptionId, selectedAction, rejectionReason)
            " class="btn btn-save" type="submit" :disabled="!selectedAction">
            {{ $t("exception.save") }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Details Modal -->
  <div v-if="isDetailsModalOpen" class="modal-overlay" @click.self="closeDetailsModal">
    <div class="modal-content details-modal" style="max-height: 85vh">
      <div class="modal-header">
        <h5 class="modal-title text-truncate" style="max-width: 80%">
          Exception Details
        </h5>
        <button @click="closeDetailsModal" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="modal-body" style="background-color: #f8f8f8">
        <div class="details-card">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="details-label">
                {{ $t("exception.exceptionname") }} :
              </div>
              <div class="details-value">{{ this.exceptionData.name }}</div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="details-label">
                {{ $t("exception.exceptiontype") }} :
              </div>
              <div class="details-value">
                <span v-if="this.exceptionData.type == 1">{{
                  $t("exception.policyexception")
                }}</span>
                <span v-else-if="this.exceptionData.type == 2">{{
                  $t("exception.riskexception")
                }}</span>
                <span v-else-if="this.exceptionData.type == 3">{{
                  $t("exception.controlexception")
                }}</span>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <div class="details-label">{{ $t("exception.status") }} :</div>
              <div class="details-value">
                <span v-if="this.exceptionData.status === 'Pending'" class="status-badge pending">{{
                  $t("exception.pending") }}</span>
                <span v-else-if="this.exceptionData.status === 'Rejected'" class="status-badge rejected">{{
                  $t("exception.rejected") }}</span>
                <span v-else-if="this.exceptionData.status === 'Approved'" class="status-badge approved">{{
                  $t("exception.approved") }}</span>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="details-label">
                {{ $t("exception.stakeholders") }} :
              </div>
              <div class="details-value d-flex align-items-center">
                <span v-for="(user, idx) in getStakeholderUsers(
                  exceptionData.stakeholder_ids
                ).slice(0, 3)" :key="user.id" class="avatar-chip" :style="{ backgroundColor: getChipColor(idx) }">{{
                    getInitials(user.full_name) }}</span>
                <span v-if="
                  getStakeholderUsers(exceptionData.stakeholder_ids).length >
                  3
                " class="avatar-plus">+{{
                    getStakeholderUsers(exceptionData.stakeholder_ids).length -
                    3
                  }}</span>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <div class="details-label">{{ $t("exception.createdat") }} :</div>
              <div class="details-value">
                {{ formatCreatedDate(this.exceptionData.created_at) }}
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="details-label">
                {{ $t("exception.lastupdate") }} :
              </div>
              <div class="details-value">
                {{ formatCreatedDate(this.exceptionData.updated_at) }}
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <div class="details-label">
                {{ $t("exception.exceptionduration") }} :
              </div>
              <div class="details-value">
                {{ this.exceptionData.duration }} {{ $t("exception.days") }}
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="details-label">
                {{ $t("exception.description") }} :
              </div>
              <div class="details-value truncate-purple">
                {{ stripHtmlTags(this.exceptionData.description) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Existing Comments Display -->
        <div class="details-card mt-3" v-if="comments.length > 0">
          <label class="details-label" style="margin-bottom: 12px">
            <i class="fa-regular fa-comments"></i>
            {{ $t("exception.comments") || "Comments" }} ({{ comments.length }})
          </label>
          <div class="comments-container">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header rtl">
                <div class="comment-author rtl">
                  <span class="author-avatar">
                    {{ getInitials(comment.user?.full_name || "Unknown") }}
                  </span>
                  <div class="author-info">
                    <strong>{{ comment.user?.full_name || "Unknown" }}</strong>
                    <small class="text-muted">{{
                      formatCommentDate(comment.created_at)
                    }}</small>
                  </div>
                </div>
                <div class="comment-actions" v-if="comment.user_id === userID">
                  <i class="fa fa-edit text-primary" style="cursor: pointer" @click="startEditing(comment)"
                    title="Edit"></i>
                  <i class="fa fa-trash text-danger" style="cursor: pointer" @click="deleteComment(comment.id)"
                    title="Delete"></i>
                </div>
              </div>

              <!-- Comment Content (view mode) -->
              <div v-if="editingCommentId !== comment.id" class="comment-content">
                {{ comment.content }}
              </div>

              <!-- Comment Content (edit mode) -->
              <div v-else class="comment-edit-form">
                <textarea v-model="editingCommentContent" class="form-control" rows="2" style="resize: none"></textarea>
                <div class="d-flex justify-content-end gap-2 mt-2">
                  <button type="button" class="btn btn-sm btn-cancel" @click="cancelEditing">
                    Cancel
                  </button>
                  <button type="button" class="btn btn-sm btn-save" @click="updateComment(comment.id)">
                    Save
                  </button>
                </div>
              </div>

              <!-- Replies Section -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="comment-header">
                    <div class="comment-author">
                      <span class="author-avatar author-avatar-small">
                        {{ getInitials(reply.user?.full_name || "Unknown") }}
                      </span>
                      <div class="author-info">
                        <strong>{{
                          reply.user?.full_name || "Unknown"
                        }}</strong>
                        <small class="text-muted">{{
                          formatCommentDate(reply.created_at)
                        }}</small>
                      </div>
                    </div>
                    <div class="comment-actions" v-if="reply.user_id === userID">
                      <i class="fa fa-edit text-primary" style="cursor: pointer" @click="startEditing(reply)"
                        title="Edit"></i>
                      <i class="fa fa-trash text-danger" style="cursor: pointer" @click="deleteComment(reply.id)"
                        title="Delete"></i>
                    </div>
                  </div>

                  <!-- Reply Content (view mode) -->
                  <div v-if="editingCommentId !== reply.id" class="comment-content">
                    {{ reply.content }}
                  </div>

                  <!-- Reply Content (edit mode) -->
                  <div v-else class="comment-edit-form">
                    <textarea v-model="editingCommentContent" class="form-control" rows="2"
                      style="resize: none"></textarea>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                      <button type="button" class="btn btn-sm btn-cancel" @click="cancelEditing">
                        Cancel
                      </button>
                      <button type="button" class="btn btn-sm btn-save" @click="updateComment(reply.id)">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reply Form -->
              <div v-if="replyingTo === comment.id" class="reply-form">
                <textarea v-model="newReply" class="form-control" rows="2" placeholder="Write a reply..."
                  style="resize: none"></textarea>
                <div class="d-flex justify-content-end gap-2 mt-2">
                  <button type="button" class="btn btn-sm btn-cancel" @click="toggleReplyForm(null)">
                    Cancel
                  </button>
                  <button type="button" class="btn btn-sm btn-save" @click="submitReply(comment.id)">
                    Reply
                  </button>
                </div>
              </div>

              <!-- Reply Button -->
              <button v-else type="button" class="btn btn-sm btn-link reply-button"
                @click="toggleReplyForm(comment.id)">
                <i class="fa fa-reply"></i> Reply
              </button>
            </div>
          </div>
        </div>

        <!-- Post Comment Form -->
        <div class="details-card mt-3">
          <label class="details-label" style="margin-bottom: 8px">
            <i class="fa-regular fa-comment"></i>
            {{ $t("exception.postcomment") }}</label>
          <form @submit.prevent="submitComment">
            <textarea v-model="newComment" class="form-control details-textarea" rows="3" required
              style="resize: none"></textarea>
            <div class="d-flex justify-content-end mt-3">
              <button type="submit" class="btn btn-save">
                {{ $t("exception.comment") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- View User Details Modal -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event" />
</template>

<script>
// Importing necessary components and API modules
import exception from "@/API/Exception/Exception";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import VueApexCharts from "vue3-apexcharts";
import regulatorApi from "@/API/Regulator/Regulator";
import riskApi from "@/API/Risk/Risk";
import policyApi from "@/API/Document/Document";
import frameworkApi from "@/API/Frameworks/Frameworks";
import controlApi from "@/API/Control/Control";
import VueSelect from "vue-select";
import userApi from "@/API/User/User";
import departmentApi from "@/API/Department/Department";
import ExceptionSetting from "@/API/ExceptionSetting/ExceptionSetting";
import Comment from "@/API/comment/comment";
import Auth from "@/API/Auth";
import { notify } from "@kyvg/vue3-notification";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    apexchart: VueApexCharts,
    "vue-select": VueSelect,
    PurpleDotsLoader,
    ViewUserDetails,
    LazySelectField,
  },

  setup() {
    const api = new exception();
    const ExceptionSettingApi = new ExceptionSetting();
    const apiParams = {
      filter: "type|1|=",
      filterIn: "",
    };
    const tableColumns = [];
    const fromFields = [];
    const regulator = new regulatorApi();
    const framework = new frameworkApi();
    const control = new controlApi();
    const usersList = new userApi();
    const departmentsList = new departmentApi();
    const risk = new riskApi();
    const policy = new policyApi();
    const commentApi = new Comment();

    return {
      api,
      ExceptionSettingApi,
      apiParams,
      tableColumns,
      fromFields,
      regulator,
      risk,
      policy,
      framework,
      control,
      usersList,
      departmentsList,
      commentApi,
    };
  },

  async mounted() {
    try {
      this.$nextTick(() => {
        this.frameworkSelectRef = this.$refs.frameworkSelect;
        this.controlSelectRef = this.$refs.controlSelect;
      });
      // Fetch all data in parallel for better performance
      const [policyCounts, controlCounts, riskCounts] = await Promise.all([
        this.fetchRegulators(),
        this.fetchUsers(),
        this.fetchRisks(),
        this.getAcceptors(),
        this.fetchPolicies(),
        this.getPolicyExceptions(),
        this.getControlExceptions(),
        this.getRiskExceptions(),
      ]).then((results) => {
        // Return only the last 3 results (exception counts)
        return results.slice(-3);
      });

      // Update all charts and counts using the new helper method
      this.updateChartData(policyCounts, controlCounts, riskCounts);
      await this.fetchStatisticsData();
      this.load = false;
    } catch (error) {
      console.error("Error loading exception data:", error);
      this.chartsLoading = false;
    }
  },

  data() {
    return {
      load: true,
      frameworkSelectRef: null,
      controlSelectRef: null,
      filteredFrameworks: [],
      frameworkPage: 1,
      frameworkLoading: false,
      hasMoreFrameworks: false,
      frameworkSearchTimeout: null,

      // Control pagination
      filteredControls: [],
      controlPage: 1,
      controlLoading: false,
      hasMoreControls: false,
      controlSearchTimeout: null,
      chartsLoading: true,
      filter: {
        type: "1", // Initialize with Policy type
        framework: "",
        status: "",
      },
      exceptionFilters: [
        {
          title: "Status",
          key: "status",
          type: "string",
          data: [
            { id: "Pending", name: "Pending" },
            { id: "Approved", name: "Approved" },
            { id: "Rejected", name: "Rejected" },
          ],
        },
        {
          title: "Type",
          key: "type",
          type: "string",
          data: [
            { id: "1", name: "Policy" },
            { id: "2", name: "Risk" },
            { id: "3", name: "Control" },
          ],
        },
        {
          title: "Framework",
          key: "framework",
          type: "string",
          data: {
            model: "Frameworks",
            id: "id",
            display: "title",
          },
          filterType: "filter",
        },

        {
          title: "Control",
          key: "control",
          type: "string",
          data: {
            model: "Control",
            id: "id",
            display: "short_name",
          },
          filterType: "filter",
        },

        {
          title: "Policy",
          key: "policy",
          type: "string",
          data: {
            model: "Document",
            id: "id",
            display: "name",
          },
          filterType: "filter",
        },

        {
          title: "Risk",
          key: "risk",
          type: "string",
          data: {
            model: "Risk",
            id: "id",
            display: "subject",
          },
          filterType: "filter",
        },
      ],
      activeTab: "policy",
      exceptionCounts: {
        policy: 0,
        control: 0,
        risk: 0,
        unapproved: 0,
      },
      acceptors: {},
      userID: null,
      userList: [],
      isFrameworkDisabled: true,
      isControlDisabled: true,
      filteredFrameworks: [],
      filteredControls: [],
      policyChart: {
        series: [0, 0, 0],
        chartOptions: {
          chart: {
            type: "donut",
            width: 260,
          },
          labels: [
            this.$t("exception.approved"),
            this.$t("exception.rejected"),
            this.$t("exception.pending"),
          ],
          colors: ["#255F0B", "#A92525", "#C4951B"],
          plotOptions: {
            pie: {
              donut: {
                size: "0%",
              },
              dataLabels: {
                enabled: false,
              },
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              colors: ["#fff"],
            },
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "12px",
            markers: {
              width: 8,
              height: 8,
              radius: 0,
            },
            itemMargin: {
              horizontal: 10,
              vertical: 5,
            },
          },
        },
      },
      controlChart: {
        series: [0, 0, 0],
        chartOptions: {
          chart: {
            type: "donut",
            width: 260,
          },
          labels: [
            this.$t("exception.approved"),
            this.$t("exception.rejected"),
            this.$t("exception.pending"),
          ],
          colors: ["#255F0B", "#A92525", "#C4951B"],
          plotOptions: {
            pie: {
              donut: {
                size: "0%",
              },
              dataLabels: {
                enabled: false,
              },
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              colors: ["#fff"],
            },
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "12px",
            markers: {
              width: 8,
              height: 8,
              radius: 0,
            },
            itemMargin: {
              horizontal: 10,
              vertical: 5,
            },
          },
        },
      },
      riskChart: {
        series: [0, 0, 0],
        chartOptions: {
          chart: {
            type: "donut",
            width: 260,
          },
          labels: [
            this.$t("exception.approved"),
            this.$t("exception.rejected"),
            this.$t("exception.pending"),
          ],
          colors: ["#255F0B", "#A92525", "#C4951B"],
          plotOptions: {
            pie: {
              donut: {
                size: "0%",
              },
              dataLabels: {
                enabled: false,
              },
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              colors: ["#fff"],
            },
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "12px",
            markers: {
              width: 8,
              height: 8,
              radius: 0,
            },
            itemMargin: {
              horizontal: 10,
              vertical: 5,
            },
          },
        },
      },
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      icon_path: null,
      translateFields: [],
      fields: [],
      exceptionData: [],
      show: false,
      id: Number,
      isFlipped: false,
      isReadonly: false,
      newItem: {
        type: null,
        regulator: null,
        framework: null,
        control: null,
      },
      policies: [],
      users: [],
      isModalOpen: false,
      isDetailsModalOpen: false,
      selectedExceptionId: null,
      selectedAction: null,
      rejectionReason: null,
      regulatorList: [],
      frameworkList: [],
      controlList: [],
      userList: [],
      riskList: [],
      policyList: [],
      comments: [], // Store comments for the exception
      newComment: "", // Store new comment input
      editingCommentId: null, // Track comment/reply being edited
      editingCommentContent: "", // Store edited content
      currentPage: 1,
      perPage: 10,
      replyingTo: null, // Track which comment is being replied to
      newReply: "", // Store reply content
      // User Details Modal Data
      viewUserModal: false,
      userData: {},
      departmentList: [],
      // Statistics Modal Data
      isStatisticsModalOpen: false,
      statisticsLoading: false,
      statisticsData: {
        totalExceptions: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalPending: 0,
        policyExceptions: 0,
        controlExceptions: 0,
        riskExceptions: 0,
      },
      overallStatusChartSeries: [],
      overallStatusChartOptions: {
        chart: {
          type: "pie",
        },
        labels: [
          this.$t("exception.approved"),
          this.$t("exception.rejected"),
          this.$t("exception.pending"),
        ],
        colors: ["#255F0B", "#A92525", "#C4951B"],
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val.toFixed(1) + "%";
          },
        },
      },
      typeDistributionChartSeries: [],
      typeDistributionChartOptions: {
        chart: {
          type: "pie",
        },
        labels: [
          this.$t("exception.policy"),
          this.$t("exception.control"),
          this.$t("exception.risk"),
        ],
        colors: ["#6e3894", "#255F0B", "#C4951B"],
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: true,
        },
      },
      statusByTypeChartSeries: [],
      statusByTypeChartOptions: {
        chart: {
          type: "bar",
          stacked: true,
        },
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        xaxis: {
          categories: [
            this.$t("exception.policy"),
            this.$t("exception.control"),
            this.$t("exception.risk"),
          ],
        },
        colors: ["#255F0B", "#A92525", "#C4951B"],
        legend: {
          position: "bottom",
        },
      },
      durationChartSeries: [],
      durationChartOptions: {
        chart: {
          type: "bar",
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          categories: [
            this.$t("exception.policy"),
            this.$t("exception.control"),
            this.$t("exception.risk"),
          ],
        },
        colors: ["#255F0B"],
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val + " days";
          },
        },
      },
      monthlyTrendChartSeries: [],
      monthlyTrendChartOptions: {
        chart: {
          type: "line",
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        xaxis: {
          categories: [],
        },
        colors: ["#6e3894", "#255F0B", "#C4951B"],
        legend: {
          position: "bottom",
        },
      },
      departmentChartSeries: [],
      departmentChartOptions: {
        chart: {
          type: "bar",
          stacked: false,
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {},
          },
        },
        xaxis: {
          categories: [],
        },
        colors: ["#6e3894"],
        dataLabels: {
          enabled: true,
          offsetX: 30,
          style: {
            fontSize: "12px",
            colors: ["#333"],
          },
        },
        legend: {
          position: "bottom",
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " exceptions";
            },
          },
        },
      },
    };
  },

  computed: {

    frameworkApiParams() {
      if (this.newItem.regulator) {
        return {
          filter: `regulator_id|${this.newItem.regulator}|=`,
          perPage: 10
        };
      }
      return { perPage: 10 };
    },

    controlApiParams() {
      if (this.newItem.framework) {
        return {
          filter: `framework_id|${this.newItem.framework}|=`,
          perPage: 10
        };
      }
      return { perPage: 10 };
    },
    hideActions() {
      return (row) => {
        const loggedInUser = Auth.USER;
        return {
          edit: row.requestor_id != loggedInUser.id || row.status != "Pending",
          delete:
            row.requestor_id != loggedInUser.id || row.status != "Pending",
        };
      };
    },
    isPolicySelected() {
      return this.newItem.type === 1;
    },
    isRiskSelected() {
      return this.newItem.type === 2;
    },
    isRegulatorSelected() {
      return this.newItem.type === 3;
    },
    isFrameworkDisabled() {
      return !this.newItem.regulator;
    },
    isControlDisabled() {
      return !this.newItem.framework;
    },
    paginatedComments() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.comments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.comments.length / this.perPage) || 1;
    },
  },

  watch: {
    "newItem.type": function (newType) {
      if (newType !== 3) {
        this.newItem.regulator = null;
        this.newItem.framework = null;
        this.newItem.control = null;
        this.isFrameworkDisabled = true;
        this.isControlDisabled = true;
        this.filteredFrameworks = [];
        this.filteredControls = [];
      }
      if (newType != 2) {
        this.newItem.risk = null;
      }
      if (newType != 1) {
        this.newItem.policy = null;
      }
    },
    filter: {
      deep: true,
      handler(newFilter) {
        // Build query params deterministically to avoid stale state
        const nextParams = { filter: "", filterIn: "" };
        const filters = [];
        if (newFilter.type) {
          filters.push(`type|${newFilter.type}|=`);
        }
        if (newFilter.status) {
          const statuses = newFilter.status.split(",");
          if (statuses.length > 1) {
            nextParams.filterIn = `status|${statuses}|=`;
          } else {
            filters.push(`status|${newFilter.status}|=`);
          }
        }
        nextParams.filter = filters.join(",");
        this.apiParams = Object.assign({}, this.apiParams, nextParams);
        this.$nextTick(() => this.$refs.table.refreshTable());
      },
    },
  },

  created() {
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("exception.exceptionname"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "requestor",
        title: this.$t("exception.requestor"),
        data: "_USERSERVICE.User.requestor_id.full_name",
        defaultContent: "N/A",
      },
      {
        id: "duration",
        title: this.$t("exception.exceptionduration"),
        data: "duration",
        defaultContent: "N/A",
      },
      {
        id: "type",
        title: this.$t("exception.exceptiontype"),
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("exception.status"),
        data: "status",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("exception.exceptionname"),
        type: "text",
        rules: "required",
        description: "",
        col: 6,
      },
      {
        type: "options",
        name: "type",
        label: this.$t("exception.exceptiontype"),
        options: [
          { id: 1, name: this.$t("exception.policy") },
          { id: 2, name: this.$t("exception.risk") },
          { id: 3, name: this.$t("exception.control") },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",
        placeholder: this.$t("exception.exceptiontype"),
      },
      {
        type: "hidden",
        name: "policy_id",
        label: this.$t(""),
        options: [],
        optionLabel: "name",
        col: 12,
        rules: "",
        description: "",
      },
      {
        type: "hidden",
        name: "risk",
        label: this.$t(""),
        options: [],
        optionLabel: "name",
        col: 12,
        rules: "",
        description: "",
      },
      {
        type: "hidden",
        name: "regulator_id",
        label: this.$t("exception.regulator"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: this.$t("exception.select_a_regulator"),
      },
      {
        type: "hidden",
        name: "framework_id",
        label: this.$t("exception.framework"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: "",
      },
      {
        type: "hidden",
        name: "control",
        label: this.$t("exception.control"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: "",
      },
      {
        type: "user-select",
        name: "stakeholder_ids",
        label: this.$t("exception.stakeholders"),
        options: [],
        multiple: true,
        optionLabel: "full_name",
        col: 12,
        rules: "required",
        description: "",
      },
      {
        name: "duration",
        label: this.$t("exception.duration"),
        type: "number",
        rules: "required",
        description: "",
        col: 12,
        placeholder: this.$t("exception.duration"),
      },
      {
        name: "description",
        label: this.$t("exception.description"),
        type: "textarea",
        rules: "",
        description: "",
        col: 12,
      },
      {
        name: "justification",
        label: this.$t("exception.justification"),
        type: "textarea",
        rules: "",
        description: "",
        col: 12,
      },
      {
        name: "requestor_id",
        label: "",
        type: "hidden",
        rules: "",
        description: "",
        col: 12,
      },
    ];
  },

  methods: {
    getPercentage(value) {
      const numValue = Number(value) || 0;
      const numTotal = Number(this.statisticsData.totalExceptions) || 0;

      if (numTotal === 0) {
        return "0.0";
      }

      return ((numValue / numTotal) * 100).toFixed(1);
    },

    calculateChartSeries(approved, rejected, pending) {
      const total = approved + rejected + pending;
      if (total === 0) return [0, 0, 0];

      return [
        Math.round((approved / total) * 1000) / 10,
        Math.round((rejected / total) * 1000) / 10,
        Math.round((pending / total) * 1000) / 10,
      ];
    },

    updateChartData(policyCounts, controlCounts, riskCounts) {
      // Update exception counts
      this.exceptionCounts = {
        policy:
          policyCounts.approved + policyCounts.rejected + policyCounts.pending,
        control:
          controlCounts.controlApproved +
          controlCounts.controlRejected +
          controlCounts.controlPending,
        risk:
          riskCounts.riskApproved +
          riskCounts.riskRejected +
          riskCounts.riskPending,
        unapproved:
          policyCounts.pending +
          controlCounts.controlPending +
          riskCounts.riskPending,
      };

      // Update chart series
      this.policyChart.series = this.calculateChartSeries(
        policyCounts.approved,
        policyCounts.rejected,
        policyCounts.pending
      );

      this.controlChart.series = this.calculateChartSeries(
        controlCounts.controlApproved,
        controlCounts.controlRejected,
        controlCounts.controlPending
      );

      this.riskChart.series = this.calculateChartSeries(
        riskCounts.riskApproved,
        riskCounts.riskRejected,
        riskCounts.riskPending
      );

      this.chartsLoading = false;
    },

    getUserName(userId) {
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },

    getUserInitials(fullName) {
      if (!fullName) return "?!";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      // Get first letter of first name and first letter of last name
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    },
    getStakeholderUsers(stakeholderIds) {
      if (!Array.isArray(stakeholderIds)) return [];
      return stakeholderIds
        .map((id) => this.userList.find((u) => u.id === id))
        .filter(Boolean);
    },
    getInitials(fullName) {
      if (!fullName) return "";
      const parts = fullName.trim().split(/\s+/);
      const first = parts[0] ? parts[0][0] : "";
      const last = parts[1] ? parts[1][0] : "";
      return (first + last).toUpperCase();
    },
    getChipColor(index) {
      const colors = ["#7b61ff", "#f5c542", "#5abf66", "#ff6b6b"]; // purple, yellow, green, red
      return colors[index % colors.length];
    },
    isOverdue(createdAt, duration) {
      const today = new Date();
      const created = new Date(createdAt);
      const dueDate = new Date(created);
      dueDate.setDate(created.getDate() + duration);
      console.log("today", today > dueDate);
      return today > dueDate;
    },
    getRequestorName(userId) {
      const requester = this.userList.find((user) => user.id === userId);
      return requester ? requester.full_name : "";
    },
    openViewUserModal(userId) {
      if (!userId) return;
      const user = this.userList.find((u) => u.id === userId);
      if (user) {
        const dept = this.departmentList.find(
          (d) => d.id === user.department_id
        );
        this.userData = {
          ...user,
          department: dept ? dept.name : "N/A",
        };
        this.viewUserModal = true;
      }
    },
    formatCreatedDate(date) {
      if (!date) return "N/A";
      return new Date(date)
        .toLocaleString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", "");
    },
    formatCommentDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },
    async deleteItem(data) {
      await this.api.delete(0, [data.id].map(String));
      this.$refs.table.refreshTable();
      this.refreshCharts();
      this.refreshExceptionCounts();
    },
    async refreshCharts() {
      try {
        // Fetch all exception counts in parallel
        const [policyCounts, controlCounts, riskCounts] = await Promise.all([
          this.getPolicyExceptions(),
          this.getControlExceptions(),
          this.getRiskExceptions(),
        ]);

        // Update charts using the helper method
        this.updateChartData(policyCounts, controlCounts, riskCounts);
      } catch (error) {
        console.error("Error refreshing charts:", error);
      }
    },
    async refreshExceptionCounts() {
      try {
        // Fetch all exception counts in parallel
        const [policyCounts, controlCounts, riskCounts] = await Promise.all([
          this.getPolicyExceptions(),
          this.getControlExceptions(),
          this.getRiskExceptions(),
        ]);

        // Update exception counts
        this.exceptionCounts = {
          policy:
            policyCounts.approved +
            policyCounts.rejected +
            policyCounts.pending,
          control:
            controlCounts.controlApproved +
            controlCounts.controlRejected +
            controlCounts.controlPending,
          risk:
            riskCounts.riskApproved +
            riskCounts.riskRejected +
            riskCounts.riskPending,
          unapproved:
            policyCounts.pending +
            controlCounts.controlPending +
            riskCounts.riskPending,
        };
      } catch (error) {
        console.error("Error refreshing exception counts:", error);
      }
    },
    getStakeholderNames(stakeholderIds) {
      if (!stakeholderIds || !Array.isArray(stakeholderIds))
        return "No stakeholders";
      return stakeholderIds
        .map((id) => {
          const user = this.userList.find((user) => user.id === id);
          return user ? user.full_name : "";
        })
        .filter((name) => name)
        .join(", ");
    },
    handleTabChange(tabType) {
      this.activeTab = tabType.toLowerCase();
      switch (this.activeTab) {
        case "policy":
          this.filter = {
            type: "1",
            status: "",
          };
          break;
        case "control":
          this.filter = {
            type: "3",
            status: "",
          };
          break;
        case "risk":
          this.filter = {
            type: "2",
            status: "",
          };
          break;
        case "unapproved":
          this.filter = {
            status: "Pending,Rejected",
            type: "",
          };
          break;
      }
      // Refresh will be triggered by the watcher on `filter`
    },
    onRegulatorChange() {
      this.newItem.framework = null;
      this.newItem.control = null;

      // Trigger reload when dropdown opens
      if (this.$refs.frameworkSelect) {
        this.$nextTick(() => {
          // The computed property will automatically update
          // We need to trigger a reload
          if (this.newItem.regulator) {
            this.$refs.frameworkSelect.loadOptions(true);
          }
        });
      }

      // Clear control select
      if (this.$refs.controlSelect) {
        this.$refs.controlSelect.internalOptions = [];
        this.$refs.controlSelect.currentPage = 1;
      }
    },

    onFrameworkChange() {
      this.newItem.control = null;

      // Trigger reload when dropdown opens
      if (this.$refs.controlSelect && this.newItem.framework) {
        this.$nextTick(() => {
          this.$refs.controlSelect.loadOptions(true);
        });
      }
    },

    onFrameworkSelectOpen() {
      // Reset and reload frameworks when dropdown opens
      if (this.$refs.frameworkSelect && this.newItem.regulator) {
        this.$nextTick(() => {
          this.$refs.frameworkSelect.loadOptions(true);
        });
      }
    },

    onControlSelectOpen() {
      // Reset and reload controls when dropdown opens
      if (this.$refs.controlSelect && this.newItem.framework) {
        this.$nextTick(() => {
          this.$refs.controlSelect.loadOptions(true);
        });
      }
    },
    async fetchRegulators() {
      this.regulatorList = await this.regulator.getAll({ select: "id|name" });
    },

    async fetchFrameworksByRegulator(regulatorId) {
      // This is now handled by LazySelectField
      if (regulatorId) {
        // Just update the API params if needed
        if (this.$refs.frameworkSelect) {
          this.$refs.frameworkSelect.apiParams = {
            filter: `regulator_id|${regulatorId}|=`,
            perPage: 10
          };
        }
      }
    },

    async loadMoreFrameworks() {
      if (this.hasMoreFrameworks && !this.frameworkLoading) {
        this.frameworkPage++;
        await this.fetchFrameworksByRegulator(this.newItem.regulator);
      }
    },

    async searchFrameworks(searchQuery) {
      // Debounce search
      clearTimeout(this.frameworkSearchTimeout);
      this.frameworkSearchTimeout = setTimeout(() => {
        this.fetchFrameworksByRegulator(
          this.newItem.regulator,
          true,
          searchQuery
        );
      }, 300);
    },

    async fetchControlsByFramework(frameworkId) {
      // This is now handled by LazySelectField
      if (frameworkId && this.$refs.controlSelect) {
        this.$refs.controlSelect.apiParams = {
          filter: `framework_id|${frameworkId}|=`,
          perPage: 10
        };
      }
    },

    onFrameworkSelectOpen() {
      // Reset and reload frameworks when dropdown opens
      if (this.$refs.frameworkSelect) {
        this.$nextTick(() => {
          this.$refs.frameworkSelect.loadOptions(true);
        });
      }
    },

    onControlSelectOpen() {
      // Reset and reload controls when dropdown opens
      if (this.$refs.controlSelect && this.newItem.framework) {
        this.$nextTick(() => {
          this.$refs.controlSelect.loadOptions(true);
        });
      }
    },

    async loadMoreControls() {
      if (this.hasMoreControls && !this.controlLoading) {
        this.controlPage++;
        await this.fetchControlsByFramework(this.newItem.framework);
      }
    },

    async searchControls(searchQuery) {
      clearTimeout(this.controlSearchTimeout);
      this.controlSearchTimeout = setTimeout(() => {
        this.fetchControlsByFramework(
          this.newItem.framework,
          true,
          searchQuery
        );
      }, 300);
    },
    async fetchRisks() {
      this.riskList = await this.risk.getAll({ select: "id|subject" });
      this.fromFields.find((field) => field.name === "risk").options =
        this.riskList;
    },
    async fetchPolicies() {
      this.policyList = await this.policy.getAll({ select: "id|name" });
    },
    async fetchFrameworks() {
      const response = await this.framework.getAll({
        select: "id|title|regulator_id",
      });
      this.frameworkList = response;
    },
    async fetchControls() {
      const response = await this.control.getAll({
        select: "id|long_name|framework_id",
      });
      this.controlList = response;
    },
    async getPolicyExceptions() {
      try {
        const response = await this.api.getPolicyExceptions();
        if (response.pending || response.approved || response.rejected) {
          return {
            approved: response.approved || 0,
            rejected: response.rejected || 0,
            pending: response.pending || 0,
          };
        } else {
          return { approved: 0, rejected: 0, pending: 0 };
        }
      } catch (error) {
        console.error("Error fetching policy exceptions:", error);
        return { approved: 0, rejected: 0, pending: 0 };
      }
    },
    async getAcceptors() {
      try {
        const response = await this.ExceptionSettingApi.getAll();
        const exceptionSettingData = response.find(
          (item) => item.type === "exceptions"
        );
        this.acceptors = exceptionSettingData;
        this.userID = Auth.USER.id;
      } catch (error) {
        console.error("Error fetching acceptors:", error);
      }
    },
    async getControlExceptions() {
      try {
        const response = await this.api.getControlExceptions();
        if (response.pending || response.approved || response.rejected) {
          return {
            controlApproved: response.approved || 0,
            controlRejected: response.rejected || 0,
            controlPending: response.pending || 0,
          };
        } else {
          return { approved: 0, rejected: 0, pending: 0 };
        }
      } catch (error) {
        console.error("Error fetching control exceptions:", error);
        return { approved: 0, rejected: 0, pending: 0 };
      }
    },
    async getRiskExceptions() {
      try {
        const response = await this.api.getRiskExceptions();
        if (response.pending || response.approved || response.rejected) {
          return {
            riskApproved: response.approved || 0,
            riskRejected: response.rejected || 0,
            riskPending: response.pending || 0,
          };
        } else {
          return { approved: 0, rejected: 0, pending: 0 };
        }
      } catch (error) {
        console.error("Error fetching risk exceptions:", error);
        return { approved: 0, rejected: 0, pending: 0 };
      }
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    async fetchUsers() {
      const response = await this.usersList.getAll({
        select: "id|full_name|username|email|phone|type|department_id",
      });
      this.userList = response;
      this.fromFields.find(
        (field) => field.name === "stakeholder_ids"
      ).options = response;
      // Fetch departments for user details modal
      const deptResponse = await this.departmentsList.getAll({
        select: "id|name",
      });
      this.departmentList = deptResponse;
    },
    openForm() {
      this.newItem.requestor_id = Auth.USER.id;
      this.isFlipped = true;
    },
    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
      this.refreshCharts();
      this.refreshExceptionCounts();
    },
    editItem(data) {
      if (data.status === "Approved") {
        this.$notify({
          type: "error",
          text: "You cannot edit an approved exception",
        });
      } else if (data.status === "Rejected") {
        this.$notify({
          type: "error",
          text: "You cannot edit a rejected exception",
        });
      } else {
        this.newItem = { ...data, requestor_id: Auth.USER.id };
        this.filteredFrameworks = [];
        for (let i = 0; i < this.frameworkList.length; i++) {
          if (this.frameworkList[i].regulator_id === data.regulator) {
            this.filteredFrameworks.push(this.frameworkList[i]);
          }
        }
        this.filteredControls = [];
        for (let i = 0; i < this.controlList.length; i++) {
          if (this.controlList[i].framework_id === data.framework) {
            this.filteredControls.push(this.controlList[i]);
          }
        }
        this.newItem.risk = data.risk;
        this.newItem.framework = data.framework;
        this.newItem.risk = data.risk;
        this.isFlipped = true;
        this.refreshCharts();
        this.refreshExceptionCounts();
      }
    },
    openModal(selectedRow) {
      this.selectedAction = "";
      this.selectedExceptionId = selectedRow.id;
      this.isModalOpen = true;
    },
    async openDetailsModal(selectedRow) {
      this.selectedAction = "";
      this.selectedExceptionId = selectedRow.id;
      this.exceptionData = selectedRow;
      this.isDetailsModalOpen = true;
      await this.fetchComments(selectedRow.id);
    },
    async takeAction(selectedExceptionId, selectedAction, rejectionReason) {
      await this.api.changeStatus(
        selectedExceptionId,
        selectedAction,
        rejectionReason
      );
      this.isModalOpen = false;
      this.$refs.table.refreshTable();
      await this.refreshExceptionCounts();
      await this.refreshCharts();
    },
    async closeModal() {
      this.isModalOpen = false;
      this.rejectionReason = "";
    },
    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
      this.newComment = "";
      this.comments = [];
      this.currentPage = 1;
      this.replyingTo = null;
      this.editingCommentId = null;
      this.editingCommentContent = "";
      this.newReply = "";
    },
    async fetchComments(exceptionId) {
      try {
        const response = await this.commentApi.fetchComments(
          exceptionId,
          "exception"
        );
        const userIds = [...new Set(response.map((c) => c.user_id))];
        const users = await Promise.all(
          userIds.map((id) => this.usersList.show(id))
        );
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
        const comments = response
          .filter((comment) => !comment.parent_id)
          .map((comment) => ({
            ...comment,
            user: userMap[comment.user_id] || { full_name: " - " },
            replies: response
              .filter((reply) => reply.parent_id === comment.id)
              .map((reply) => ({
                ...reply,
                user: userMap[reply.user_id] || { full_name: " - " },
              })),
          }));
        this.comments = comments;
        this.currentPage = 1;
      } catch (error) {
        console.error("Error fetching comments:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch comments",
        });
      }
    },
    async submitComment() {
      if (!this.newComment.trim()) {
        notify({
          type: "warning",
          title: "Warning",
          text: "Comment cannot be empty",
        });
        return;
      }
      try {
        const commentData = {
          content: this.newComment,
          user_id: Auth.USER.id,
          commentable_type: "exception",
          commentable_id: this.exceptionData.id,
          is_private: false,
          status: "active",
        };
        const response = await this.commentApi.publishComment(commentData);
        const newComment = {
          ...response,
          user: response.user || {
            id: Auth.USER.id,
            full_name: Auth.USER.full_name || "Current User",
          },
          created_at: response.created_at || new Date().toISOString(),
          replies: response.replies || [],
        };
        this.comments.unshift(newComment);
        this.currentPage = 1;
        this.newComment = "";
        this.fetchComments(this.exceptionData.id);
      } catch (error) {
        console.error("Error submitting comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to add comment",
        });
      }
    },
    toggleReplyForm(commentId) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
      this.newReply = "";
      this.editingCommentId = null;
    },
    async submitReply(parentId) {
      if (!this.newReply.trim()) {
        notify({
          type: "warning",
          title: "Warning",
          text: "Reply cannot be empty",
        });
        return;
      }
      try {
        const replyData = {
          content: this.newReply,
          user_id: Auth.USER.id,
          commentable_type: "exception",
          commentable_id: this.exceptionData.id,
          parent_id: parentId,
          is_private: false,
          status: "active",
        };
        const response = await this.commentApi.publishComment(replyData);
        const newReply = {
          id: response.id,
          content: response.content,
          user: response.user || {
            id: Auth.USER.id,
            full_name: Auth.USER.full_name || "Current User",
          },
          created_at: response.created_at || new Date().toISOString(),
          user_id: Auth.USER.id,
        };
        this.comments = this.comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        });
        this.toggleReplyForm(null);
        this.fetchComments(this.exceptionData.id);
      } catch (error) {
        console.error("Error submitting reply:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to add reply",
        });
      }
    },
    startEditing(comment) {
      this.editingCommentId = comment.id;
      this.editingCommentContent = comment.content;
      this.replyingTo = null;
    },
    cancelEditing() {
      this.editingCommentId = null;
      this.editingCommentContent = "";
    },
    async updateComment(commentId) {
      if (!this.editingCommentContent.trim()) {
        notify({
          type: "warning",
          title: "Warning",
          text: "Comment cannot be empty",
        });
        return;
      }
      try {
        const updatedData = {
          id: commentId,
          content: this.editingCommentContent,
        };
        const response = await this.commentApi.from(updatedData);
        this.comments = this.comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: this.editingCommentContent,
              ...(response && {
                content: response.content || this.editingCommentContent,
                updated_at: response.updated_at || comment.updated_at,
              }),
            };
          }
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                  ...reply,
                  content: this.editingCommentContent,
                  ...(response && {
                    content: response.content || this.editingCommentContent,
                    updated_at: response.updated_at || reply.updated_at,
                  }),
                }
                : reply
            ),
          };
        });
        this.cancelEditing();
      } catch (error) {
        console.error("Error updating comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to update comment",
        });
      }
    },
    async deleteComment(commentId) {
      const result = await this.$swal({
        title: "Are you sure?",
        text: "This comment will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
      });
      if (!result.isConfirmed) return;
      try {
        await this.commentApi.delete(commentId);
        this.comments = this.comments.filter(
          (comment) => comment.id !== commentId
        );
        this.comments = this.comments.map((comment) => ({
          ...comment,
          replies: comment.replies.filter((reply) => reply.id !== commentId),
        }));
        if (this.paginatedComments.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to delete comment",
        });
      }
    },

    async fetchStatisticsData() {
      try {
        // Fetch all exceptions data
        const [
          policyCounts,
          controlCounts,
          riskCounts,
          allExceptions,
          allDepartments,
          allUsers,
        ] = await Promise.all([
          this.getPolicyExceptions(),
          this.getControlExceptions(),
          this.getRiskExceptions(),
          this.api.getAll({
            select: "id|type|status|duration|created_at|requestor_id",
          }),
          this.departmentsList.getAll({ select: "id|name" }),
          this.usersList.getAll({ select: "id|department_id" }),
        ]);

        // Calculate totals
        const totalApproved =
          policyCounts.approved +
          controlCounts.controlApproved +
          riskCounts.riskApproved;
        const totalRejected =
          policyCounts.rejected +
          controlCounts.controlRejected +
          riskCounts.riskRejected;
        const totalPending =
          policyCounts.pending +
          controlCounts.controlPending +
          riskCounts.riskPending;

        this.statisticsData = {
          totalExceptions: totalApproved + totalRejected + totalPending,
          totalApproved,
          totalRejected,
          totalPending,
          policyExceptions:
            policyCounts.approved +
            policyCounts.rejected +
            policyCounts.pending,
          controlExceptions:
            controlCounts.controlApproved +
            controlCounts.controlRejected +
            controlCounts.controlPending,
          riskExceptions:
            riskCounts.riskApproved +
            riskCounts.riskRejected +
            riskCounts.riskPending,
        };

        // Overall Status Distribution Chart
        this.overallStatusChartSeries = [
          totalApproved,
          totalRejected,
          totalPending,
        ];

        // Type Distribution Chart
        this.typeDistributionChartSeries = [
          this.statisticsData.policyExceptions,
          this.statisticsData.controlExceptions,
          this.statisticsData.riskExceptions,
        ];

        // Status by Type Chart
        this.statusByTypeChartSeries = [
          {
            name: this.$t("exception.approved"),
            data: [
              policyCounts.approved,
              controlCounts.controlApproved,
              riskCounts.riskApproved,
            ],
          },
          {
            name: this.$t("exception.rejected"),
            data: [
              policyCounts.rejected,
              controlCounts.controlRejected,
              riskCounts.riskRejected,
            ],
          },
          {
            name: this.$t("exception.pending"),
            data: [
              policyCounts.pending,
              controlCounts.controlPending,
              riskCounts.riskPending,
            ],
          },
        ];

        // Calculate average duration by type
        const policyExceptions = allExceptions.filter((e) => e.type == 1);
        const controlExceptions = allExceptions.filter((e) => e.type == 3);
        const riskExceptions = allExceptions.filter((e) => e.type == 2);

        const avgPolicyDuration =
          policyExceptions.length > 0
            ? (
              policyExceptions.reduce(
                (sum, e) => sum + (e.duration || 0),
                0
              ) / policyExceptions.length
            ).toFixed(0)
            : 0;

        const avgControlDuration =
          controlExceptions.length > 0
            ? (
              controlExceptions.reduce(
                (sum, e) => sum + (e.duration || 0),
                0
              ) / controlExceptions.length
            ).toFixed(0)
            : 0;

        const avgRiskDuration =
          riskExceptions.length > 0
            ? (
              riskExceptions.reduce((sum, e) => sum + (e.duration || 0), 0) /
              riskExceptions.length
            ).toFixed(0)
            : 0;

        this.durationChartSeries = [
          {
            name: this.$t("exception.average_duration"),
            data: [
              parseFloat(avgPolicyDuration),
              parseFloat(avgControlDuration),
              parseFloat(avgRiskDuration),
            ],
          },
        ];

        // Monthly Trend Chart
        const monthlyData = this.calculateMonthlyTrend(allExceptions);
        this.monthlyTrendChartSeries = monthlyData.series;
        this.monthlyTrendChartOptions = {
          ...this.monthlyTrendChartOptions,
          xaxis: {
            categories: monthlyData.categories,
          },
        };

        // Exceptions by Department Chart
        // Create a map of user_id to department_id
        const userDepartmentMap = {};
        allUsers.forEach((user) => {
          userDepartmentMap[user.id] = user.department_id;
        });

        // Create a map of department_id to department name
        const departmentMap = {};
        allDepartments.forEach((dept) => {
          departmentMap[dept.id] = dept.name;
        });

        // Count exceptions per department
        const departmentCounts = {};
        allExceptions.forEach((exception) => {
          const departmentId = userDepartmentMap[exception.requestor_id];
          if (departmentId) {
            departmentCounts[departmentId] =
              (departmentCounts[departmentId] || 0) + 1;
          }
        });

        // Convert to arrays for the chart, sorted by count descending
        const departmentData = Object.entries(departmentCounts)
          .map(([deptId, count]) => ({
            department: departmentMap[deptId] || `Department ${deptId}`,
            count: count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Show top 10 departments

        this.departmentChartOptions = {
          ...this.departmentChartOptions,
          xaxis: {
            categories: departmentData.map((d) => d.department),
          },
        };

        this.departmentChartSeries = [
          {
            name: this.$t("exception.total_exceptions"),
            data: departmentData.map((d) => d.count),
          },
        ];
      } catch (error) {
        console.error("Error in fetchStatisticsData:", error);
        throw error;
      }
    },

    calculateMonthlyTrend(exceptions) {
      // Get last 6 months
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: date.toLocaleString("default", { month: "short" }),
          year: date.getFullYear(),
          date: date,
        });
      }

      const policyData = [];
      const controlData = [];
      const riskData = [];

      months.forEach((monthInfo) => {
        const monthStart = new Date(
          monthInfo.year,
          monthInfo.date.getMonth(),
          1
        );
        const monthEnd = new Date(
          monthInfo.year,
          monthInfo.date.getMonth() + 1,
          0
        );

        const policyCount = exceptions.filter((e) => {
          const createdDate = new Date(e.created_at);
          return (
            e.type == 1 && createdDate >= monthStart && createdDate <= monthEnd
          );
        }).length;

        const controlCount = exceptions.filter((e) => {
          const createdDate = new Date(e.created_at);
          return (
            e.type == 3 && createdDate >= monthStart && createdDate <= monthEnd
          );
        }).length;

        const riskCount = exceptions.filter((e) => {
          const createdDate = new Date(e.created_at);
          return (
            e.type == 2 && createdDate >= monthStart && createdDate <= monthEnd
          );
        }).length;

        policyData.push(policyCount);
        controlData.push(controlCount);
        riskData.push(riskCount);
      });

      return {
        categories: months.map((m) => `${m.month} ${m.year}`),
        series: [
          {
            name: this.$t("exception.policy"),
            data: policyData,
          },
          {
            name: this.$t("exception.control"),
            data: controlData,
          },
          {
            name: this.$t("exception.risk"),
            data: riskData,
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background-color: #f8f8f8;
  border-radius: 0.375rem;
  width: 100%;
  max-width: 1000px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

/* Approval modal specific tweaks to match the provided design */
.approval-modal {
  max-width: 720px;
  padding: 0;
}

.approval-modal .modal-header {
  padding: 16px 20px;
}

.approval-modal .modal-title {
  font-weight: 700;
}

.approval-modal .modal-body {
  padding: 20px 35px 10px 35px;
}

.approval-modal .modal-footer {
  padding: 12px 20px 20px 20px;
  gap: 12px;
}

.approval-modal label {
  font-weight: 600;
  margin-bottom: 8px;
}

.approval-modal .custom-select {
  height: 35px;
  border-radius: 10px;
}

.approval-modal .btn-save {
  background-color: #6e3894;
  color: #fff;
  border: none;
  /* padding: 8px 18px; */
  border-radius: 12px;
}

.approval-modal .btn-save:disabled {
  opacity: 0.6;
}

.approval-modal .btn-cancel {
  background-color: #ffffff;
  color: #6e3894;
  border: 1px solid #e1d7fb;
  /* padding: 8px 18px; */
  border-radius: 12px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  /* border-bottom: 1px solid #e9ecef; */
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

.modal-body p {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.ck-editor__editable {
  min-height: 200px !important;
}

select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.custom-tabs {
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
}

.form-container {
  padding: 0px 0px 0px 0px !important;
}

.nav-tabs {
  border-bottom: none;
  display: flex;
  width: 100%;
  gap: 8px;
  /* spacing between tabs */
  background: #ffffff;
  border: 1px solid #e8e8ee;
  border-radius: 14px;
  /* rounded container */
  padding: 6px;
}

.nav-tabs .nav-item {
  flex: 1 1 0;
  /* make tabs fill the row evenly */
}

.nav-link {
  width: 100%;
  padding: 10px 16px;
  /* comfortable height */
  font-size: 14px;
  font-weight: 500;
  color: #5c5c66;
  /* inactive text */
  background-color: #f3f3f7;
  /* inactive bg */
  border: none;
  border-radius: 10px;
  /* pill shape */
  margin-right: 0;
  /* no default margin */
  transition: all 0.2s ease;
  white-space: nowrap;
  /* keep text on one line */
  text-align: center;
}

.nav-link:hover {
  background-color: #eaeaf0;
  /* hover state */
  color: #4a4a55;
}

.nav-link.active {
  color: #fff;
  background-color: #6e3894;
  /* brand purple for active tab */
  border: none;
  font-weight: 600;
  /* bold active */
  box-shadow: 0 2px 6px rgba(111, 60, 196, 0.25);
}

/* User info container - matches InternalMessage.vue */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
}

/* User full name text */
.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link.active:hover {
  background-color: #6431bb;
  /* darker hover */
}

.exception-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Keep other styles as they are unless further adjustments are needed */

.exception-card-header {
  display: block;
  /* Changed from inline */
  margin-bottom: 8px;
  padding-bottom: 10px;
  /* border-bottom: 1px solid #e9ecef; */
}

.exception-title {
  font-size: 14px;
  font-weight: 400;
  color: #000;
  margin: 0;
  display: flex;
  /* Add this */
  justify-content: space-between;
  /* Add this */
  align-items: center;
  /* Add this */
}

.exception-count.badge {
  font-size: 14px;
  font-weight: 500px;
  color: #000000;
  background-color: white;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  padding: 5px 8px;
  margin-left: auto;
  /* Changed from 10px */
  display: inline-block;
}

.exception-count {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

.exception-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
}

/* Skeleton loader styles */
.skeleton-title {
  height: 28px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-chart {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.icofont-fountain-pen {
  display: none;
}

.comments-list {
  max-height: 450px;
  overflow-y: auto;
}

.comment {
  background-color: #f8f9fa;
  position: relative;
}

.replies {
  border-left: 3px solid #28a745;
  padding-left: 15px;
  margin-left: 15px;
}

.reply {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 5px;
}

.comment p,
.reply p {
  margin-bottom: 0;
  font-style: normal;
}

.comment-actions i,
.reply-actions i {
  transition: all 0.2s ease;
}

.comment-actions i:hover,
.reply-actions i:hover {
  transform: scale(1.1);
}

.reply {
  min-width: 200px;
}

.comment-actions,
.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-control {
  border: 2px solid #f0f0f0;
}

.input-group textarea,
textarea.form-control {
  resize: none;
  border: 2px solid #f0f0f0;
}

/* Creation Form modal styling */
.create-exception-modal {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.create-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  /* background-color: #f8f8f8; */
}

.create-modal-body {
  padding: 12px 16px 16px 16px;
  border: 3px solid #f0f0f0;
  border-radius: 10px;

  /* background-color: #f8f8f8; */
}

.form-textarea {
  min-height: 120px;
}
</style>

<style>
.details-modal {
  max-width: 720px;
  padding: 0;
}

.details-modal .modal-header {
  padding: 16px 20px;
  background-color: #f8f8f8;
}

.details-modal .modal-title {
  font-weight: 700;
}

.details-modal .modal-body {
  padding: 20px 20px 24px 20px;
}

.details-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 18px 8px 18px;
}

.details-label {
  color: #8a8a8a;
  font-weight: 600;
}

.details-value {
  color: #1d1d1f;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.status-badge.pending {
  background: #fdecc8;
  color: #6d5700;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #842029;
}

.status-badge.approved {
  background: #d1e7dd;
  color: #0f5132;
}

.avatar-chip {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  margin-right: 6px;
}

.avatar-plus {
  background: #e9ecef;
  color: #495057;
  border-radius: 14px;
  padding: 2px 8px;
  font-size: 12px;
}

.truncate-purple {
  color: #6e3894;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details-textarea {
  background: #fff;
  border-radius: 12px;
  min-height: 120px;
}

.vs__dropdown-menu {
  max-height: 200px !important;
}

.table-actions .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  border-top: 1px solid #efefef;
}

.table-actions .dropdown-item:first-child {
  border-top: none;
}

.table-actions .dropdown-item:hover {
  background-color: #f8f9fa;
}

.table-actions .dropdown-item i {
  margin-right: 0.5rem;
  width: 1rem;
  text-align: center;
}

.form-container {
  padding: 15px !important;
}

.text-bg-danger {
  background-color: #e2b6b6 !important;
  color: #a92525 !important;
  font-size: 13px;
  border-radius: 30px !important;
}

.text-bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
  font-size: 13px;
  border-radius: 30px !important;
}

.text-bg-warning {
  background-color: #ebdcb3 !important;
  color: #c4951b !important;
  font-size: 13px;
  border-radius: 30px !important;
}

.custom-table th,
td {
  text-align: center !important;
}

.action-list-item {
  padding: 4px 15px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border-radius: 0 !important;
  margin: 5px !important;
}

.action-list-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
}

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

/* Icon styling within menu items */
.action-list-item .action-icon {
  color: #6e3894 !important;
  margin-right: 12px !important;
}

/* Comments Display Styles */
.comments-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.comment-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.author-avatar-small {
  width: 28px;
  height: 28px;
  font-size: 11px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-info strong {
  font-size: 14px;
  color: #212529;
}

.author-info small {
  font-size: 12px;
}

.comment-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.comment-actions i {
  font-size: 14px;
  transition: all 0.2s ease;
}

.comment-actions i:hover {
  transform: scale(1.15);
}

.comment-content {
  padding: 8px 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.comment-edit-form {
  margin-top: 8px;
}

.replies-section {
  margin-top: 12px;
  margin-left: 44px;
  border-left: 3px solid #6e3894;
  padding-left: 12px;
}

.reply-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
}

.reply-form {
  margin-top: 12px;
  margin-left: 44px;
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
  border: 2px solid #6e3894;
}

.reply-button {
  color: #6e3894;
  font-size: 13px;
  padding: 4px 8px;
  text-decoration: none;
  margin-top: 4px;
}

.reply-button:hover {
  color: #5a2d7a;
  text-decoration: underline;
}

.btn-sm.btn-save {
  background-color: #6e3894;
  color: white;
  border: none;
  /* padding: 6px 16px; */
  border-radius: 6px;
  font-size: 13px;
}

.btn-sm.btn-save:hover {
  background-color: #5a2d7a;
}

.btn-sm.btn-cancel {
  background-color: #ffffff;
  color: #6c757d;
  border: 1px solid #dee2e6;
  /* padding: 6px 16px; */
  border-radius: 6px;
  font-size: 13px;
}

.btn-sm.btn-cancel:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.gap-2 {
  gap: 8px;
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}

/* Statistics Modal Styles */
.statistics-modal {
  max-width: 95vw !important;
  height: 90vh;
}

.statistics-modal .modal-body {
  max-height: 75vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.statistics-content {
  padding: 10px;
}

/* Metrics Grid */
/* Modern Card Styles */
.modern-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #f0f0f0;
  transition: all 0.3s ease;
  margin-top: 12px;
}

.card .card-body {
  background: white !important;
  border-radius: 8px;
}

.statistic-container {
  background: #f0f0f0;
  border-radius: 16px;
  padding: 15px;
  margin: 10px 0px;
  border: 1px solid #e9ecef;
}

.modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card-modern {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f5;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.stat-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-purple {
  background-color: #e9d5ff;
  color: #7c3aed;
}

.stat-icon-green {
  background-color: #d1fae5;
  color: #059669;
}

.stat-icon-red {
  background-color: #fee2e2;
  color: #dc2626;
}

.stat-icon-yellow {
  background-color: #fef3c7;
  color: #d97706;
}

.stat-value-wrapper {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
}

.stat-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  background-color: #f9fafb;
  padding: 4px 10px;
  border-radius: 12px;
}

.stat-card-purple .stat-value {
  color: #6e3894;
}

.stat-card-green .stat-value {
  color: #255f0b;
}

.stat-card-red .stat-value {
  color: #a92525;
}

.stat-card-yellow .stat-value {
  color: #c4951b;
}

/* Acceptor Cards Styles */
.acceptor-header {
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.acceptor-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
}

.acceptor-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f5;
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 100px;
}

.acceptor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.acceptor-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.acceptor-card-policy .acceptor-card-icon {
  background-color: #dbeafe;
  color: #2563eb;
}

.acceptor-card-control .acceptor-card-icon {
  background-color: #d1fae5;
  color: #059669;
}

.acceptor-card-risk .acceptor-card-icon {
  background-color: #fee2e2;
  color: #dc2626;
}

.acceptor-card-content {
  flex: 1;
  min-width: 0;
}

.acceptor-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.acceptor-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.acceptor-name.text-muted {
  color: #9ca3af;
  font-style: italic;
  font-weight: 500;
}

.acceptor-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.acceptor-card-policy .acceptor-badge {
  background-color: #dbeafe;
  color: #1e40af;
}

.acceptor-card-control .acceptor-badge {
  background-color: #d1fae5;
  color: #047857;
}

.acceptor-card-risk .acceptor-badge {
  background-color: #fee2e2;
  color: #b91c1c;
}

.metric-content h6 {
  margin: 0;
  font-size: 13px;
  color: #8a8a8a;
  font-weight: 600;
  margin-bottom: 5px;
}

.metric-value {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 25px;
}

.chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-container h5 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .statistics-modal {
    max-width: 100vw !important;
    height: 100vh;
  }

  .stat-card-modern {
    padding: 16px;
    min-height: 100px;
  }

  .stat-icon-circle {
    width: 36px;
    height: 36px;
  }

  .stat-icon-circle svg {
    width: 18px;
    height: 18px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-title {
    font-size: 0.8rem;
  }

  .acceptor-card {
    padding: 16px;
    min-height: 90px;
  }

  .acceptor-card-icon {
    width: 44px;
    height: 44px;
  }

  .acceptor-card-icon svg {
    width: 22px;
    height: 22px;
  }

  .acceptor-name {
    font-size: 1rem;
  }

  .acceptor-section-title {
    font-size: 0.95rem;
  }
}

@media (max-width: 576px) {
  .stat-card-modern {
    padding: 14px;
    min-height: 95px;
  }

  .stat-icon-circle {
    width: 32px;
    height: 32px;
  }

  .stat-icon-circle svg {
    width: 16px;
    height: 16px;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .stat-title {
    font-size: 0.75rem;
  }

  .stat-percentage {
    font-size: 0.75rem;
    padding: 3px 8px;
  }

  .acceptor-card {
    padding: 14px;
    min-height: 85px;
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .acceptor-card-icon {
    width: 40px;
    height: 40px;
  }

  .acceptor-card-icon svg {
    width: 20px;
    height: 20px;
  }

  .acceptor-name {
    font-size: 0.95rem;
  }

  .acceptor-type {
    font-size: 0.8rem;
  }

  .acceptor-section-title {
    font-size: 0.9rem;
  }

  .acceptor-badge {
    font-size: 0.7rem;
    padding: 3px 10px;
  }
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

[dir="rtl"] .chart-container h5 {
  text-align: end;
}
</style>
