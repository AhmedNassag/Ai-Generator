<template>
  <PurpleDotsLoader v-if="load" />
  <main-page
    v-else
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('incident.Risk_Management')"
    :mainSubPage="this.$t('incident.incidents')"
    :subPage="this.$t('incident.Incident_Management')"
    :titlePage="this.$t('incident.Incident_Management')"
    v-permission:show
    :showInsightsTab="true"
  >
    <div v-permission:update v-permission:delete></div>

    <template #statistics>
      <!-- Statistics Content -->
      <div class="statistics-content">
        <div>
          <div class="stats-content">
            <!-- Main KPI Cards - Featured Metrics -->
            <div class="card modern-card">
              <div class="card-body pt-2 pb-2 pl-3 pr-3">
                <div class="statistic-container">
                  <div class="row g-3">
                    <!-- Total Incidents Card -->
                    <div class="col-12 col-sm-6 col-lg-3">
                      <div class="stat-card-modern stat-card-purple">
                        <div class="stat-card-header rtl">
                          <h6 class="stat-title">Total Incidents</h6>
                          <div class="stat-icon-circle stat-icon-purple">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                          </div>
                        </div>
                        <div class="stat-value-wrapper rtl">
                          <h2 class="stat-value">
                            {{ statisticsData.kpis.totalIncidents }}
                          </h2>
                          <span class="stat-percentage">100%</span>
                        </div>
                      </div>
                    </div>

                    <!-- Open Incidents Card -->
                    <div class="col-12 col-sm-6 col-lg-3">
                      <div class="stat-card-modern stat-card-red">
                        <div class="stat-card-header rtl">
                          <h6 class="stat-title">Open</h6>
                          <div class="stat-icon-circle stat-icon-red">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path
                                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                              ></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                          </div>
                        </div>
                        <div class="stat-value-wrapper rtl">
                          <h2 class="stat-value">
                            {{ statisticsData.kpis.openIncidents }}
                          </h2>
                          <span class="stat-percentage"
                            >{{
                              getPercentage(
                                statisticsData.kpis.openIncidents,
                                statisticsData.kpis.totalIncidents
                              )
                            }}%</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- In Progress Card -->
                    <div class="col-12 col-sm-6 col-lg-3">
                      <div class="stat-card-modern stat-card-yellow">
                        <div class="stat-card-header rtl">
                          <h6 class="stat-title">In Progress</h6>
                          <div class="stat-icon-circle stat-icon-yellow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                        </div>
                        <div class="stat-value-wrapper rtl">
                          <h2 class="stat-value">
                            {{ statisticsData.kpis.inProgressIncidents }}
                          </h2>
                          <span class="stat-percentage"
                            >{{
                              getPercentage(
                                statisticsData.kpis.inProgressIncidents,
                                statisticsData.kpis.totalIncidents
                              )
                            }}%</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Closed Card -->
                    <div class="col-12 col-sm-6 col-lg-3">
                      <div class="stat-card-modern stat-card-green">
                        <div class="stat-card-header rtl">
                          <h6 class="stat-title">Closed</h6>
                          <div class="stat-icon-circle stat-icon-green">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path
                                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                              ></path>
                              <polyline
                                points="22 4 12 14.01 9 11.01"
                              ></polyline>
                            </svg>
                          </div>
                        </div>
                        <div class="stat-value-wrapper rtl">
                          <h2 class="stat-value">
                            {{ statisticsData.kpis.closedIncidents }}
                          </h2>
                          <span class="stat-percentage"
                            >{{
                              getPercentage(
                                statisticsData.kpis.closedIncidents,
                                statisticsData.kpis.totalIncidents
                              )
                            }}%</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Secondary Metrics Grid -->
            <div class="card modern-card">
              <div class="card-body pt-2 pb-2 pl-3 pr-3">
                <div class="statistic-container">
                  <div class="row g-3">
                    <!-- With Evidence Card -->
                    <div class="col-12 col-md-4">
                      <div class="secondary-metric-card metric-card-teal">
                        <div class="secondary-metric-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            ></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <div class="secondary-metric-content">
                          <h6 class="secondary-metric-label">With Evidence</h6>
                          <p class="secondary-metric-value">
                            {{ statisticsData.kpis.withEvidence }}%
                          </p>
                          <span class="secondary-metric-info"
                            >{{ statisticsData.kpis.evidenceCount }} files</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Average Per Day Card -->
                    <div class="col-12 col-md-4">
                      <div class="secondary-metric-card metric-card-indigo">
                        <div class="secondary-metric-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div class="secondary-metric-content">
                          <h6 class="secondary-metric-label">Avg/Day</h6>
                          <p class="secondary-metric-value">
                            {{ statisticsData.kpis.avgIncidentsPerDay }}
                          </p>
                          <span class="secondary-metric-info"
                            >{{ statisticsData.kpis.newThisWeek }} new this
                            week</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Active Reporters Card -->
                    <div class="col-12 col-md-4">
                      <div class="secondary-metric-card metric-card-pink">
                        <div class="secondary-metric-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path
                              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                            ></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <div class="secondary-metric-content">
                          <h6 class="secondary-metric-label">
                            Active Reporters
                          </h6>
                          <p class="secondary-metric-value">
                            {{ statisticsData.kpis.totalReporters }}
                          </p>
                          <span class="secondary-metric-info"
                            >Unique users</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts Section -->
            <div class="stats-charts-section">
              <!-- Trend Chart - Full Width -->
              <div class="stats-chart-card stats-chart-full">
                <div class="stats-chart-header">
                  <div class="chart-title-wrapper">
                    <v-icon color="#6e3894" class="mr-2"
                      >mdi-chart-timeline-variant</v-icon
                    >
                    <h5>Incident Trends Over Time</h5>
                  </div>
                  <p class="chart-subtitle">
                    Daily incident volume over the last 30 days
                  </p>
                </div>
                <apexchart
                  type="area"
                  height="320"
                  :options="statisticsData.charts.trendOptions"
                  :series="statisticsData.charts.trendSeries"
                ></apexchart>
              </div>

              <!-- Status & Priority Distribution -->
              <div class="stats-charts-grid-2">
                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2"
                        >mdi-chart-donut</v-icon
                      >
                      <h5>Status Distribution</h5>
                    </div>
                    <p class="chart-subtitle">
                      Current incident status breakdown
                    </p>
                  </div>
                  <apexchart
                    type="pie"
                    height="300"
                    :options="statisticsData.charts.statusOptions"
                    :series="statisticsData.charts.statusSeries"
                  ></apexchart>
                </div>

                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2"
                        >mdi-chart-bar</v-icon
                      >
                      <h5>Priority Distribution</h5>
                    </div>
                    <p class="chart-subtitle">
                      Incidents by classification level
                    </p>
                  </div>
                  <apexchart
                    type="bar"
                    height="300"
                    :options="statisticsData.charts.priorityOptions"
                    :series="statisticsData.charts.prioritySeries"
                  ></apexchart>
                </div>
              </div>

              <!-- Attack Vectors & Detection Methods -->
              <div class="stats-charts-grid-2">
                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2"
                        >mdi-shield-alert-outline</v-icon
                      >
                      <h5>Attack Vectors</h5>
                    </div>
                    <p class="chart-subtitle">Distribution of attack methods</p>
                  </div>
                  <apexchart
                    type="pie"
                    height="320"
                    :options="statisticsData.charts.attackOptions"
                    :series="statisticsData.charts.attackSeries"
                  ></apexchart>
                </div>

                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2">mdi-radar</v-icon>
                      <h5>Detection Methods</h5>
                    </div>
                    <p class="chart-subtitle">
                      How incidents are being detected
                    </p>
                  </div>
                  <apexchart
                    type="pie"
                    height="320"
                    :options="statisticsData.charts.detectorOptions"
                    :series="statisticsData.charts.detectorSeries"
                  ></apexchart>
                </div>
              </div>

              <!-- Top Incident Types & Direction -->
              <div class="stats-charts-grid-2">
                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2"
                        >mdi-format-list-numbered</v-icon
                      >
                      <h5>Top Incident Types</h5>
                    </div>
                    <p class="chart-subtitle">Most common case types</p>
                  </div>
                  <apexchart
                    type="bar"
                    height="320"
                    :options="statisticsData.charts.typeOptions"
                    :series="statisticsData.charts.typeSeries"
                  ></apexchart>
                </div>

                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2"
                        >mdi-swap-horizontal</v-icon
                      >
                      <h5>Incident Direction</h5>
                    </div>
                    <p class="chart-subtitle">
                      Inbound, Outbound, Internal breakdown
                    </p>
                  </div>
                  <apexchart
                    type="bar"
                    height="320"
                    :options="statisticsData.charts.directionOptions"
                    :series="statisticsData.charts.directionSeries"
                  ></apexchart>
                </div>
              </div>

              <!-- Top Lists Section -->
              <div class="stats-charts-grid-2">
                <!-- Top Detectors -->
                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2">mdi-medal</v-icon>
                      <h5>Top 5 Detection Sources</h5>
                    </div>
                    <p class="chart-subtitle">
                      Most effective detection methods
                    </p>
                  </div>
                  <div class="stats-list">
                    <div
                      v-for="(detector, index) in statisticsData.topDetectors"
                      :key="index"
                      class="stats-list-item"
                    >
                      <div class="stats-list-info">
                        <span class="stats-list-rank">{{ index + 1 }}</span>
                        <span class="stats-list-name">{{ detector.name }}</span>
                      </div>
                      <div class="stats-list-value">
                        <div class="stats-progress">
                          <div
                            class="stats-progress-bar"
                            :style="{ width: detector.percentage + '%' }"
                          ></div>
                        </div>
                        <span class="stats-count"
                          >{{ detector.count }} ({{
                            detector.percentage
                          }}%)</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Top Reporters -->
                <div class="stats-chart-card">
                  <div class="stats-chart-header">
                    <div class="chart-title-wrapper">
                      <v-icon color="#6e3894" class="mr-2"
                        >mdi-account-star</v-icon
                      >
                      <h5>Top 5 Incident Reporters</h5>
                    </div>
                    <p class="chart-subtitle">Most active incident reporters</p>
                  </div>
                  <div class="stats-list">
                    <div
                      v-for="(reporter, index) in statisticsData.topReporters"
                      :key="index"
                      class="stats-list-item"
                    >
                      <div class="stats-list-info">
                        <span class="stats-list-rank">{{ index + 1 }}</span>
                        <span class="stats-list-name">{{ reporter.name }}</span>
                      </div>
                      <div class="stats-list-value">
                        <div class="stats-progress">
                          <div
                            class="stats-progress-bar stats-progress-purple"
                            :style="{ width: reporter.percentage + '%' }"
                          ></div>
                        </div>
                        <span class="stats-count"
                          >{{ reporter.count }} incidents</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :hideStatisticsButton="true"
        :Configurations="openConfigurationsModal"
        :hideConfigurationsButton="false"
        :filters="incidentFilters"
        :hideActions="hideActions"
      >
        <template #type="{ item }">
          {{ getCaseTypeName(item.caseType) }}
        </template>
        <template #direction="{ item }">
          {{ getCaseDirectionName(item.direction) }}
        </template>
        <template #attack="{ item }">
          {{ getAttackName(item.attack) }}
        </template>
        <template #detector="{ item }">
          {{ getDetectorName(item.detectedBy) }}
        </template>

        <template #tlp="{ item }">
          <div v-if="item.tlp && getTlpData(item.tlp)">
            <span
              class="badge"
              :style="{
                backgroundColor: getTlpData(item.tlp)?.color || '#6c757d',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
              }"
            >
              {{ getTlpData(item.tlp)?.name || item.tlp }}
            </span>
          </div>
          <span v-else> - </span>
        </template>

        <template #pap="{ item }">
          <div v-if="item.pap && getPapData(item.pap)">
            <span
              class="badge"
              :style="{
                backgroundColor: getPapData(item.pap)?.color || '#6c757d',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
              }"
            >
              {{ getPapData(item.pap)?.name || item.pap }}
            </span>
          </div>
          <span v-else> - </span>
        </template>

        <template #reporter="{ item }">
          <div v-if="getReporterUser(item.createdBy)" class="user-info">
            <div
              class="user-avatar-clickable"
              @click.prevent="openUserDetailsModal(getReporterUser(item.createdBy))"
            >
              {{ getUserInitials(getUserName(item.createdBy) || "U") }}
            </div>
            <span class="user-fullname">{{ getUserName(item.createdBy) }}</span>
          </div>
          <span v-else class="no-users-text">N/A</span>
        </template>

        <template #playbook="{ item }">
          {{ getPlayBookName(item.playBookId) }}
        </template>

        <template #class="{ item }">
          <div v-if="item.classification" class="color-swatch-container">
            <span
              class="color-swatch"
              :style="{ backgroundColor: item.classificationColor }"
              :title="item.classification"
            ></span>
          </div>
          <span v-else> - </span>
        </template>

        <template #status="{ item }">
          <span
            style="width: 83%; font-size: 14px; border-radius: 20px"
            v-if="item.status == '3'"
            class="badge text-bg-success text-light"
          >
            <i class="fa-solid fa-check"></i>
            {{ $t("incident.closed") }}
          </span>
          <span
            style="width: 100%; font-size: 14px; border-radius: 20px"
            v-else-if="item.status == '2'"
            class="badge bg-warning text-dark"
          >
            <i class="fa-solid fa-spinner fa-spin"></i>
            {{ $t("incident.inprogress") }}
          </span>
          <span
            style="width: 70%; font-size: 14px; border-radius: 20px"
            v-else="item.status == '1'"
            class="badge text-bg-danger text-light"
          >
            {{ $t("incident.open") }}
          </span>
        </template>

        <!-- <template #incidentResponse="{ item }">
          <a
            v-if="
              item.status != '3' &&
              ira &&
              ((ira.responsibleType === 'User' &&
                ira.responsibleId.includes(loggedInUser.id)) ||
                (ira.responsibleType === 'Team' &&
                  ira.responsibleId.some((teamId) => {
                    const team = teams.find((t) => t.id === teamId);
                    return (
                      team &&
                      team.user_ids &&
                      team.user_ids.includes(loggedInUser.id)
                    );
                  })) ||
                isUserResponsibleForIncidentPlaybook(item.playBookId))
            "
            href="javascript:void(0)"
            @click="response(item)"
            class="dropdown-item"
            v-permission:update
          >
            <i class="fa-solid fa-gear"></i> {{ $t("incident.response") }}
          </a>
        </template> -->

        <template #addAction="{ item }">
          <v-list-item
            v-if="
              item.status != '3' &&
              ira &&
              ((ira.responsibleType === 'User' &&
                ira.responsibleId.includes(loggedInUser.id)) ||
                (ira.responsibleType === 'Team' &&
                  ira.responsibleId.some((teamId) => {
                    const team = teams.find((t) => t.id === teamId);
                    return (
                      team &&
                      team.user_ids &&
                      team.user_ids.includes(loggedInUser.id)
                    );
                  })) ||
                isUserResponsibleForIncidentPlaybook(item.playBookId))
            "
            @click="response(item)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("incident.response") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="
              item.status != '3' &&
              ira &&
              ((ira.responsibleType === 'User' &&
                ira.responsibleId.includes(loggedInUser.id)) ||
                (ira.responsibleType === 'Team' &&
                  ira.responsibleId.some((teamId) => {
                    const team = teams.find((t) => t.id === teamId);
                    return (
                      team &&
                      team.user_ids &&
                      team.user_ids.includes(loggedInUser.id)
                    );
                  })) ||
                isUserResponsibleForIncidentPlaybook(item.playBookId))
            "
            @click="openCommentsModal(item)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-comment-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("incident.comments") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
        <template #caseType="{ item }">
          <div class="col-md-6 mb-3">
            <label for="caseType">{{ $t("incident.casetype") }}</label>
            <LazySelectField
              name="caseType"
              v-model="newItem.caseType"
              :placeholder="$t('incident.selectacasetype')"
              :options="caseTypes"
              option-label="type"
              option-value="id"
              :disabled="isReadonly"
            />
          </div>
        </template>
        <template #direction="{ item }">
          <div class="col-md-6 mb-3">
            <label for="direction">{{ $t("incident.direction") }}</label>
            <LazySelectField
              name="direction"
              v-model="newItem.direction"
              :placeholder="$t('incident.selectacasedirection')"
              :options="caseDirections"
              option-label="direction"
              option-value="id"
              :disabled="isReadonly"
            />
          </div>
        </template>
        <template #attack="{ item }">
          <div class="col-md-6 mb-3">
            <label for="attack">{{ $t("incident.attack") }}</label>
            <LazySelectField
              name="attack"
              v-model="newItem.attack"
              :placeholder="$t('incident.selectanattack')"
              :options="attacks"
              option-label="attack"
              option-value="id"
            />
          </div>
        </template>

        <template #detectedBy="{ item }">
          <div class="col-md-6 mb-3">
            <label for="attack">{{ $t("incident.detectedby") }}</label>
            <LazySelectField
              name="detectedBy"
              v-model="newItem.detectedBy"
              :placeholder="$t('incident.selectadetector')"
              :options="detectedBy"
              option-label="name"
              option-value="id"
            />
          </div>
        </template>

        <template #detectedAt="{ item }">
          <div class="col-md-6 mb-3">
            <label for="detectedAt">{{ $t("incident.detectedon") }}</label>
            <div class="input-group">
              <flat-pickr
                class="form-control"
                id="detectedAt"
                v-model="newItem.detectedAt"
                :config="flatpickrConfig"
                :disabled="isReadonly"
                :placeholder="this.$t('incident.select_date_and_time')"
              />
              <button
                class="btn btn-sm btn-secondary"
                type="button"
                @click="setCurrentDateTime"
                :disabled="isReadonly"
              >
                {{ $t("incident.now") }}
              </button>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Configurations Modal -->
  <div v-if="isConfigurationsModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-truncate">
          {{ $t("incident.incidentsconfigurations") }}
        </h5>
        <button
          class="btn-close"
          aria-label="Close"
          @click="closeConfigurationsModal"
        ></button>
      </div>
      <div class="modal-body modal-body-tabs">
        <!-- Tab Navigation Bar -->
        <div class="nav-tabs-container">
          <ul class="nav nav-tabs">
            <li class="nav-item" v-for="(tab, index) in tabs" :key="index">
              <a
                class="nav-link"
                :class="{ active: activeTab === tab.name }"
                @click="setActiveTab(tab.name)"
                href="#"
              >
                {{ $t(tab.label) }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Tab Content -->
        <transition name="fade" mode="out-in">
          <div
            class="tab-content"
            :key="activeTab"
            style="margin-top: 80px; width: 100% !important"
          >
            <!-- Case Type -->
            <div v-if="activeTab === 'caseType'" class="form-group">
              <!-- Case Type Inputs -->
              <div
                v-for="(caseType, index) in caseTypeInputs"
                :key="caseType.id"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="caseTypeInputs[index].type"
                  type="text"
                  class="form-control me-2"
                  :placeholder="this.$t('incident.enter_case_type')"
                  @input="trackCaseTypeChange"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeCaseTypeInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addCaseTypeInput"
                  :disabled="
                    caseTypeInputs.length > 0 &&
                    !caseTypeInputs[caseTypeInputs.length - 1].type?.trim()
                  "
                >
                  {{ $t("incident.addcasetype") }}
                </button>
                <button
                  v-show="caseTypeInputs.length > 0"
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveCaseTypes"
                  :disabled="
                    caseTypeInputs.length > 0 &&
                    !caseTypeInputs[caseTypeInputs.length - 1].type?.trim()
                  "
                >
                  {{ $t("incident.save") }}
                </button>
              </div>
            </div>

            <!-- Case Direction -->
            <div v-if="activeTab === 'caseDirection'" class="form-group">
              <!-- Case Direction Inputs -->
              <div
                v-for="(caseDirection, index) in caseDirectionInputs"
                :key="caseDirection.id"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="caseDirectionInputs[index].direction"
                  type="text"
                  class="form-control me-2"
                  :placeholder="this.$t('incident.enter_case_direction')"
                  @input="trackCaseDirectionChange"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeCaseDirectionInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addCaseDirectionInput"
                  :disabled="
                    caseDirectionInputs.length > 0 &&
                    !caseDirectionInputs[
                      caseDirectionInputs.length - 1
                    ].direction?.trim()
                  "
                >
                  {{ $t("incident.addcasedirection") }}
                </button>
                <button
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveCaseDirections"
                  :disabled="
                    caseDirectionInputs.length > 0 &&
                    !caseDirectionInputs[
                      caseDirectionInputs.length - 1
                    ].direction?.trim()
                  "
                >
                  {{ $t("incident.save") }}
                </button>
              </div>
            </div>

            <!-- Attacks -->
            <div v-if="activeTab === 'attacks'" class="form-group">
              <div
                v-for="(attack, index) in attackInputs"
                :key="attack.id"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="attackInputs[index].attack"
                  type="text"
                  class="form-control me-2"
                  :placeholder="this.$t('incident.enter_attack')"
                  @input="trackAttackChange"
                  :class="{
                    'is-invalid':
                      duplicateAttackError &&
                      isAttackDuplicate(attack.attack, index),
                  }"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeAttackInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addAttackInput"
                  :disabled="
                    attackInputs.length > 0 &&
                    !attackInputs[attackInputs.length - 1].attack?.trim()
                  "
                >
                  {{ $t("incident.addattack") }}
                </button>
                <button
                  v-if="attackInputs.some((item) => item.attack?.trim())"
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveAttacks"
                  :disabled="
                    attackInputs.length > 0 &&
                    !attackInputs[attackInputs.length - 1].attack?.trim()
                  "
                >
                  {{ $t("incident.save") }}
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'detectedBy'" class="form-group">
              <div
                v-for="(detectedByValue, index) in detectedByInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="detectedByInputs[index].name"
                  type="text"
                  class="form-control me-2"
                  :placeholder="this.$t('incident.enter_detected_by')"
                  @input="trackDetectedByChange"
                  :class="{
                    'is-invalid':
                      duplicateDetectedByError &&
                      isDetectedByDuplicate(
                        detectedByInputs[index].name,
                        index
                      ),
                  }"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeDetectedByInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addDetectedByInput"
                  :disabled="
                    detectedByInputs.length > 0 &&
                    (!detectedByInputs[detectedByInputs.length - 1].name ||
                      !detectedByInputs[
                        detectedByInputs.length - 1
                      ].name.trim())
                  "
                >
                  {{ $t("incident.adddetector") }}
                </button>
                <button
                  v-if="
                    detectedByInputs.some(
                      (detectedBy) => detectedBy.name && detectedBy.name.trim()
                    )
                  "
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveDetectedBy"
                  :disabled="
                    detectedByInputs.length > 0 &&
                    (!detectedByInputs[detectedByInputs.length - 1].name ||
                      !detectedByInputs[
                        detectedByInputs.length - 1
                      ].name.trim())
                  "
                >
                  {{ $t("incident.save") }}
                </button>
              </div>
            </div>

            <!-- TLP Tab -->
            <div v-if="activeTab === 'tlp'" class="form-group">
              <div
                v-for="(tlp, index) in tlpInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="tlpInputs[index].name"
                  type="text"
                  class="form-control me-2"
                  :placeholder="
                    this.$t('incident.enter_tlp_name') || 'Enter TLP name'
                  "
                  @input="trackTlpChange"
                  :class="{
                    'is-invalid':
                      duplicateTlpNameError &&
                      isTlpNameDuplicate(tlpInputs[index].name, index),
                  }"
                />
                <input
                  v-model="tlpInputs[index].description"
                  type="text"
                  class="form-control me-2"
                  :placeholder="
                    this.$t('incident.enter_tlp_description') ||
                    'Enter description'
                  "
                />
                <input
                  v-model="tlpInputs[index].color"
                  type="color"
                  class="form-control form-control-color me-2"
                  :title="this.$t('incident.choose_color') || 'Choose color'"
                  :class="{
                    'is-invalid':
                      duplicateTlpColorError &&
                      isTlpColorDuplicate(tlpInputs[index].color, index),
                  }"
                  style="width: 80px"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeTlpInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div
                v-if="duplicateTlpNameError || duplicateTlpColorError"
                class="invalid-feedback d-block ms-2 mt-1"
              >
                <span v-if="duplicateTlpNameError">
                  {{
                    $t("incident.tlp_name_must_be_unique") ||
                    "TLP name must be unique"
                  }}
                </span>
                <span v-if="duplicateTlpColorError">
                  {{
                    $t("incident.tlp_color_must_be_unique") ||
                    "TLP color must be unique"
                  }}
                </span>
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addTlpInput"
                  :disabled="
                    tlpInputs.length > 0 &&
                    (!tlpInputs[tlpInputs.length - 1].name ||
                      !tlpInputs[tlpInputs.length - 1].name.trim() ||
                      !tlpInputs[tlpInputs.length - 1].color ||
                      isTlpNameDuplicate(
                        tlpInputs[tlpInputs.length - 1].name,
                        tlpInputs.length - 1
                      ) ||
                      isTlpColorDuplicate(
                        tlpInputs[tlpInputs.length - 1].color,
                        tlpInputs.length - 1
                      ))
                  "
                >
                  {{ $t("incident.addtlplevel") || "Add TLP" }}
                </button>
                <button
                  v-if="
                    tlpInputs.some(
                      (tlp) => tlp.name && tlp.name.trim() && tlp.color
                    )
                  "
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveTlps"
                  :disabled="
                    tlpInputs.length > 0 &&
                    (!tlpInputs[tlpInputs.length - 1].name ||
                      !tlpInputs[tlpInputs.length - 1].name.trim() ||
                      !tlpInputs[tlpInputs.length - 1].color ||
                      isTlpNameDuplicate(
                        tlpInputs[tlpInputs.length - 1].name,
                        tlpInputs.length - 1
                      ) ||
                      isTlpColorDuplicate(
                        tlpInputs[tlpInputs.length - 1].color,
                        tlpInputs.length - 1
                      ))
                  "
                >
                  {{ $t("incident.save") }}
                </button>
              </div>
            </div>

            <!-- PAP Tab -->
            <div v-if="activeTab === 'pap'" class="form-group">
              <div
                v-for="(pap, index) in papInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="papInputs[index].name"
                  type="text"
                  class="form-control me-2"
                  :placeholder="
                    this.$t('incident.enter_pap_name') || 'Enter PAP name'
                  "
                  @input="trackPapChange"
                  :class="{
                    'is-invalid':
                      duplicatePapNameError &&
                      isPapNameDuplicate(papInputs[index].name, index),
                  }"
                />
                <input
                  v-model="papInputs[index].description"
                  type="text"
                  class="form-control me-2"
                  :placeholder="
                    this.$t('incident.enter_pap_description') ||
                    'Enter description'
                  "
                />
                <input
                  v-model="papInputs[index].color"
                  type="color"
                  class="form-control form-control-color me-2"
                  :title="this.$t('incident.choose_color') || 'Choose color'"
                  :class="{
                    'is-invalid':
                      duplicatePapColorError &&
                      isPapColorDuplicate(papInputs[index].color, index),
                  }"
                  style="width: 80px"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removePapInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div
                v-if="duplicatePapNameError || duplicatePapColorError"
                class="invalid-feedback d-block ms-2 mt-1"
              >
                <span v-if="duplicatePapNameError">
                  {{
                    $t("incident.pap_name_must_be_unique") ||
                    "PAP name must be unique"
                  }}
                </span>
                <span v-if="duplicatePapColorError">
                  {{
                    $t("incident.pap_color_must_be_unique") ||
                    "PAP color must be unique"
                  }}
                </span>
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addPapInput"
                  :disabled="
                    papInputs.length > 0 &&
                    (!papInputs[papInputs.length - 1].name ||
                      !papInputs[papInputs.length - 1].name.trim() ||
                      !papInputs[papInputs.length - 1].color ||
                      isPapNameDuplicate(
                        papInputs[papInputs.length - 1].name,
                        papInputs.length - 1
                      ) ||
                      isPapColorDuplicate(
                        papInputs[papInputs.length - 1].color,
                        papInputs.length - 1
                      ))
                  "
                >
                  {{ $t("incident.addpaplevel") || "Add PAP" }}
                </button>
                <button
                  v-if="
                    papInputs.some(
                      (pap) => pap.name && pap.name.trim() && pap.color
                    )
                  "
                  class="btn mt-2 btn-sm btn-primary"
                  @click="savePaps"
                  :disabled="
                    papInputs.length > 0 &&
                    (!papInputs[papInputs.length - 1].name ||
                      !papInputs[papInputs.length - 1].name.trim() ||
                      !papInputs[papInputs.length - 1].color ||
                      isPapNameDuplicate(
                        papInputs[papInputs.length - 1].name,
                        papInputs.length - 1
                      ) ||
                      isPapColorDuplicate(
                        papInputs[papInputs.length - 1].color,
                        papInputs.length - 1
                      ))
                  "
                >
                  {{ $t("incident.save") }}
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'incidentScore'" class="form-group">
              <!-- Incident Score Button -->
              <div class="mt-3 ms-5">
                <button
                  class="btn btn-sm btn-secondary"
                  @click="openIncidentScoreWizard"
                  type="button"
                >
                  {{ $t("incident.addincidentscore") }}
                </button>
              </div>

              <!-- Score Section -->
              <div class="score-section mt-4">
                <h5 class="section-title">
                  {{ $t("incident.scorecriteria") }}
                </h5>
                <div v-if="incidentScoreCriteria.length === 0" class="no-data">
                  {{ $t("incident.nocriteriadefinedyet") }}
                </div>
                <div v-else class="criteria-container">
                  <div
                    v-for="(criteria, index) in incidentScoreCriteria"
                    :key="'criteria-' + index"
                    class="criteria-card"
                  >
                    <div class="criteria-header">
                      <h6 class="criteria-title">{{ criteria.name }}</h6>
                    </div>
                    <p class="criteria-description">
                      {{ criteria.description }}
                    </p>
                    <table class="table score-table">
                      <thead>
                        <tr>
                          <th>{{ $t("incident.name") }}</th>
                          <th>{{ $t("incident.point") }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(score, scoreIndex) in criteria.scores"
                          :key="'score-' + scoreIndex"
                        >
                          <td>{{ score.level }}</td>
                          <td>{{ score.point }}</td>
                        </tr>
                        <!-- <tr
              v-if="
                !scoringInputs[criteria.name] ||
                scoringInputs[criteria.name].length === 0
              "
            >
              <td colspan="2">No levels defined</td>
            </tr> -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Classify Section -->
              <div class="classify-section mt-4">
                <h5 class="section-title">
                  {{ $t("incident.classifications") }}
                </h5>
                <div
                  v-if="incidentClassifications.length === 0"
                  class="no-data"
                >
                  {{ $t("incident.noclassificationsdefinedyet") }}
                </div>
                <div v-else class="classification-container">
                  <table class="table classify-table">
                    <thead>
                      <tr>
                        <th>{{ $t("incident.priority") }}</th>
                        <th>{{ $t("incident.value") }}</th>
                        <th>{{ $t("incident.color") }}</th>
                        <th>{{ $t("incident.sla(hours)") }}</th>
                        <th>{{ $t("incident.description") }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(
                          classification, index
                        ) in incidentClassifications"
                        :key="index"
                        class="classification-row"
                      >
                        <td>{{ classification.priority }}</td>
                        <td>{{ classification.value }}</td>
                        <td>
                          <span
                            class="color-swatch"
                            :style="{ backgroundColor: classification.color }"
                          ></span>
                        </td>
                        <td>{{ classification.sla }}</td>
                        <td>{{ classification.description || "N/A" }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="isIncidentScoreWizardOpen" class="modal-overlay">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      {{ $t("incident.incidentscoredefinition") }}
                    </h5>
                    <button
                      aria-label="Close"
                      @click="closeIncidentScoreWizard"
                      type="button"
                    >
                      <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                  </div>
                  <div class="modal-body">
                    <!-- Wizard Navigation -->
                    <div class="step-progress">
                      <div
                        class="step"
                        :class="{ active: currentWizardStep === 1 }"
                      >
                        <span class="step-number">1</span>
                        <span class="step-label">{{
                          $t("incident.definecriteria")
                        }}</span>
                      </div>
                      <div class="step-line"></div>
                      <div
                        class="step"
                        :class="{ active: currentWizardStep === 2 }"
                      >
                        <span class="step-number">2</span>
                        <span class="step-label">{{
                          $t("incident.scoringsystem")
                        }}</span>
                      </div>
                      <div class="step-line"></div>
                      <div
                        class="step"
                        :class="{ active: currentWizardStep === 3 }"
                      >
                        <span class="step-number">3</span>
                        <span class="step-label">{{
                          $t("incident.classifyincident")
                        }}</span>
                      </div>
                    </div>

                    <!-- Wizard Content -->
                    <transition name="fade" mode="out-in">
                      <div class="tab-content mt-5" :key="currentWizardStep">
                        <!-- Step 1: Define Criteria -->
                        <div v-if="currentWizardStep === 1" class="form-group">
                          <div
                            v-for="(criteria, index) in incidentScoreCriteria"
                            :key="index"
                            class="d-flex align-items-start mt-2"
                          >
                            <div class="position-relative">
                              <input
                                style="width: 95%"
                                v-model="incidentScoreCriteria[index].name"
                                type="text"
                                class="form-control me-2"
                                :placeholder="
                                  this.$t('incident.enter_criteria_name')
                                "
                                @input="trackCriteriaNameChange(index)"
                              />
                            </div>
                            <input
                              v-model="incidentScoreCriteria[index].description"
                              type="text"
                              class="form-control me-2"
                              :placeholder="
                                this.$t('incident.enter_criteria_description')
                              "
                            />
                            <button
                              style="color: red"
                              class="btn btn-sm"
                              @click="removeCriteriaInput(index)"
                              type="button"
                            >
                              <i class="fa-solid fa-trash"></i>
                            </button>
                          </div>
                          <div class="mt-3 ms-5">
                            <button
                              class="btn btn-sm mt-2 me-2 btn-secondary"
                              @click="addCriteriaInput"
                              type="button"
                              :disabled="
                                incidentScoreCriteria.length > 0 &&
                                (!incidentScoreCriteria[
                                  incidentScoreCriteria.length - 1
                                ]?.name ||
                                  !incidentScoreCriteria[
                                    incidentScoreCriteria.length - 1
                                  ]?.description ||
                                  isDuplicateCriteriaName(
                                    incidentScoreCriteria[
                                      incidentScoreCriteria.length - 1
                                    ]?.name,
                                    incidentScoreCriteria.length - 1
                                  ))
                              "
                            >
                              <i class="fa-solid fa-plus"></i>
                              {{ $t("incident.addcriteria") }}
                            </button>
                            <button
                              v-if="
                                incidentScoreCriteria.some(
                                  (c) =>
                                    c.name.trim() &&
                                    c.description &&
                                    !isDuplicateCriteriaName(
                                      c.name,
                                      incidentScoreCriteria.indexOf(c)
                                    )
                                )
                              "
                              class="btn mt-2 btn-sm btn-secondary"
                              @click="saveCriteria"
                              :disabled="
                                incidentScoreCriteria.length > 0 &&
                                (!incidentScoreCriteria[
                                  incidentScoreCriteria.length - 1
                                ]?.name?.trim() ||
                                  !incidentScoreCriteria[
                                    incidentScoreCriteria.length - 1
                                  ]?.description)
                              "
                              type="button"
                            >
                              {{ $t("incident.save") }}
                            </button>
                          </div>
                        </div>

                        <!-- Step 2: Scoring System -->
                        <div v-if="currentWizardStep === 2" class="form-group">
                          <h5 style="text-align: center">
                            {{ $t("incident.predefinedcriteria") }}
                          </h5>
                          <div class="sub-nav-tabs-container">
                            <ul class="nav nav-tabs sub-nav-tabs">
                              <li
                                class="nav-item"
                                v-for="(criteria, index) in incidentScores"
                                :key="index"
                              >
                                <a
                                  class="nav-link"
                                  :class="{
                                    active: activeCriteriaTab === criteria.name,
                                  }"
                                  @click="setActiveCriteriaTab(criteria.name)"
                                  href="#"
                                >
                                  {{ criteria.name }}
                                </a>
                              </li>
                            </ul>
                          </div>

                          <transition name="fade" mode="out-in">
                            <div
                              class="sub-tab-content mt-5"
                              :key="activeCriteriaTab"
                            >
                              <div
                                v-for="(
                                  criteria, index
                                ) in incidentScoreCriteria"
                                :key="index"
                                v-show="activeCriteriaTab === criteria.name"
                              >
                                <div
                                  v-for="(
                                    score, scoreIndex
                                  ) in getScoringInputs(criteria.name)"
                                  :key="scoreIndex"
                                  class="d-flex align-items-center mt-2"
                                >
                                  <div
                                    class="form-group me-2 position-relative"
                                  >
                                    <input
                                      v-model="
                                        scoringInputs[criteria.name][scoreIndex]
                                          .level
                                      "
                                      type="text"
                                      class="form-control"
                                      :placeholder="
                                        this.$t('incident.enter_level_name')
                                      "
                                      @blur="
                                        validateScoringInputs(criteria.name)
                                      "
                                    />
                                  </div>
                                  <div
                                    class="form-group me-2 position-relative"
                                  >
                                    <input
                                      v-model.number="
                                        scoringInputs[criteria.name][scoreIndex]
                                          .point
                                      "
                                      type="number"
                                      class="form-control"
                                      :placeholder="
                                        this.$t('incident.enter_point')
                                      "
                                      min="0"
                                      @input="
                                        if (
                                          scoringInputs[criteria.name][
                                            scoreIndex
                                          ].point < 0
                                        ) {
                                          scoringInputs[criteria.name][
                                            scoreIndex
                                          ].point = 0;
                                        }
                                      "
                                    />
                                  </div>

                                  <button
                                    style="color: red; margin-bottom: 12px"
                                    class="btn btn-sm"
                                    @click="
                                      removeScoringInput(
                                        criteria.name,
                                        scoreIndex
                                      )
                                    "
                                    type="button"
                                  >
                                    <i class="fa-solid fa-trash"></i>
                                  </button>
                                </div>
                                <div class="mt-3 ms-5">
                                  <button
                                    class="btn btn-sm mt-2 me-2 btn-secondary"
                                    @click="addScoringInput(criteria.name)"
                                    type="button"
                                    :disabled="
                                      getScoringInputs(criteria.name).length >
                                        0 &&
                                      (!scoringInputs[criteria.name][
                                        getScoringInputs(criteria.name).length -
                                          1
                                      ]?.level?.trim() ||
                                        scoringInputs[criteria.name][
                                          getScoringInputs(criteria.name)
                                            .length - 1
                                        ]?.point == null ||
                                        scoringInputs[criteria.name][
                                          getScoringInputs(criteria.name)
                                            .length - 1
                                        ]?.point === '')
                                    "
                                  >
                                    <i class="fa-solid fa-plus"></i>
                                  </button>
                                  <button
                                    v-if="
                                      getScoringInputs(criteria.name).length > 0
                                    "
                                    class="btn mt-2 btn-sm btn-secondary"
                                    @click="saveScoring(criteria.name)"
                                    type="button"
                                    :disabled="
                                      getScoringInputs(criteria.name).length >
                                        0 &&
                                      (!scoringInputs[criteria.name][
                                        getScoringInputs(criteria.name).length -
                                          1
                                      ]?.level?.trim() ||
                                        scoringInputs[criteria.name][
                                          getScoringInputs(criteria.name)
                                            .length - 1
                                        ]?.point == null ||
                                        scoringInputs[criteria.name][
                                          getScoringInputs(criteria.name)
                                            .length - 1
                                        ]?.point === '')
                                    "
                                  >
                                    {{ $t("incident.save") }}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>

                        <div v-if="currentWizardStep === 3" class="form-group">
                          <div class="hint-equation">
                            <p style="margin-bottom: 0px">
                              {{ totalScoreEquation }}
                            </p>
                          </div>
                          <div
                            v-for="(
                              classification, index
                            ) in incidentClassifications"
                            :key="index"
                            class="classification-row mt-2"
                          >
                            <div class="d-flex align-items-center">
                              <div class="form-group me-2 flex-fill">
                                <label
                                  style="font-size: 12px !important"
                                  for="priority"
                                  >{{ $t("incident.priority") }}</label
                                >
                                <input
                                  v-model="
                                    incidentClassifications[index].priority
                                  "
                                  type="text"
                                  class="form-control"
                                  :placeholder="
                                    this.$t('incident.enter_priority')
                                  "
                                  :class="{
                                    'is-invalid': !isPriorityUnique(
                                      incidentClassifications[index].priority,
                                      index
                                    ),
                                  }"
                                />
                                <div class="invalid-feedback">
                                  <span
                                    v-if="
                                      !isPriorityUnique(
                                        incidentClassifications[index].priority,
                                        index
                                      )
                                    "
                                  >
                                    {{ $t("incident.prioritymustbeunique") }}
                                  </span>
                                </div>
                              </div>
                              <div class="form-group me-2" style="width: 140px">
                                <label
                                  style="font-size: 12px !important"
                                  for="value"
                                  >{{ $t("incident.value") }}</label
                                >
                                <input
                                  v-model.number="
                                    incidentClassifications[index].value
                                  "
                                  type="number"
                                  min="1"
                                  class="form-control"
                                  :placeholder="this.$t('incident.enter_value')"
                                  :class="{
                                    'is-invalid':
                                      !isValueUnique(
                                        incidentClassifications[index].value,
                                        index
                                      ) ||
                                      (Number.isInteger(
                                        Number(
                                          incidentClassifications[index].value
                                        )
                                      ) &&
                                        (incidentClassifications[index].value >
                                          maxTotalScore ||
                                          incidentClassifications[index].value <
                                            1)),
                                  }"
                                  @blur="validateValue(index)"
                                />
                                <div class="invalid-feedback">
                                  <span
                                    v-if="
                                      !isValueUnique(
                                        incidentClassifications[index].value,
                                        index
                                      )
                                    "
                                  >
                                    {{ $t("incident.valuemustbeunique") }}
                                  </span>
                                  <span
                                    v-else-if="
                                      Number.isInteger(
                                        Number(
                                          incidentClassifications[index].value
                                        )
                                      ) &&
                                      incidentClassifications[index].value >
                                        maxTotalScore
                                    "
                                  >
                                    {{
                                      $t("incident.valuecannotexceedtotalscore")
                                    }}
                                    ({{ maxTotalScore }})
                                  </span>
                                  <span
                                    v-else-if="
                                      Number.isInteger(
                                        Number(
                                          incidentClassifications[index].value
                                        )
                                      ) &&
                                      incidentClassifications[index].value < 0
                                    "
                                  >
                                    {{ $t("incident.valuemustbeatleast1") }}
                                  </span>
                                </div>
                              </div>
                              <div class="form-group me-2" style="width: 140px">
                                <label
                                  style="font-size: 12px !important"
                                  for="sla"
                                  >{{ $t("incident.sla(hours)") }}</label
                                >
                                <input
                                  v-model.number="
                                    incidentClassifications[index].sla
                                  "
                                  type="number"
                                  step="1"
                                  min="1"
                                  onkeydown="return false"
                                  class="form-control"
                                  :placeholder="this.$t('incident.enter_sla')"
                                />
                                <div class="invalid-feedback"></div>
                                <!-- Placeholder for consistent spacing -->
                              </div>
                              <div class="form-group me-2" style="width: 80px">
                                <label
                                  style="font-size: 12px !important"
                                  for="color"
                                  >{{ $t("incident.color") }}</label
                                >
                                <input
                                  v-model="incidentClassifications[index].color"
                                  type="color"
                                  class="form-control form-control-color"
                                  :title="this.$t('incident.choose_color')"
                                />
                                <div class="invalid-feedback">
                                  <span
                                    v-if="
                                      !isColorUnique(
                                        incidentClassifications[index].color,
                                        index
                                      )
                                    "
                                  >
                                    {{ $t("incident.unique") }}!
                                  </span>
                                </div>
                              </div>
                              <button
                                style="
                                  color: red;
                                  margin-top: 40px;
                                  font-size: 16px;
                                "
                                class="btn btn-sm"
                                @click="removeClassificationInput(index)"
                                type="button"
                              >
                                <i class="fa-solid fa-trash"></i>
                              </button>
                            </div>
                            <div class="form-group">
                              <input
                                v-model="
                                  incidentClassifications[index].description
                                "
                                type="text"
                                class="form-control"
                                :placeholder="
                                  this.$t('incident.enter_description')
                                "
                              />
                              <div class="invalid-feedback"></div>
                              <!-- Placeholder for consistent spacing -->
                            </div>
                          </div>
                          <div class="mt-3 ms-5">
                            <button
                              class="btn btn-sm mt-2 me-2 btn-secondary"
                              @click="addClassificationInput"
                              type="button"
                              :disabled="isAddClassificationDisabled"
                            >
                              <i class="fa-solid fa-plus"></i>
                              {{ $t("incident.addclassification") }}
                            </button>
                            <button
                              v-if="
                                incidentClassifications.some(
                                  (c) =>
                                    c.priority &&
                                    Number.isInteger(Number(c.value)) &&
                                    c.value <= maxTotalScore &&
                                    c.value >= 1 &&
                                    c.color &&
                                    Number.isInteger(Number(c.sla))
                                )
                              "
                              class="btn mt-2 btn-sm btn-secondary"
                              @click="saveClassifications"
                              :disabled="isAddClassificationDisabled"
                              type="button"
                            >
                              {{ $t("incident.save") }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>
                  <div class="modal-footer">
                    <button
                    style="background-color: #6e3894 !important;"
                      v-if="currentWizardStep > 1"
                      class="btn btn-sm btn-secondary me-2"
                      @click="setWizardStep(currentWizardStep - 1)"
                      type="button"
                    >
                      {{ $t("incident.back") }}
                    </button>
                    <button
                    style="background-color: #6e3894 !important;"
                      v-if="currentWizardStep < wizardSteps.length"
                      class="btn btn-sm btn-secondary"
                      @click="setWizardStep(currentWizardStep + 1)"
                      :disabled="!canProceedToNextStep"
                      type="button"
                    >
                      {{ $t("incident.next") }}
                    </button>
                    <button
                    style="background-color: #6e3894 !important;"
                      v-if="currentWizardStep === wizardSteps.length"
                      class="btn btn-sm btn-secondary"
                      @click="closeIncidentScoreWizard"
                      :disabled="!canProceedToNextStep"
                      type="button"
                    >
                      {{ $t("incident.end") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'playBookCategory'" class="form-group">
              <!-- Nested Tab Navigation for Play Book Category -->
              <div class="sub-nav-tabs-container">
                <ul class="nav nav-tabs sub-nav-tabs">
                  <li
                    class="nav-item"
                    v-for="(subTab, index) in playBookCategoryTabs"
                    :key="index"
                  >
                    <a
                      class="nav-link"
                      :class="{
                        active: activePlayBookCategoryTab === subTab.name,
                      }"
                      @click="setActivePlayBookCategoryTab(subTab.name)"
                      href="#"
                    >
                      {{ $t(subTab.label) }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Nested Tab Content -->
              <transition name="fade" mode="out-in">
                <div
                  class="sub-tab-content mt-5"
                  :key="activePlayBookCategoryTab"
                >
                  <!-- Containments -->
                  <div
                    v-if="activePlayBookCategoryTab === 'containments'"
                    class="form-group"
                  >
                    <div
                      v-for="(containment, index) in containmentInputs"
                      :key="index"
                      class="d-flex align-items-center mt-2"
                    >
                      <input
                        v-model="containmentInputs[index]"
                        type="text"
                        class="form-control me-2"
                        :placeholder="
                          this.$t('incident.enter_containment_category')
                        "
                      />
                      <button
                        style="color: red"
                        class="btn btn-sm"
                        @click="removeContainmentInput(index)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                    <div class="mt-3 ms-5">
                      <button
                        class="btn btn-sm mt-2 me-2 btn-primary"
                        @click="addContainmentInput"
                        :disabled="
                          containmentInputs.length > 0 &&
                          !containmentInputs[
                            containmentInputs.length - 1
                          ]?.trim()
                        "
                      >
                        {{ $t("incident.addcontainmentcategory") }}
                      </button>
                      <button
                        v-if="
                          containmentInputs.some((containment) =>
                            containment.trim()
                          )
                        "
                        class="btn mt-2 btn-sm btn-primary"
                        @click="saveContainments"
                      >
                        {{ $t("incident.save") }}
                      </button>
                    </div>
                  </div>

                  <!-- Eradications -->
                  <div
                    v-if="activePlayBookCategoryTab === 'eradications'"
                    class="form-group"
                  >
                    <div
                      v-for="(eradication, index) in eradicationInputs"
                      :key="index"
                      class="d-flex align-items-center mt-2"
                    >
                      <input
                        v-model="eradicationInputs[index]"
                        type="text"
                        class="form-control me-2"
                        :placeholder="
                          this.$t('incident.enter_eradication_category')
                        "
                      />
                      <button
                        style="color: red"
                        class="btn btn-sm"
                        @click="removeEradicationInput(index)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                    <div class="mt-3 ms-5">
                      <button
                        class="btn btn-sm mt-2 me-2 btn-primary"
                        @click="addEradicationInput"
                        :disabled="
                          eradicationInputs.length > 0 &&
                          !eradicationInputs[
                            eradicationInputs.length - 1
                          ]?.trim()
                        "
                      >
                        {{ $t("incident.adderadicationcategory") }}
                      </button>
                      <button
                        v-if="
                          eradicationInputs.some((eradication) =>
                            eradication.trim()
                          )
                        "
                        class="btn mt-2 btn-sm btn-primary"
                        @click="saveEradications"
                      >
                        {{ $t("incident.save") }}
                      </button>
                    </div>
                  </div>

                  <!-- Recoveries -->
                  <div
                    v-if="activePlayBookCategoryTab === 'recoveries'"
                    class="form-group"
                  >
                    <div
                      v-for="(itemrecovery, index) in recoveryInputs"
                      :key="index"
                      class="d-flex align-items-center mt-2"
                    >
                      <input
                        v-model="recoveryInputs[index]"
                        type="text"
                        class="form-control me-2"
                        :placeholder="
                          this.$t('incident.enter_recovery_category')
                        "
                      />
                      <button
                        style="color: red"
                        class="btn btn-sm"
                        @click="removeRecoveryInput(index)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                    <div class="mt-3 ms-5">
                      <button
                        class="btn btn-sm mt-2 me-2 btn-primary"
                        @click="addRecoveryInput"
                        :disabled="
                          recoveryInputs.length > 0 &&
                          !recoveryInputs[recoveryInputs.length - 1]?.trim()
                        "
                      >
                        {{ $t("incident.addrecoverycategory") }}
                      </button>
                      <button
                        v-if="recoveryInputs.some((item) => item.trim())"
                        class="btn mt-2 btn-sm btn-primary"
                        @click="saveRecoveries"
                      >
                        {{ $t("incident.save") }}
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div v-if="activeTab === 'playBook'" class="form-group">
              <!-- Add Play Book Button -->
              <div class="mt-3 ms-5">
                <button
                  class="btn btn-sm btn-primary"
                  @click="openPlayBookModal"
                >
                  {{ $t("incident.addplaybook") }}
                </button>
              </div>

              <!-- Play Books Table -->
              <div class="mt-6">
                <table class="table classify-table">
                  <thead>
                    <tr>
                      <th>
                        <i class="fa-solid fa-signature"></i>
                        {{ $t("incident.name") }}
                      </th>
                      <th>
                        <i class="fa-solid fa-file-signature"></i>
                        {{ $t("incident.type") }}
                      </th>
                      <th>
                        <i class="fa-solid fa-users"></i>
                        {{ $t("incident.responsibles") }}
                      </th>
                      <th>{{ $t("incident.actions") }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-if="playBooks.length"
                      v-for="(playBook, index) in playBooks"
                      :key="index"
                    >
                      <td>{{ playBook?.name }}</td>
                      <td>{{ playBook?.responsibleType }}</td>
                      <td>{{ playBook?.responsibleName }}</td>
                      <td>
                        <button
                          class="btn"
                          @click="openPlayBookActionsModal(index)"
                          title="Add Actions"
                        >
                          <i class="fa-solid fa-plus"></i>
                        </button>
                        <button
                          class="btn"
                          @click="editPlayBook(index)"
                          title="Edit Playbook"
                        >
                          <i class="fa-solid fa-pen"></i>
                        </button>
                        <button
                          class="btn"
                          @click="deletePlayBook(index)"
                          title="Delete Playbook"
                        >
                          <i class="fa-solid fa-trash" style="color: red"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="isPlayBookActionsModalOpen" class="modal-overlay">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      {{ selectedPlayBook?.name }} {{ $t("incident.actions") }}
                    </h5>
                    <button
                      class="btn-close"
                      aria-label="Close"
                      @click="closePlayBookActionsModal"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <!-- Tab Navigation for Actions -->
                    <div
                      class="nav-tabs-container"
                      style="position: absolute; width: 100%"
                    >
                      <ul class="nav nav-tabs">
                        <li
                          class="nav-item"
                          v-for="(tab, index) in actionTabs"
                          :key="index"
                        >
                          <a
                            class="nav-link"
                            :class="{ active: activeActionTab === tab.name }"
                            @click="setActiveActionTab(tab.name)"
                            href="#"
                          >
                            {{ $t(tab.label) }}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <!-- Tab Content -->
                    <transition name="fade" mode="out-in">
                      <div class="tab-content mt-5" :key="activeActionTab">
                        <!-- Add Action Button -->
                        <div class="mt-3 ms-5">
                          <button
                            class="btn btn-sm btn-primary"
                            @click="openActionModal"
                          >
                            {{ $t("incident.addaction") }}
                          </button>
                        </div>

                        <!-- Actions Table -->
                        <div class="mt-3">
                          <table class="table classify-table">
                            <thead>
                              <tr>
                                <th>{{ $t("incident.name") }}</th>
                                <th>{{ $t("incident.category") }}</th>
                                <th>{{ $t("incident.actions") }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(action, actionIndex) in validActions"
                                :key="actionIndex"
                              >
                                <td>
                                  {{ action?.name || "" }}
                                </td>
                                <td>
                                  {{ getCategoryName(action?.category) || "" }}
                                </td>
                                <td>
                                  <button
                                    class="btn"
                                    @click="editAction(actionIndex)"
                                    title="Edit Action"
                                    :disabled="!action"
                                  >
                                    <i class="fa-solid fa-pen"></i>
                                  </button>
                                  <button
                                    class="btn"
                                    @click="
                                      deleteAction(activeActionTab, action)
                                    "
                                    title="Delete Action"
                                    :disabled="!action"
                                  >
                                    <i
                                      class="fa-solid fa-trash"
                                      style="color: red"
                                    ></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </transition>
                  </div>
                  <div class="modal-footer">
                    <button
                      class="btn btn-sm btn-secondary"
                      @click="closePlayBookActionsModal"
                    >
                      {{ $t("incident.cancel") }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="isActionModalOpen" class="modal-overlay">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      {{ isEditingAction ? "Edit Action" : "Add Action" }}
                    </h5>
                    <button aria-label="Close" @click="closeActionModal">
                      <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                  </div>
                  <div class="modal-body">
                    <!-- Category Selection -->
                    <div class="form-group">
                      <label for="actionCategory">{{
                        $t("incident.actioncategory")
                      }}</label>

                      <v-select
                        v-model="newAction.category"
                        :options="dynamicActionCategoryOptions"
                        :reduce="(item) => item.value"
                        label="label"
                        id="actionCategory"
                        class="form-control"
                        :placeholder="this.$t('incident.select_category')"
                      />
                    </div>
                    <!-- Action Type Selection -->
                    <!-- <div class="form-group radio-group">
          <label>Action Type</label>
          <div class="radio-options ms-3">
            <div class="radio-item">
              <input
                type="radio"
                id="existingAction"
                value="existing"
                v-model="newAction.type"
                name="actionType"
              />
              <label for="existingAction">Existing Action</label>
            </div>
            <div class="radio-item">
              <input
                type="radio"
                id="newAction"
                value="new"
                v-model="newAction.type"
                name="actionType"
              />
              <label for="newAction">New Action</label>
            </div>
          </div>
        </div> -->
                    <!-- Existing Action Selection -->
                    <!-- <div
          v-if="newAction.type === 'existing'"
          class="form-group"
        >
          <label for="existingActionSelect">Select Action</label>
          <v-select
            v-model="newAction.actionId"
            :options="filteredActionOptions"
            :reduce="(item) => item.id"
            label="name"
            id="existingActionSelect"
            class="form-control"
            placeholder="Select action"
          />
        </div> -->
                    <!-- New Action Input -->
                    <div class="form-group">
                      <label for="newActionName">{{
                        $t("incident.actionname")
                      }}</label>
                      <input
                        v-model="newAction.name"
                        id="newActionName"
                        type="text"
                        class="form-control"
                        :placeholder="this.$t('incident.enter_action_name')"
                      />
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button
                      class="btn btn-primary"
                      @click="saveAction"
                      :disabled="!isActionValid"
                    >
                      {{ isEditingAction ? "Update" : "Save" }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Play Book Modal -->
              <div v-if="isPlayBookModalOpen" class="modal-overlay">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">
                      {{
                        editingIndex !== null
                          ? this.$t("incident.addplaybook")
                          : this.$t("incident.addplaybook")
                      }}
                    </h5>
                    <button aria-label="Close" @click="closePlayBookModal">
                      <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                  </div>
                  <div class="modal-body">
                    <div class="form-group">
                      <label for="playBookName">{{
                        $t("incident.name")
                      }}</label>
                      <input
                        v-model="newPlayBook.name"
                        id="playBookName"
                        type="text"
                        class="form-control"
                        :placeholder="this.$t('incident.enter_playbook_name')"
                      />
                    </div>
                    <div class="form-group radio-group">
                      <label for="responsibleType">{{
                        $t("incident.responsibletype")
                      }}</label>
                      <div class="radio-options ms-3">
                        <div class="radio-item">
                          <input
                            type="radio"
                            id="user"
                            value="User"
                            v-model="newPlayBook.responsibleType"
                            name="responsibleType"
                          />
                          <label for="user">{{ $t("incident.user") }}</label>
                        </div>
                        <div class="radio-item">
                          <input
                            type="radio"
                            id="team"
                            value="Team"
                            v-model="newPlayBook.responsibleType"
                            name="responsibleType"
                          />
                          <label for="team">{{ $t("incident.team") }}</label>
                        </div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="responsible">{{
                        $t("incident.responsibles(csirt)")
                      }}</label>

                      <!-- Show UserSelect when Playbook responsible type is User -->
                      <UserSelect
                        v-if="newPlayBook.responsibleType === 'User'"
                        id="responsible"
                        v-model="newPlayBook.responsibleId"
                        multiple
                        :placeholder="this.$t('incident.select_responsibles')"
                      />

                      <!-- Show TeamSelect when Playbook responsible type is Team -->
                      <TeamSelect
                        v-else-if="newPlayBook.responsibleType === 'Team'"
                        id="responsible"
                        v-model="newPlayBook.responsibleId"
                        multiple
                        :placeholder="this.$t('incident.select_responsibles')"
                      />

                      <!-- Disabled empty select when no type is chosen -->
                      <v-select
                        v-else
                        id="responsible"
                        :options="[]"
                        :reduce="(item) => item.id"
                        :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                        class="form-control"
                        :placeholder="this.$t('incident.select_responsibles')"
                        disabled
                      />
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button
                      class="btn btn-primary"
                      @click="savePlayBook"
                      :disabled="
                        !newPlayBook.name || !newPlayBook.responsibleId
                      "
                    >
                      {{ $t("incident.save") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Update the IRA tab content -->
            <div v-if="activeTab === 'ira'" class="form-group">
              <div class="ira-form">
                <!-- Form for Adding/Editing IRA (shown when editing or no IRA exists) -->
                <div v-if="editingIRA || !ira" class="ira-form-container">
                  <div class="form-group">
                    <label for="iraName">{{ $t("incident.name") }}</label>
                    <input
                      v-model="newIRA.name"
                      id="iraName"
                      type="text"
                      class="form-control"
                      :placeholder="this.$t('incident.enter_ira_name')"
                      :class="{ 'is-invalid': !newIRA.name.trim() }"
                    />
                    <!-- <div v-if="!newIRA.name.trim()" class="invalid-feedback">
                      IRA name is required
                    </div> -->
                  </div>

                  <div class="form-group radio-group">
                    <label>{{ $t("incident.responsibletype") }}</label>
                    <div class="radio-options ms-3">
                      <div class="radio-item">
                        <input
                          type="radio"
                          id="iraUser"
                          value="User"
                          v-model="newIRA.responsibleType"
                          name="iraResponsibleType"
                        />
                        <label for="iraUser">{{ $t("incident.user") }}</label>
                      </div>
                      <div class="radio-item">
                        <input
                          type="radio"
                          id="iraTeam"
                          value="Team"
                          v-model="newIRA.responsibleType"
                          name="iraResponsibleType"
                        />
                        <label for="iraTeam">{{ $t("incident.team") }}</label>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="iraResponsibles">{{
                      $t("incident.responsibles")
                    }}</label>

                    <!-- Show UserSelect when "User" is selected -->
                    <UserSelect
                      v-if="newIRA.responsibleType === 'User'"
                      id="iraResponsibles"
                      v-model="newIRA.responsibleId"
                      multiple
                      :placeholder="this.$t('incident.select_responsibles')"
                    />

                    <!-- Show TeamSelect when "Team" is selected -->
                    <TeamSelect
                      v-else-if="newIRA.responsibleType === 'Team'"
                      id="iraResponsibles"
                      v-model="newIRA.responsibleId"
                      multiple
                      :placeholder="this.$t('incident.select_responsibles')"
                    />

                    <!-- Disabled select when no type is chosen yet -->
                    <v-select
                      v-else
                      id="iraResponsibles"
                      :options="[]"
                      :reduce="(item) => item.id"
                      :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                      class="form-control"
                      :placeholder="this.$t('incident.select_responsibles')"
                      disabled
                    />
                    <!-- <div
                      v-if="newIRA.responsibleId.length === 0"
                      class="invalid-feedback"
                    >
                      At least one responsible is required
                    </div> -->
                  </div>

                  <div class="mt-3">
                    <button
                      class="btn btn-sm btn-primary me-2"
                      @click="saveIRA"
                      :disabled="!isIRAValid"
                    >
                      {{
                        ira
                          ? this.$t("incident.update")
                          : this.$t("incident.save")
                      }}
                    </button>
                    <button
                      class="btn btn-sm btn-secondary"
                      @click="cancelEditIRA"
                      v-if="ira"
                    >
                      {{ $t("incident.cancel") }}
                    </button>
                  </div>
                </div>

                <!-- Updated IRA Display (shown when IRA exists and not editing) -->
                <div v-else class="ira-display-container">
                  <div class="mt-3">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th style="background-color: #6e3894; color: white">
                            <i class="fa-solid fa-signature"></i>
                            {{ $t("incident.name") }}
                          </th>
                          <th style="background-color: #6e3894; color: white">
                            <i class="fa-solid fa-file-signature"></i>
                            {{ $t("incident.type") }}
                          </th>
                          <th style="background-color: #6e3894; color: white">
                            <i class="fa-solid fa-users"></i>
                            {{ $t("incident.responsibles") }}
                          </th>
                          <th style="background-color: #6e3894; color: white">
                            {{ $t("incident.actions") }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="ira">
                          <td>{{ ira.name }}</td>
                          <td>{{ ira.responsibleType }}</td>
                          <td>{{ ira.responsibleName }}</td>
                          <td>
                            <button
                              class="btn"
                              @click="editIRA"
                              title="Edit IRA"
                            >
                              <i class="fa-solid fa-pen"></i>
                            </button>
                            <button
                              class="btn"
                              @click="deleteIRA"
                              title="Delete IRA"
                            >
                              <i
                                class="fa-solid fa-trash"
                                style="color: red"
                              ></i>
                            </button>
                          </td>
                        </tr>
                        <tr v-else>
                          <td colspan="4" class="text-center">
                            {{ $t("incident.noiradefinedyet.") }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-sm btn-secondary"
          @click="closeConfigurationsModal"
        >
          {{ $t("incident.cancel") }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="isIncidentEditModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("incident.incidentresponse") }}</h5>
        <button
          aria-label="Close"
          @click="closeIncidentEditModal"
          type="button"
        >
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
      </div>
      <div class="modal-body">
        <!-- Wizard Navigation -->
        <div class="step-progress">
          <div class="step" :class="{ active: currentEditWizardStep === 1 }">
            <span class="step-number">1</span>
            <span class="step-label">{{ $t("incident.detection") }}</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentEditWizardStep === 2 }">
            <span class="step-number">2</span>
            <span class="step-label">{{ $t("incident.association") }}</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentEditWizardStep === 3 }">
            <span class="step-number">3</span>
            <span class="step-label">{{ $t("incident.assessment") }}</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentEditWizardStep === 4 }">
            <span class="step-number">4</span>
            <span class="step-label">{{ $t("incident.assignment") }}</span>
          </div>
          <div class="step-line" v-if="canAccessReviewStep"></div>
          <div
            class="step"
            :class="{ active: currentEditWizardStep === 5 }"
            v-if="canAccessReviewStep"
          >
            <span class="step-number">5</span>
            <span class="step-label">{{ $t("incident.playbook") }}</span>
          </div>
        </div>

        <!-- Wizard Content -->
        <transition name="fade" mode="out-in">
          <div class="tab-content mt-5" :key="currentEditWizardStep">
            <!-- Step 1: Detection -->
            <div v-if="currentEditWizardStep === 1" class="incident-details">
              <!-- <div class="incident-card"> -->
              <div class="">
                <div class="incident-card-body">
                  <!-- Summary -->
                  <div class="detail-row">
                    <span class="detail-label">{{
                      $t("incident.summary")
                    }}</span>
                    <span class="detail-value">{{
                      editingIncident.summary || "N/A"
                    }}</span>
                  </div>
                  <!-- Details -->
                  <div class="detail-row">
                    <span class="detail-label">{{
                      $t("incident.details")
                    }}</span>
                    <span class="detail-value">{{
                      stripHtmlTags(editingIncident.details) || "N/A"
                    }}</span>
                  </div>

                  <!-- Supporting Document -->
                  <div
                    v-if="
                      currentIncident?.incidentFile?.length > 0 &&
                      !(
                        currentIncident.incidentFile.length === 1 &&
                        currentIncident.incidentFile[0] === null
                      )
                    "
                    class="detail-row"
                  >
                    <span class="detail-label">{{ $t("incident.file") }}</span>
                    <a
                      class="detail-value"
                      :href="currentIncident.fullIncidentFilePath"
                      target="_blank"
                      >{{
                        getFileName(currentIncident.fullIncidentFilePath) ||
                        "N/A"
                      }}</a
                    >
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">{{
                      $t("incident.reporter")
                    }}</span>
                    <span class="detail-value">{{
                      getUserName(editingIncident.createdBy) || "N/A"
                    }}</span>
                  </div>

                  <!-- Two-Column Grid for Other Attributes -->
                  <div class="row">
                    <!-- Row 1: Type and Direction -->
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">{{
                          $t("incident.type")
                        }}</span>
                        <span class="detail-value">{{
                          getCaseTypeName(editingIncident.caseType)
                        }}</span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">{{
                          $t("incident.direction")
                        }}</span>
                        <span class="detail-value">{{
                          getCaseDirectionName(editingIncident.direction)
                        }}</span>
                      </div>
                    </div>

                    <!-- Row 2: Attack and Detector -->
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">{{
                          $t("incident.attack")
                        }}</span>
                        <span class="detail-value">{{
                          getAttackName(editingIncident.attack)
                        }}</span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">{{
                          $t("incident.detector")
                        }}</span>
                        <span class="detail-value">{{
                          getDetectorName(editingIncident.detectedBy)
                        }}</span>
                      </div>
                    </div>

                    <!-- Row 3: Detection Time and Status -->
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">{{
                          $t("incident.detectiontime")
                        }}</span>
                        <span class="detail-value">{{
                          editingIncident.detectedAt || "N/A"
                        }}</span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">{{
                          $t("incident.status")
                        }}</span>
                        <select
                          class="status-select"
                          v-model="editingIncident.status"
                          aria-label="Incident status"
                        >
                          <option value="1">{{ $t("incident.open") }}</option>
                          <option value="2">
                            {{ $t("incident.inprogress") }}
                          </option>
                          <option value="3">{{ $t("incident.closed") }}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Association (Placeholder) -->
            <div
              v-if="currentEditWizardStep === 2"
              class="form-group association-step"
            >
              <div class="row">
                <!-- Related Incidents -->
                <div class="col-6 mb-3">
                  <label for="relatedIncidents" class="detail-label">{{
                    $t("incident.relatedincidents")
                  }}</label>
                  <LazySelectField
                    name="relatedIncidents"
                    v-model="editingIncident.relatedIncidents"
                    :placeholder="$t('incident.select_related_incidents')"
                    options="Incident"
                          :apiParams="{
        filter: `id|${editingIncident.id}|!=`,}"
                    option-label="summary"
                    option-value="id"
                    multiple
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  />
                </div>

                <!-- Related Risks -->
                <div class="col-6 mb-3">
                  <label for="relatedRisks" class="detail-label">{{
                    $t("incident.relatedrisks")
                  }}</label>
                  <LazySelectField
                    name="relatedRisks"
                    v-model="editingIncident.relatedRisks"
                    :placeholder="$t('incident.select_risks')"
                    options="Risk"
                    option-label="subject"
                    option-value="id"
                    multiple
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  />
                </div>

                <!-- Source Tag -->
                <div class="col-6 mb-3">
                  <label for="sourceTag" class="detail-label">{{
                    $t("incident.sourcetag")
                  }}</label>
                  <input
                    id="sourceTag"
                    v-model="editingIncident.sourceTag"
                    type="text"
                    class="form-control"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                    :placeholder="this.$t('incident.enter_source_tag')"
                  />
                </div>

                <!-- Destination Tag -->
                <div class="col-6 mb-3">
                  <label for="destinationTag" class="detail-label">{{
                    $t("incident.destinationtag")
                  }}</label>
                  <input
                    id="destinationTag"
                    v-model="editingIncident.destinationTag"
                    type="text"
                    class="form-control"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                    :placeholder="this.$t('incident.enter_destination_tag')"
                  />
                </div>

                <!-- Related Assets -->
                <div class="col-12 mb-3">
                  <label for="relatedAssets" class="detail-label">{{
                    $t("incident.affectedassets")
                  }}</label>
                  <LazySelectField
                    name="relatedAssets"
                    v-model="editingIncident.relatedAssets"
                    :placeholder="$t('incident.select_assets')"
                    options="Asset"
                    option-label="name"
                    option-value="id"
                    multiple
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  />
                </div>

                <!-- Affected Users -->
                <div class="col-md-12 mb-3">
                  <label for="affectedUsers" class="detail-label">{{
                    $t("incident.affected_users")
                  }}</label>
                  <UserSelect
                    id="affectedUsers"
                    v-model="editingIncident.affectedUsers"
                    :options="users"
                    :reduce="(user) => user.id"
                    label="full_name"
                    multiple
                    :placeholder="
                      this.$t('incident.select_related_affected_users')
                    "
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                    <template #option="{ full_name, id }">
                      <span>{{ full_name }}</span>
                    </template>
                  </UserSelect>
                </div>

                <!-- Other Assets -->
                <div class="col-md-12 mb-3">
                  <label for="otherAssets" class="detail-label">{{
                    $t("incident.other_assets")
                  }}</label>
                  <ckeditor
                    id="otherAssets"
                    v-model="editingIncident.otherAssets"
                    :editor="editor"
                    :config="editorConfig"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  ></ckeditor>
                </div>

                <!-- New file upload field -->
                <div class="form-group">
                  <label class="detail-label">{{
                    $t("incident.supportingfiles(multiple)")
                  }}</label>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    class="form-control file-input"
                    multiple
                  />
                  <small class="form-text text-muted">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB.
                  </small>
                  <!-- Display uploaded files -->
                  <div
                    v-if="currentIncident.file && currentIncident.file.length"
                    class="mt-3"
                  >
                    <h6 class="mb-2">{{ $t("incident.uploadedfiles") }} :</h6>
                    <ul class="list-group">
                      <li
                        v-for="(file, index) in currentIncident.file"
                        :key="index"
                        class="d-flex justify-content-between align-items-center"
                      >
                        <a
                          class="badge badge-primary"
                          :href="file"
                          target="_blank"
                          >{{ file.name || getFileName(file) }}</a
                        >
                        <button
                          type="button"
                          class="btn btn-sm"
                          @click="removeFile(index)"
                          :disabled="
                            canAccessReviewStep &&
                            !ira.responsibleId.includes(loggedInUser.id)
                          "
                        >
                          <i class="icofont icofont-trash text-danger"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Assessment (Placeholder) -->
            <div
              v-if="currentEditWizardStep === 3"
              class="form-group assessment-step"
            >
              <h4 class="section-title">
                {{ $t("incident.incidentassessment") }}
              </h4>
              <div v-if="incidentScoreCriteria.length" class="criteria-table">
                <div class="table-header">
                  <div class="header-item">{{ $t("incident.criterion") }}</div>
                  <div class="header-item">
                    {{ $t("incident.description") }}
                  </div>
                  <div class="header-item">
                    {{ $t("incident.severitylevel") }}
                  </div>
                </div>
                <div
                  v-for="(criterion, index) in incidentScoreCriteria"
                  :key="index"
                  class="table-row"
                >
                  <div class="row-item criterion-name">
                    {{ criterion.name }}
                  </div>
                  <div class="row-item criterion-description">
                    {{ criterion.description }}
                  </div>
                  <div class="row-item criterion-select">
                    <LazySelectField
                     style="width: 100%"
                      :name="`assessment-level-${index}`"
                      v-model="editingIncident.assessment[criterion.name]"
                      :options="criterion.scores.map(s => ({ ...s, label: `${s.level} (${s.point} points)` }))"
                      option-label="label"
                      option-value="point"
                      :placeholder="$t('incident.select_an_answer')"
                      :disabled="
                        canAccessReviewStep &&
                        !ira.responsibleId.includes(loggedInUser.id)
                      "
                      :on-update="calculateTotalScore"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="no-data">
                {{
                  $t(
                    "incident.no_assessment_criteria_defined.please_configure_criteria_in_the_settings."
                  )
                }}
              </div>
              <div class="score-summary">
                <span class="summary-label"
                  >{{ $t("incident.totalassessmentscore") }} :</span
                >
                <span class="summary-value"
                  >{{ totalAssessmentScore }} / {{ maxAssessmentScore }}</span
                >
              </div>
            </div>

            <!-- Step 4: Assignment (Placeholder) -->
            <div
              v-if="currentEditWizardStep === 4"
              class="form-group assignment-step"
            >
              <div class="row">
                <!-- Case Type -->
                <div class="col-md-6 mb-3">
                  <label for="ResponseCaseType" class="detail-label">{{
                    $t("incident.casetype")
                  }}</label>
                  <LazySelectField
                    name="ResponseCaseType"
                    v-model="editingIncident.ResponseCaseType"
                    :placeholder="$t('incident.selectcasetype')"
                    :options="caseTypes"
                    option-label="type"
                    option-value="id"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  />
                </div>
                <!-- Reporter -->
                <div class="col-md-6 mb-3">
                  <label for="reporter" class="detail-label">{{
                    $t("incident.reporter")
                  }}</label>
                  <UserSelect
                    name="createdBy"
                    v-model="editingIncident.createdBy"
                    :placeholder="$t('incident.selectreporter')"
                    :options="users"
                    option-label="full_name"
                    option-value="id"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                  </UserSelect>
                </div>
                <!-- Play Book -->
                <div class="col-md-12 mb-3">
                  <label for="playBook" class="detail-label">{{
                    $t("incident.playbook")
                  }}</label>
                  <LazySelectField
                    name="playBook"
                    v-model="editingIncident.playBookId"
                    :placeholder="$t('incident.selectplaybook')"
                    :options="playBooks"
                    option-label="name"
                    option-value="id"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  />
                </div>

                <!-- Stakeholders -->
                <div class="col-md-12 mb-3">
                  <label for="stakeholders" class="detail-label">{{
                    $t("incident.stakeholders")
                  }}</label>
                  <UserSelect
                    id="stakeholders"
                    v-model="editingIncident.stakeholders"
                    :options="users"
                    :reduce="(user) => user.id"
                    label="full_name"
                    multiple
                    :placeholder="
                      this.$t('incident.select_related_stakeholders')
                    "
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                    <template #option="{ full_name, id }">
                      <span>{{ full_name }}</span>
                    </template>
                  </UserSelect>
                </div>
              </div>
            </div>

            <!-- Step 5: Review -->
            <div
              v-if="currentEditWizardStep === 5 && canAccessReviewStep"
              class="form-group review-step"
            >
              <!-- Tab Navigation for Review Actions -->
              <div
                style="position: relative; text-align: center; width: 100%"
                class="nav-tabs-container"
              >
                <ul class="nav nav-tabs">
                  <li
                    class="nav-item"
                    v-for="(tab, index) in reviewTabs"
                    :key="index"
                  >
                    <a
                      class="nav-link"
                      :class="{ active: activeReviewTab === tab.name }"
                      @click="setActiveReviewTab(tab.name)"
                      href="#"
                    >
                      {{ tab.label }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Tab Content -->
              <div class="tab-content mt-3">
                <!-- Containments -->
                <div
                  v-if="activeReviewTab === 'containments'"
                  class="tab-pane active"
                >
                  <ul class="list-group">
                    <li
                      v-for="(action, index) in filteredContainmentActions"
                      :key="action.name"
                      class="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{{ action.name }} </span>
                      <div>
                        <!-- <div>{{ currentIncident[index] }}</div> -->
                        <select
                          :value="action.status"
                          :disabled="
                            currentIncident.playBookActionsStatus.find(
                              (item) => item.name === action.name
                            )?.status === 'Done'
                          "
                          class="form-select d-inline-block w-auto"
                          @change="
                            updateActionStatus(
                              'containments',
                              index,
                              $event.target.value
                            )
                          "
                        >
                          <option
                            v-for="status in statusOptions"
                            :key="status"
                            :value="status"
                          >
                            {{ status }}
                          </option>
                        </select>
                        <button
                          v-if="action.status === 'Done'"
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Add Evidence"
                          @click="openEvidenceModal('containments', index)"
                        >
                          <i class="fa-solid fa-plus"></i>
                        </button>
                        <span
                          style="margin: 5px"
                          class="badge badge-primary rounded-circle"
                          >{{
                            editingIncident?.evidence.filter(
                              (evidence) =>
                                evidence.actionTab === "containments" &&
                                evidence.actionName === action.name
                            ).length
                          }}</span
                        >
                        <button
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Comments"
                          @click="
                            openActionCommentsModal('containments', action.name)
                          "
                        >
                          <i class="fa-solid fa-comments"></i>
                        </button>
                        <button
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Status Change Log"
                          @click="
                            openActionStatusLog('containments', action.name)
                          "
                        >
                          <i class="fa-solid fa-circle-question"></i>
                        </button>
                      </div>
                    </li>
                  </ul>
                  <!-- Containment Evidence Table -->
                  <div style="margin-top: 70px" class="evidence-section">
                    <h3 class="section-title">
                      {{ $t("incident.evidences") }}
                    </h3>
                    <div
                      v-if="
                        currentIncident.evidence &&
                        currentIncident.evidence.filter(
                          (e) => e.actionTab === 'containments'
                        ).length
                      "
                      class="table-container"
                    >
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>{{ $t("incident.name") }}</th>
                            <th>{{ $t("incident.file") }}</th>
                            <th>{{ $t("incident.stage") }}</th>
                            <th>{{ $t("incident.relatedaction") }}</th>
                            <th>{{ $t("incident.uploader") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(
                              evidence, index
                            ) in currentIncident.evidence.filter(
                              (e) => e.actionTab === 'containments'
                            )"
                            :key="index"
                          >
                            <td>{{ evidence.name }}</td>
                            <td>
                              <a
                                :href="evidence.file"
                                target="_blank"
                                class="btn-link"
                                >{{ getFileName(evidence.file) }}</a
                              >
                            </td>
                            <td>{{ formatActionTab(evidence.actionTab) }}</td>
                            <td>{{ evidence.actionName }}</td>
                            <td>{{ getUserName(evidence.createdBy) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="no-data">
                      {{ $t("incident.no_evidence_available_for_this_stage") }}
                    </div>
                  </div>
                </div>

                <!-- Eradications -->
                <div
                  v-if="activeReviewTab === 'eradications'"
                  class="tab-pane active"
                >
                  <ul class="list-group">
                    <li
                      v-for="(action, index) in filteredEradicationActions"
                      :key="index"
                      class="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{{ action.name }} </span>
                      <div>
                        <select
                          :value="action.status"
                          :disabled="
                            currentIncident.playBookActionsStatus.find(
                              (item) => item.name === action.name
                            )?.status === 'Done'
                          "
                          class="form-select d-inline-block w-auto"
                          @change="
                            updateActionStatus(
                              'eradications',
                              index,
                              $event.target.value
                            )
                          "
                        >
                          <option
                            v-for="status in statusOptions"
                            :key="status"
                            :value="status"
                          >
                            {{ status }}
                          </option>
                        </select>
                        <button
                          v-if="action.status === 'Done'"
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Add Evidence"
                          @click="openEvidenceModal('eradications', index)"
                        >
                          <i class="fa-solid fa-plus"></i>
                        </button>
                        <span
                          style="margin: 5px"
                          class="badge badge-primary rounded-circle"
                          >{{
                            editingIncident?.evidence.filter(
                              (evidence) =>
                                evidence.actionTab === "eradications" &&
                                evidence.actionName === action.name
                            ).length
                          }}</span
                        >
                        <button
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Comments"
                          @click="
                            openActionCommentsModal('eradications', action.name)
                          "
                        >
                          <i class="fa-solid fa-comments"></i>
                        </button>
                        <button
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Status Change Log"
                          @click="
                            openActionStatusLog('eradications', action.name)
                          "
                        >
                          <i class="fa-solid fa-circle-question"></i>
                        </button>
                      </div>
                    </li>
                  </ul>
                  <!-- Eradication Evidence Table -->
                  <div style="margin-top: 70px" class="evidence-section">
                    <h3 class="section-title">
                      {{ $t("incident.evidences") }}
                    </h3>
                    <div
                      v-if="
                        currentIncident.evidence &&
                        currentIncident.evidence.filter(
                          (e) => e.actionTab === 'eradications'
                        ).length
                      "
                      class="table-container"
                    >
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>{{ $t("incident.name") }}</th>
                            <th>{{ $t("incident.file") }}</th>
                            <th>{{ $t("incident.stage") }}</th>
                            <th>{{ $t("incident.relatedaction") }}</th>
                            <th>{{ $t("incident.uploader") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(
                              evidence, index
                            ) in currentIncident.evidence.filter(
                              (e) => e.actionTab === 'eradications'
                            )"
                            :key="index"
                          >
                            <td>{{ evidence.name }}</td>
                            <td>
                              <a
                                :href="evidence.file"
                                target="_blank"
                                class="btn-link"
                                >{{ getFileName(evidence.file) }}</a
                              >
                            </td>
                            <td>{{ formatActionTab(evidence.actionTab) }}</td>
                            <td>{{ evidence.actionName }}</td>
                            <td>{{ getUserName(evidence.createdBy) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="no-data">
                      {{ $t("incident.no_evidence_available_for_this_stage") }}
                    </div>
                  </div>
                </div>

                <!-- Recoveries -->
                <div
                  v-if="activeReviewTab === 'recoveries'"
                  class="tab-pane active"
                >
                  <ul class="list-group">
                    <li
                      v-for="(action, index) in filteredRecoveryActions"
                      :key="index"
                      class="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span
                        >{{ action.name }}
                        <!-- ({{
                          getCategoryName(action?.category) || ""
                        }}) -->
                      </span>
                      <div>
                        <select
                          :value="action.status"
                          :disabled="
                            currentIncident.playBookActionsStatus.find(
                              (item) => item.name === action.name
                            )?.status === 'Done'
                          "
                          class="form-select d-inline-block w-auto"
                          @change="
                            updateActionStatus(
                              'recoveries',
                              index,
                              $event.target.value
                            )
                          "
                        >
                          <option
                            v-for="status in statusOptions"
                            :key="status"
                            :value="status"
                          >
                            {{ status }}
                          </option>
                        </select>
                        <button
                          v-if="action.status === 'Done'"
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Add Evidence"
                          @click="openEvidenceModal('recoveries', index)"
                        >
                          <i class="fa-solid fa-plus"></i>
                        </button>
                        <span
                          style="margin: 5px"
                          class="badge badge-primary rounded-circle"
                          >{{
                            editingIncident?.evidence.filter(
                              (evidence) =>
                                evidence.actionTab === "recoveries" &&
                                evidence.actionName === action.name
                            ).length
                          }}</span
                        >
                        <button
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Comments"
                          @click="
                            openActionCommentsModal('recoveries', action.name)
                          "
                        >
                          <i class="fa-solid fa-comments"></i>
                        </button>
                        <button
                          class="btn btn-link p-0 ml-2 mr-2"
                          title="Status Change Log"
                          @click="
                            openActionStatusLog('recoveries', action.name)
                          "
                        >
                          <i class="fa-solid fa-circle-question"></i>
                        </button>
                      </div>
                    </li>
                  </ul>
                  <!-- Recovery Evidence Table -->
                  <div style="margin-top: 70px" class="evidence-section">
                    <h3 class="section-title">
                      {{ $t("incident.evidences") }}
                    </h3>
                    <div
                      v-if="
                        currentIncident.evidence &&
                        currentIncident.evidence.filter(
                          (e) => e.actionTab === 'recoveries'
                        ).length
                      "
                      class="table-container"
                    >
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>{{ $t("incident.name") }}</th>
                            <th>{{ $t("incident.file") }}</th>
                            <th>{{ $t("incident.stage") }}</th>
                            <th>{{ $t("incident.relatedaction") }}</th>
                            <th>{{ $t("incident.uploader") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(
                              evidence, index
                            ) in currentIncident.evidence.filter(
                              (e) => e.actionTab === 'recoveries'
                            )"
                            :key="index"
                          >
                            <td>{{ evidence.name }}</td>
                            <td>
                              <a
                                :href="evidence.file"
                                target="_blank"
                                class="btn-link"
                                >{{ getFileName(evidence.file) }}</a
                              >
                            </td>
                            <td>{{ formatActionTab(evidence.actionTab) }}</td>
                            <td>{{ evidence.actionName }}</td>
                            <td>{{ getUserName(evidence.createdBy) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="no-data">
                      {{ $t("incident.no_evidence_available_for_this_stage") }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <div class="modal-footer">
        <button
        style="background-color: #6e3894 !important;"
          v-if="currentEditWizardStep > 1"
          class="btn btn-sm btn-secondary me-2"
          @click="setEditWizardStep(currentEditWizardStep - 1)"
          type="button"
        >
          {{ $t("incident.back") }}
        </button>
        <button
        style="background-color: #6e3894 !important;"
          v-if="currentEditWizardStep < (canAccessReviewStep ? 5 : 4)"
          class="btn btn-sm btn-secondary"
          @click="setEditWizardStep(currentEditWizardStep + 1)"
          type="button"
        >
          {{ $t("incident.next") }}
        </button>
        <button
        style="background-color: #6e3894 !important;"
          v-if="currentEditWizardStep === (canAccessReviewStep ? 5 : 4)"
          class="btn btn-sm btn-secondary"
          @click="saveIncident"
          type="button"
        >
          {{ $t("incident.save") }}
        </button>
      </div>

      <!-- Evidence Modal -->
      <div
        v-if="isEvidenceModalOpen"
        class="modal-overlay"
        tabindex="-1"
        style="background-color: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-content-log">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t("incident.addevidence") }}</h5>
            <button
              aria-label="Close"
              @click="closeEvidenceModal"
              type="button"
            >
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="evidenceName" class="form-label">{{
                $t("incident.evidencename")
              }}</label>
              <input
                v-model="newEvidence.name"
                type="text"
                class="form-control"
                id="evidenceName"
                :placeholder="this.$t('incident.enter_evidence_name')"
                required
              />
            </div>
            <div class="mb-3">
              <label for="evidenceFile" class="form-label">{{
                $t("incident.uploadfile")
              }}</label>
              <input
                type="file"
                class="form-control"
                id="evidenceFile"
                ref="evidenceFileInput"
                @change="handleEvidenceFileChange"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              :disabled="!isEvidenceValid"
              @click="saveEvidence"
            >
              {{ $t("incident.save") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Comments Modal -->
  <comment-modal
    v-if="isActionCommentsModalOpen"
    :isVisible="isActionCommentsModalOpen"
    :commentableType="'incident_playbook_action'"
    :commentableId="actionCommentsTarget.id"
    :userId="loggedInUser?.id"
    :users="users"
    @close="closeActionCommentsModal"
  />

  <!-- Action Status Log Modal -->
  <div v-if="isActionStatusLogModalOpen" class="modal-overlay">
    <div class="modal-content-log">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="fa-solid fa-clock-rotate-left"></i> Status Change Log -
          {{ currentActionStatusLog.actionName }}
        </h5>
        <button
          class="btn-close"
          aria-label="Close"
          @click="closeActionStatusLog"
        ></button>
      </div>
      <div class="modal-body">
        <div
          v-if="
            currentActionStatusLog.logs &&
            currentActionStatusLog.logs.length > 0
          "
          class="table-responsive"
        >
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th>{{ $t("incident.date") }}</th>
                <th>{{ $t("incident.user") }}</th>
                <th>{{ $t("incident.old_status") }}</th>
                <th><i class="fa-solid fa-arrow-right"></i></th>
                <th>{{ $t("incident.new_status") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(log, index) in currentActionStatusLog.logs"
                :key="index"
              >
                <td>{{ formatLogDate(log.changedAt) }}</td>
                <td>{{ log.changedByName || "Unknown" }}</td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-secondary': log.oldStatus === 'None',
                      'bg-warning text-dark': log.oldStatus === 'Progress',
                      'bg-success': log.oldStatus === 'Done',
                    }"
                  >
                    {{ log.oldStatus }}
                  </span>
                </td>
                <td class="text-center">
                  <i class="fa-solid fa-arrow-right"></i>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-secondary': log.newStatus === 'None',
                      'bg-warning text-dark': log.newStatus === 'Progress',
                      'bg-success': log.newStatus === 'Done',
                    }"
                  >
                    {{ log.newStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-muted py-4">
          <i class="fa-solid fa-circle-info"></i>
          <p>{{ $t("incident.no_status_changes_recorded") }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeActionStatusLog">
          {{ $t("incident.close") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Comments Modal -->
  <div v-if="isCommentsModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ selectedIncident?.summary || "N/A" }} {{ $t("incident.comments") }}
        </h5>
        <button
          class="btn-close"
          aria-label="Close"
          @click="closeCommentsModal"
        ></button>
      </div>
      <div class="modal-body">
        <div class="comments-section">
          <div class="comment-input mb-3">
            <textarea
              v-model="newComment"
              style="resize: none; height: 100px !important"
              class="form-control"
              rows="3"
              :placeholder="this.$t('incident.add_a_comment')"
            ></textarea>
            <button
              style="margin: 20px; margin-top: 20px !important"
              class="btn btn-sm btn-primary mt-5"
              @click="addComment"
            >
              {{ $t("incident.postcomment") }}
            </button>
          </div>
          <div v-if="comments.length" class="comments-list">
            <div
              v-for="comment in paginatedComments"
              :key="comment.id"
              class="comment mb-3 p-3 rounded"
            >
              <!-- Comment Header -->
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <div>
                  <strong style="font-style: normal; color: black">{{
                    comment.user.full_name
                  }}</strong>
                  <small style="font-size: 10px" class="text-muted ms-2">
                    {{ formatCreatedDate(comment.created_at) }}
                  </small>
                </div>
                <div class="comment-actions">
                  <i
                    v-if="comment.user_id === loggedInUser.id"
                    class="fa-solid fa-pencil"
                    style="color: black; font-size: 14px; cursor: pointer"
                    @click="startEditing(comment)"
                    title="Edit Comment"
                  ></i>
                  <i
                    v-if="comment.user_id === loggedInUser.id"
                    class="fa-solid fa-trash"
                    style="color: red; font-size: 14px; cursor: pointer"
                    @click="deleteComment(comment.id)"
                    title="Delete Comment"
                  ></i>
                  <i
                    class="fas fa-reply"
                    style="font-size: 14px; cursor: pointer"
                    @click="toggleReplyForm(comment.id)"
                    title="Reply"
                  ></i>
                </div>
              </div>

              <!-- Comment Content -->
              <div
                style="font-style: normal; color: black; font-size: 14px"
                v-if="editingCommentId !== comment.id"
                class="comment-content mb-2"
              >
                {{ comment.content }}
              </div>

              <!-- Comment Edit Form -->
              <div v-else>
                <textarea
                  v-model="editingCommentContent"
                  class="form-control mb-2"
                  rows="3"
                ></textarea>
                <div class="d-flex justify-content-end gap-2">
                  <button
                    style="font-style: normal; font-size: xx-small"
                    class="btn btn-sm btn-primary"
                    @click="updateComment(comment.id)"
                  >
                    {{ $t("incident.save") }}
                  </button>
                  <button
                    style="font-style: normal; font-size: xx-small"
                    class="btn btn-sm btn-primary"
                    @click="cancelEditing"
                  >
                    {{ $t("incident.cancel") }}
                  </button>
                </div>
              </div>

              <!-- Reply Form -->
              <div
                v-if="replyingTo === comment.id"
                class="reply-form mt-3 ms-3"
              >
                <textarea
                  v-model="newReply"
                  class="form-control mb-2"
                  :placeholder="this.$t('incident.write_your_reply')"
                  rows="2"
                ></textarea>
                <div class="d-flex justify-content-end gap-2">
                  <button
                    style="font-style: normal; font-size: xx-small"
                    class="btn btn-sm btn-primary"
                    @click="submitReply(comment.id)"
                  >
                    {{ $t("incident.reply") }}
                  </button>
                  <button
                    style="font-style: normal; font-size: xx-small"
                    class="btn btn-sm btn-primary"
                    @click="toggleReplyForm(null)"
                  >
                    {{ $t("incident.cancel") }}
                  </button>
                </div>
              </div>

              <!-- Replies List -->
              <div v-if="comment.replies.length" class="replies mt-3 ms-4">
                <div
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="reply mb-2 p-2 bg-light rounded"
                >
                  <!-- Reply Header -->
                  <div
                    class="d-flex justify-content-between align-items-center mb-1"
                  >
                    <div>
                      <strong
                        style="
                          font-size: 12px;
                          color: black;
                          font-style: normal;
                        "
                        >{{ reply.user.full_name }}</strong
                      >
                      <small style="font-size: 10px" class="text-muted ms-2">
                        {{ formatCreatedDate(reply.created_at) }}
                      </small>
                    </div>
                    <div class="reply-actions">
                      <i
                        v-if="reply.user_id === loggedInUser.id"
                        class="fa-solid fa-pencil"
                        style="color: black; font-size: 10px"
                        @click="startEditing(reply)"
                        title="Edit"
                      ></i>
                      <i
                        v-if="reply.user_id === loggedInUser.id"
                        class="fa-solid fa-trash"
                        style="color: red; font-size: 10px"
                        @click="deleteComment(reply.id)"
                        title="Delete"
                      ></i>
                    </div>
                  </div>

                  <!-- Reply Content -->
                  <div
                    style="color: black; font-style: normal"
                    v-if="editingCommentId !== reply.id"
                  >
                    {{ reply.content }}
                  </div>

                  <!-- Reply Edit Form -->
                  <div v-else>
                    <textarea
                      v-model="editingCommentContent"
                      class="form-control mb-2"
                      rows="2"
                    ></textarea>
                    <div class="d-flex justify-content-end gap-2">
                      <button
                        style="font-style: normal; font-size: xx-small"
                        class="btn btn-sm btn-primary"
                        @click="updateComment(reply.id)"
                      >
                        {{ $t("incident.save") }}
                      </button>
                      <button
                        style="font-style: normal; font-size: xx-small"
                        class="btn btn-sm btn-secondary"
                        @click="cancelEditing"
                      >
                        {{ $t("incident.cancel") }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-center mt-3">
              <nav aria-label="Comments pagination">
                <ul class="pagination">
                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
                    <button
                      :title="this.$t('incident.previous_comments')"
                      style="color: black; background: white; border: none"
                      class="page-link"
                      @click="currentPage--"
                    >
                      <i class="fa-solid fa-arrow-left"></i>
                    </button>
                  </li>
                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === totalPages }"
                  >
                    <button
                      :title="this.$t('incident.next_comments')"
                      style="color: black; background: white; border: none"
                      class="page-link"
                      @click="currentPage++"
                    >
                      <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div v-else class="no-comments">..</div>
          <!-- Pagination -->
          <!-- <nav v-if="totalPages > 1" class="mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(currentPage - 1)"
                  >{{ $t("incident.previous") }}</a
                >
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(page)"
                  >{{ page }}</a
                >
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(currentPage + 1)"
                  >{{ $t("incident.next") }}</a
                >
              </li>
            </ul>
          </nav> -->
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm btn-secondary" @click="closeCommentsModal">
          {{ $t("incident.close") }}
        </button>
      </div>
    </div>
  </div>

  <!-- View User Details Modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />
</template>

<script>
import incident from "@/API/Incident/Incident";
import risk from "@/API/Risk/Risk";
import asset from "@/API/Asset/Asset";
import location from "@/API/Location/Location";
import incidentSetting from "@/API/IncidentSetting/IncidentSetting";
import Form from "@/components/Form.vue";
import Comment from "@/API/comment/comment";
import MainPage from "@/components/MainPage.vue";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import Swal from "sweetalert2";
import Auth from "@/API/Auth";
import { notify } from "@kyvg/vue3-notification";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.min.css";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CommentModal from "@/components/Comment.vue";
import VueApexCharts from "vue3-apexcharts";
import UserSelect from "@/components/UserSelect.vue";
import TeamSelect from "@/components/TeamSelect.vue";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    "v-select": VueSelect,
    FlatPickr,
    ckeditor: Ckeditor,
    CommentModal,
    apexchart: VueApexCharts,
    UserSelect,
    TeamSelect,
    PurpleDotsLoader,
    LazySelectField,
    ViewUserDetails,
  },

  setup() {
    const api = new incident();
    const apiIncidentSetting = new incidentSetting();
    const userApi = new user();
    const teamApi = new team();
    const commentApi = new Comment();
    const riskApi = new risk();
    const assetApi = new asset();
    const locationApi = new location();
    const apiParams = {};
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      userApi,
      teamApi,
      riskApi,
      assetApi,
      locationApi,
      tableColumns,
      fromFields,
      apiIncidentSetting,
      commentApi,
    };
  },

  data() {
    return {
      load: true,
      viewUserModal: false,
      userData: {},
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      isCommentsModalOpen: false,
      selectedIncident: null,
      comments: [],
      newComment: "",
      newReply: "",
      showReplyInput: null,
      currentPage: 1,
      replyingTo: null, // Track which comment is being replied to
      editingCommentId: null, // Track comment/reply being edited
      commentsPerPage: 5,
      isAddClassificationDisabled: false,
      isEvidenceModalOpen: false,
      currentIncident: {},
      newEvidence: {
        name: "",
        file: null,
      },
      actionCommentsDraft: {},
      isActionCommentsModalOpen: false,
      actionCommentsTarget: {
        type: null, // 'containment' | 'eradication' | 'recovery'
        name: null,
        id: null, // computed commentable_id
      },
      isActionStatusLogModalOpen: false,
      currentActionStatusLog: {
        actionName: null,
        actionType: null,
        logs: [],
      },
      // Statistics Modal Data
      isStatisticsModalOpen: false,
      selectedIncidentForStats: null,
      loadingStatistics: false,
      activeStatsTab: "overview",
      incidentStatistics: {
        timeToDetection: "-",
        timeToResolution: "-",
        relatedItemsCount: 0,
        assessmentScore: 0,
        maxScore: 0,
        evidenceCount: 0,
        slaStatus: "-",
        slaCompliant: false,
        relatedIncidents: [],
        relatedRisks: [],
        relatedAssets: [],
        affectedUsers: [],
        assessmentBreakdown: null,
        playbookProgress: 0,
        playbookActions: {},
        activityLog: [],
      },
      // Chart Options
      playbookActionsChartSeries: [],
      playbookActionsChartOptions: {
        chart: { type: "donut" },
        labels: [],
        colors: ["#28a745", "#ffc107", "#6c757d"],
        legend: { position: "bottom" },
        dataLabels: { enabled: true },
      },
      assessmentChartSeries: [],
      assessmentChartOptions: {
        chart: { type: "bar" },
        plotOptions: {
          bar: { horizontal: true, distributed: true },
        },
        colors: ["#6e3894"],
        xaxis: { categories: [] },
        legend: { show: false },
      },
      timelineChartSeries: [],
      timelineChartOptions: {
        chart: { type: "rangeBar" },
        plotOptions: {
          bar: { horizontal: true },
        },
        xaxis: { type: "datetime" },
        colors: ["#6e3894"],
      },
      relatedDataChartSeries: [],
      relatedDataChartOptions: {
        chart: { type: "pie" },
        labels: [],
        colors: ["#6e3894", "#5a2d7a", "#7a4d9a", "#9a6dba"],
        legend: { position: "bottom" },
      },
      activityChartSeries: [],
      activityChartOptions: {
        chart: { type: "area" },
        xaxis: { type: "datetime" },
        colors: ["#6e3894"],
        stroke: { curve: "smooth" },
      },
      selectedAction: {
        tab: null, // 'containments', 'eradications', or 'recoveries'
        index: null, // Index of the action in filtered actions
      },
      statusOptions: ["None", "Progress", "Done"],
      reviewTabs: [
        { name: "containments", label: this.$t("incident.containments") },
        { name: "eradications", label: this.$t("incident.eradications") },
        { name: "recoveries", label: this.$t("incident.recoveries") },
      ],
      activeReviewTab: "containments",
      containmentActions: [],
      eradicationActions: [],
      recoveryActions: [],
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      flatpickrConfig: {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        altInput: true,
        altFormat: "F j, Y h:i K",
        defaultDate: null,
      },
      isConfigurationsModalOpen: false,
      isStatisticsModalOpen: false,
      statisticsLoading: false,
      statisticsDateRange: "all",
      statisticsStatusFilter: "all",
      statisticsData: {
        allIncidents: [],
        filteredIncidents: [],
        kpis: {
          totalIncidents: 0,
          totalTrend: 0,
          openIncidents: 0,
          inProgressIncidents: 0,
          closedIncidents: 0,
          criticalOpen: 0,
          avgResolutionTime: "0h",
          avgResolutionHours: 0,
          mttr: "0h",
          slaCompliance: 0,
          slaBreach: 0,
          avgDetectionTime: "0h",
          closedToday: 0,
          closedThisWeek: 0,
          withEvidence: 0,
          evidenceCount: 0,
          avgIncidentsPerDay: 0,
          totalReporters: 0,
          staleIncidents: 0,
          newThisWeek: 0,
        },
        charts: {
          statusSeries: [],
          statusOptions: {},
          prioritySeries: [],
          priorityOptions: {},
          trendSeries: [],
          trendOptions: {},
          typeSeries: [],
          typeOptions: {},
          attackSeries: [],
          attackOptions: {},
          responseTimeSeries: [],
          responseTimeOptions: {},
          detectorSeries: [],
          detectorOptions: {},
          directionSeries: [],
          directionOptions: {},
        },
        topDetectors: [],
        topReporters: [],
      },
      formData: {
        caseType: "",
        caseDirection: "",
        attacks: "",
        detectedBy: "",
        siteLocation: "",
        incidentScore: "",
        playBookCategory: "",
        playBook: "",
        ira: "",
      },
      activeTab: "caseType",
      tabs: [
        { name: "caseType", label: this.$t("incident.casetype") },
        { name: "caseDirection", label: this.$t("incident.casedirection") },
        { name: "attacks", label: this.$t("incident.attacks") },
        { name: "detectedBy", label: this.$t("incident.detectedby") },
        { name: "tlp", label: this.$t("incident.tlp") || "TLP" },
        { name: "pap", label: this.$t("incident.pap") || "PAP" },
        // { name: "siteLocation", label: "Site/Location" },
        { name: "incidentScore", label: this.$t("incident.incidentscore") },
        {
          name: "playBookCategory",
          label: this.$t("incident.playbookcategory"),
        },
        { name: "playBook", label: this.$t("incident.playbook") },
        { name: "ira", label: this.$t("incident.ira") },
      ],
      caseTypeInputs: [],
      caseDirectionInputs: [],
      duplicateError: false,
      directionDuplicateError: false,
      incidentCaseTypes: [],
      incidentCaseDirections: [],
      caseTypes: [], // For case type dropdown options
      caseDirections: [], // For case direction dropdown options
      attackInputs: [], // Add for attack input fields
      incidentAttacks: [], // Add for storing fetched attacks
      attacks: [], // Add for dropdown options
      detectedByInputs: [], // Add for detected by input fields
      incidentDetectedBy: [], // Add for storing fetched detected by data
      detectedBy: [], // Add for dropdown options
      tlpInputs: [], // Add for TLP input fields
      incidentTlps: [], // Add for storing fetched TLP data
      tlps: [], // Add for dropdown options
      duplicateTlpNameError: false,
      duplicateTlpColorError: false,
      papInputs: [], // Add for PAP input fields
      incidentPaps: [], // Add for storing fetched PAP data
      paps: [], // Add for dropdown options
      duplicatePapNameError: false,
      duplicatePapColorError: false,
      siteLocationInputs: [], // Add for site/location input fields
      incidentSiteLocations: [], // Add for storing fetched site/location data
      siteLocations: [], // Add for dropdown options
      activePlayBookCategoryTab: "containments",
      playBookCategoryTabs: [
        { name: "containments", label: "Containments" },
        { name: "eradications", label: "Eradications" },
        { name: "recoveries", label: "Recoveries" },
      ],
      containmentInputs: [],
      eradicationInputs: [],
      recoveryInputs: [],
      incidentContainments: [],
      incidentEradications: [],
      incidentRecoveries: [],
      containments: [], // For dropdown options
      eradications: [], // For dropdown options
      recoveries: [], // For dropdown options
      isPlayBookModalOpen: false,
      newPlayBook: {
        name: "",
        responsibleType: "",
        responsibleId: [],
      },
      editingIndex: null,
      users: [], // For dropdown options
      teams: [], // For dropdown options
      isPlayBookActionsModalOpen: false,
      selecd: 0,
      activeActionTab: "containments",
      actionTabs: [
        { name: "containments", label: "Containments" },
        { name: "eradications", label: "Eradications" },
        { name: "recoveries", label: "Recoveries" },
      ],
      isActionModalOpen: false,
      newAction: {
        type: "existing",
        actionId: null,
        name: "",
        category: null, // Add category field
      },

      playBooks: [], // Ensure playBooks is initialized as an empty array
      isEditingAction: false, // New flag to track edit mode
      editingActionIndex: null,
      isIncidentScoreWizardOpen: false,
      currentWizardStep: 1,
      wizardSteps: [
        { title: "Define Criteria" },
        { title: "Scoring System" },
        { title: "Classify Incident" },
      ],
      incidentScoreCriteria: [], // Array to store criteria with name and description
      incidentScores: [],
      activeCriteriaTab: "", // Tracks the active criteria tab in Step 2
      scoringInputs: {}, // Stores level and point inputs for each criteria
      incidentClassifications: [],
      ira: null, // Will store the single IRA
      editingIRA: false, // Track if we're editing
      duplicateDetectedByError: false,
      newIRA: {
        name: "",
        responsibleType: "",
        responsibleId: [],
      },
      isIncidentEditModalOpen: false,
      currentEditWizardStep: 1,
      editWizardSteps: [
        { title: "Detection" },
        { title: "Association" },
        { title: "Assessment" },
        { title: "Assignment" },
        { title: "Review" }, // New step
      ],
      filter: {
        status: "",
        tlp: "",
        pap: "",
        playBookId: "",
        classification: "",
        caseType: "",
        // summary: "",
        // submission_date: "",
      },

      availableIncidents: [], // List of incidents excluding the current one
      availableRisks: [], // List of available risks
      availableAssets: [], // List of available assets
      filePreview: null,
      sourceTag: "",
      destinationTag: "",
      affectedUsers: [],
      editingIncident: {
        caseType: "",
        createdBy: "",
        stakeholders: "",
        playBookId: "",
        relatedIncidents: [],
        relatedRisks: [],
        relatedAssets: [],
        otherAssets: "",
        assessment: {},
        file: [],
      },
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const loggedInUser = Auth.USER;
        return {
          edit: row.status != "1" && row.reporter != loggedInUser.id,
          delete:
            row.status != "1" &&
            row.reporter != loggedInUser.id &&
            ("playBookId" in row || row.playBookId),
        };
      };
    },
    paginatedComments() {
      const start = (this.currentPage - 1) * this.commentsPerPage;
      const end = start + this.commentsPerPage;
      return this.comments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.comments.length / this.commentsPerPage);
    },
    canAddComment() {
      return this.ira && this.ira.responsibleId.includes(this.loggedInUser.id);
    },
    canReply() {
      return this.ira && this.ira.responsibleId.includes(this.loggedInUser.id);
    },
    dynamicActionCategoryOptions() {
      let sourceData = [];
      // Determine the data source based on the active tab
      switch (this.activeActionTab) {
        case "containments":
          sourceData = this.incidentContainments;
          break;
        case "eradications":
          sourceData = this.incidentEradications;
          break;
        case "recoveries":
          sourceData = this.incidentRecoveries;
          break;
        default:
          return []; // Return empty if no tab is matched
      }

      if (!sourceData || sourceData.length === 0) {
        return [];
      }

      // Map the fetched data to the format required by v-select
      return sourceData.map((item) => ({
        label: item.category,
        value: item.id,
      }));
    },
    canAccessReviewStep() {
      const playBoo = this.playBooks.find(
        (p) => p.id === this.currentIncident.playBookId
      );
      console.log("selectedPlayBookkkkkkkkkkk", playBoo);
      console.log("currentIncidenttttttttttttttttttttt", this.currentIncident);
      return (
        this.currentIncident.playBookId &&
        this.isUserResponsibleForPlaybook(playBoo)
      );
    },
    isEvidenceValid() {
      return this.newEvidence.name.trim() && this.newEvidence.file !== null;
    },

    selectedPlayBook() {
      if (!this.editingIncident.playBookId) return null;
      return (
        this.playBooks.find((p) => p.id === this.editingIncident.playBookId) ||
        null
      );
    },
    totalAssessmentScore() {
      return Object.values(this.editingIncident.assessment || {}).reduce(
        (sum, score) => {
          const numericScore = Number(score);
          return (
            sum +
            (isNaN(numericScore) || score === null || score === undefined
              ? 0
              : numericScore)
          );
        },
        0
      );
    },
    incidentFilters() {
      return [
        {
          title: "Status",
          key: "status",
          type: "string",
          data: [
            { id: "1", name: "Open" },
            { id: "2", name: "In Progress" },
            { id: "3", name: "Closed" },
          ],
        },
        {
          title: "TLP",
          key: "tlp",
          type: "string",
          data: this.tlps,
        },
        {
          title: "PAP",
          key: "pap",
          type: "string",
          data: this.paps,
        },
        {
          title: "Playbook",
          key: "playBookId",
          type: "string",
          data:
            this.playBooks?.map((pb) => ({ id: pb.id, name: pb.name })) || [],
        },
        {
          title: "Classification",
          key: "classification",
          type: "string",
          data:
            this.incidentClassifications?.map((ic) => ({
              id: ic.priority,
              name: ic.priority,
            })) || [],
        },
        {
          title: "Case Type",
          key: "caseType",
          type: "string",
          data:
            this.caseTypes?.map((ct) => ({ id: ct.id, name: ct.type })) || [],
        },
        {
          title: "Reporter",
          key: "createdBy",
          type: "string",
          data: "User",
        },
        {
          title: "CSIRT ",
          key: "csirt_users",
          type: "string",
          data: "User",
        },
      ];
    },

    filteredContainmentActions() {
      // if (
      //   !this.selectedPlayBook?.actions?.containments ||
      //   !this.editingIncident?.playBookActionsStatus ||
      //   !Array.isArray(this.selectedPlayBook.actions.containments)
      // ) {
      //   console.log("Invalid playbook or actions:", {
      //     selectedPlayBook: this.selectedPlayBook,
      //     playBookActionsStatus: this.editingIncident?.playBookActionsStatus,
      //   });
      //   return [];
      // }

      const filteredActions = this.selectedPlayBook.actions.containments
        .filter((action) => {
          if (action == null) {
            console.log("Found null action:", action);
            return false;
          }
          if (typeof action !== "object") {
            console.log("Found non-object action:", action);
            return false;
          }
          if (
            !action.name ||
            typeof action.name !== "string" ||
            !action.name.trim()
          ) {
            console.log("Found invalid action name:", action);
            return false;
          }
          return true;
        })
        .map((action) => {
          if (!this.editingIncident.playBookActionsStatus) {
            return {
              name: action.name,
              category: action.category || "",
              status: action.status || "None",
              evidence: action.evidence || [],
              canAddEvidence: true,
              comment: action.comment || "",
            };
          } else {
            const statusEntry =
              this.editingIncident?.playBookActionsStatus.find(
                (status) =>
                  status?.name === action.name && status?.type === "containment"
              );

            return {
              name: action.name,
              category: action.category || "",
              status: statusEntry?.status || action.status || "None",
              evidence: action.evidence || [],
              canAddEvidence: statusEntry?.status !== "Done",
              comment: statusEntry?.comment || action.comment || "",
            };
          }
        });

      console.log("Filtered containment actions:", filteredActions);
      return filteredActions;
    },

    filteredEradicationActions() {
      // if (
      //   !this.selectedPlayBook?.actions?.eradications ||
      //   !this.editingIncident?.playBookActionsStatus ||
      //   !Array.isArray(this.selectedPlayBook.actions.eradications)
      // ) {
      //   console.log("Invalid playbook or actions:", {
      //     selectedPlayBook: this.selectedPlayBook,
      //     playBookActionsStatus: this.editingIncident?.playBookActionsStatus,
      //   });
      //   return [];
      // }

      const filteredActions = this.selectedPlayBook.actions.eradications
        .filter((action) => {
          if (action == null) {
            console.log("Found null action:", action);
            return false;
          }
          if (typeof action !== "object") {
            console.log("Found non-object action:", action);
            return false;
          }
          if (
            !action.name ||
            typeof action.name !== "string" ||
            !action.name.trim()
          ) {
            console.log("Found invalid action name:", action);
            return false;
          }
          return true;
        })
        .map((action) => {
          if (!this.editingIncident.playBookActionsStatus) {
            return {
              name: action.name,
              category: action.category || "",
              status: action.status || "None",
              evidence: action.evidence || [],
              canAddEvidence: true,
              comment: action.comment || "",
            };
          } else {
            const statusEntry =
              this.editingIncident?.playBookActionsStatus.find(
                (status) =>
                  status?.name === action.name && status?.type === "eradication"
              );

            return {
              name: action.name,
              category: action.category || "",
              status: statusEntry?.status || action.status || "None",
              evidence: action.evidence || [],
              canAddEvidence: statusEntry?.status !== "Done",
              comment: statusEntry?.comment || action.comment || "",
            };
          }
        });

      console.log("Filtered eradication actions:", filteredActions);
      return filteredActions;
    },

    filteredRecoveryActions() {
      // if (
      //   !this.selectedPlayBook?.actions?.recoveries ||
      //   !this.editingIncident?.playBookActionsStatus ||
      //   !Array.isArray(this.selectedPlayBook.actions.recoveries)
      // ) {
      //   return [];
      // }

      return this.selectedPlayBook.actions.recoveries
        .filter((action) => action && typeof action === "object" && action.name)
        .map((action) => {
          if (!this.editingIncident.playBookActionsStatus) {
            return {
              name: action.name,
              category: action.category || "",
              status: action.status || "None",
              evidence: action.evidence || [],
              canAddEvidence: true,
              comment: action.comment || "",
            };
          } else {
            const statusEntry =
              this.editingIncident?.playBookActionsStatus.find(
                (status) =>
                  status?.name === action.name && status?.type === "recovery"
              );

            return {
              name: action.name,
              category: action.category || "",
              status: statusEntry?.status || action.status || "None",
              evidence: action.evidence || [],
              canAddEvidence: statusEntry?.status !== "Done",
              comment: statusEntry?.comment || action.comment || "",
            };
          }
        });
    },
    selectedPlayBook() {
      if (!this.editingIncident.playBookId) {
        console.log("No playBookId selected");
        return null;
      }
      const playbook =
        this.playBooks.find((p) => p.id === this.editingIncident.playBookId) ||
        null;
      console.log("Selected Playbook:", playbook);
      return playbook;
    },
    //   isImageFile() {
    //   return this.editingIncident.file?.type.startsWith('image/');
    // },

    maxAssessmentScore() {
      return this.incidentScoreCriteria.reduce((maxSum, criterion) => {
        const maxScore = criterion.scores.reduce(
          (max, score) => Math.max(max, Number(score.point)),
          0
        );
        return maxSum + maxScore;
      }, 0);
    },
    iraResponsibleOptions() {
      return this.newIRA.responsibleType === "User" ? this.users : this.teams;
    },
    isIRAValid() {
      return this.newIRA.name.trim() && this.newIRA.responsibleId.length > 0;
    },
    totalScoreEquation() {
      if (this.incidentScoreCriteria.length === 0) {
        return "Total Score = No criteria defined";
      }

      const criteriaWithMaxPoints = this.incidentScoreCriteria
        .map((criteria) => {
          const scores = this.scoringInputs[criteria.name];
          if (!scores || scores.length === 0) {
            return null; // Skip empty or undefined inputs
          }
          const maxPoint = Math.max(
            ...scores.map((score) => Number(score.point))
          );
          return { name: criteria.name, maxPoint };
        })
        .filter((item) => item !== null); // Remove null entries

      if (criteriaWithMaxPoints.length === 0) {
        return "Total Score = No valid scores provided";
      }

      const equation = criteriaWithMaxPoints
        .map((c) => `${c.maxPoint} (${c.name})`)
        .join(" + ");
      const total = criteriaWithMaxPoints.reduce(
        (sum, c) => sum + c.maxPoint,
        0
      );

      return `Total Score = ${equation} = ${total} points`;
    },
    maxTotalScore() {
      if (this.incidentScoreCriteria.length === 0) {
        return 0;
      }
      return this.incidentScoreCriteria.reduce((sum, criteria) => {
        const scores = this.scoringInputs[criteria.name] || [];
        const maxPoint =
          scores.length > 0
            ? Math.max(...scores.map((score) => Number(score.point)))
            : 0;
        return sum + maxPoint;
      }, 0);
    },
    canProceedToNextStep() {
      if (this.currentWizardStep === 1) {
        return this.incidentScoreCriteria.some((c) => c.name && c.description);
      } else if (this.currentWizardStep === 3) {
        return this.incidentClassifications.some(
          (c) =>
            c.priority &&
            Number.isInteger(Number(c.value)) &&
            c.color &&
            Number.isInteger(Number(c.sla))
        );
      }
      return true;
    },
    isFirstTab() {
      return this.tabs.findIndex((tab) => tab.name === this.activeTab) === 0;
    },
    isLastTab() {
      return (
        this.tabs.findIndex((tab) => tab.name === this.activeTab) ===
        this.tabs.length - 1
      );
    },
    canProceedToNextStep() {
      if (this.currentWizardStep === 1) {
        return this.incidentScoreCriteria.some((c) => c.name && c.description);
      }
      return true; // Allow proceeding for placeholder steps
    },
    validActions() {
      const playBook = this.playBooks[this.selecd];
      if (
        !playBook ||
        !playBook.actions ||
        !playBook.actions[this.activeActionTab]
      ) {
        return [];
      }

      return playBook.actions[this.activeActionTab]
        .filter(
          (action) =>
            action !== null &&
            action !== undefined &&
            (typeof action === "string" ||
              (typeof action === "object" && action.name))
        )
        .map((action) => {
          if (typeof action === "string") {
            return {
              name: action,
              category: this.findCategoryForAction(action),
            };
          }
          return action;
        });
    },
    filteredActionOptions() {
      if (!this.newAction.category) return [];

      const incidentDataMap = {
        containments: this.incidentContainments,
        eradications: this.incidentEradications,
        recoveries: this.incidentRecoveries,
      };

      const incidentData = incidentDataMap[this.activeActionTab] || [];
      const categoryData = incidentData.find(
        (item) => item.category === this.newAction.category
      );

      if (!categoryData || !categoryData.actions) return [];

      return categoryData.actions
        .filter(
          (action) => action !== null && action !== undefined && action !== ""
        )
        .map((action, index) => ({
          id: `${this.newAction.category}-${index}`,
          name: action,
        }));
    },
    responsibleOptions() {
      return this.newPlayBook.responsibleType === "User"
        ? this.users
        : this.teams;
    },
    // selectedPlayBook() {
    //   const playBook = this.playBooks[this.selecd];
    //   return playBook && typeof playBook === "object" && playBook.name
    //     ? playBook
    //     : {};
    // },
    actionOptions() {
      if (this.activeActionTab === "containments") {
        return this.containments.map((item, index) => ({
          id: index,
          name: item,
        }));
      } else if (this.activeActionTab === "eradications") {
        return this.eradications.map((item, index) => ({
          id: index,
          name: item,
        }));
      } else if (this.activeActionTab === "recoveries") {
        return this.recoveries.map((item, index) => ({
          id: index,
          name: item,
        }));
      }
      return [];
    },
    isActionValid() {
      if (!this.newAction.category || this.newAction.name.trim() == "")
        return false;
      return true;

      // return !!this.newAction.name && this.newAction.name.trim() !== "";
      // if (this.newAction.type === "existing") {
      //   return !!this.newAction.actionId;
      // } else {
      // return !!this.newAction.name && this.newAction.name.trim() !== "";
      // }
    },

    getScoringInputs() {
      return (criteriaName) => {
        return this.scoringInputs[criteriaName] || [];
      };
    },
  },
  async mounted() {
    this.loggedInUser = Auth.USER;
    // Fetch incident settings first
    await Promise.all([
      this.fetchContainments(),
      this.fetchEradications(),
      this.fetchRecoveries(),
      this.fetchCaseTypes(),
      this.fetchCaseDirections(),
      this.fetchAttacks(),
      this.fetchDetectedBy(),
      this.fetchTlps(),
      this.fetchPaps(),
      this.fetchIRAs(),
      this.fetchIncidentScores(),
      this.fetchUsers(),
      this.fetchTeams(),
    ]);

    // Fetch statistics and playbooks after incident settings
    await this.fetchPlayBooks();
    await this.fetchStatisticsData();
    this.load = false;

    // Refresh table only if ref is available
    if (this.$refs.table) {
      this.$refs.table.refreshTable();
    }
  },

  created() {
    this.tableColumns = [
      {
        id: "summary",
        title: this.$t("incident.summary"),
        data: "summary",
        defaultContent: "N/A",
      },
      {
        id: "type",
        title: this.$t("incident.type"),
        data: "caseType",
        defaultContent: "N/A",
      },
      {
        id: "direction",
        title: this.$t("incident.direction"),
        data: "direction",
        defaultContent: "N/A",
      },
      {
        id: "attack",
        title: this.$t("incident.attack"),
        data: "attack",
        defaultContent: "N/A",
      },
      {
        id: "detector",
        title: this.$t("incident.detector"),
        data: "detectedBy",
        defaultContent: "N/A",
      },
      {
        id: "tlp",
        title: this.$t("incident.tlp") || "TLP",
        data: "tlp",
        defaultContent: "-",
      },
      {
        id: "pap",
        title: this.$t("incident.pap") || "PAP",
        data: "pap",
        defaultContent: "-",
      },
      {
        id: "class",
        title: this.$t("incident.class"),
        data: "classification",
        defaultContent: "N/A",
      },
      {
        id: "detectedon",
        title: this.$t("incident.detectedon"),
        data: "detectedAt",
        defaultContent: "N/A",
      },
      {
        id: "reporter",
        title: this.$t("incident.reporter"),
        data: "_USERSERVICE.User.createdBy.full_name",
        defaultContent: "N/A",
      },
      {
        id: "playbook",
        title: this.$t("incident.playbook"),
        data: "playBookId",
        defaultContent: " - ",
      },
      {
        id: "status",
        title: this.$t("incident.status"),
        data: "status",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "summary",
        label: this.$t("incident.summary"),
        type: "text",
        rules: "required",
        description: this.$t(
          "incident.please_enter_the_summary_of_the_incident"
        ),
        col: 12,
      },
      {
        name: "details",
        label: this.$t("incident.details"),
        type: "textarea",
        rules: "required",
        description: this.$t(
          "incident.please_enter_the_details_of_the_incident"
        ),

        col: 12,
      },
      {
        type: "options",
        name: "caseType",
        label: this.$t("incident.casetype"),
        options: [],
        optionLabel: "type",
        col: 6,
        rules: "required",
        description: this.$t("incident.select_a_case_type."),
      },
      {
        type: "options",
        name: "direction",
        label: this.$t("incident.direction"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: this.$t("incident.select_a_direction."),
      },
      {
        type: "options",
        name: "attack",
        label: this.$t("incident.attack"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: this.$t("incident.select_an_attack."),
      },
      {
        type: "options",
        name: "detectedBy",
        label: this.$t("incident.detectedby"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: this.$t("incident.select_a_detector."),
      },
      {
        type: "options",
        name: "tlp",
        label: this.$t("incident.tlp") || "TLP",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("incident.select_a_tlp") || "Select a TLP",
      },
      {
        type: "options",
        name: "pap",
        label: this.$t("incident.pap") || "PAP",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("incident.select_a_pap") || "Select a PAP",
      },
      {
        name: "detectedAt",
        label: this.$t("incident.detectedat"),
        type: "date",
        rules: "required",
        description: this.$t("incident.please_select_a_date."),

        col: 6,
      },

      {
        name: "incidentFile",
        label: this.$t("incident.supportdocument"),
        type: "file", // Hidden field
        rules: "", // Validation rule: required field
        description: this.$t("incident.upload_a_file"),

        col: 6, // Column size in the form layout
      },
    ];
  },

  watch: {
    incidentClassifications: {
      handler() {
        if (this.isAddClassificationDisabled) {
          this.isAddClassificationDisabled = !this.isLastClassificationValid();
        }
        // Ensure the first classification's value stays as maxTotalScore
        if (
          this.incidentClassifications.length > 0 &&
          this.incidentClassifications[0].isFirst
        ) {
          this.incidentClassifications[0].value = this.maxTotalScore;
        }
        this.incidentClassifications[0].value = this.maxTotalScore;
        this.incidentClassifications[0].disabled = true;
      },
      deep: true,
    },
    "newPlayBook.responsibleType"(newValue, oldValue) {
      if (newValue !== oldValue && oldValue !== "") {
        this.resetPlayBookForm();
      }
    },

    "newIRA.responsibleType"(newValue, oldValue) {
      if (newValue !== oldValue && oldValue !== "") {
        this.newIRA.responsibleId = []; // Clear selected responsibles when type changes
      }
    },
    isConfigurationsModalOpen(newVal) {
      if (newVal) {
        this.fetchCaseTypes();
        this.fetchCaseDirections();
        this.fetchAttacks();
        this.fetchDetectedBy();
        this.fetchSiteLocations();
        this.fetchContainments();
        this.fetchEradications();
        this.fetchRecoveries();
        this.fetchPlayBooks();
        this.fetchUsers();
        this.fetchTeams();
        this.fetchIncidentScores();
        this.fetchIncidentClassifications();
        this.fetchIRAs();
      }
    },

    incidentScoreCriteria: {
      handler(newVal) {
        if (newVal.length > 0) {
          // Set activeCriteriaTab to the first criterion if not already set
          if (!this.activeCriteriaTab) {
            this.activeCriteriaTab = newVal[0].name;
          }
          // Initialize scoringInputs for each criterion
          newVal.forEach((criteria) => {
            if (!this.scoringInputs[criteria.name]) {
              this.scoringInputs[criteria.name] = criteria.scores || [];
            }
          });
        }
      },
      deep: true, // Watch for deep changes in the array
    },

    filter: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        const filters = [];
        console.log("******************filter******************");
        console.log("newFilterrrrrrr", newFilter);
        if (newFilter.status) filters.push(`status|${newFilter.status}|=`);
        if (newFilter.summary)
          filters.push(`summary|%${newFilter.summary}%|like`);
        if (newFilter.submission_date)
          this.apiParams.filterDate = `created_at|${newFilter.submission_date}-date|like`;

        // Update apiParams with the new filter
        this.apiParams.filter = filters.join("&&");
        this.apiParams.sort = "created_at|asc";
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },

    // incidentScoreCriteria(newVal) {
    //   if (newVal.length > 0 && !this.activeCriteriaTab) {
    //     this.activeCriteriaTab = newVal[0].name;
    //     // Initialize scoringInputs for each criteria
    //     newVal.forEach((criteria) => {
    //       if (!this.scoringInputs[criteria.name]) {
    //         this.scoringInputs[criteria.name] = [];
    //       }
    //     });
    //   }
    // },
  },

  methods: {
    getPercentage(value, total) {
      const numValue = Number(value) || 0;
      const numTotal = Number(total) || 0;

      if (numTotal === 0) {
        return "0.0";
      }

      return ((numValue / numTotal) * 100).toFixed(1);
    },

    // Statistics Modal Methods
    async openStatisticsModal(incident) {
      this.selectedIncidentForStats = incident;
      this.isStatisticsModalOpen = true;
      this.loadingStatistics = true;
      this.activeStatsTab = "overview";

      try {
        await this.fetchIncidentStatistics(incident.id);
      } catch (error) {
        console.error("Error loading statistics:", error);
        notify({
          title: this.$t("common.error"),
          text: this.$t("incident.failed_to_load_statistics"),
          type: "error",
        });
      } finally {
        this.loadingStatistics = false;
      }
    },

    closeStatisticsModal() {
      this.isStatisticsModalOpen = false;
      this.selectedIncidentForStats = null;
      this.incidentStatistics = {
        timeToDetection: "-",
        timeToResolution: "-",
        relatedItemsCount: 0,
        assessmentScore: 0,
        maxScore: 0,
        evidenceCount: 0,
        slaStatus: "-",
        slaCompliant: false,
        relatedIncidents: [],
        relatedRisks: [],
        relatedAssets: [],
        affectedUsers: [],
        assessmentBreakdown: null,
        playbookProgress: 0,
        playbookActions: {},
        activityLog: [],
      };
    },

    async fetchIncidentStatistics(incidentId) {
      try {
        // Fetch full incident details
        const fullIncident = await this.api.show(incidentId);

        // Calculate time metrics
        this.calculateTimeMetrics(fullIncident);

        // Fetch and calculate related data
        await this.fetchRelatedData(fullIncident);

        // Calculate assessment metrics
        this.calculateAssessmentMetrics(fullIncident);

        // Calculate playbook progress
        this.calculatePlaybookProgress(fullIncident);

        // Build activity log
        this.buildActivityLog(fullIncident);

        // Prepare chart data
        this.prepareChartData(fullIncident);
      } catch (error) {
        console.error("Error fetching incident statistics:", error);
        throw error;
      }
    },

    calculateTimeMetrics(incident) {
      const detectedAt = incident.detectedAt
        ? new Date(incident.detectedAt)
        : null;
      const createdAt = incident.created_at
        ? new Date(incident.created_at)
        : null;
      const updatedAt = incident.updated_at
        ? new Date(incident.updated_at)
        : null;

      // Time to detection (from creation to detection)
      if (detectedAt && createdAt) {
        const diffMs = detectedAt - createdAt;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        this.incidentStatistics.timeToDetection =
          diffHours > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffMinutes}m`;
      }

      // Time to resolution (from detection to closure)
      if (incident.status === "3" && detectedAt && updatedAt) {
        const diffMs = updatedAt - detectedAt;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        this.incidentStatistics.timeToResolution =
          diffDays > 0 ? `${diffDays}d ${diffHours}h` : `${diffHours}h`;
      } else if (incident.status !== "3") {
        this.incidentStatistics.timeToResolution = this.$t("incident.ongoing");
      }

      // SLA Status
      if (incident.classification && this.incidentClassifications.length) {
        const classification = this.incidentClassifications.find(
          (c) => c.priority === incident.classification
        );
        if (classification && detectedAt) {
          const slaHours = classification.sla;
          const now = new Date();
          const elapsedHours = (now - detectedAt) / (1000 * 60 * 60);

          if (incident.status === "3") {
            const resolutionTime = (updatedAt - detectedAt) / (1000 * 60 * 60);
            this.incidentStatistics.slaCompliant = resolutionTime <= slaHours;
            this.incidentStatistics.slaStatus = this.incidentStatistics
              .slaCompliant
              ? this.$t("incident.met")
              : this.$t("incident.breached");
          } else {
            this.incidentStatistics.slaCompliant = elapsedHours <= slaHours;
            this.incidentStatistics.slaStatus = this.incidentStatistics
              .slaCompliant
              ? `${Math.floor(slaHours - elapsedHours)}h ${this.$t(
                  "incident.remaining"
                )}`
              : this.$t("incident.breached");
          }
        }
      }
    },

    async fetchRelatedData(incident) {
      try {
        // Fetch related incidents
        if (incident.relatedIncidents && incident.relatedIncidents.length) {
          const relatedIncidentsData = await Promise.all(
            incident.relatedIncidents.map((id) =>
              this.api.show(id).catch(() => null)
            )
          );
          this.incidentStatistics.relatedIncidents =
            relatedIncidentsData.filter((i) => i !== null);
        }

        // Fetch related risks
        if (incident.relatedRisks && incident.relatedRisks.length) {
          const relatedRisksData = await Promise.all(
            incident.relatedRisks.map((id) =>
              this.riskApi.show(id).catch(() => null)
            )
          );
          this.incidentStatistics.relatedRisks = relatedRisksData.filter(
            (r) => r !== null
          );
        }

        // Fetch related assets
        if (incident.relatedAssets && incident.relatedAssets.length) {
          const relatedAssetsData = await Promise.all(
            incident.relatedAssets.map((id) =>
              this.assetApi.show(id).catch(() => null)
            )
          );
          this.incidentStatistics.relatedAssets = relatedAssetsData.filter(
            (a) => a !== null
          );
        }

        // Fetch affected users
        if (incident.affectedUsers && incident.affectedUsers.length) {
          const affectedUsersData = await Promise.all(
            incident.affectedUsers.map((id) =>
              this.userApi.show(id).catch(() => null)
            )
          );
          this.incidentStatistics.affectedUsers = affectedUsersData.filter(
            (u) => u !== null
          );
        }

        // Calculate total related items
        this.incidentStatistics.relatedItemsCount =
          this.incidentStatistics.relatedIncidents.length +
          this.incidentStatistics.relatedRisks.length +
          this.incidentStatistics.relatedAssets.length +
          this.incidentStatistics.affectedUsers.length;
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    },

    calculateAssessmentMetrics(incident) {
      if (incident.assessment) {
        const assessment = incident.assessment;
        let totalScore = 0;
        let maxScore = 0;
        const breakdown = [];

        this.incidentScoreCriteria.forEach((criteria) => {
          const score = assessment[criteria.name] || 0;
          totalScore += Number(score);

          const maxCriteriaScore = Math.max(
            ...criteria.scores.map((s) => Number(s.point))
          );
          maxScore += maxCriteriaScore;

          breakdown.push({
            name: criteria.name,
            score: Number(score),
            max: maxCriteriaScore,
          });
        });

        this.incidentStatistics.assessmentScore = totalScore;
        this.incidentStatistics.maxScore = maxScore;
        this.incidentStatistics.assessmentBreakdown = breakdown;
      }

      // Evidence count
      this.incidentStatistics.evidenceCount = incident.evidence
        ? incident.evidence.length
        : 0;
    },

    calculatePlaybookProgress(incident) {
      if (incident.playBookId && incident.playBookActionsStatus) {
        const actions = incident.playBookActionsStatus;
        const totalActions = actions.length;
        const doneActions = actions.filter((a) => a.status === "Done").length;

        this.incidentStatistics.playbookProgress =
          totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;

        // Group actions by category
        const grouped = {
          containments: [],
          eradications: [],
          recoveries: [],
        };

        actions.forEach((action) => {
          if (action.type === "containment") grouped.containments.push(action);
          else if (action.type === "eradication")
            grouped.eradications.push(action);
          else if (action.type === "recovery") grouped.recoveries.push(action);
        });

        this.incidentStatistics.playbookActions = grouped;
      }
    },

    buildActivityLog(incident) {
      const activities = [];

      // Incident created
      if (incident.created_at) {
        activities.push({
          type: "created",
          description: this.$t("incident.incident_created"),
          timestamp: incident.created_at,
        });
      }

      // Incident detected
      if (incident.detectedAt) {
        activities.push({
          type: "detected",
          description: this.$t("incident.incident_detected"),
          timestamp: incident.detectedAt,
        });
      }

      // Status changes from log
      if (
        incident.playBookActionsStatusLog &&
        incident.playBookActionsStatusLog.length
      ) {
        incident.playBookActionsStatusLog.forEach((log) => {
          activities.push({
            type: "status_change",
            description: `${log.actionName}: ${log.oldStatus} → ${log.newStatus}`,
            timestamp: log.changedAt,
          });
        });
      }

      // Evidence added
      if (incident.evidence && incident.evidence.length) {
        incident.evidence.forEach((evidence) => {
          activities.push({
            type: "evidence",
            description: `${this.$t("incident.evidence_added")}: ${
              evidence.name
            }`,
            timestamp: evidence.uploadedAt || incident.created_at,
          });
        });
      }

      // Incident updated
      if (incident.updated_at && incident.updated_at !== incident.created_at) {
        activities.push({
          type: "updated",
          description: this.$t("incident.incident_updated"),
          timestamp: incident.updated_at,
        });
      }

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      this.incidentStatistics.activityLog = activities;
    },

    prepareChartData(incident) {
      // Playbook Actions Chart
      if (
        incident.playBookActionsStatus &&
        incident.playBookActionsStatus.length
      ) {
        const statusCounts = {
          Done: 0,
          Progress: 0,
          None: 0,
        };

        incident.playBookActionsStatus.forEach((action) => {
          statusCounts[action.status] = (statusCounts[action.status] || 0) + 1;
        });

        this.playbookActionsChartSeries = [
          statusCounts.Done,
          statusCounts.Progress,
          statusCounts.None,
        ];
        this.playbookActionsChartOptions = {
          ...this.playbookActionsChartOptions,
          labels: [
            this.$t("incident.done"),
            this.$t("incident.in_progress"),
            this.$t("incident.not_started"),
          ],
        };
      }

      // Assessment Breakdown Chart
      if (this.incidentStatistics.assessmentBreakdown) {
        this.assessmentChartSeries = [
          {
            name: this.$t("incident.score"),
            data: this.incidentStatistics.assessmentBreakdown.map(
              (b) => b.score
            ),
          },
        ];
        this.assessmentChartOptions = {
          ...this.assessmentChartOptions,
          xaxis: {
            ...(this.assessmentChartOptions?.xaxis || {}),
            categories: this.incidentStatistics.assessmentBreakdown.map(
              (b) => b.name
            ),
          },
        };
      }

      // Timeline Chart
      const detectedAt = incident.detectedAt
        ? new Date(incident.detectedAt).getTime()
        : null;
      const createdAt = incident.created_at
        ? new Date(incident.created_at).getTime()
        : null;
      const updatedAt = incident.updated_at
        ? new Date(incident.updated_at).getTime()
        : new Date().getTime();

      if (detectedAt && createdAt) {
        this.timelineChartSeries = [
          {
            name: this.$t("incident.incident_lifecycle"),
            data: [
              {
                x: this.$t("incident.incident_duration"),
                y: [detectedAt, updatedAt],
              },
            ],
          },
        ];
      }

      // Related Data Chart
      const relatedCounts = [
        this.incidentStatistics.relatedIncidents.length,
        this.incidentStatistics.relatedRisks.length,
        this.incidentStatistics.relatedAssets.length,
        this.incidentStatistics.affectedUsers.length,
      ];

      if (relatedCounts.some((c) => c > 0)) {
        this.relatedDataChartSeries = relatedCounts;
        this.relatedDataChartOptions = {
          ...this.relatedDataChartOptions,
          labels: [
            this.$t("incident.incidents"),
            this.$t("incident.risks"),
            this.$t("incident.assets"),
            this.$t("incident.users"),
          ],
        };
      }

      // Activity Chart - Group activities by day
      if (this.incidentStatistics.activityLog.length) {
        const activityByDay = {};

        this.incidentStatistics.activityLog.forEach((activity) => {
          const date = new Date(activity.timestamp);
          const dayKey = date.toISOString().split("T")[0];
          activityByDay[dayKey] = (activityByDay[dayKey] || 0) + 1;
        });

        const sortedDays = Object.keys(activityByDay).sort();
        this.activityChartSeries = [
          {
            name: this.$t("incident.activities"),
            data: sortedDays.map((day) => ({
              x: new Date(day).getTime(),
              y: activityByDay[day],
            })),
          },
        ];
      }
    },

    getActivityIcon(type) {
      const icons = {
        created: "fa-solid fa-plus-circle text-success",
        detected: "fa-solid fa-eye text-info",
        status_change: "fa-solid fa-exchange-alt text-warning",
        evidence: "fa-solid fa-file-upload text-primary",
        updated: "fa-solid fa-edit text-secondary",
      };
      return icons[type] || "fa-solid fa-circle text-muted";
    },

    formatActivityTime(timestamp) {
      if (!timestamp) return "-";
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    calculateTotalScore() {
      // Handle null/undefined values in calculation
      this.totalAssessmentScore = Object.values(
        this.editingIncident.assessment
      ).reduce((sum, score) => {
        const numericScore = Number(score);
        return sum + (isNaN(numericScore) ? 0 : numericScore);
      }, 0);
    },

    // Add this method
    updateAssessmentValue(criterionName, value) {
      this.$set(this.editingIncident.assessment, criterionName, Number(value));
      this.calculateTotalScore && this.calculateTotalScore();
    },

    getUserInitials(fullName) {
      if (!fullName) return "U";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      // Get first letter of first name and first letter of last name
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
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

    openCommentsModal(item) {
      this.selectedIncident = item;
      this.isCommentsModalOpen = true;
      this.fetchComments(item.id);
    },
    closeCommentsModal() {
      this.isCommentsModalOpen = false;
      this.selectedIncident = null;
      this.comments = [];
      this.newComment = "";
      this.newReply = "";
      this.showReplyInput = null;
      this.currentPage = 1;
    },
    async fetchComments(incidentId) {
      console.log("ID", incidentId);
      try {
        const response = await this.commentApi.fetchComments(
          incidentId,
          "incident"
        );

        // First, fetch all users to populate comment user info
        const userIds = [...new Set(response.map((c) => c.user_id))];
        const users = await Promise.all(
          userIds.map((id) => this.userApi.show(id))
        );
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        // Process comments and replies
        const comments = response
          .filter((comment) => !comment.parent_id) // Top-level comments
          .map((comment) => ({
            ...comment,
            user: userMap[comment.user_id] || { full_name: " - " },
            replies: response
              .filter((reply) => reply.parent_id === comment.id) // Find replies
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
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_fetch_comments"),
        });
      }
    },

    async deleteComment(commentId) {
      try {
        const response = await this.commentApi.delete(commentId);

        if (response) {
          // Update local state after successful deletion
          this.comments = this.comments.filter(
            (comment) => comment.id !== commentId
          );
          this.comments = this.comments.map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== commentId),
          }));

          // Adjust pagination
          if (this.paginatedComments.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }

          notify({
            type: "success",
            title: this.$t("common.success"),
            text: this.$t("common.comment_deleted_successfully"),
          });
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

    toggleReplyForm(commentId) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
      this.newReply = "";
      this.editingCommentId = null; // Close edit form if replying
    },
    async addComment() {
      if (!this.newComment.trim()) {
        notify({
          type: "warning",
          title: this.$t("common.warning"),
          text: this.$t("common.comment_cannot_be_empty"),
        });
        return;
      }

      try {
        const commentData = {
          content: this.newComment,
          user_id: Auth.USER.id,
          commentable_type: "incident",
          commentable_id: this.selectedIncident.id,
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
        this.fetchComments(this.selectedIncident.id);
      } catch (error) {
        console.error("Error submitting comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to add comment",
        });
      }
    },
    openReplyInput(index) {
      this.showReplyInput = index;
      this.newReply = "";
    },
    async submitReply(parentId) {
      if (!this.newReply.trim()) {
        notify({
          type: "warning",
          title: this.$t("common.warning"),
          text: this.$t("common.reply_cannot_be_empty"),
        });
        return;
      }

      try {
        const replyData = {
          content: this.newReply,
          user_id: Auth.USER.id,
          commentable_type: "evidence",
          commentable_id: this.selectedIncident.id,
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

        // Add reply to parent comment
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
        this.fetchComments(this.selectedIncident.id);
        // notify({
        //   type: "success",
        //   title: "Success",
        //   text: "Reply added successfully",
        // });
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
      this.replyingTo = null; // Close reply form if editing
    },

    cancelEditing() {
      this.editingCommentId = null;
      this.editingCommentContent = "";
    },
    async updateComment(commentId) {
      if (!this.editingCommentContent.trim()) {
        notify({
          type: "warning",
          title: this.$t("common.warning"),
          text: this.$t("common.comment_cannot_be_empty"),
        });
        return;
      }

      try {
        const updatedData = {
          id: commentId,
          content: this.editingCommentContent,
        };

        // Call the API to update the comment
        const response = await this.commentApi.from(updatedData);

        // Update the comments array
        this.comments = this.comments.map((comment) => {
          if (comment.id === commentId) {
            // Update top-level comment
            return {
              ...comment,
              content: this.editingCommentContent, // Use editingCommentContent directly
              // Optionally merge with response if it contains additional fields
              ...(response && {
                content: response.content || this.editingCommentContent,
                updated_at: response.updated_at || comment.updated_at,
              }),
            };
          }
          // Update replies if the commentId matches a reply
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    content: this.editingCommentContent, // Use editingCommentContent directly
                    ...(response && {
                      content: response.content || this.editingCommentContent,
                      updated_at: response.updated_at || reply.updated_at,
                    }),
                  }
                : reply
            ),
          };
        });

        // Reset editing state
        this.cancelEditing();

        // notify({
        //   type: "success",
        //   title: "Success",
        //   text: "Comment updated successfully",
        // });
      } catch (error) {
        console.error("Error updating comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to update comment",
        });
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    isUserResponsibleForIncidentPlaybook(playBookId) {
      if (!playBookId) {
        console.warn("No playBookId provided for incident");
        return false;
      }

      // Find the playbook by playBookId
      const playbook = this.playBooks.find((pb) => pb.id === playBookId);
      if (!playbook) {
        console.warn(`No playbook found for playBookId: ${playBookId}`);
        return false;
      }

      // Check if the logged-in user is in the responsibleId array
      if (playbook.responsibleType === "User") {
        return Array.isArray(playbook.responsibleId)
          ? playbook.responsibleId.includes(this.loggedInUser.id)
          : playbook.responsibleId === this.loggedInUser.id;
      } else if (playbook.responsibleType === "Team") {
        // Check if the user is part of any team in responsibleId
        return playbook.responsibleId.some((teamId) => {
          const team = this.teams.find((t) => t.id === teamId);
          return (
            team &&
            team.user_ids &&
            team.user_ids.includes(this.loggedInUser.id)
          );
        });
      }

      return false;
    },
    getCategoryName(categoryId) {
      if (!categoryId) return "";

      let sourceData = [];
      switch (this.activeActionTab) {
        case "containments":
          sourceData = this.incidentContainments;
          break;
        case "eradications":
          sourceData = this.incidentEradications;
          break;
        case "recoveries":
          sourceData = this.incidentRecoveries;
          break;
        default:
          return "Unknown Category";
      }

      const category = sourceData.find((cat) => cat.id === categoryId);
      return category ? category.category : "Unknown Category";
    },
    restrictPositiveInteger(index) {
      const value = this.incidentClassifications[index].value;
      if (!Number.isInteger(Number(value)) || value < 1) {
        this.incidentClassifications[index].value = 1;
      }
    },
    setCurrentDateTime() {
      const now = new Date();
      // Format: YYYY-MM-DD HH:MM (matches flatpickrConfig.dateFormat: "Y-m-d H:i")
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
      this.newItem.detectedAt = formattedDateTime;
      console.log("Set dateTime to:", formattedDateTime);
    },
    async deleteItem(incidentId) {
      const response = await this.api.delete(incidentId);
      this.$refs.table.refreshTable();
      console.log("Incident deleted successfully", response);
    },
    generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
    async isCaseTypeReferenced(id) {
      try {
        const response = await this.api.getAll({
          filter: `caseType|${id}|=`,
        });
        return response && response.length > 0;
      } catch (error) {
        console.error("Error checking case type references:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to check if case type is referenced.",
        });
        return false;
      }
    },

    getUserName(userId) {
      // Find user by ID and return name, fallback to ID if not found
      const user = this.users.find((user) => user.id === userId);
      return user ? user.full_name : userId;
    },

    getReporterUser(userId) {
      // Find and return the full user object by ID
      return this.users.find((user) => user.id === userId) || null;
    },

    openUserDetailsModal(user) {
      if (!user) return;
      this.userData = { ...user };
      this.viewUserModal = true;
    },
    getFileName(fileUrl) {
      console.log("dddd", fileUrl);
      // Handle both string URLs and File objects
      if (typeof fileUrl === "string") {
        return fileUrl.split("/").pop();
      } else if (fileUrl instanceof File) {
        return fileUrl.name; // Extract name from File object
      } else {
        console.warn("Invalid fileUrl type:", fileUrl);
        return "Unknown File"; // Fallback for invalid types
      }
    },
    formatActionTab(tab) {
      if (!tab) return "";
      return tab.charAt(0).toUpperCase() + tab.slice(1).replace(/s$/, ""); // e.g., 'containments' -> 'Containment'
    },
    isDuplicateCriteriaName(name, currentIndex) {
      if (!name || !name.trim()) return false;
      const trimmedName = name.trim().toLowerCase();
      return this.incidentScoreCriteria.some(
        (criteria, index) =>
          index !== currentIndex &&
          criteria.name &&
          criteria.name.trim().toLowerCase() === trimmedName
      );
    },
    trackCriteriaNameChange(index) {
      // Force re-render to update validation
      this.$forceUpdate();
    },
    trackCaseTypeChange() {
      this.duplicateError = false; // Reset error on input change
    },
    isDuplicate(caseType, currentIndex) {
      const trimmedType = caseType.trim().toLowerCase();
      return this.caseTypeInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.type.trim().toLowerCase() === trimmedType
      );
    },
    trackCaseDirectionChange() {
      this.directionDuplicateError = false; // Reset error on input change
    },
    isDuplicate(caseDirection, currentIndex) {
      const trimmedDirection = caseDirection.trim().toLowerCase();
      return this.caseDirectionInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.direction?.trim().toLowerCase() === trimmedDirection
      );
    },
    isUserResponsibleForPlaybook(playbook) {
      if (!playbook) {
        return false;
      }

      if (playbook.responsibleType === "User") {
        return playbook.responsibleId.includes(this.loggedInUser.id);
      }

      if (playbook.responsibleType === "Team") {
        return playbook.responsibleId.some((teamId) => {
          const team = this.teams.find((t) => t.id === teamId);
          console.log("responsible Type", team.user_ids);

          return (
            team &&
            team.user_ids &&
            team.user_ids.includes(this.loggedInUser.id)
          );
        });
      }

      return false;
    },
    openEvidenceModal(tab, index) {
      this.selectedAction = { tab, index };
      this.newEvidence = { name: "", file: null };
      this.isEvidenceModalOpen = true;
    },

    closeEvidenceModal() {
      this.isEvidenceModalOpen = false;
      this.newEvidence = { name: "", file: null };
      this.selectedAction = { tab: null, index: null };
      if (this.$refs.evidenceFileInput) {
        this.$refs.evidenceFileInput.value = "";
      }
    },

    handleEvidenceFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        this.newEvidence.file = null;
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "File size must be less than 5MB.",
        });
        this.$refs.evidenceFileInput.value = "";
        this.newEvidence.file = null;
        return;
      }

      // Validate file type
      const acceptedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      if (!acceptedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please upload a PDF, DOC, DOCX, JPG, or PNG file.",
        });
        this.$refs.evidenceFileInput.value = "";
        this.newEvidence.file = null;
        return;
      }

      this.newEvidence.file = file;
    },

    async saveEvidence() {
      if (!this.isEvidenceValid) {
        await Swal.fire({
          icon: "warning",
          title: this.$t("common.invalid_input"),
          text: this.$t("common.provide_name_and_file"),
        });
        return;
      }

      if (!this.editingIncident || !this.editingIncident.id) {
        await Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.no_incident_selected"),
        });
        return;
      }

      if (!this.selectedPlayBook) {
        await Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.no_playbook_selected"),
        });
        return;
      }

      try {
        let filteredActions = [];
        let actionTypeForStatus;
        switch (this.selectedAction.tab) {
          case "containments":
            filteredActions = this.filteredContainmentActions;
            actionTypeForStatus = "containment";
            break;
          case "eradications":
            filteredActions = this.filteredEradicationActions;
            actionTypeForStatus = "eradication";
            break;
          case "recoveries":
            filteredActions = this.filteredRecoveryActions;
            actionTypeForStatus = "recovery";
            break;
          default:
            console.error(
              "Invalid selectedAction.tab:",
              this.selectedAction.tab
            );
            await Swal.fire({
              icon: "error",
              title: this.$t("common.error"),
              text: this.$t("common.invalid_action_category"),
            });
            return;
        }

        const actionIndex = this.selectedAction.index;
        if (
          actionIndex === null ||
          actionIndex < 0 ||
          actionIndex >= filteredActions.length
        ) {
          console.error("Invalid action index:", {
            actionIndex,
            filteredActions,
          });
          await Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text: this.$t("common.action_not_found"),
          });
          return;
        }

        const action = filteredActions[actionIndex];

        const newEvidenceEntry = {
          id: this.generateUUID(),
          name: this.newEvidence.name.trim(),
          file: this.newEvidence.file,
          fileType: this.newEvidence.file.type,
          createdBy: this.loggedInUser.id,
          uploadedAt: new Date().toISOString(),
          actionTab: this.selectedAction.tab,
          actionName: action.name,
        };

        // Check for duplicate evidence to prevent client-side duplicates
        const isDuplicate = (this.editingIncident.evidence || []).some(
          (ev) =>
            ev.name === newEvidenceEntry.name &&
            ev.actionTab === newEvidenceEntry.actionTab &&
            ev.actionName === newEvidenceEntry.actionName
        );
        console.log("isDuplicate", isDuplicate);

        if (isDuplicate) {
          notify({
            title: this.$t("common.duplicate_evidence"),
            text: this.$t("common.evidence_already_added"),
            type: "error",
          });
          return;
        }

        const updatedEvidence = [
          ...(this.editingIncident.evidence || []),
          newEvidenceEntry,
        ];

        // Update action status to "Done"
        if (!this.editingIncident.playBookActionsStatus) {
          this.editingIncident.playBookActionsStatus = [];
        }

        // Find or create status entry for the action
        let statusEntry = this.editingIncident.playBookActionsStatus.find(
          (s) => s.name === action.name && s.type === actionTypeForStatus
        );

        if (statusEntry) {
          // Update existing status
          statusEntry.status = "Done";
        } else {
          // Create new status entry
          this.editingIncident.playBookActionsStatus.push({
            name: action.name,
            type: actionTypeForStatus,
            status: "Done",
          });
        }

        if (this.editingIncident.status === "3") {
          const actionsWithNone =
            this.editingIncident.playBookActionsStatus?.filter(
              (action) => action.status === "None"
            ) || [];
          if (actionsWithNone.length > 0) {
            this.editingIncident.status = this.currentIncident.status;
          }
        }

        const evidencePayload = {
          ...this.editingIncident,
          evidence: updatedEvidence,
          playBookActionsStatus: this.editingIncident.playBookActionsStatus,
        };

        // Save evidence and action status to API
        const response = await this.api.from(evidencePayload);
        console.log("Save evidence and action status API response:", response);

        // Update local state with server response
        this.editingIncident = {
          ...this.editingIncident,
          evidence: response.evidence || updatedEvidence,
          playBookActionsStatus:
            response.playBookActionsStatus ||
            this.editingIncident.playBookActionsStatus,
        };

        // Reset evidence form
        this.newEvidence = {
          name: "",
          file: null,
        };

        this.closeEvidenceModal();
        this.currentIncident = await this.api.show(this.currentIncident.id);
        console.log("editingIncident", this.currentIncident);
      } catch (error) {
        console.error("Error saving evidence and action status:", error);
        let errorMessage = this.$t("incident.failed_to_save_evidence");
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        await Swal.fire({
          icon: "error",
          title: this.$t("incident.error"),
          text: errorMessage,
        });
      }
    },

    updateActionStatus(actionTab, actionIndex, newStatus) {
      // Determine which list of actions to use
      let filteredActions;
      let actionTypeForStatus;
      if (actionTab === "containments") {
        filteredActions = this.filteredContainmentActions;
        actionTypeForStatus = "containment";
      } else if (actionTab === "eradications") {
        filteredActions = this.filteredEradicationActions;
        actionTypeForStatus = "eradication";
      } else if (actionTab === "recoveries") {
        filteredActions = this.filteredRecoveryActions;
        actionTypeForStatus = "recovery";
      } else {
        return; // Exit if the tab name is invalid
      }

      // Get the action that was changed
      const changedAction = filteredActions[actionIndex];
      if (!changedAction) return;

      // Ensure the central status tracking array exists
      if (!this.editingIncident.playBookActionsStatus) {
        this.editingIncident.playBookActionsStatus = [];
      }

      // Ensure the status log array exists
      if (!this.editingIncident.playBookActionsStatusLog) {
        this.editingIncident.playBookActionsStatusLog = [];
      }

      // Find the corresponding status entry in the source of truth
      let statusEntry = this.editingIncident.playBookActionsStatus.find(
        (s) => s.name === changedAction.name && s.type === actionTypeForStatus
      );

      const oldStatus = statusEntry
        ? statusEntry.status
        : changedAction.status || "None";

      // Only log if status actually changed
      if (oldStatus !== newStatus) {
        // Add log entry for this status change
        this.editingIncident.playBookActionsStatusLog.push({
          actionName: changedAction.name,
          actionType: actionTypeForStatus,
          oldStatus: oldStatus,
          newStatus: newStatus,
          changedBy: Auth.USER.id,
          changedByName:
            Auth.USER.full_name || Auth.USER.name || "Unknown User",
          changedAt: new Date().toISOString(),
        });
      }

      if (statusEntry) {
        // If it exists, update its status
        statusEntry.status = newStatus;
        console.log("Updated status entry:", statusEntry);
      } else {
        // If it doesn't exist, create it and add it to the array
        this.editingIncident.playBookActionsStatus.push({
          name: changedAction.name,
          type: actionTypeForStatus,
          status: newStatus,
          comment: changedAction.comment || "",
        });
      }
    },

    getActionKeyFromTab(tab, actionName) {
      const type =
        tab === "containments"
          ? "containment"
          : tab === "eradications"
          ? "eradication"
          : "recovery";
      return `${type}:${actionName}`;
    },

    updateActionComment(actionTab, actionIndex, newComment) {
      // Determine which list of actions to use
      let filteredActions;
      let actionTypeForStatus;
      if (actionTab === "containments") {
        filteredActions = this.filteredContainmentActions;
        actionTypeForStatus = "containment";
      } else if (actionTab === "eradications") {
        filteredActions = this.filteredEradicationActions;
        actionTypeForStatus = "eradication";
      } else if (actionTab === "recoveries") {
        filteredActions = this.filteredRecoveryActions;
        actionTypeForStatus = "recovery";
      } else {
        return;
      }

      const changedAction = filteredActions[actionIndex];
      if (!changedAction) return;

      if (!this.editingIncident.playBookActionsStatus) {
        this.editingIncident.playBookActionsStatus = [];
      }

      let statusEntry = this.editingIncident.playBookActionsStatus.find(
        (s) => s.name === changedAction.name && s.type === actionTypeForStatus
      );

      if (statusEntry) {
        statusEntry.comment = newComment;
      } else {
        this.editingIncident.playBookActionsStatus.push({
          name: changedAction.name,
          type: actionTypeForStatus,
          status: changedAction.status || "None",
          comment: newComment,
        });
      }
    },

    async saveReviewActions() {
      if (!this.selectedPlayBook) {
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.no_playbook_selected"),
        });
        return;
      }

      try {
        // Update the selected playbook's actions, preserving evidence
        const updatedPlayBook = {
          ...this.selectedPlayBook,
          actions: {
            containments: this.filteredContainmentActions.map((action) => ({
              ...action,
              evidence: action.evidence || [],
              comment: action.comment || "",
            })),
            eradications: this.filteredEradicationActions.map((action) => ({
              ...action,
              evidence: action.evidence || [],
              comment: action.comment || "",
            })),
            recoveries: this.filteredRecoveryActions.map((action) => ({
              ...action,
              evidence: action.evidence || [],
              comment: action.comment || "",
            })),
          },
        };

        // Update the playBooks array
        const updatedPlayBooks = this.playBooks.map((pb) =>
          pb.id === this.selectedPlayBook.id ? updatedPlayBook : pb
        );

        const payload = {
          type: "incident-play-books",
          data: updatedPlayBooks,
        };
        await this.apiIncidentSetting.from(payload);
        this.playBooks = updatedPlayBooks;

        Swal.fire({
          icon: "success",
          title: this.$t("common.success"),
          text: this.$t("common.review_actions_saved"),
        });
      } catch (error) {
        console.error("Error saving review actions:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_save_review_actions"),
        });
      }
    },
    setActiveReviewTab(tabName) {
      this.activeReviewTab = tabName;
    },

    // Add this method to load playbook actions when entering review step
    setEditWizardStep(step) {
      // Base max step: 4 for non-responsible users, 5 for responsible users
      let maxStep = 4;
      if (
        this.selectedPlayBook &&
        this.isUserResponsibleForPlaybook(this.selectedPlayBook)
      ) {
        maxStep = 5; // Allow access to Review step
      } else if (this.loggedInUser.id === this.editingIncident.stakeholders) {
        maxStep = 4; // Owner still limited to step 4 unless in responsibleId
      }

      // Initialize actions if needed and step is valid
      if (
        step === 5 &&
        this.selectedPlayBook &&
        !this.selectedPlayBook.actions
      ) {
        this.selectedPlayBook.actions = {
          containments: [],
          eradications: [],
          recoveries: [],
        };
      }

      // Set step if within bounds
      if (step >= 1 && step <= maxStep) {
        this.currentEditWizardStep = step;
      }
    },
    handleFileChange(event) {
      const files = event.target.files; // FileList object
      if (files && files.length > 0) {
        // Convert FileList to an array and store it
        this.editingIncident.file = Array.from(files);
        // Optionally, generate previews for image files
        this.filePreviews = [];
        for (let file of files) {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.filePreviews.push(e.target.result);
            };
            reader.readAsDataURL(file);
          }
        }
      } else {
        this.editingIncident.file = [];
        this.filePreviews = [];
      }
    },

    buildActionCommentableId(tab, actionName) {
      // Build a deterministic id for action comments based on incident + playbook + action type + action name
      const incidentId = this.editingIncident?.id || this.currentIncident?.id;
      const playbookId =
        this.editingIncident?.playBookId || this.currentIncident?.playBookId;
      const type =
        tab === "containments"
          ? "containment"
          : tab === "eradications"
          ? "eradication"
          : "recovery";
      return `${incidentId || "N"}:${playbookId || "N"}:${type}:${actionName}`;
    },

    openActionCommentsModal(tab, actionName) {
      const type =
        tab === "containments"
          ? "containment"
          : tab === "eradications"
          ? "eradication"
          : "recovery";
      this.actionCommentsTarget = {
        type,
        name: actionName,
        id: this.buildActionCommentableId(tab, actionName),
      };
      this.isActionCommentsModalOpen = true;
    },

    closeActionCommentsModal() {
      this.isActionCommentsModalOpen = false;
      this.actionCommentsTarget = { type: null, name: null, id: null };
    },

    openActionStatusLog(actionTab, actionName) {
      const actionType =
        actionTab === "containments"
          ? "containment"
          : actionTab === "eradications"
          ? "eradication"
          : "recovery";

      console.log("Opening status log for:", actionName, actionType);
      console.log(
        "Available logs:",
        this.editingIncident?.playBookActionsStatusLog
      );

      // Get logs for this specific action
      const logs = (this.editingIncident?.playBookActionsStatusLog || [])
        .filter(
          (log) =>
            log &&
            log.actionName === actionName &&
            log.actionType === actionType
        )
        .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)); // Sort by most recent first

      console.log("Filtered logs for this action:", logs);

      this.currentActionStatusLog = {
        actionName: actionName,
        actionType: actionType,
        logs: logs,
      };

      this.isActionStatusLogModalOpen = true;
    },

    closeActionStatusLog() {
      this.isActionStatusLogModalOpen = false;
      this.currentActionStatusLog = {
        actionName: null,
        actionType: null,
        logs: [],
      };
    },

    formatLogDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },

    removeFile() {
      this.editingIncident.file = null;
      this.filePreview = null;
      this.$refs.fileInput.value = "";
    },
    async fetchAvailableIncidents() {
      try {
        const response = await this.api.getAll();
        // Filter out the current incident
        this.availableIncidents = response.filter(
          (incident) => incident.id !== this.editingIncident.id
        );
      } catch (error) {
        console.error("Error fetching incidents:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_fetch_incidents"),
        });
      }
    },

    async fetchAvailableRisks() {
      // Corrected method name
      try {
        // Assuming you have an API endpoint for risks
        this.availableRisks = await this.riskApi.getAll({
          select: "id|subject",
        });
        console.log("risks response", this.availableRisks);
      } catch (error) {
        console.error("Error fetching risks:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_fetch_risks"),
        });
      }
    },

    async fetchAvailableAssets() {
      try {
        // Assuming you have an API endpoint for assets
        this.availableAssets = await this.assetApi.getAll();
        console.log("assets response", this.availableAssets);
      } catch (error) {
        console.error("Error fetching assets:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_fetch_assets"),
        });
      }
    },

    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    getCaseTypeName(caseTypeId) {
      const type = this.caseTypes.find((ct) => ct.id === caseTypeId);
      return type ? type.type : "N/A";
    },

    getCaseDirectionName(caseDirectionId) {
      const direction = this.caseDirections.find(
        (ct) => ct.id === caseDirectionId
      );
      return direction ? direction.direction : "N/A";
    },

    getAttackName(attackId) {
      console.log("attackId", attackId);
      if (attackId === null) {
        return "N/A";
      }
      const attack = this.attacks.find((ct) => ct.id === attackId);
      return attack ? attack.attack : "N/A";
    },

    getPlayBookName(playId) {
      if (playId === null) {
        return "No Playbook Assigned";
      }

      const playbook = this.playBooks.find((pl) => pl.id === playId);
      return playbook ? playbook.name : "No Playbook Assigned";
    },

    getDetectorName(detectorId) {
      const detector = this.detectedBy.find((ct) => ct.id === detectorId);
      return detector ? detector.name : "N/A";
    },
    getTlpData(tlpId) {
      if (!tlpId) return null;
      // Try to find by ID first, then by name (in case tlpId is actually a name)
      const tlp = this.tlps.find((t) => t.id === tlpId || t.name === tlpId);
      return tlp || null;
    },
    getPapData(papId) {
      if (!papId) return null;
      // Try to find by ID first, then by name (in case papId is actually a name)
      const pap = this.paps.find((p) => p.id === papId || p.name === papId);
      return pap || null;
    },
    async fetchIRAs() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const iraData = response.find((item) => item.type === "incident-ira");

        if (iraData && iraData.data && iraData.data.length > 0) {
          // Take the first (and only) IRA
          this.ira = iraData.data[0];
        } else {
          this.ira = null; // No IRA exists yet
        }
      } catch (error) {
        console.error("Error fetching IRA:", error);
        this.ira = null;
      }
    },

    async saveIRA() {
      if (!this.isIRAValid) {
        Swal.fire({
          icon: "warning",
          title: this.$t("common.invalid_input"),
          text: this.$t("common.provide_name_and_responsible"),
        });
        return;
      }

      try {
        const responsibleNames = this.iraResponsibleOptions
          .filter((item) => this.newIRA.responsibleId.includes(item.id))
          .map((item) =>
            this.newIRA.responsibleType === "User" ? item.full_name : item.name
          )
          .filter((name) => name) // Remove undefined or null names
          .join(", ");

        const ira = {
          name: this.newIRA.name.trim(),
          responsibleType: this.newIRA.responsibleType,
          responsibleId: this.newIRA.responsibleId,
          responsibleName: responsibleNames,
        };

        // Always send an array with one IRA
        const payload = {
          type: "incident-ira",
          data: [ira], // Wrap in array (API might expect a list)
        };

        const response = await this.apiIncidentSetting.from(payload);
        console.log("Saved IRA:", response);

        // Update local state
        this.ira = ira;
        this.editingIRA = false;

        // Reset form
        this.newIRA = {
          name: "",
          responsibleType: "",
          responsibleId: [],
        };

        // Swal.fire({
        //   icon: "success",
        //   title: "Success",
        //   text: "IRA saved successfully.",
        // });
      } catch (error) {
        console.error("Error saving IRA:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_save_ira"),
        });
      }
    },

    cancelEditIRA() {
      // this.ira = ira;
      this.editingIRA = false;
    },

    editIRA() {
      if (!this.ira) return;

      this.newIRA = {
        name: this.ira.name,
        responsibleType: this.ira.responsibleType,
        responsibleId: Array.isArray(this.ira.responsibleId)
          ? [...this.ira.responsibleId]
          : [this.ira.responsibleId],
      };
      this.editingIRA = true;
    },

    async deleteIRA() {
      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.ira_will_be_deleted"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) return;

      try {
        // Send an empty array to clear the IRA
        const payload = {
          type: "incident-ira",
          data: [], // Empty array means "delete the IRA"
        };

        const response = await this.apiIncidentSetting.from(payload);
        console.log("Deleted IRA:", response);

        // Clear local state
        this.ira = null;

        Swal.fire({
          icon: "success",
          title: this.$t("common.deleted"),
          text: this.$t("common.ira_has_been_deleted"),
        });
      } catch (error) {
        console.error("Error deleting IRA:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_delete_ira"),
        });
      }
    },
    isValueValid(value, currentIndex) {
      return (
        this.isValueUnique(value, currentIndex) &&
        Number(value) <= this.maxTotalScore
      );
    },
    isValueUnique(value, currentIndex) {
      return !this.incidentClassifications.some((classification, index) => {
        return (
          index !== currentIndex &&
          classification.value !== undefined &&
          Number(classification.value) === Number(value)
        );
      });
    },
    validateValue(index) {
      const value = this.incidentClassifications[index].value;
      if (!this.isValueValid(value, index)) {
        // Trigger reactivity by direct assignment
        this.incidentClassifications[index] = {
          ...this.incidentClassifications[index],
        };
      }
    },

    isPriorityUnique(priority, currentIndex) {
      if (!priority) return true; // Allow empty for initial state
      const priorityKey = priority;
      return !this.incidentClassifications.some(
        (c, index) =>
          index !== currentIndex && c.priority && c.priority === priorityKey
      );
    },

    isValueUnique(value, currentIndex) {
      if (!Number.isInteger(Number(value))) return true; // Allow invalid numbers for initial state
      const valueKey = Number(value);
      return !this.incidentClassifications.some(
        (c, index) =>
          index !== currentIndex &&
          Number.isInteger(Number(c.value)) &&
          Number(c.value) === valueKey
      );
    },

    isColorUnique(color, currentIndex) {
      if (!color) return true; // Allow empty for initial state
      const colorKey = color.toLowerCase();
      return !this.incidentClassifications.some(
        (c, index) =>
          index !== currentIndex &&
          c.color &&
          c.color.toLowerCase() === colorKey
      );
    },

    addClassificationInput() {
      const isFirstClassification = this.incidentClassifications.length === 0;
      this.incidentClassifications.push({
        priority: "",
        value: isFirstClassification ? this.maxTotalScore : 1,
        color: "#000000",
        sla: "",
        description: "",
        isFirst: isFirstClassification, // Flag to identify the first classification
      });
      this.isAddClassificationDisabled = true; // Disable the button after adding
    },

    isLastClassificationValid() {
      const lastClassification =
        this.incidentClassifications[this.incidentClassifications.length - 1];
      if (!lastClassification) return false;

      return (
        lastClassification.priority &&
        Number.isInteger(Number(lastClassification.value)) &&
        lastClassification.value > 0 &&
        (lastClassification.isFirst ||
          lastClassification.value <= this.maxTotalScore) &&
        lastClassification.color &&
        Number.isInteger(Number(lastClassification.sla)) &&
        lastClassification.sla > 0 &&
        lastClassification.description
      );
    },
    async removeClassificationInput(index) {
      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }
      this.incidentClassifications.splice(index, 1);
      this.saveClassifications();
    },

    async saveClassifications() {
      const validClassifications = this.incidentClassifications
        .filter(
          (c) =>
            c.priority &&
            Number.isInteger(Number(c.value)) &&
            c.color &&
            Number.isInteger(Number(c.sla))
        )
        .map((c) => ({
          priority: c.priority,
          value: Number(c.value),
          color: c.color,
          sla: Number(c.sla),
          description: c.description,
          id: c.id || this.generateUUID(),
        }));

      if (validClassifications.length === 0) {
        Swal.fire({
          icon: "warning",
          title: this.$t("common.invalid_input"),
          text: this.$t("common.enter_valid_classification_details"),
        });
        return;
      }

      // Validate unique priority, value, and color
      const prioritySet = new Set();
      const valueSet = new Set();
      const colorSet = new Set();
      for (const c of validClassifications) {
        const priorityKey = c.priority;
        const valueKey = Number(c.value);
        const colorKey = c.color.toLowerCase();
        if (
          prioritySet.has(priorityKey) ||
          valueSet.has(valueKey) ||
          colorSet.has(colorKey)
        ) {
          notify({
            title: this.$t("common.validation_error"),
            text: this.$t("common.priority_value_color_must_be_unique"),
            type: "error",
          });
          return;
        }
        prioritySet.add(priorityKey);
        valueSet.add(valueKey);
        colorSet.add(colorKey);
      }

      try {
        const payload = {
          type: "incident-classifications",
          data: validClassifications,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log("Saved classifications:", response);
        this.incidentClassifications = validClassifications;
        // Swal.fire({
        //   icon: "success",
        //   title: "Success",
        //   text: "Classifications saved successfully.",
        // });
      } catch (error) {
        console.error("Error saving classifications:", error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Failed to save classifications.",
        // });
      }
    },

    async fetchIncidentClassifications() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        console.log("Fetched response:", response);
        const classificationData = response.find(
          (item) => item.type === "incident-classifications"
        );
        if (classificationData && classificationData.data) {
          // Use spread operator to ensure reactivity
          this.incidentClassifications.splice(
            0,
            this.incidentClassifications.length,
            ...classificationData.data.map((c) => ({
              priority: c.priority || "",
              value: Number(c.value) || 0,
              color: c.color || "#000000",
              sla: Number(c.sla) || 0,
              description: c.description || "",
              id: c.id || this.generateUUID(),
            }))
          );
          console.log(
            "Updated incidentClassifications:",
            this.incidentClassifications
          );
        } else {
          this.incidentClassifications.splice(
            0,
            this.incidentClassifications.length
          );
          console.log("No classification data found");
        }
      } catch (error) {
        console.error("Error fetching classifications:", error);
        this.incidentClassifications.splice(
          0,
          this.incidentClassifications.length
        );
        notify({
          title: this.$t("common.token_expired"),
          text: this.$t("common.please_login_again"),
          type: "error",
        });
      }
    },

    async openIncidentScoreWizard() {
      this.isIncidentScoreWizardOpen = true;
      // Fetch incident scores to ensure latest data
      await this.fetchIncidentScores();
      // Fetch classifications
      await this.fetchIncidentClassifications();

      this.currentWizardStep = 1;
      // Ensure scoringInputs is initialized
      this.incidentScoreCriteria.forEach((criteria) => {
        if (!this.scoringInputs[criteria.name]) {
          this.$set(this.scoringInputs, criteria.name, criteria.scores || []);
        }
      });
    },

    isLevelUnique(criteriaName, level, currentIndex) {
      if (!this.scoringInputs[criteriaName]) return true;
      return !this.scoringInputs[criteriaName].some((score, index) => {
        return (
          index !== currentIndex &&
          score.level &&
          score.level.trim().toLowerCase() === level.trim().toLowerCase()
        );
      });
    },

    isPointUnique(criteriaName, point, currentIndex) {
      if (!this.scoringInputs[criteriaName]) return true;
      return !this.scoringInputs[criteriaName].some((score, index) => {
        return (
          index !== currentIndex &&
          score.point !== undefined &&
          Number(score.point) === Number(point)
        );
      });
    },

    isPointValid(criteriaName, point, index) {
      return point >= 0 && this.isPointUnique(criteriaName, point, index);
    },
    getPointErrorMessage(criteriaName, point, index) {
      if (point <= 0) {
        return this.$t("incident.point_must_be_greater_than_0");
      }
      if (!this.isPointUnique(criteriaName, point, index)) {
        return this.$t("incident.point_must_be_unique");
      }
      return "";
    },

    areAllPointsValid(criteriaName) {
      return this.getScoringInputs(criteriaName).every(
        (score, index) =>
          score.point >= 0 &&
          this.isPointUnique(criteriaName, score.point, index)
      );
    },

    validateScoringInputs(criteriaName) {
      if (!this.scoringInputs[criteriaName]) return true;

      const inputs = this.scoringInputs[criteriaName];
      const levelSet = new Set();
      let isValid = true;

      for (const input of inputs) {
        if (!input.level) {
          isValid = false;
          continue;
        }

        const levelKey = input.level.trim().toLowerCase();

        if (levelSet.has(levelKey)) {
          isValid = false;
        }

        levelSet.add(levelKey);
      }

      return isValid;
    },
    setActiveCriteriaTab(criteriaName) {
      this.activeCriteriaTab = criteriaName;
    },

    addScoringInput(criteriaName) {
      if (!this.scoringInputs[criteriaName]) {
        this.scoringInputs[criteriaName] = [];
      }
      const newScore = {
        level: "",
        point: this.scoringInputs[criteriaName].length === 0 ? 1 : null,
        id: this.generateUUID(),
      };
      this.scoringInputs[criteriaName].push(newScore);
    },

    async removeScoringInput(criteriaName, index) {
      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      if (this.scoringInputs[criteriaName]) {
        const deletedScore = this.scoringInputs[criteriaName][index];
        this.scoringInputs[criteriaName].splice(index, 1);

        // Validate remaining points after deletion
        const scores = this.scoringInputs[criteriaName];
        if (scores.length > 0) {
          const points = scores.map((score) => Number(score.point));
          const uniquePoints = new Set(points);
          const maxPoint = scores.length;

          // Check if points are integers between 1 and maxPoint, unique, and first point is 1
          const validPoints =
            points.every(
              (point, idx) =>
                Number.isInteger(point) &&
                point >= 1 &&
                point <= maxPoint &&
                (idx === 0 ? point === 1 : true)
            ) && uniquePoints.size === points.length;

          if (!validPoints) {
            // Identify invalid points (those exceeding maxPoint)
            const invalidPoints = points
              .map((point, idx) => (point > maxPoint ? point : null))
              .filter((point) => point !== null);

            notify({
              title: this.$t("common.validation_error"),
              text: this.$t("common.invalid_points", {
                points: invalidPoints.join(", "),
                maxPoint,
              }),
              type: "error",
            });

            // Optionally, reset invalid points to null to prompt user correction
            scores.forEach((score, idx) => {
              if (Number(score.point) > maxPoint) {
                score.point = null;
              }
            });

            return; // Prevent saving until points are corrected
          }
        }

        // Save the updated scores
        await this.saveScoring(criteriaName);
      }
    },

    async saveScoring(criteriaName) {
      if (!this.scoringInputs[criteriaName]) {
        this.scoringInputs[criteriaName] = [];
      }

      // Validate inputs before saving
      if (!this.validateScoringInputs(criteriaName)) {
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.names_must_be_unique"),
          type: "error",
        });
        return;
      }

      // Validate points: must be unique integers between 1 and number of inputs
      const scores = this.scoringInputs[criteriaName];
      if (scores.length > 0) {
        const points = scores.map((score) => Number(score.point));
        const uniquePoints = new Set(points);
        const maxPoint = scores.length;

        // Check if points are integers between 1 and maxPoint, unique, and first point is 1
        const validPoints =
          points.every(
            (point, index) =>
              Number.isInteger(point) && point >= 1 && point <= maxPoint
          ) && uniquePoints.size === points.length;

        if (!validPoints) {
          notify({
            title: this.$t("common.validation_error"),
            text: this.$t("common.points_must_be_unique_integers", {
              maxPoint,
            }),
            type: "error",
          });
          return;
        }
      }

      // Sort scores by point value in ascending order
      const validScores = this.scoringInputs[criteriaName]
        .filter(
          (score) =>
            score &&
            typeof score === "object" &&
            score.level &&
            score.level.trim() &&
            Number.isInteger(Number(score.point)) &&
            Number(score.point) >= 1
        )
        .map((score) => ({
          level: score.level.trim(),
          point: Number(score.point),
          id: score.id || this.generateUUID(),
        }))
        .sort((a, b) => a.point - b.point);

      try {
        const updatedCriteria = this.incidentScoreCriteria.map((criteria) => {
          if (criteria.name === criteriaName) {
            return { ...criteria, scores: validScores };
          }
          return {
            ...criteria,
            scores: (this.scoringInputs[criteria.name] || [])
              .filter(
                (score) =>
                  score &&
                  typeof score === "object" &&
                  score.level &&
                  score.level.trim() &&
                  Number.isInteger(Number(score.point)) &&
                  Number(score.point) >= 1
              )
              .map((score) => ({
                level: score.level.trim(),
                point: Number(score.point),
              }))
              .sort((a, b) => a.point - b.point),
          };
        });

        const payload = {
          type: "incident-score-criteria",
          data: updatedCriteria,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log(`Saved scoring for ${criteriaName}:`, response);
        this.incidentScores = updatedCriteria;
        this.scoringInputs[criteriaName] = validScores;
      } catch (error) {
        console.error(`Error saving scoring for ${criteriaName}:`, error);
      }
    },
    openForm() {
      this.newItem.createdBy = Auth.USER.id; // Set the requestor_id to the current user's ID
      (this.newItem.status = this.newItem.status || "1"),
        (this.isFlipped = true);
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = {
        ...data,
        // existingFile: selectedRow.file, // Store the existing filename
      };
      this.isFlipped = true;
    },
    response(data) {
      // Ensure playBookActionsStatusLog exists in the data
      const incidentData = {
        ...data,
        playBookActionsStatusLog: data.playBookActionsStatusLog || [],
      };

      this.currentIncident = JSON.parse(JSON.stringify(incidentData));
      this.editingIncident = {
        ...incidentData,
        assessment: {},
        caseType: incidentData.caseType || "",
        createdBy: incidentData.createdBy || "",
        stakeholders: incidentData.stakeholders || "",
        playBookId: incidentData.playBookId || "",
        id: incidentData.id,
        relatedIncidents: incidentData.relatedIncidents || [],
        relatedRisks: incidentData.relatedRisks || [],
        relatedAssets: incidentData.relatedAssets || [],
        playBookActionsStatusLog: incidentData.playBookActionsStatusLog || [],
      };

      console.log(
        "Loaded playBookActionsStatusLog:",
        this.editingIncident.playBookActionsStatusLog
      );

      // Initialize assessment values properly
      this.incidentScoreCriteria.forEach((criterion) => {
        const assessmentValue = data.assessment?.[criterion.name];
        // Only set a value if it exists and is not null/empty
        if (
          assessmentValue !== null &&
          assessmentValue !== undefined &&
          assessmentValue !== ""
        ) {
          this.editingIncident.assessment[criterion.name] =
            Number(assessmentValue);
        } else {
          // Set to null to show "nothing selected"
          this.editingIncident.assessment[criterion.name] = null;
        }
      });

      this.isIncidentEditModalOpen = true;
      this.currentEditWizardStep = 1;
      this.fetchAvailableIncidents();
      this.fetchAvailableRisks();
      this.fetchAvailableAssets();
    },
    collectPlayBookActionsStatus() {
      const actions = [];

      // Collect containment actions
      this.filteredContainmentActions.forEach((action) => {
        actions.push({
          name: action.name,
          type: "containment",
          status: action.status || "None",
          comment: action.comment || "",
        });
      });

      // Collect eradication actions
      this.filteredEradicationActions.forEach((action) => {
        actions.push({
          name: action.name,
          type: "eradication",
          status: action.status || "None",
          comment: action.comment || "",
        });
      });

      // Collect recovery actions
      this.filteredRecoveryActions.forEach((action) => {
        actions.push({
          name: action.name,
          type: "recovery",
          status: action.status || "None",
          comment: action.comment || "",
        });
      });

      return actions;
    },

    // Validation: Check if assessment data is valid
    validateAssessment() {
      const assessment = this.editingIncident.assessment;
      if (
        !assessment ||
        Object.keys(assessment).length === 0 ||
        Object.values(assessment).some(
          (value) => value === null || value === "" || value === undefined
        )
      ) {
        notify({
          title: this.$t("common.invalid_assessment"),
          text: this.$t("common.assessment_data_missing"),
          type: "warning",
        });
        return false;
      }
      return true;
    },

    // Validation: Check if all criteria have scores
    async validateMissingCriteria() {
      const missingCriteria = this.incidentScoreCriteria.filter(
        (criterion) =>
          this.editingIncident.assessment[criterion.name] === undefined
      );
      if (missingCriteria.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: this.$t("common.incomplete_assessment"),
          text: this.$t("common.provide_scores_for", {
            criteria: missingCriteria.map((c) => c.name).join(", "),
          }),
        });
        return false;
      }
      return true;
    },

    // Validation: Check if incident can be closed
    validateClosedStatus() {
      if (this.editingIncident.status === "3") {
        const currentActionsStatus = this.collectPlayBookActionsStatus();
        const actionsWithNone = currentActionsStatus.filter(
          (action) => action.status === "None"
        );
        if (actionsWithNone.length > 0) {
          notify({
            title: this.$t("common.cannot_close_incident"),
            text: this.$t("common.all_playbook_actions_must_be_done"),
            type: "warning",
          });
          return false;
        }
      }
      return true;
    },

    // Determine classification based on total assessment score
    async determineClassification() {
      await this.fetchIncidentClassifications();
      const totalScore = this.totalAssessmentScore;

      const sortedClassifications = [...this.incidentClassifications].sort(
        (a, b) => Number(a.value) - Number(b.value)
      );

      for (const cls of sortedClassifications) {
        if (totalScore <= Number(cls.value)) {
          return { classification: cls.priority, classificationColor: cls.color };
        }
      }

      if (sortedClassifications.length > 0) {
        const last = sortedClassifications[sortedClassifications.length - 1];
        return { classification: last.priority, classificationColor: last.color };
      }

      return { classification: null, classificationColor: null };
    },

    // Build the incident payload for saving
    buildIncidentPayload(classification, classificationColor) {
      const selectedPlayBook = this.playBooks.find(
        (pb) => pb.id === this.editingIncident.playBookId
      );
      const csirtUsers =
        selectedPlayBook && Array.isArray(selectedPlayBook.responsibleId)
          ? selectedPlayBook.responsibleId
          : [];

      const assessmentPayload = {
        ...this.editingIncident.assessment,
        totalScore: this.totalAssessmentScore,
      };

      const playBookActionsStatus = this.collectPlayBookActionsStatus();
      const playBookActionsStatusLog =
        this.editingIncident.playBookActionsStatusLog || [];

      return {
        ...this.editingIncident,
        status: this.editingIncident.status,
        ResponseCaseType: this.editingIncident.ResponseCaseType,
        file: this.editingIncident.file,
        createdBy: this.editingIncident.createdBy,
        stakeholders: this.editingIncident.stakeholders,
        playBookId: this.editingIncident.playBookId,
        relatedIncidents: this.editingIncident.relatedIncidents,
        relatedRisks: this.editingIncident.relatedRisks,
        relatedAssets: this.editingIncident.relatedAssets,
        sourceTag: this.editingIncident.sourceTag,
        destinationTag: this.editingIncident.destinationTag,
        affectedUsers: this.editingIncident.affectedUsers,
        assessment: assessmentPayload,
        playBookActionsStatus: playBookActionsStatus,
        playBookActionsStatusLog: playBookActionsStatusLog,
        classification: classification,
        classificationColor: classificationColor,
        csirt_users: csirtUsers,
      };
    },

    // Main save function - orchestrates validation and saving
    async saveIncident() {
      try {
        // Run all validations
        if (!this.validateAssessment()) return;
        if (!(await this.validateMissingCriteria())) return;
        if (!this.validateClosedStatus()) return;

        // Determine classification
        const { classification, classificationColor } =
          await this.determineClassification();

        // Build payload
        const payload = this.buildIncidentPayload(
          classification,
          classificationColor
        );

        console.log("Incident payload (without evidence):", payload);

        // Save the incident
        const response = await this.api.from(payload);
        console.log("Save incident API response:", response);

        // Update local state with server response
        this.editingIncident = { ...this.editingIncident, ...response };

        this.closeIncidentEditModal();
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Error updating incident:", error);
        let errorMessage = this.$t("incident.failed_to_update_incident");
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
    },
    closeIncidentEditModal() {
      this.isIncidentEditModalOpen = false;
      this.editingIncident = {};
      this.currentEditWizardStep = 1;
      window.location.reload();
    },

    async fetchStatisticsData() {
      this.statisticsLoading = true;
      try {
        // Fetch all incidents with large limit to ensure we get all data
        const incidentsRes = await this.api.getAll();

        console.log("Statistics API Response:", incidentsRes);
        console.log("Incidents data:", incidentsRes.data);
        console.log(
          "Incidents count:",
          incidentsRes.data ? incidentsRes.data.length : 0
        );

        this.statisticsData.allIncidents = incidentsRes || [];

        // Apply filters and calculate
        this.applyStatisticsFilters();
      } catch (error) {
        console.error("Error fetching statistics:", error);
        this.$swal({
          icon: "error",
          title: "Error",
          text: "Failed to load incident statistics",
        });
      } finally {
        this.statisticsLoading = false;
      }
    },

    applyStatisticsFilters() {
      let filtered = [...this.statisticsData.allIncidents];

      console.log("All incidents before filtering:", filtered.length);
      console.log("Date range filter:", this.statisticsDateRange);
      console.log("Status filter:", this.statisticsStatusFilter);

      // Date filter
      if (this.statisticsDateRange !== "all") {
        const now = new Date();
        filtered = filtered.filter((incident) => {
          const createdDate = new Date(incident.created_at);
          const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);

          switch (this.statisticsDateRange) {
            case "today":
              return daysDiff < 1;
            case "week":
              return daysDiff <= 7;
            case "month":
              return daysDiff <= 30;
            case "quarter":
              return daysDiff <= 90;
            case "year":
              return daysDiff <= 365;
            default:
              return true;
          }
        });
      }

      console.log("After date filter:", filtered.length);

      // Status filter
      if (this.statisticsStatusFilter !== "all") {
        filtered = filtered.filter(
          (i) => i.status === this.statisticsStatusFilter
        );
      }

      console.log("After status filter:", filtered.length);

      this.statisticsData.filteredIncidents = filtered;
      this.calculateAllStatistics(filtered);
    },

    calculateAllStatistics(incidents) {
      try {
        console.log("calculateAllStatistics called with incidents:", incidents);
        console.log("Incidents count in calculation:", incidents.length);

        // Check the status values in the first few incidents to understand the data structure
        if (incidents.length > 0) {
          console.log(
            "Sample incident statuses:",
            incidents.slice(0, 5).map((i) => ({
              id: i.id,
              status: i.status,
              statusType: typeof i.status,
              classification: i.classification,
              classificationType: typeof i.classification,
            }))
          );
        }

        const total = incidents.length;

        // Count by status - handle both string and number types
        const open = incidents.filter(
          (i) =>
            i.status === "1" ||
            i.status === 1 ||
            i.status === "open" ||
            i.status === "Open"
        ).length;
        const inProgress = incidents.filter(
          (i) =>
            i.status === "2" ||
            i.status === 2 ||
            i.status === "in_progress" ||
            i.status === "In Progress"
        ).length;
        const closed = incidents.filter(
          (i) =>
            i.status === "3" ||
            i.status === 3 ||
            i.status === "closed" ||
            i.status === "Closed"
        ).length;
        const now = new Date();

        console.log("KPI Calculations:", { total, open, inProgress, closed });
        console.log("Unique status values in data:", [
          ...new Set(incidents.map((i) => i.status)),
        ]);

        // Critical/High priority open incidents
        const criticalOpen = incidents.filter((i) => {
          // Check if status is open (handle multiple formats)
          const isOpen =
            i.status === "1" ||
            i.status === 1 ||
            i.status === "open" ||
            i.status === "Open";
          if (!isOpen) return false;

          // Handle classification as string, number, or object
          const classification = String(i.classification || "").toLowerCase();
          return (
            classification.includes("critical") ||
            classification.includes("high")
          );
        }).length;

        // Calculate average resolution time for CLOSED incidents only
        const closedIncidents = incidents.filter(
          (i) =>
            i.status === "3" ||
            i.status === 3 ||
            i.status === "closed" ||
            i.status === "Closed"
        );
        let totalResolutionMs = 0;
        let resolutionCount = 0;

        closedIncidents.forEach((incident) => {
          const detectedDate = incident.detectedAt
            ? new Date(incident.detectedAt)
            : new Date(incident.created_at);
          const closedDate = new Date(incident.updated_at);
          if (!isNaN(detectedDate.getTime()) && !isNaN(closedDate.getTime())) {
            const diff = closedDate - detectedDate;
            if (diff > 0) {
              totalResolutionMs += diff;
              resolutionCount++;
            }
          }
        });

        const avgResolutionMs =
          resolutionCount > 0 ? totalResolutionMs / resolutionCount : 0;
        const avgResolutionHours = Math.round(
          avgResolutionMs / (1000 * 60 * 60)
        );
        const avgResolutionDays = Math.floor(avgResolutionHours / 24);
        const avgResolutionRemainingHours = avgResolutionHours % 24;

        // Calculate average detection time
        let totalDetectionMs = 0;
        let detectionCount = 0;

        incidents.forEach((incident) => {
          if (incident.detectedAt && incident.created_at) {
            const created = new Date(incident.created_at);
            const detected = new Date(incident.detectedAt);
            if (!isNaN(created.getTime()) && !isNaN(detected.getTime())) {
              const diff = detected - created;
              if (diff > 0) {
                totalDetectionMs += diff;
                detectionCount++;
              }
            }
          }
        });

        const avgDetectionMs =
          detectionCount > 0 ? totalDetectionMs / detectionCount : 0;
        const avgDetectionHours = Math.round(avgDetectionMs / (1000 * 60 * 60));
        const avgDetectionMinutes = Math.round(avgDetectionMs / (1000 * 60));

        // SLA Compliance - check against classification SLA hours
        let slaCompliant = 0;
        closedIncidents.forEach((incident) => {
          const classData = this.incidentClassifications.find(
            (c) =>
              c.value === incident.classification ||
              c.priority === incident.classification
          );
          if (classData && classData.slaHours) {
            const detectedDate = incident.detectedAt
              ? new Date(incident.detectedAt)
              : new Date(incident.created_at);
            const closedDate = new Date(incident.updated_at);
            const hoursTaken = (closedDate - detectedDate) / (1000 * 60 * 60);

            if (hoursTaken <= classData.slaHours) {
              slaCompliant++;
            }
          }
        });

        const slaComplianceRate =
          closedIncidents.length > 0
            ? Math.round((slaCompliant / closedIncidents.length) * 100)
            : 100;
        const slaBreach = closedIncidents.length - slaCompliant;

        // Closed today
        const closedToday = closedIncidents.filter((i) => {
          const updated = new Date(i.updated_at);
          return updated.toDateString() === now.toDateString();
        }).length;

        // Closed this week
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const closedThisWeek = closedIncidents.filter((i) => {
          const updated = new Date(i.updated_at);
          return updated >= weekAgo;
        }).length;

        // Evidence statistics
        const withEvidence = incidents.filter(
          (i) =>
            i.evidence && Array.isArray(i.evidence) && i.evidence.length > 0
        ).length;
        const evidencePercentage =
          total > 0 ? Math.round((withEvidence / total) * 100) : 0;
        const totalEvidenceCount = incidents.reduce((sum, i) => {
          return (
            sum +
            (i.evidence && Array.isArray(i.evidence) ? i.evidence.length : 0)
          );
        }, 0);

        // Avg incidents per day
        let avgPerDay = 0;
        if (incidents.length > 0) {
          const dates = incidents
            .map((i) => new Date(i.created_at).getTime())
            .filter((t) => !isNaN(t));
          if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const daysDiff = Math.max(
              1,
              Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
            );
            avgPerDay = (total / daysDiff).toFixed(1);
          }
        }

        // Unique reporters
        const uniqueReporters = new Set(
          incidents.map((i) => i.createdBy).filter((id) => id)
        ).size;

        // Stale incidents (open > 30 days)
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const staleIncidents = incidents.filter((i) => {
          // Exclude closed incidents (handle multiple formats)
          const isClosed =
            i.status === "3" ||
            i.status === 3 ||
            i.status === "closed" ||
            i.status === "Closed";
          if (isClosed) return false;
          const created = new Date(i.created_at);
          return created < thirtyDaysAgo;
        }).length;

        // New this week
        const newThisWeek = incidents.filter((i) => {
          const created = new Date(i.created_at);
          return created >= weekAgo;
        }).length;

        // Calculate trend
        const thirtyDaysAgoDate = new Date(now);
        thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
        const sixtyDaysAgoDate = new Date(now);
        sixtyDaysAgoDate.setDate(sixtyDaysAgoDate.getDate() - 60);

        const currentPeriod = incidents.filter(
          (i) => new Date(i.created_at) >= thirtyDaysAgoDate
        ).length;
        const previousPeriod = incidents.filter((i) => {
          const created = new Date(i.created_at);
          return created >= sixtyDaysAgoDate && created < thirtyDaysAgoDate;
        }).length;

        const trend =
          previousPeriod > 0
            ? Math.round(
                ((currentPeriod - previousPeriod) / previousPeriod) * 100
              )
            : 0;

        // Update KPIs with all calculated values
        this.statisticsData.kpis = {
          totalIncidents: total,
          totalTrend: trend,
          openIncidents: open,
          inProgressIncidents: inProgress,
          closedIncidents: closed,
          criticalOpen: criticalOpen,
          avgResolutionTime:
            avgResolutionDays > 0
              ? `${avgResolutionDays}d ${avgResolutionRemainingHours}h`
              : `${avgResolutionHours}h`,
          avgResolutionHours: avgResolutionHours,
          mttr: `${avgResolutionHours}h`,
          slaCompliance: slaComplianceRate,
          slaBreach: slaBreach,
          avgDetectionTime:
            avgDetectionHours > 0
              ? `${avgDetectionHours}h`
              : `${avgDetectionMinutes}m`,
          closedToday: closedToday,
          closedThisWeek: closedThisWeek,
          withEvidence: evidencePercentage,
          evidenceCount: totalEvidenceCount,
          avgIncidentsPerDay: avgPerDay,
          totalReporters: uniqueReporters,
          staleIncidents: staleIncidents,
          newThisWeek: newThisWeek,
        };

        // Status Chart - Donut
        this.statisticsData.charts.statusSeries = [open, inProgress, closed];
        this.statisticsData.charts.statusOptions = {
          chart: { type: "pie", fontFamily: "Nunito Sans, sans-serif" },
          labels: ["Open", "In Progress", "Closed"],
          colors: ["#A92525", "#C4951B", "#255F0B"],
          legend: { position: "bottom", fontSize: "14px" },
          dataLabels: {
            enabled: true,
            formatter: function (val, opts) {
              return opts.w.config.series[opts.seriesIndex];
            },
          },
          plotOptions: {
            pie: {
              donut: {
                size: "65%",
                labels: {
                  show: false,
                },
              },
            },
          },
          responsive: [
            {
              breakpoint: 480,
              options: { legend: { position: "bottom" } },
            },
          ],
        };

        // Priority Chart - Bar Chart
        const priorityCount = {};
        incidents.forEach((i) => {
          // Convert classification to string to handle any data type
          const p = String(i.classification || "No Class");
          priorityCount[p] = (priorityCount[p] || 0) + 1;
        });
        const priorityCategories = Object.keys(priorityCount);
        const priorityData = Object.values(priorityCount);

        this.statisticsData.charts.prioritySeries = [
          { name: "Incidents", data: priorityData },
        ];
        this.statisticsData.charts.priorityOptions = {
          chart: {
            type: "bar",
            fontFamily: "Nunito Sans, sans-serif",
            toolbar: { show: false },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "55%",
              borderRadius: 5,
              dataLabels: { position: "top" },
            },
          },
          dataLabels: {
            enabled: true,
            offsetY: -20,
            style: { fontSize: "12px", colors: ["#541212"] },
          },
          colors: ["#A92525"],
          xaxis: {
            categories: priorityCategories,
            labels: { style: { fontSize: "12px" } },
          },
          yaxis: { title: { text: "Number of Incidents" } },
          fill: { opacity: 1 },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + " incidents";
              },
            },
          },
        };

        // Trend Chart - Area Chart showing incidents over time (last 30 days)
        const dateMap = {};
        incidents.forEach((i) => {
          const dateKey = new Date(i.created_at).toISOString().split("T")[0];
          if (!dateMap[dateKey])
            dateMap[dateKey] = { open: 0, inProgress: 0, closed: 0 };

          // Handle different status formats
          if (
            i.status === "1" ||
            i.status === 1 ||
            i.status === "open" ||
            i.status === "Open"
          ) {
            dateMap[dateKey].open++;
          } else if (
            i.status === "2" ||
            i.status === 2 ||
            i.status === "in_progress" ||
            i.status === "In Progress"
          ) {
            dateMap[dateKey].inProgress++;
          } else if (
            i.status === "3" ||
            i.status === 3 ||
            i.status === "closed" ||
            i.status === "Closed"
          ) {
            dateMap[dateKey].closed++;
          }
        });

        const last30 = Object.keys(dateMap).sort().slice(-30);
        const openData = last30.map((d) => (dateMap[d] ? dateMap[d].open : 0));
        const inProgressData = last30.map((d) =>
          dateMap[d] ? dateMap[d].inProgress : 0
        );
        const closedData = last30.map((d) =>
          dateMap[d] ? dateMap[d].closed : 0
        );

        this.statisticsData.charts.trendSeries = [
          { name: "Open", data: openData },
          { name: "In Progress", data: inProgressData },
          { name: "Closed", data: closedData },
        ];
        this.statisticsData.charts.trendOptions = {
          chart: {
            type: "area",
            fontFamily: "Nunito Sans, sans-serif",
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: true },
          },
          colors: ["#A92525", "#C4951B", "#255F0B"],
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: 2 },
          fill: {
            type: "gradient",
            gradient: { opacityFrom: 0.6, opacityTo: 0.1 },
          },
          xaxis: {
            categories: last30.map((d) => {
              const date = new Date(d);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }),
            labels: { style: { fontSize: "11px" } },
          },
          yaxis: { title: { text: "Number of Incidents" } },
          legend: { position: "top" },
          tooltip: { shared: true, intersect: false },
        };

        // Type Chart - Horizontal Bar (Top 10)
        const typeCount = {};
        incidents.forEach((i) => {
          const t = this.getCaseTypeName(i.caseType);
          typeCount[t] = (typeCount[t] || 0) + 1;
        });
        const topTypes = Object.entries(typeCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        this.statisticsData.charts.typeSeries = [
          { name: "Incidents", data: topTypes.map((t) => t[1]) },
        ];
        this.statisticsData.charts.typeOptions = {
          chart: {
            type: "bar",
            fontFamily: "Nunito Sans, sans-serif",
            toolbar: { show: false },
          },
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 4,
              dataLabels: { position: "top" },
            },
          },
          dataLabels: {
            enabled: true,
            offsetX: 30,
            style: { fontSize: "12px", colors: ["#541212"] },
          },
          colors: ["#A92525"],
          xaxis: { categories: topTypes.map((t) => t[0]) },
          yaxis: { labels: { style: { fontSize: "11px" } } },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + " incidents";
              },
            },
          },
        };

        // Attack Vectors Chart - Pie Chart
        const attackCount = {};
        incidents.forEach((i) => {
          const a = this.getAttackName(i.attack);
          attackCount[a] = (attackCount[a] || 0) + 1;
        });
        const attackLabels = Object.keys(attackCount);
        const attackData = Object.values(attackCount);

        this.statisticsData.charts.attackSeries = attackData;
        this.statisticsData.charts.attackOptions = {
          chart: { type: "pie", fontFamily: "Nunito Sans, sans-serif" },
          labels: attackLabels,
          colors: [
            "#A92525",
            "#C4951B",
            "#255F0B",
            "#999999",
            "#A92525",
            "#C4951B",
            "#255F0B",
            "#999999",
          ],
          legend: { position: "bottom", fontSize: "12px" },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return Math.round(val) + "%";
            },
          },
          responsive: [
            {
              breakpoint: 480,
              options: { legend: { position: "bottom" } },
            },
          ],
        };

        // Response Time by Priority - Line Chart
        const classificationTimes = {};
        closedIncidents.forEach((incident) => {
          const classification = incident.classification || "Unknown";
          if (incident.detectedAt && incident.updated_at) {
            const detected = new Date(incident.detectedAt);
            const resolved = new Date(incident.updated_at);
            const hours = (resolved - detected) / (1000 * 60 * 60);

            if (!classificationTimes[classification]) {
              classificationTimes[classification] = { total: 0, count: 0 };
            }
            classificationTimes[classification].total += hours;
            classificationTimes[classification].count++;
          }
        });

        const responseCategories = Object.keys(classificationTimes);
        const responseAvgTimes = responseCategories.map((cat) => {
          const avg =
            classificationTimes[cat].total / classificationTimes[cat].count;
          return Math.round(avg);
        });

        this.statisticsData.charts.responseTimeSeries = [
          {
            name: "Avg Response Time (hours)",
            data: responseAvgTimes,
          },
        ];
        this.statisticsData.charts.responseTimeOptions = {
          chart: {
            type: "line",
            fontFamily: "Nunito Sans, sans-serif",
            toolbar: { show: false },
          },
          colors: ["#A92525"],
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val + "h";
            },
          },
          stroke: { curve: "smooth", width: 3 },
          markers: { size: 5 },
          xaxis: { categories: responseCategories },
          yaxis: { title: { text: "Hours" } },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + " hours";
              },
            },
          },
        };

        // Detection Methods - Donut Chart
        const detectorChartCount = {};
        incidents.forEach((i) => {
          const d = this.getDetectorName(i.detectedBy);
          detectorChartCount[d] = (detectorChartCount[d] || 0) + 1;
        });
        const detectorLabels = Object.keys(detectorChartCount);
        const detectorData = Object.values(detectorChartCount);

        this.statisticsData.charts.detectorSeries = detectorData;
        this.statisticsData.charts.detectorOptions = {
          chart: { type: "pie", fontFamily: "Nunito Sans, sans-serif" },
          labels: detectorLabels,
          colors: ["#A92525", "#C4951B", "#255F0B", "#999999", "#A92525"],
          legend: { position: "bottom", fontSize: "12px" },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return Math.round(val) + "%";
            },
          },
          plotOptions: {
            pie: {
              donut: {
                size: "65%",
                labels: {
                  show: false,
                },
              },
            },
          },
        };

        // Direction Chart - Bar Chart
        const directionCount = {};
        incidents.forEach((i) => {
          const d = this.getCaseDirectionName(i.direction);
          directionCount[d] = (directionCount[d] || 0) + 1;
        });
        const directionCategories = Object.keys(directionCount);
        const directionData = Object.values(directionCount);

        this.statisticsData.charts.directionSeries = [
          { name: "Incidents", data: directionData },
        ];
        this.statisticsData.charts.directionOptions = {
          chart: {
            type: "bar",
            fontFamily: "Nunito Sans, sans-serif",
            toolbar: { show: false },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "55%",
              borderRadius: 5,
            },
          },
          dataLabels: {
            enabled: true,
            style: { fontSize: "12px", colors: ["#541212"] },
          },
          colors: ["#A92525"],
          xaxis: { categories: directionCategories },
          yaxis: { title: { text: "Number of Incidents" } },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + " incidents";
              },
            },
          },
        };

        // Top Detectors
        const detectorCount = {};
        incidents.forEach((i) => {
          const d = this.getDetectorName(i.detectedBy);
          detectorCount[d] = (detectorCount[d] || 0) + 1;
        });
        const topDet = Object.entries(detectorCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        this.statisticsData.topDetectors = topDet.map((d) => ({
          name: d[0],
          count: d[1],
          percentage: Math.round((d[1] / total) * 100),
        }));

        // Top Reporters
        const reporterCount = {};
        incidents.forEach((i) => {
          const r = this.getUserName(i.createdBy);
          reporterCount[r] = (reporterCount[r] || 0) + 1;
        });
        const topRep = Object.entries(reporterCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        const maxCount = topRep.length > 0 ? topRep[0][1] : 1;
        this.statisticsData.topReporters = topRep.map((r) => ({
          name: r[0],
          count: r[1],
          percentage: Math.round((r[1] / maxCount) * 100),
        }));
      } catch (error) {
        console.error("Error in calculateAllStatistics:", error);
        console.error("Error stack:", error.stack);

        // Set default values to prevent UI errors
        this.statisticsData.kpis = {
          totalIncidents: 0,
          totalTrend: 0,
          openIncidents: 0,
          inProgressIncidents: 0,
          closedIncidents: 0,
          criticalOpen: 0,
          avgResolutionTime: "0h",
          avgResolutionHours: 0,
          mttr: "0h",
          slaCompliance: 0,
          slaBreach: 0,
          avgDetectionTime: "0h",
          closedToday: 0,
          closedThisWeek: 0,
          withEvidence: 0,
          evidenceCount: 0,
          avgIncidentsPerDay: 0,
          totalReporters: 0,
          staleIncidents: 0,
          newThisWeek: 0,
        };

        this.$swal({
          icon: "error",
          title: "Calculation Error",
          text: `Error calculating statistics: ${error.message}`,
        });
      }
    },

    openConfigurationsModal() {
      this.isConfigurationsModalOpen = true;
      this.activeTab = "caseType";
    },

    closeConfigurationsModal() {
      this.isConfigurationsModalOpen = false;
      this.caseTypeInputs = [];
      this.editingIRA = false;
    },

    addSection() {
      const newType = this.sections.length % 2 === 0 ? "Event" : "Incident";
      this.sections.push({ type: newType, description: "" });
    },

    deleteSection(index) {
      this.sections.splice(index, 1);
    },

    updateSection(index) {
      console.log(`Updating section ${index}:`, this.sections[index]);
    },

    setActiveTab(tabName) {
      this.activeTab = tabName;
      if (tabName === "caseType") {
        this.caseTypeInputs = [...this.incidentCaseTypes];
      } else if (tabName === "caseDirection") {
        this.caseDirectionInputs = [...this.incidentCaseDirections];
      } else if (tabName === "attacks") {
        this.attackInputs = [...this.incidentAttacks];
      } else if (tabName === "detectedBy") {
        this.detectedByInputs = [...this.incidentDetectedBy];
      } else if (tabName === "siteLocation") {
        this.siteLocationInputs = [...this.incidentSiteLocations];
      }
    },

    closeIncidentScoreWizard() {
      this.isIncidentScoreWizardOpen = false;
      this.currentWizardStep = 1;
      this.fetchIncidentScores();
      this.fetchIncidentClassifications();
      // this.incidentScoreCriteria = []; // Reset criteria inputs
    },

    setWizardStep(step) {
      if (step >= 1 && step <= this.wizardSteps.length) {
        this.currentWizardStep = step;
      }
    },

    addCriteriaInput() {
      this.incidentScoreCriteria.push({ name: "", description: "" });
    },
    async removeCriteriaInput(index) {
      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }
      this.incidentScoreCriteria.splice(index, 1);
      this.saveCriteria();
    },

    async saveCriteria() {
      const validCriteria = this.incidentScoreCriteria
        .filter((criteria) => criteria.name && criteria.description)
        .map((criteria) => ({
          name: criteria.name.trim(),
          description: criteria.description,
          scores: criteria.scores || 0, // Preserve score directly
          id: criteria.id || this.generateUUID(), // Use existing ID or generate new
        }));

      if (validCriteria.length === 0) {
        Swal.fire({
          icon: "warning",
          title: this.$t("common.invalid_input"),
          text: this.$t("common.enter_valid_criteria"),
        });
        return;
      }

      // Check for duplicates before saving
      const lowercasedNames = validCriteria.map((c) => c.name.toLowerCase());
      const uniqueNames = new Set(lowercasedNames);
      if (uniqueNames.size !== validCriteria.length) {
        notify({
          title: this.$t("common.duplicate_criteria_name"),
          text: this.$t("common.criteria_names_must_be_unique"),
          type: "error",
        });
        return;
      }

      try {
        const payload = {
          type: "incident-score-criteria",
          data: validCriteria,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log("Saved incident score criteria:", response);
        this.incidentScores = [...validCriteria];
        this.incidentScoreCriteria = [...validCriteria]; // Update input array
        // Update form field options if needed
        if (this.fromFields) {
          const scoreField = this.fromFields.find(
            (field) => field.name === "incidentScores"
          );
          if (scoreField) {
            scoreField.options = validCriteria.map((item) => ({
              label: item.name,
              value: item.name,
              id: item.id,
            }));
          }
        }
      } catch (error) {
        console.error("Error saving incident score criteria:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_save_criteria"),
        });
      }
    },

    async fetchIncidentScores() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        console.log("Fetched incident settings response:", response); // Debug log

        if (!Array.isArray(response)) {
          throw new Error(
            "Unexpected response format: response is not an array"
          );
        }

        const scoreData = response.find(
          (item) => item.type === "incident-score-criteria"
        );
        console.log("Found scoreData:", scoreData); // Debug log

        if (scoreData && Array.isArray(scoreData.data)) {
          // Update incidentScoreCriteria
          this.incidentScoreCriteria = scoreData.data
            .map((criteria) => {
              if (!criteria.name || !criteria.description) {
                console.warn("Invalid criteria found:", criteria);
                return null;
              }
              return {
                name: criteria.name || "",
                description: criteria.description || "",
                scores: Array.isArray(criteria.scores)
                  ? criteria.scores.map((score) => ({
                      level: score?.level || "",
                      point: Number(score?.point) || 0, // Convert string to number
                    }))
                  : [],
              };
            })
            .filter((criteria) => criteria !== null); // Remove invalid criteria

          // Initialize scoringInputs for each criterion
          this.scoringInputs = {}; // Reset scoringInputs
          this.incidentScoreCriteria.forEach((criteria) => {
            this.scoringInputs[criteria.name] = criteria.scores || []; // Direct assignment
          });

          // Update incidentScores
          this.incidentScores = [...this.incidentScoreCriteria];

          // Set activeCriteriaTab if criteria exist
          if (this.incidentScoreCriteria.length > 0) {
            this.activeCriteriaTab = this.incidentScoreCriteria[0].name;
          }

          // Initialize assessment for editingIncident
          this.editingIncident.assessment =
            this.editingIncident.assessment || {}; // Ensure assessment exists
          this.incidentScoreCriteria.forEach((criterion) => {
            if (this.editingIncident.assessment[criterion.name] === undefined) {
              this.editingIncident.assessment[criterion.name] =
                criterion.scores[0]?.point || 0; // Direct assignment
            }
          });

          console.log(
            "Processed incidentScoreCriteria:",
            this.incidentScoreCriteria
          ); // Debug log
        } else {
          console.warn("No valid incident-score-criteria data found");
          this.incidentScoreCriteria = [];
          this.incidentScores = [];
          this.scoringInputs = {};
          this.activeCriteriaTab = "";
        }
      } catch (error) {
        console.error(
          "Error fetching incident score criteria:",
          error.message,
          error.stack
        );
        this.incidentScoreCriteria = [];
        this.incidentScores = [];
        this.scoringInputs = {};
        this.activeCriteriaTab = "";
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: `Failed to fetch incident score criteria: ${error.message}`,
        // });
      }
    },

    async saveIncidentScore() {
      const validCriteria = this.incidentScoreCriteria
        .filter((criteria) => criteria.name.trim() && criteria.description)
        .map((criteria) => ({
          name: criteria.name.trim(),
          description: criteria.description,
          scores: (this.scoringInputs[criteria.name] || [])
            .filter(
              (score) =>
                score &&
                typeof score === "object" &&
                score.level &&
                score.level.trim() &&
                Number.isInteger(Number(score.point)) &&
                Number(score.point) >= 0
            )
            .map((score) => ({
              level: score.level.trim(),
              point: Number(score.point),
            })),
        }));
      if (validCriteria.length > 0) {
        try {
          const payload = {
            type: "incident-score-criteria",
            data: validCriteria,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved incident score:", response);
          this.incidentScores = validCriteria;
          // Update scoringInputs to reflect saved data
          this.scoringInputs = validCriteria.reduce((acc, criteria) => {
            acc[criteria.name] = criteria.scores;
            return acc;
          }, {});
          // Swal.fire({
          //   icon: "success",
          //   title: "Success",
          //   text: "Incident score wizard completed and saved successfully.",
          // });
          // this.closeIncidentScoreWizard();
        } catch (error) {
          console.error("Error saving incident score:", error);
          // Swal.fire({
          //   icon: "error",
          //   title: "Error",
          //   text: "Failed to save incident score.",
          // });
        }
      } else {
        // Swal.fire({
        //   icon: "warning",
        //   title: "Invalid Input",
        //   text: "No valid criteria defined.",
        // });
      }
    },

    setActivePlayBookCategoryTab(tabName) {
      this.activePlayBookCategoryTab = tabName;
      if (tabName === "containments") {
        this.containmentInputs = this.incidentContainments.map(
          (item) => item.category || ""
        );
      } else if (tabName === "eradications") {
        this.eradicationInputs = this.incidentEradications.map(
          (item) => item.category || ""
        );
      } else if (tabName === "recoveries") {
        this.recoveryInputs = this.incidentRecoveries.map(
          (item) => item.category || ""
        );
      }
    },

    openPlayBookActionsModal(index) {
      if (
        !this.playBooks[index] ||
        typeof this.playBooks[index] !== "object" ||
        !this.playBooks[index].name
      ) {
        console.error(
          `Invalid playbook at index ${index}:`,
          this.playBooks[index]
        );
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Cannot open actions for an invalid playbook.",
        // });
        return;
      }

      this.selecd = index;

      const playBook = { ...this.playBooks[this.selecd] };
      if (!playBook.actions) {
        playBook.actions = {
          containments: [],
          eradications: [],
          recoveries: [],
        };
      } else {
        playBook.actions.containments = playBook.actions.containments || [];
        playBook.actions.eradications = playBook.actions.eradications || [];
        playBook.actions.recoveries = playBook.actions.recoveries || [];
      }

      this.playBooks = [
        ...this.playBooks.slice(0, this.selecd),
        playBook,
        ...this.playBooks.slice(this.selecd + 1),
      ];

      this.activeActionTab = "containments";
      this.newAction = {
        type: "existing",
        actionId: null,
        name: "",
        category: null,
      };
      this.isPlayBookActionsModalOpen = true;
    },

    closePlayBookActionsModal() {
      this.isPlayBookActionsModalOpen = false;
      this.selecd = null;
    },

    setActiveActionTab(tabName) {
      this.activeActionTab = tabName;
    },

    openActionModal() {
      this.isEditingAction = false;
      this.editingActionIndex = null;
      this.newAction = {
        type: "existing",
        actionId: null,
        name: "",
        category: null,
      };
      this.isActionModalOpen = true;
    },

    closeActionModal() {
      this.isActionModalOpen = false;
      this.isEditingAction = false;
      this.editingActionIndex = null;
      this.newAction = {
        type: "existing",
        actionId: null,
        name: "",
        category: null,
      };
    },

    async editAction(actionIndex) {
      const action = this.validActions[actionIndex];
      if (!action) {
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.cannot_edit_invalid_action"),
        });
        return;
      }
      const playBook = { ...this.playBooks[this.selecd] };

      // Check if the playbook with this ID is referenced in incidents
      let isReferenced = await this.checkPlayBookInUse(playBook.id);
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.action_referenced_by_incidents"),
          type: "error",
        });
        return;
      }
      console.log("islam", playBook);

      const originalActions =
        this.playBooks[this.selecd]?.actions?.[this.activeActionTab] || [];
      let originalIndex = -1;

      for (let i = 0; i < originalActions.length; i++) {
        const a = originalActions[i];
        if (!a) continue;

        if (typeof a === "object" && a.name === action.name) {
          originalIndex = i;
          break;
        } else if (typeof a === "string" && a === action.name) {
          originalIndex = i;
          break;
        }
      }

      if (originalIndex === -1) {
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.could_not_find_original_action"),
        });
        return;
      }

      this.isEditingAction = true;
      this.editingActionIndex = originalIndex;

      // Resolve category ID from category name if necessary
      let categoryId = action.category;
      console.log("action.category", action.category);
      // if (typeof action.category === "string" && action.category) {
      //   // Handle legacy actions with category names
      //   const category = this.incidentContainments.find(
      //     (c) => c.category.toLowerCase() === action.category.toLowerCase()
      //   );
      //   categoryId = category ? category.id : null;
      // }

      this.newAction = {
        type: "new",
        actionId: null,
        name: action.name || "",
        category: categoryId, // Set to category ID
      };

      this.isActionModalOpen = true;
    },

    findCategoryForAction(actionName) {
      if (!actionName) return null;

      const incidentDataMap = {
        containments: this.incidentContainments,
        eradications: this.incidentEradications,
        recoveries: this.incidentRecoveries,
      };

      const incidentData = incidentDataMap[this.activeActionTab] || [];

      for (const category of incidentData) {
        if (category.actions && category.actions.includes(actionName)) {
          return category.id; // Return category ID
        }
      }

      return null;
    },

    async saveAction() {
      if (!this.newAction.category || !this.isActionValid) {
        Swal.fire({
          icon: "error",
          title: this.$t("common.invalid_action"),
          text: this.$t("common.select_valid_category_and_action"),
        });
        return;
      }

      let actionName = this.newAction.name.trim();

      if (!actionName) {
        Swal.fire({
          icon: "error",
          title: this.$t("common.invalid_action"),
          text: this.$t("common.action_name_cannot_be_empty"),
        });
        return;
      }

      const playBook = { ...this.playBooks[this.selecd] };

      if (!playBook.actions) {
        playBook.actions = {
          containments: [],
          eradications: [],
          recoveries: [],
        };
      }

      const currentActions = [
        ...(playBook.actions[this.activeActionTab] || []),
      ];

      // Check for duplicate category
      const isCategoryUsed = currentActions.some(
        (action, index) =>
          action.category === this.newAction.category &&
          (!this.isEditingAction || index !== this.editingActionIndex)
      );

      if (isCategoryUsed) {
        notify({
          title: this.$t("common.duplicate_category"),
          text: this.$t("common.category_already_used_in_playbook", {
            tab: this.activeActionTab,
          }),
          type: "error",
        });
        return;
      }

      // Check for duplicate action name
      const actionNameLower = actionName.toLowerCase();
      const isDuplicate = currentActions.some((action, index) => {
        if (this.isEditingAction && index === this.editingActionIndex) {
          return false;
        }
        return action.name.toLowerCase() === actionNameLower;
      });

      if (isDuplicate) {
        notify({
          title: this.$t("common.duplicate_action"),
          text: this.$t("common.action_already_exists_in_playbook", {
            name: actionName,
          }),
          type: "error",
        });
        return;
      }

      let actionObject;
      if (this.isEditingAction && this.editingActionIndex !== null) {
        if (this.editingActionIndex >= currentActions.length) {
          notify({
            title: this.$t("common.error"),
            text: this.$t("common.invalid_action_index_for_editing"),
            type: "error",
          });
          return;
        }
        const existingAction = currentActions[this.editingActionIndex];
        actionObject = {
          name: actionName,
          category: this.newAction.category,
          id: existingAction.id || this.generateUUID(),
        };
        currentActions[this.editingActionIndex] = actionObject;
      } else {
        actionObject = {
          name: actionName,
          category: this.newAction.category,
          id: this.generateUUID(),
        };
        currentActions.push(actionObject);
      }

      playBook.actions[this.activeActionTab] = currentActions;

      const updatedPlayBooks = [...this.playBooks];
      updatedPlayBooks[this.selecd] = playBook;

      try {
        const payload = {
          type: "incident-play-books",
          data: updatedPlayBooks,
        };
        await this.apiIncidentSetting.from(payload);

        this.playBooks = updatedPlayBooks;
      } catch (error) {
        console.error("Error saving play book actions:", error);
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_save_playbook_actions"),
          type: "error",
        });
        return;
      }

      this.closeActionModal();
    },
    async deleteAction(category, actionToDelete) {
      if (!actionToDelete) {
        return;
      }

      const playBook = { ...this.playBooks[this.selecd] };

      // Check if the playbook with this ID is referenced in incidents
      let isReferenced = await this.checkPlayBookInUse(playBook.id);
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.playbook_referenced_by_incidents"),
          type: "error",
        });
        return;
      }
      console.log("islam", playBook);

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.action_will_be_permanently_deleted"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) return;

      try {
        const playBook = { ...this.playBooks[this.selecd] };

        if (!playBook.actions) {
          playBook.actions = {
            containments: [],
            eradications: [],
            recoveries: [],
          };
        }

        const actionName =
          typeof actionToDelete === "string"
            ? actionToDelete
            : actionToDelete.name;

        playBook.actions[category] = (playBook.actions[category] || []).filter(
          (action) => {
            if (!action) return false;
            return typeof action === "string"
              ? action !== actionName
              : action.name !== actionName;
          }
        );

        const updatedPlayBooks = [...this.playBooks];
        updatedPlayBooks[this.selecd] = playBook;

        const payload = {
          type: "incident-play-books",
          data: updatedPlayBooks,
        };
        await this.apiIncidentSetting.from(payload);

        this.playBooks = updatedPlayBooks;

        // Swal.fire({
        //   icon: "success",
        //   title: "Deleted!",
        //   text: "The action has been deleted.",
        // });
      } catch (error) {
        console.error("Error deleting action:", error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Failed to delete action.",
        // });
      }
    },
    resetPlayBookForm() {
      this.newPlayBook = {
        name: this.newPlayBook.name || "",
        responsibleType: this.newPlayBook.responsibleType || "",
        responsibleId: [],
      };
    },
    openPlayBookModal() {
      this.isPlayBookModalOpen = true;
      // this.newPlayBook = {
      //   name: "",
      //   responsibleType: "User",
      //   responsibleId: [],
      // };
      this.resetPlayBookForm();
    },

    async editPlayBook(index) {
      // 1. Identify the playbook object using the selected index
      const playbookToDelete = this.playBooks[index];
      // This line is now safe because we've confirmed playbookToDelete exists
      const playbookId = playbookToDelete.id;

      // Check if the playbook with this ID is referenced in incidents
      let isReferenced = await this.checkPlayBookInUse(playbookId);
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.playbook_referenced_by_incidents"),
          type: "error",
        });
        return;
      }

      this.newPlayBook = { ...this.playBooks[index] };
      console.log("Play book", this.newPlayBook);
      this.newPlayBook.responsibleId = Array.isArray(
        this.newPlayBook.responsibleId
      )
        ? this.newPlayBook.responsibleId
        : [this.newPlayBook.responsibleId];
      this.editingIndex = index; // Store the index of the playbook being edited
      this.isPlayBookModalOpen = true;
    },

    async checkPlayBookInUse(playBookId) {
      try {
        const response = await this.api.getAll({
          filter: `playBookId|${playBookId}|=`,
        });
        console.log("fasdwqewqe", response);
        // This will now correctly return true or false.
        return Array.isArray(response) && response.length > 0;
      } catch (error) {
        console.error("Error checking playbook usage:", error);
        // It's safer to return true to prevent accidental deletion if the check fails.
        return true;
      }
    },

    async deletePlayBook(index) {
      // 1. Identify the playbook object using the selected index
      const playbookToDelete = this.playBooks[index];
      // This line is now safe because we've confirmed playbookToDelete exists
      const playbookId = playbookToDelete.id;

      // Check if the playbook with this ID is referenced in incidents
      let isReferenced = await this.checkPlayBookInUse(playbookId);
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.playbook_referenced_by_incidents"),
          type: "error",
        });
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }
      try {
        const updatedPlayBooks = [...this.playBooks];
        updatedPlayBooks.splice(index, 1);
        const payload = {
          type: "incident-play-books",
          data: updatedPlayBooks,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log("Deleted play book:", response);
        this.playBooks = updatedPlayBooks;
      } catch (error) {
        console.error("Error deleting play book:", error);
      }
    },

    closePlayBookModal() {
      this.newPlayBook = {
        name: "",
        responsibleType: "",
        responsibleId: [],
      };
      this.editingIndex = null; // Reset the editing index
      this.isPlayBookModalOpen = false;
      this.editingIndex = null;
    },

    async fetchPlayBooks() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const playBookData = response.find(
          (item) => item.type === "incident-play-books"
        );
        if (playBookData && playBookData.data) {
          this.playBooks = playBookData.data
            .filter(
              (playBook) =>
                playBook && typeof playBook === "object" && playBook.name
            )
            .map((playBook, index) => ({
              id: playBook.id || index,
              ...playBook,
              actions: {
                containments: (playBook.actions?.containments || [])
                  .filter(
                    (action) =>
                      action !== null &&
                      action !== undefined &&
                      typeof action === "object" &&
                      action.name
                  )
                  .map((action) => ({
                    ...action,
                    status: action.status || "None", // Preserve or default to "None"
                  })),
                eradications: (playBook.actions?.eradications || [])
                  .filter(
                    (action) =>
                      action !== null &&
                      action !== undefined &&
                      typeof action === "object" &&
                      action.name
                  )
                  .map((action) => ({
                    ...action,
                    status: action.status || "None", // Preserve or default to "None"
                  })),
                recoveries: (playBook.actions?.recoveries || [])
                  .filter(
                    (action) =>
                      action !== null &&
                      action !== undefined &&
                      typeof action === "object" &&
                      action.name
                  )
                  .map((action) => ({
                    ...action,
                    status: action.status || "None", // Preserve or default to "None"
                  })),
              },
            }));
          console.log("Fetched playBooks:", this.playBooks);
        } else {
          this.playBooks = [];
        }
      } catch (error) {
        console.error("Error fetching play books:", error);
        this.playBooks = [];
      }
    },

    async fetchUsers() {
      try {
        // const response = await this.userApi.getAll();
        const users = await this.userApi.getAll({
          select: "id|full_name|username|email|phone|type|department_id",
          with: ["department"]
        });
        // Map department name for ViewUserDetails modal
        this.users = users.map(user => ({
          ...user,
          department: user.department?.name || null
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    async fetchTeams() {
      try {
        const response = await this.teamApi.getAll();
        this.teams = response.map((team) => ({
          id: team.id,
          name: team.name,
          user_ids: team.user_ids,
        }));
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    },

    async savePlayBook() {
      if (
        !this.newPlayBook.name ||
        this.newPlayBook.responsibleId.length === 0
      ) {
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.select_responsible"),
          type: "error",
        });
        return;
      }

      // Check for duplicate playbook name
      const isDuplicateName = this.playBooks.some(
        (playBook, index) =>
          playBook.name.toLowerCase() === this.newPlayBook.name.toLowerCase() &&
          index !== this.editingIndex
      );

      if (isDuplicateName) {
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.playbook_with_name_exists"),
          type: "error",
        });
        return;
      }

      try {
        const responsibleNames = this.responsibleOptions
          .filter((item) => this.newPlayBook.responsibleId.includes(item.id))
          .map((item) =>
            this.newPlayBook.responsibleType === "User"
              ? item.full_name
              : item.name
          )
          .filter((name) => name) // Remove undefined or null names
          .join(", ");

        // Get the existing playbook data if editing
        const existingPlayBook =
          this.editingIndex !== null ? this.playBooks[this.editingIndex] : {};

        const playBook = {
          name: this.newPlayBook.name,
          responsibleType: this.newPlayBook.responsibleType,
          responsibleId: this.newPlayBook.responsibleId,
          responsibleName: responsibleNames,
          id: this.newPlayBook.id || this.generateUUID(),
          actions: existingPlayBook.actions || {
            containments: [],
            eradications: [],
            recoveries: [],
          },
        };

        let updatedPlayBooks;
        if (this.editingIndex !== null) {
          // Editing an existing playbook
          updatedPlayBooks = [...this.playBooks];
          updatedPlayBooks[this.editingIndex] = playBook; // Update the specific playbook
        } else {
          // Adding a new playbook
          updatedPlayBooks = [...this.playBooks, playBook];
        }

        const payload = {
          type: "incident-play-books",
          data: updatedPlayBooks,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log("Saved play book:", response);
        this.playBooks = payload.data;
        this.closePlayBookModal(); // Resets editingIndex via closePlayBookModal
      } catch (error) {
        console.error("Error saving play book:", error);
        this.closePlayBookModal(); // Reset modal state on error
      }
    },

    async fetchContainments() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const containmentData = response.find(
          (item) => item.type === "incident-containments"
        );
        if (containmentData && containmentData.data) {
          const mappedData = Array.isArray(containmentData.data)
            ? containmentData.data.map((item) =>
                typeof item === "string"
                  ? { id: this.generateUUID(), category: item, actions: [] }
                  : {
                      id: item.id || this.generateUUID(),
                      category: item.category || "",
                      actions: (item.actions || []).filter(
                        (a) => a !== null && a !== ""
                      ),
                    }
              )
            : [];
          this.incidentContainments = mappedData;
          this.containmentInputs = mappedData.map(
            (item) => item.category || ""
          );
          this.containments = mappedData.map((item) => item.category || "");
        } else {
          this.incidentContainments = [];
          this.containmentInputs = [];
          this.containments = [];
        }
      } catch (error) {
        console.error("Error fetching containments:", error);
        this.incidentContainments = [];
        this.containmentInputs = [];
        this.containments = [];
      }
    },

    async fetchEradications() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const eradicationData = response.find(
          (item) => item.type === "incident-eradications"
        );
        if (eradicationData && eradicationData.data) {
          const mappedData = Array.isArray(eradicationData.data)
            ? eradicationData.data.map((item) =>
                typeof item === "string"
                  ? { id: this.generateUUID(), category: item, actions: [] }
                  : {
                      id: item.id || this.generateUUID(),
                      category: item.category || "",
                      actions: (item.actions || []).filter(
                        (a) => a !== null && a !== ""
                      ),
                    }
              )
            : [];
          this.incidentEradications = mappedData;
          this.eradicationInputs = mappedData.map(
            (item) => item.category || ""
          );
          this.eradications = mappedData.map((item) => item.category || "");
        } else {
          this.incidentEradications = [];
          this.eradicationInputs = [];
          this.eradications = [];
        }
      } catch (error) {
        console.error("Error fetching eradications:", error);
        this.incidentEradications = [];
        this.eradicationInputs = [];
        this.eradications = [];
      }
    },

    async fetchRecoveries() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const recoveryData = response.find(
          (item) => item.type === "incident-recoveries"
        );
        if (recoveryData && recoveryData.data) {
          const mappedData = Array.isArray(recoveryData.data)
            ? recoveryData.data.map((item) =>
                typeof item === "string"
                  ? { id: this.generateUUID(), category: item, actions: [] }
                  : {
                      id: item.id || this.generateUUID(),
                      category: item.category || "",
                      actions: (item.actions || []).filter(
                        (a) => a !== null && a !== ""
                      ),
                    }
              )
            : [];
          this.incidentRecoveries = mappedData;
          this.recoveryInputs = mappedData.map((item) => item.category || "");
          this.recoveries = mappedData.map((item) => item.category || "");
        } else {
          this.incidentRecoveries = [];
          this.recoveryInputs = [];
          this.recoveries = [];
        }
      } catch (error) {
        console.error("Error fetching recoveries:", error);
        this.incidentRecoveries = [];
        this.recoveryInputs = [];
        this.recoveries = [];
      }
    },

    addContainmentInput() {
      this.containmentInputs.push("");
    },

    isContainmentCategoryUsed(categoryId) {
      if (!categoryId || !this.playBooks || !this.playBooks.length) {
        return false;
      }

      return this.playBooks.some((playBook) => {
        if (!playBook.actions || !playBook.actions.containments) {
          return false;
        }

        return playBook.actions.containments.some((action) => {
          return (
            action &&
            typeof action === "object" &&
            action.category &&
            action.category === categoryId
          );
        });
      });
    },

    isEradicationCategoryUsed(categoryId) {
      if (!categoryId || !this.playBooks || !this.playBooks.length) {
        return false;
      }

      return this.playBooks.some((playBook) => {
        if (!playBook.actions || !playBook.actions.eradications) {
          return false;
        }

        return playBook.actions.eradications.some((action) => {
          return (
            action &&
            typeof action === "object" &&
            action.category &&
            action.category === categoryId
          );
        });
      });
    },

    async removeContainmentInput(index) {
      const containmentToRemove = this.containmentInputs[index]?.trim();
      if (!containmentToRemove) {
        this.containmentInputs.splice(index, 1);
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Find the category ID
      const category = this.incidentContainments.find(
        (c) => c.category.toLowerCase() === containmentToRemove.toLowerCase()
      );
      const categoryId = category ? category.id : null;

      // Check if the containment category is used in any playbook actions
      if (categoryId && this.isContainmentCategoryUsed(categoryId)) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.category_used_in_playbook_actions", {
            category: containmentToRemove,
          }),
          type: "error",
        });
        return;
      }

      try {
        // Remove the containment input locally
        this.containmentInputs.splice(index, 1);

        // Update the incidentContainments and save to the server
        const validContainments = this.containmentInputs
          .filter((category) => typeof category === "string" && category.trim())
          .map((category) => ({
            category,
            id:
              this.incidentContainments.find((c) => c.category === category)
                ?.id || this.generateUUID(),
            actions:
              this.incidentContainments.find((c) => c.category === category)
                ?.actions || [],
          }))
          .map((item) => ({
            ...item,
            actions: item.actions.filter((a) => a !== null && a !== ""),
          }));

        const payload = {
          type: "incident-containments",
          data: validContainments,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log("Removed containment:", response);
        this.incidentContainments = validContainments;
        this.containments = validContainments.map((item) => item.category);
      } catch (error) {
        console.error("Error removing containment:", error);
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_remove_containment_category"),
          type: "error",
        });
      }
    },

    async saveContainments() {
      const validContainments = this.containmentInputs
        .filter((category) => typeof category === "string" && category.trim())
        .map((category) => ({
          category,
          id:
            this.incidentContainments.find((c) => c.category === category)
              ?.id || this.generateUUID(),
          actions:
            this.incidentContainments.find((c) => c.category === category)
              ?.actions || [],
        }))
        .map((item) => ({
          ...item,
          actions: item.actions.filter((a) => a !== null && a !== ""),
        }));

      // Check for duplicates
      const uniqueContainments = new Set(
        validContainments.map((item) => item.category.toLowerCase())
      );
      if (uniqueContainments.size !== validContainments.length) {
        // this.duplicateAttackError = true;
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.containments_names_must_be_unique"),
          type: "error",
        });
        return;
      }

      if (validContainments.length > 0) {
        try {
          const payload = {
            type: "incident-containments",
            data: validContainments,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved containments:", response);
          this.incidentContainments = validContainments;
          this.containments = validContainments.map((item) => item.category);
        } catch (error) {
          console.error("Error saving containments:", error);
        }
      }
    },

    addEradicationInput() {
      this.eradicationInputs.push("");
    },

    async removeEradicationInput(index) {
      const eradicationToRemove = this.eradicationInputs[index]?.trim();
      if (!eradicationToRemove) {
        this.eradicationInputs.splice(index, 1);
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Find the category ID
      const category = this.incidentEradications.find(
        (c) => c.category.toLowerCase() === eradicationToRemove.toLowerCase()
      );
      const categoryId = category ? category.id : null;

      // Check if the eradication category is used in any playbook actions
      if (categoryId && this.isEradicationCategoryUsed(categoryId)) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.category_used_in_playbook_actions", {
            category: eradicationToRemove,
          }),
          type: "error",
        });
        return;
      }

      try {
        // Remove the containment input locally
        this.eradicationInputs.splice(index, 1);

        // Update the incidentContainments and save to the server
        const validEradications = this.eradicationInputs
          .filter((category) => typeof category === "string" && category.trim())
          .map((category) => ({
            category,
            id:
              this.incidentEradications.find((c) => c.category === category)
                ?.id || this.generateUUID(),
            actions:
              this.incidentEradications.find((c) => c.category === category)
                ?.actions || [],
          }))
          .map((item) => ({
            ...item,
            actions: item.actions.filter((a) => a !== null && a !== ""),
          }));

        const payload = {
          type: "incident-eradications",
          data: validEradications,
        };
        const response = await this.apiIncidentSetting.from(payload);
        console.log("Removed eradication:", response);
        this.incidentEradications = validEradications;
        this.eradications = validEradications.map((item) => item.category);
      } catch (error) {
        console.error("Error removing eradications:", error);
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_remove_eradications_category"),
          type: "error",
        });
      }
    },

    async saveEradications() {
      const validEradications = this.eradicationInputs
        .filter((category) => typeof category === "string" && category.trim())
        .map((category) => ({
          category,
          id:
            this.incidentEradications.find((c) => c.category === category)
              ?.id || this.generateUUID(),
          actions:
            this.incidentEradications.find((c) => c.category === category)
              ?.actions || [],
        }));

      // Check for duplicates
      const uniqueEradications = new Set(
        validEradications.map((item) => item.category.toLowerCase())
      );
      if (uniqueEradications.size !== validEradications.length) {
        // this.duplicateAttackError = true;
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.eradications_names_must_be_unique"),
          type: "error",
        });
        return;
      }
      if (validEradications.length > 0) {
        try {
          const payload = {
            type: "incident-eradications",
            data: validEradications,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved eradications:", response);
          this.incidentEradications = validEradications;
          this.eradications = validEradications.map((item) => item.category);
        } catch (error) {
          console.error("Error saving eradications:", error);
        }
      }
    },

    addRecoveryInput() {
      this.recoveryInputs.push("");
    },

    removeRecoveryInput(index) {
      this.recoveryInputs.splice(index, 1);
    },

    async saveRecoveries() {
      const validRecoveries = this.recoveryInputs
        .filter((category) => typeof category === "string" && category.trim())
        .map((category) => ({
          category,
          id:
            this.incidentRecoveries.find((c) => c.category === category)?.id ||
            this.generateUUID(),
          actions:
            this.incidentRecoveries.find((c) => c.category === category)
              ?.actions || [],
        }));

      // Check for duplicates
      const uniqueRecoveries = new Set(
        validRecoveries.map((item) => item.category.toLowerCase())
      );
      if (uniqueRecoveries.size !== validRecoveries.length) {
        // this.duplicateAttackError = true;
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.recoveries_names_must_be_unique"),
          type: "error",
        });
        return;
      }
      if (validRecoveries.length > 0) {
        try {
          const payload = {
            type: "incident-recoveries",
            data: validRecoveries,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved recoveries:", response);
          this.incidentRecoveries = validRecoveries;
          this.recoveries = validRecoveries.map((item) => item.category);
        } catch (error) {
          console.error("Error saving recoveries:", error);
        }
      }
    },

    async fetchCaseTypes() {
      try {
        const caseTypeData = await this.apiIncidentSetting.getAll({
          filter: "type|incident-case-type|=",
        });
        if (caseTypeData && caseTypeData[0].data) {
          // Store raw data
          this.incidentCaseTypes = caseTypeData[0].data;
          this.caseTypeInputs = [...caseTypeData[0].data];
          this.caseTypes = [...caseTypeData[0].data];
          console.log("caseTypessssssssssss", caseTypeData[0].data);
          // Map for v-select options
          const options = caseTypeData[0].data.map((item) => ({
            label: item.type, // Displayed in dropdown
            value: item.type, // Value bound to formData.caseType
            id: item.id, // Optional: keep id for reference
          }));
          this.fromFields.find((field) => field.name === "caseType").options =
            options;
        } else {
          this.incidentCaseTypes = [];
          this.caseTypeInputs = [];
          this.caseTypes = [];
          this.fromFields.find((field) => field.name === "caseType").options =
            [];
        }
      } catch (error) {
        console.error("Error fetching case types:", error);
        this.fromFields.find((field) => field.name === "caseType").options = [];
      }
    },

    addSiteLocationInput() {
      this.siteLocationInputs.push({ id: null, name: "" });
    },

    removeSiteLocationInput(index) {
      this.siteLocationInputs.splice(index, 1);
      this.locationApi.delete(this.incidentSiteLocations[index].id);
    },

    async fetchSiteLocations() {
      try {
        const response = await this.locationApi.getAll();
        // Assuming response is an array of objects like [{ id: 1, name: "Location A" }, ...]
        if (Array.isArray(response)) {
          this.incidentSiteLocations = response.map((item) => ({
            id: item.id,
            name: item.name || "",
          }));
          this.siteLocationInputs = [...this.incidentSiteLocations];
          this.siteLocations = [...this.incidentSiteLocations];
        } else {
          console.warn("Unexpected site locations response format:", response);
          this.incidentSiteLocations = [];
          this.siteLocationInputs = [];
          this.siteLocations = [];
        }
      } catch (error) {
        console.error("Error fetching site locations:", error);
        this.incidentSiteLocations = [];
        this.siteLocationInputs = [];
        this.siteLocations = [];
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_fetch_site_locations"),
        });
      }
    },

    async saveSiteLocations() {
      try {
        // Filter out empty locations
        const locationsToSave = this.siteLocationInputs.filter(
          (location) => location.name && location.name.trim()
        );

        for (const location of locationsToSave) {
          if (location._id) {
            // Update existing location
            await this.locationApi.from(location.id, { name: location.name });
          } else {
            // Create new location
            const newLocation = await this.locationApi.from({
              name: location.name,
            });
            location.id = newLocation.id;
          }
        }

        // Refresh the data
        await this.fetchSiteLocations();

        console.log("Site locations saved successfully");
      } catch (error) {
        console.error("Error saving site locations:", error);
      }
    },
    async fetchDetectedBy() {
      try {
        const detectedByData = await this.apiIncidentSetting.getAll({
          filter: "type|incident-detected-by|=",
        });
        if (detectedByData && detectedByData[0].data) {
          this.incidentDetectedBy = detectedByData[0].data;
          this.detectedByInputs = [...detectedByData[0].data];
          this.detectedBy = [...detectedByData[0].data];
        }
      } catch (error) {
        console.error("Error fetching detected by:", error);
      }
    },

    addDetectedByInput() {
      // Check if the last input (if it exists and is not empty) is a duplicate
      const lastInput =
        this.detectedByInputs[this.detectedByInputs.length - 1]?.name?.trim();
      if (
        lastInput &&
        this.isDetectedByDuplicate(lastInput, this.detectedByInputs.length - 1)
      ) {
        this.duplicateDetectedByError = true;
        return;
      }
      this.duplicateDetectedByError = false;
      this.detectedByInputs.push({ name: "", id: this.generateUUID() });
    },

    async removeDetectedByInput(index) {
      const detectedByToRemove = this.detectedByInputs[index]?.name?.trim();
      if (!detectedByToRemove) {
        this.detectedByInputs.splice(index, 1);
        this.duplicateDetectedByError = false;
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Check if the detectedBy with this ID is referenced in incidents
      const isReferenced = await this.isDetectedByReferenced(
        this.detectedByInputs[index].id
      );
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.detected_by_referenced_by_incidents", {
            detectedBy: detectedByToRemove,
          }),
          type: "error",
        });
        return;
      }

      // Check for duplicates before removing
      // if (this.isDetectedByDuplicate(detectedByToRemove, index)) {
      //   this.duplicateDetectedByError = true;
      //   return;
      // }

      this.detectedByInputs.splice(index, 1);
      this.saveDetectedBy();
      this.duplicateDetectedByError = false;
    },

    async isDetectedByReferenced(id) {
      try {
        const response = await this.api.getAll({
          filter: `detectedBy|${id}|=`, // Use consistent filter syntax with other methods
        });
        return response && response.length > 0; // Check if any incidents reference this detectedBy
      } catch (error) {
        console.error("Error checking detected by references:", error);
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_check_detected_by_references"),
          type: "error",
        });
        return false;
      }
    },
    trackDetectedByChange() {
      this.duplicateDetectedByError = false; // Reset error on input change
    },

    isDetectedByDuplicate(detectedByValue, currentIndex) {
      if (!detectedByValue) return false;
      const trimmedValue = detectedByValue.trim().toLowerCase();
      return this.detectedByInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.name &&
          item.name.trim().toLowerCase() === trimmedValue
      );
    },
    async saveDetectedBy() {
      const validDetectedBy = this.detectedByInputs
        .filter((item) => item?.name?.trim())
        .map((item) => ({
          name: item.name.trim(),
          id: item.id || this.generateUUID(),
        }));

      // Check for duplicates
      const uniqueDetectedBy = new Set(
        validDetectedBy.map((item) => item.name.toLowerCase())
      );
      if (uniqueDetectedBy.size !== validDetectedBy.length) {
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.detected_by_names_must_be_unique"),
          type: "error",
        });
        return;
      }

      this.duplicateDetectedByError = false;
      if (validDetectedBy.length > 0) {
        try {
          const payload = {
            type: "incident-detected-by",
            data: validDetectedBy,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved detected by:", response);
          this.incidentDetectedBy = [...validDetectedBy];
          this.detectedBy = [...validDetectedBy];
          this.detectedByInputs = [...validDetectedBy];
          // Update form field options
          this.fromFields.find((item) => item.name === "detectedBy").options =
            this.detectedBy.map((item) => ({
              label: item.name,
              value: item.name,
              id: item.id,
            }));
        } catch (error) {
          console.error("Error saving detected by:", error);
          Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text: this.$t("common.failed_to_save_detected_by_data"),
          });
        }
      } else {
        try {
          const payload = {
            type: "incident-detected-by",
            data: [],
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Cleared detected by:", response);
          this.incidentDetectedBy = [];
          this.detectedBy = [];
          this.detectedByInputs = [];
          this.fromFields.find((item) => item.name === "detectedBy").options =
            [];
        } catch (error) {
          console.error("Error clearing detected by:", error);
          Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text: this.$t("common.failed_to_clear_detected_by_data"),
          });
        }
      }
    },

    // TLP Methods
    addTlpInput() {
      this.tlpInputs.push({
        name: "",
        description: "",
        color: "#000000",
        id: null,
      });
    },

    async isTlpReferenced(id) {
      try {
        const response = await this.api.getAll({
          filter: `tlp|${id}|=`,
        });
        return response && response.length > 0;
      } catch (error) {
        console.error("Error checking TLP references:", error);
        notify({
          title: this.$t("common.error"),
          text:
            this.$t("incident.failed_to_check_tlp_references") ||
            "Failed to check TLP references",
          type: "error",
        });
        return false;
      }
    },

    async removeTlpInput(index) {
      const tlpToRemove = this.tlpInputs[index];

      // If the TLP has an ID, check if it's referenced by any incidents
      if (tlpToRemove.id) {
        const isReferenced = await this.isTlpReferenced(tlpToRemove.id);
        if (isReferenced) {
          notify({
            title: this.$t("common.cannot_delete"),
            type: "error",
            text:
              this.$t("incident.tlp_is_referenced_by_incidents") ||
              "This TLP is referenced by one or more incidents and cannot be deleted.",
          });
          return;
        }
      }

      this.tlpInputs.splice(index, 1);
      this.saveTlps();
      this.duplicateTlpNameError = false;
      this.duplicateTlpColorError = false;
    },

    trackTlpChange() {
      this.duplicateTlpNameError = false;
      this.duplicateTlpColorError = false;
    },

    isTlpNameDuplicate(name, currentIndex) {
      if (!name) return false;
      const trimmedName = name.trim().toLowerCase();
      return this.tlpInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.name &&
          item.name.trim().toLowerCase() === trimmedName
      );
    },

    isTlpColorDuplicate(color, currentIndex) {
      if (!color) return false;
      return this.tlpInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.color &&
          item.color.toLowerCase() === color.toLowerCase()
      );
    },

    async saveTlps() {
      const validTlps = this.tlpInputs
        .filter((item) => item?.name?.trim() && item?.color)
        .map((item) => ({
          name: item.name.trim(),
          description: item.description?.trim() || "",
          color: item.color,
          id: item.id || this.generateUUID(),
        }));

      // Check for duplicate names
      const uniqueNames = new Set(
        validTlps.map((item) => item.name.toLowerCase())
      );
      if (uniqueNames.size !== validTlps.length) {
        this.duplicateTlpNameError = true;
        notify({
          title: this.$t("common.validation_error"),
          text:
            this.$t("incident.tlp_name_must_be_unique") ||
            "TLP names must be unique",
          type: "error",
        });
        return;
      }

      // Check for duplicate colors
      const uniqueColors = new Set(
        validTlps.map((item) => item.color.toLowerCase())
      );
      if (uniqueColors.size !== validTlps.length) {
        this.duplicateTlpColorError = true;
        notify({
          title: this.$t("common.validation_error"),
          text:
            this.$t("incident.tlp_color_must_be_unique") ||
            "TLP colors must be unique",
          type: "error",
        });
        return;
      }

      this.duplicateTlpNameError = false;
      this.duplicateTlpColorError = false;

      if (validTlps.length > 0) {
        try {
          const payload = {
            type: "incident-tlp",
            data: validTlps,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved TLPs:", response);
          this.incidentTlps = [...validTlps];
          this.tlps = [...validTlps];
          this.tlpInputs = [...validTlps];

          notify({
            title: this.$t("common.success"),
            text:
              this.$t("incident.tlps_saved_successfully") ||
              "TLPs saved successfully",
            type: "success",
          });
        } catch (error) {
          console.error("Error saving TLPs:", error);
          Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text:
              this.$t("incident.failed_to_save_tlps") ||
              "Failed to save TLP data",
          });
        }
      } else {
        try {
          const payload = {
            type: "incident-tlp",
            data: [],
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Cleared TLPs:", response);
          this.incidentTlps = [];
          this.tlps = [];
          this.tlpInputs = [];
        } catch (error) {
          console.error("Error clearing TLPs:", error);
          Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text:
              this.$t("incident.failed_to_clear_tlps") ||
              "Failed to clear TLP data",
          });
        }
      }
    },

    async fetchTlps() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const tlpData = response.find((item) => item.type === "incident-tlp");
        if (tlpData && tlpData.data) {
          this.incidentTlps = tlpData.data;
          this.tlpInputs = [...tlpData.data];
          this.tlps = [...tlpData.data];
          // Update form field options
          const tlpField = this.fromFields.find(
            (field) => field.name === "tlp"
          );
          if (tlpField) {
            tlpField.options = this.tlps;
          }
        }
      } catch (error) {
        console.error("Error fetching TLPs:", error);
      }
    },

    // PAP Methods
    addPapInput() {
      this.papInputs.push({
        name: "",
        description: "",
        color: "#000000",
        id: null,
      });
    },

    async isPapReferenced(id) {
      try {
        const response = await this.api.getAll({
          filter: `pap|${id}|=`,
        });
        return response && response.length > 0;
      } catch (error) {
        console.error("Error checking PAP references:", error);
        notify({
          title: this.$t("common.error"),
          text:
            this.$t("incident.failed_to_check_pap_references") ||
            "Failed to check PAP references",
          type: "error",
        });
        return false;
      }
    },

    async removePapInput(index) {
      const papToRemove = this.papInputs[index];

      // If the PAP has an ID, check if it's referenced by any incidents
      if (papToRemove.id) {
        const isReferenced = await this.isPapReferenced(papToRemove.id);
        if (isReferenced) {
          notify({
            title: this.$t("common.cannot_delete"),
            type: "error",
            text:
              this.$t("incident.pap_is_referenced_by_incidents") ||
              "This PAP is referenced by one or more incidents and cannot be deleted.",
          });
          return;
        }
      }

      this.papInputs.splice(index, 1);
      this.savePaps();
      this.duplicatePapNameError = false;
      this.duplicatePapColorError = false;
    },

    trackPapChange() {
      this.duplicatePapNameError = false;
      this.duplicatePapColorError = false;
    },

    isPapNameDuplicate(name, currentIndex) {
      if (!name) return false;
      const trimmedName = name.trim().toLowerCase();
      return this.papInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.name &&
          item.name.trim().toLowerCase() === trimmedName
      );
    },

    isPapColorDuplicate(color, currentIndex) {
      if (!color) return false;
      return this.papInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.color &&
          item.color.toLowerCase() === color.toLowerCase()
      );
    },

    async savePaps() {
      const validPaps = this.papInputs
        .filter((item) => item?.name?.trim() && item?.color)
        .map((item) => ({
          name: item.name.trim(),
          description: item.description?.trim() || "",
          color: item.color,
          id: item.id || this.generateUUID(),
        }));

      // Check for duplicate names
      const uniqueNames = new Set(
        validPaps.map((item) => item.name.toLowerCase())
      );
      if (uniqueNames.size !== validPaps.length) {
        this.duplicatePapNameError = true;
        notify({
          title: this.$t("common.validation_error"),
          text:
            this.$t("incident.pap_name_must_be_unique") ||
            "PAP names must be unique",
          type: "error",
        });
        return;
      }

      // Check for duplicate colors
      const uniqueColors = new Set(
        validPaps.map((item) => item.color.toLowerCase())
      );
      if (uniqueColors.size !== validPaps.length) {
        this.duplicatePapColorError = true;
        notify({
          title: this.$t("common.validation_error"),
          text:
            this.$t("incident.pap_color_must_be_unique") ||
            "PAP colors must be unique",
          type: "error",
        });
        return;
      }

      this.duplicatePapNameError = false;
      this.duplicatePapColorError = false;

      if (validPaps.length > 0) {
        try {
          const payload = {
            type: "incident-pap",
            data: validPaps,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved PAPs:", response);
          this.incidentPaps = [...validPaps];
          this.paps = [...validPaps];
          this.papInputs = [...validPaps];

          notify({
            title: this.$t("common.success"),
            text:
              this.$t("incident.paps_saved_successfully") ||
              "PAPs saved successfully",
            type: "success",
          });
        } catch (error) {
          console.error("Error saving PAPs:", error);
          Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text:
              this.$t("incident.failed_to_save_paps") ||
              "Failed to save PAP data",
          });
        }
      } else {
        try {
          const payload = {
            type: "incident-pap",
            data: [],
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Cleared PAPs:", response);
          this.incidentPaps = [];
          this.paps = [];
          this.papInputs = [];
        } catch (error) {
          console.error("Error clearing PAPs:", error);
          Swal.fire({
            icon: "error",
            title: this.$t("common.error"),
            text:
              this.$t("incident.failed_to_clear_paps") ||
              "Failed to clear PAP data",
          });
        }
      }
    },

    async fetchPaps() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const papData = response.find((item) => item.type === "incident-pap");
        if (papData && papData.data) {
          this.incidentPaps = papData.data;
          this.papInputs = [...papData.data];
          this.paps = [...papData.data];
          // Update form field options
          const papField = this.fromFields.find(
            (field) => field.name === "pap"
          );
          if (papField) {
            papField.options = this.paps;
          }
        }
      } catch (error) {
        console.error("Error fetching PAPs:", error);
      }
    },

    async fetchCaseDirections() {
      try {
        const caseDirectionData = await this.apiIncidentSetting.getAll({
          filter: "type|incident-case-direction|=",
        });
        if (caseDirectionData && caseDirectionData[0].data) {
          this.incidentCaseDirections = caseDirectionData[0].data;
          this.caseDirectionInputs = [...caseDirectionData[0].data];
          this.caseDirections = [...caseDirectionData[0].data];
        }
        console.log(
          "Case directions fetched successfully",
          this.caseDirectionInputs
        );
      } catch (error) {
        console.error("Error fetching case directions:", error);
      }
    },

    async fetchAttacks() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const attackData = response.find(
          (item) => item.type === "incident-attacks"
        );
        if (attackData && attackData.data) {
          this.incidentAttacks = attackData.data;
          this.attackInputs = [...attackData.data];
          this.attacks = [...attackData.data];
        }
      } catch (error) {
        console.error("Error fetching attacks:", error);
      }
    },

    trackAttackChange() {
      this.duplicateAttackError = false; // Reset error on input change
    },

    isAttackDuplicate(attackValue, currentIndex) {
      if (!attackValue) return false;
      const trimmedAttack = attackValue.trim().toLowerCase();
      return this.attackInputs.some(
        (item, index) =>
          index !== currentIndex &&
          item.attack &&
          item.attack.trim().toLowerCase() === trimmedAttack
      );
    },
    async saveAttacks() {
      const validAttacks = this.attackInputs
        .filter((item) => item?.attack?.trim())
        .map((item) => ({
          attack: item.attack.trim(),
          id: item.id || this.generateUUID(),
        }));

      // Check for duplicates
      const uniqueAttacks = new Set(
        validAttacks.map((item) => item.attack.toLowerCase())
      );
      if (uniqueAttacks.size !== validAttacks.length) {
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.attack_names_must_be_unique"),
          type: "error",
        });
        return;
      }

      this.duplicateAttackError = false;
      if (validAttacks.length > 0) {
        try {
          const payload = {
            type: "incident-attacks",
            data: validAttacks,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved attacks:", response);
          this.incidentAttacks = [...validAttacks];
          this.attacks = [...validAttacks];
          this.attackInputs = [...validAttacks];
          // Update form field options
          this.fromFields.find((item) => item.name === "attack").options =
            this.attacks;
        } catch (error) {
          console.error("Error saving attacks:", error);
        }
      } else {
        try {
          const payload = {
            type: "incident-attacks",
            data: [],
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Cleared attacks:", response);
          this.incidentAttacks = [];
          this.attacks = [];
          this.attackInputs = [];
          this.fromFields.find((item) => item.name === "attack").options = [];
        } catch (error) {
          console.error("Error clearing attacks:", error);
        }
      }
    },

    addAttackInput() {
      this.attackInputs.push({ attack: "", id: this.generateUUID() });
    },

    async isAttackReferenced(id) {
      try {
        const response = await this.api.getAll({
          filter: `attack|${id}|=`,
        });
        return response && response.length > 0;
      } catch (error) {
        console.error("Error checking attack references:", error);
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_check_attack_references"),
          type: "error",
        });
        return false;
      }
    },

    async removeAttackInput(index) {
      const attackToRemove = this.attackInputs[index]?.attack?.trim();
      if (!attackToRemove) {
        this.attackInputs.splice(index, 1);
        this.duplicateAttackError = false;
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Check if the attack with this ID is referenced in incidents
      const isReferenced = await this.isAttackReferenced(
        this.attackInputs[index].id
      );
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.attack_referenced_by_incidents", {
            attack: attackToRemove,
          }),
          type: "error",
        });
        return;
      }

      // Check for duplicates before removing
      // if (this.isAttackDuplicate(attackToRemove, index)) {
      //   this.duplicateAttackError = true;
      //   return;
      // }

      this.attackInputs.splice(index, 1);
      this.saveAttacks();
      this.duplicateAttackError = false;
    },
    addCaseTypeInput() {
      this.caseTypeInputs.push({ type: "", id: this.generateUUID() });
    },

    addCaseDirectionInput() {
      this.caseDirectionInputs.push({ direction: "", id: this.generateUUID() });
    },
    async removeCaseTypeInput(index) {
      const caseTypeToRemove = this.caseTypeInputs[index]?.type?.trim();
      if (!caseTypeToRemove) {
        this.caseTypeInputs.splice(index, 1);
        this.duplicateError = false;
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Check if the case type with this ID is referenced in incidents
      const isReferenced = await this.isCaseTypeReferenced(
        this.caseTypeInputs[index].id
      );
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.case_type_referenced_by_incidents", {
            caseType: caseTypeToRemove,
          }),
          type: "error",
        });
        return;
      }

      // Check for duplicates before removing
      if (this.isDuplicate(caseTypeToRemove, index)) {
        this.duplicateError = true;
        return;
      }

      this.caseTypeInputs.splice(index, 1);
      this.saveCaseTypes();
      this.duplicateError = false;
    },

    async isCaseDirectionReferenced(index) {
      try {
        const response = await this.api.getAll({
          filter: `direction|${index}|=`,
        });
        return response && response.length > 0;
      } catch (error) {
        console.error("Error checking case direction references:", error);
        Swal.fire({
          icon: "error",
          title: this.$t("common.error"),
          text: this.$t("common.failed_to_check_case_direction_references"),
        });
        return false;
      }
    },

    async removeCaseDirectionInput(index) {
      const caseDirectionToRemove =
        this.caseDirectionInputs[index].direction?.trim();
      if (!caseDirectionToRemove) {
        this.caseDirectionInputs.splice(index, 1);
        this.directionDuplicateError = false;
        return;
      }

      const result = await Swal.fire({
        title: this.$t("common.are_you_sure"),
        text: this.$t("common.this_action_cannot_be_undone"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("common.yes_delete_it"),
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#6e3894",
        cancelButtonColor: "#FFC107",
        confirmButtonText:
          "<span style='color: white;'>" +
          this.$t("common.yes_delete_it") +
          "</span>",
        cancelButtonText:
          "<span style='color: white;'>" + this.$t("common.cancel") + "</span>",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Check if the case direction at this index is referenced in incidents
      const isReferenced = await this.isCaseDirectionReferenced(
        this.caseDirectionInputs[index].id
      );
      if (isReferenced) {
        notify({
          title: this.$t("common.error"),
          text: this.$t("common.case_direction_referenced_by_incidents", {
            caseDirection: caseDirectionToRemove,
          }),
          type: "error",
        });
        return;
      }

      this.caseDirectionInputs.splice(index, 1);
      this.saveCaseDirections();
      this.directionDuplicateError = false;
    },

    async saveCaseTypes() {
      const validCaseTypes = this.caseTypeInputs
        .filter((item) => item?.type?.trim()) // Filter objects with non-empty type
        .map((item) => ({
          type: item.type.trim(),
          id: item.id || this.generateUUID(), // Preserve existing ID or generate new one
        }));

      const uniqueCaseTypes = new Set(
        validCaseTypes.map(({ type }) => type.toLowerCase())
      );
      if (uniqueCaseTypes.size !== validCaseTypes.length) {
        // this.duplicateAttackError = true;
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.case_type_must_be_unique"),
          type: "error",
        });
        return;
      }

      if (validCaseTypes.length > 0) {
        try {
          const payload = {
            type: "incident-case-type",
            data: validCaseTypes, // Save objects with id and type
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved case types:", response);
          this.incidentCaseTypes = validCaseTypes; // Store objects with id and type
          this.caseTypes = validCaseTypes; // Store objects with id and type
          this.duplicateError = false;
        } catch (error) {
          console.error("Error saving case types:", error);
        }
      }
    },

    async saveCaseDirections() {
      const validCaseDirections = this.caseDirectionInputs
        .filter((item) => item?.direction?.trim())
        .map((item) => ({
          direction: item.direction.trim(),
          id: item.id || this.generateUUID(), // Preserve existing ID or generate new
        }));

      const uniqueCaseDirections = new Set(
        validCaseDirections.map(({ direction }) => direction?.toLowerCase())
      );
      if (uniqueCaseDirections.size !== validCaseDirections.length) {
        notify({
          title: this.$t("common.validation_error"),
          text: this.$t("common.case_direction_must_be_unique"),
          type: "error",
        });
        return;
      }

      if (validCaseDirections.length > 0) {
        try {
          const payload = {
            type: "incident-case-direction",
            data: validCaseDirections,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved case directions:", response);
          this.incidentCaseDirections = validCaseDirections;
          this.caseDirections = validCaseDirections;
          this.duplicateError = false;
        } catch (error) {
          console.error("Error saving case directions:", error);
        }
      }
    },
  },
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";

/* User info styles for datatable */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar-clickable {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #D0B5E3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235C;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-avatar-clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-users-text {
  color: #999;
  font-style: italic;
}

/* Existing styles */
.form-container {
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.5s;
  height: 40px;
}

.form-control:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.v-select {
  --vs-controls-color: #374151;
  --vs-border-color: #e5e7eb;
  --vs-dropdown-bg: #fff;
  --vs-dropdown-color: #374151;
  --vs-dropdown-option-color: #374151;
  --vs-selected-bg: #f3f4f6;
}

.v-select .vs__dropdown-toggle {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.v-select .vs__selected {
  margin: 0 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e5e7eb;
  border-radius: 4px;
  color: #374151;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.radio-options {
  display: flex;
  gap: 0.5rem;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-item input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.radio-item label {
  margin: 0;
  font-weight: 400;
  color: #374151;
  cursor: pointer;
}

/* Modal styles */
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

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  width: 90% !important;
  height: 80vh;
  margin: 0;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.modal-content-log {
  background-color: white;
  border-radius: 0.375rem;
  width: 90% !important;
  margin: 0;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  font-size: 15px;
  border: none;
  background: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  width: 100%;
}

.modal-body-tabs {
  /* padding: 20px 0; */
  /* max-height: calc(100vh - 150px);
  overflow-y: auto;
  width: 100%; */
  display: flex;
  justify-content: center;
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
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.btn-secondary {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
.nav-tabs-container {
  display: flex;
  justify-content: center;
  width: 85%;
  overflow: auto;
  position: fixed;
}

.nav-tabs {
  display: inline-flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #fff;
}

.nav-tabs .nav-item {
  margin-right: 10px;
}

.nav-tabs .nav-link {
  color: #44225c;
  border: none;
  padding: 10px 20px;
  transition: color 0.4s ease;
}

.nav-tabs .nav-link:hover {
  color: #44225c;
  font-weight: 800;
}

.nav-tabs .nav-link.active {
  color: #44225c;
  border-bottom: 3px solid #44225c;
  background: transparent;
  font-weight: 800;
}

.tab-content {
  padding: 30px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dynamic sections */
.section-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
}

.section-row .form-group {
  flex: 1;
}

.section-row .form-group textarea {
  width: 100%;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-warning {
  background-color: #fd7e14;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
}

.btn-warning:hover {
  background-color: #e06c00;
}

.btn-add {
  background-color: #6e3894;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

/* New styles for Save button and table */
.btn-save {
  font-size: x-large;
  color: #6e3894;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
}

/* .btn-sm {
  padding: 4px 8px;
  font-size: 0.875rem;
} */

.table {
  margin-top: 1rem;
}

.table th,
.table td {
  vertical-align: middle;
  text-align: center;
}

.sub-nav-tabs-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
  overflow-x: auto;
  white-space: nowrap;
}

.sub-nav-tabs {
  /* display: inline-flex; */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #f8f9fa;
  display: inline-block;
  flex-wrap: nowrap;
}

.sub-nav-tabs .nav-item {
  margin-right: 8px;
}

.sub-nav-tabs-container .nav-item {
  display: inline-block;
  float: none;
}

.sub-nav-tabs .nav-link {
  color: #44225c;
  border: none;
  padding: 8px 16px;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.sub-nav-tabs .nav-link:hover {
  color: #44225c;
  font-weight: 700;
}

.sub-nav-tabs .nav-link.active {
  color: #44225c;
  border-bottom: 2px solid #44225c;
  background: transparent;
  font-weight: 700;
}

.sub-tab-content {
  padding: 20px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sub-tab-content .form-group {
  width: 100%;
}

.sub-tab-content .form-group .form-control {
  width: 100%;
  max-width: none; /* Override any max-width restrictions */
}

.sub-tab-content .form-group.me-2 {
  margin-right: 0; /* Remove Bootstrap's margin-end to allow full width */
}

/* Ensure playBook modal has specific max-width */
.modal-content[style*="max-width: 500px"] {
  max-height: 80vh;
}

.table th,
.table td {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 900;
  color: #6e3894;
}

.table td {
  border-bottom: 1px solid #e5e7eb;
}

.table td:last-child {
  display: masonry;
  gap: 2px;
  justify-content: center;
  align-items: center;
}

.table td:last-child .btn {
  margin: 0 2px; /* Minimal margin between buttons */
  padding: 4px; /* Reduce padding for smaller button size */
}

.table-striped tbody tr:nth-child(odd) {
  background-color: #f9fafb;
}

.vue-form-wizard .wizard-tab-content {
  padding: 20px;
}

.vue-form-wizard .wizard-nav-pills li a {
  color: #6e3894;
  font-weight: 500;
}

.vue-form-wizard .wizard-nav-pills li.active a {
  background-color: #6e3894;
  color: white;
  border-radius: 4px;
}

.vue-form-wizard .wizard-btn {
  background-color: #6e3894;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
}

.vue-form-wizard .wizard-btn:hover {
  background-color: #5a2d7a;
}

.wizard-navigation {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.nav-tabs-container .nav-tabs {
  border-bottom: 2px solid #e5e7eb;
}

.nav-tabs .nav-link {
  padding: 8px 16px;
  font-size: 0.9rem;
  color: #44225c;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  border-bottom: 2px solid #44225c;
  font-weight: 700;
}

.nav-tabs .nav-link:hover {
  border-bottom: 2px solid #5a2d7a;
}

.step-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
  position: relative;
}

.step-number {
  width: 30px;
  height: 30px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: #666;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: #6e3894;
  background-color: #6e3894;
  color: #fff;
}

.step-label {
  margin-top: 5px;
  font-size: 0.9rem;
  color: #666;
  transition: color 0.3s ease;
}

.step.active .step-label {
  color: #6e3894;
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  position: relative;
  top: 14px;
}

.hint-equation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  color: #6e3894;
  font-size: 1rem;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}
.ck-editor__editable {
  min-height: 200px !important;
}
.score-section,
.classify-section {
  background: linear-gradient(145deg, #ffffff, #f6f8fa);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  /* transition: transform 0.2s ease; */
}

.score-section:hover,
.classify-section:hover {
  /* transform: translateY(-3px); */
}

.section-title {
  color: #2c1a3d;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  height: 24px;
  width: 4px;
  background-color: #5a2d7a;
  border-radius: 2px;
}

.no-data {
  color: #4b5563;
  font-size: 0.95rem;
  text-align: center;
  padding: 25px;
  background: #f1f3f5;
  border-radius: 8px;
}

.criteria-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.criteria-card {
  flex: 1 1 320px;
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  /* transition: box-shadow 0.2s ease, transform 0.2s ease; */
}

.criteria-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  /* transform: translateY(-2px); */
}

.criteria-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.criteria-title {
  color: #2c1a3d;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.criteria-description {
  color: #4b5563;
  font-size: 0.85rem;
  margin-bottom: 15px;
  line-height: 1.5;
}

.score-table,
.classify-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
}

.score-table th,
.score-table td,
.classify-table th,
.classify-table td {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

.score-table th,
.classify-table th {
  background-color: #6e3894;
  color: #ffffff;
  font-weight: 600;
  /* text-transform: uppercase; */
  font-size: 0.85rem;
}

.score-table tbody tr:hover,
.classify-table tbody tr:hover {
  background-color: #f1f3f5;
}

.classify-table .color-swatch {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}

.color-swatch {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}

/* .classification-row {
  transition: transform 0.2s ease;
} */

/* .classification-row:hover {
  transform: scale(1.01);
} */

.ira-display {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.ira-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ira-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.ira-card-header {
  background: linear-gradient(90deg, #5a2d7a, #6e3894);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ira-card-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.ira-status {
  background: #28a745;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.ira-card-body {
  padding: 20px;
}

.ira-detail {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.ira-detail:hover {
  background: #f1f3f5;
}
.detail-label {
  font-weight: 800;
  color: #374151;
  width: 150px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #4b5563;
}

.detail-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.ira-card-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ira-card-footer .btn {
  padding: 6px 16px;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.ira-card-footer .btn:hover {
  transform: translateY(-1px);
}

.ira-card-footer .btn-primary {
  background-color: #6e3894;
  border-color: #6e3894;
}

.ira-card-footer .btn-primary:hover {
  background-color: #5a2d7a;
  border-color: #5a2d7a;
}

.ira-card-footer .btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.ira-card-footer .btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.incident-details {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.incident-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.incident-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.incident-card-header {
  background: linear-gradient(90deg, #5a2d7a, #6e3894);
  padding: 15px 20px;
}

.incident-card-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.incident-card-body {
  padding: 20px;
}

.incident-detail {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
}

.incident-detail:hover {
  background: #f1f3f5;
}

.detail-value {
  flex: 1;
  color: #4b5563;
  font-size: 0.95rem;
  word-break: break-word;
}

.status-select {
  width: 350px;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
}

.status-select:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

.association-step .form-group {
  width: 100%;
}

.association-step .col-12 {
  width: 100%;
}

.association-step .form-select,
.association-step .form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.association-step .form-control:focus,
.association-step .form-select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.association-step .detail-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

/* Ensure v-select takes full width */
.association-step .v-select {
  width: 100%;
}

.association-step .v-select .vs__dropdown-toggle {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.assessment-step {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.assessment-step .section-title {
  color: #2c1a3d;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 25px;
  position: relative;
  padding-left: 15px;
}

.assessment-step .section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  height: 28px;
  width: 5px;
  background-color: #5a2d7a;
  border-radius: 2px;
}

.assessment-step .criteria-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: auto;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.assessment-step .table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background: linear-gradient(90deg, #5a2d7a, #6e3894);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 0;
}

.assessment-step .header-item {
  padding: 0 15px;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.assessment-step .header-item:last-child {
  border-right: none;
}

.assessment-step .table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  border-top: 1px solid #e5e7eb;
  padding: 12px 0;
  transition: background 0.2s ease;
}

.assessment-step .table-row:hover {
  background: #f6f8fa;
}

.assessment-step .row-item {
  padding: 0 15px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #374151;
}

.assessment-step .criterion-name {
  font-weight: 500;
  color: #2c1a3d;
}

.assessment-step .criterion-description {
  color: #4b5563;
  line-height: 1.4;
}

.assessment-step .criterion-select {
  padding-right: 15px;
}

.assessment-step .form-select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #2c1a3d;
  font-size: 0.9rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.assessment-step .form-select:focus {
  border-color: #6e3894;
  outline: none;
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

.assessment-step .no-data {
  color: #4b5563;
  font-size: 0.95rem;
  text-align: center;
  padding: 25px;
  background: #f1f3f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.assessment-step .score-summary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 400px; /* Constrain the maximum width */
  width: auto; /* Allow it to shrink to content size */
  margin-left: auto;
  margin-right: auto; /* Center it horizontally */
}

.assessment-step .summary-label {
  font-weight: 500;
  color: #2c1a3d;
  font-size: 1.1rem;
}

.assessment-step .summary-value {
  font-weight: 700;
  color: #6e3894;
  font-size: 1.2rem;
}

.ira-display-container {
  padding: 20px;
}

.ira-display-container .table {
  margin-top: 0;
  width: 100%;
  border-collapse: collapse;
}

.ira-display-container .table th,
.ira-display-container .table td {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}

.ira-display-container .table th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #6e3894;
}

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.2s ease-in-out;
}

/* Generate different background colors for avatars */
.user-avatar:nth-child(1) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-avatar:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-avatar:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.user-avatar:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.user-avatar:nth-child(5) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Count badge for +N users */
.user-count-avatar {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
  color: #333 !important;
  font-size: 10px;
  font-weight: 700;
}

/* Empty state avatar */
.user-empty-avatar {
  background: #e0e0e0 !important;
  color: #999 !important;
}

/* Hover effect for individual avatars */
.user-avatars-container:hover .user-avatar {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.ira-display-container .table td {
  border-bottom: 1px solid #e5e7eb;
}

.ira-display-container .table td:last-child {
  display: flex;
  gap: 2px;
  justify-content: center;
  align-items: center;
}

.ira-display-container .table td:last-child .btn {
  margin: 0 2px;
  padding: 4px;
}

.ira-display-container .table-striped tbody tr:nth-child(odd) {
  background-color: #f9fafb;
}

.ira-display-container .text-center {
  color: #4b5563;
  font-size: 0.95rem;
}

.file-input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 100%;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.3s;
}

.file-input:focus {
  border-color: #6e3894;
  outline: none;
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

.file-preview {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  object-fit: contain;
}

.form-text {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

/* Ensure buttons in preview align with theme */
.file-preview .btn-danger {
  padding: 4px 12px;
  font-size: 0.85rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-item .form-control {
  flex: 1;
  background-color: #f9fafb;
  cursor: not-allowed;
}

.action-item .form-select {
  width: 150px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.9rem;
}

.action-item .form-select:focus {
  border-color: #6e3894;
  outline: none;
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-label {
    width: 100%;
    margin-bottom: 0.25rem;
  }

  .detail-value {
    width: 100%;
  }

  .detail-item {
    margin-bottom: 1rem;
  }

  .table th,
  .table td {
    padding: 8px;
    font-size: 0.85rem;
  }

  .table-container {
    margin: 0 -10px; /* Adjust for padding on small screens */
  }
}

.badge-rounded {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; /* Adjust size as needed */
  height: 24px; /* Adjust size as needed */
  border-radius: 50%;
  padding: 0;
}

.btn-link.ml-2 {
  margin-left: 0.5rem;
  text-decoration: none;
  color: #007bff;
}
.btn-link.ml-2:hover {
  text-decoration: underline;
}
.modal-sm {
  max-width: 500px;
}

.evidence-section {
  margin-top: 2rem;
  background: linear-gradient(145deg, #ffffff, #f6f8fa);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.evidence-section:hover {
  transform: translateY(-3px);
}

.table-container {
  overflow-x: auto; /* Ensure table is scrollable on small screens */
}

.table {
  width: 100%;
  border-collapse: separate;
  border-radius: 8px;
  overflow: hidden;
}

.table th,
.table td {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  /* background: linear-gradient(90deg, #5a2d7a, #6e3894); */
  background: #6e3894;

  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
  /* text-transform: uppercase; */
}

.table td {
  color: #374151;
  font-size: 0.9rem;
}

.table-striped tbody tr:nth-child(odd) {
  background-color: #f9fafb;
}

.table tbody tr:hover {
  background-color: #f1f3f5;
}

.btn-link {
  color: #6e3894;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.btn-link:hover {
  color: #5a2d7a;
  text-decoration: underline;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 3rem;
  align-items: flex-start;
}

/* .nav-tabs-container {
  margin-bottom: 3rem !important;

} */
.evidence-section {
  margin-top: 2rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.table-container {
  margin-top: 1rem;
}
.no-data {
  color: #6c757d;
  /* font-style: italic; */
}

.invalid-feedback {
  display: block; /* Always reserve space */
  min-height: 20px; /* Adjust based on your font size and design */
  font-size: 12px; /* Match your label font size for consistency */
  color: #dc3545; /* Bootstrap's default error color */
}
.invalid-feedback span {
  display: inline-block;
}
.form-control.is-invalid {
  border-color: #dc3545; /* Bootstrap's invalid border color */
}

.fa-circle-xmark {
  font-size: 20px;
}

.comments-section {
  max-height: 500px;
  overflow-y: auto;
}
.comment-item {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 10px;
}
.comment-header {
  display: flex;
  align-items: center;
  font-size: 0.9em;
}
.comment-body {
  margin-top: 5px;
}

.replies-list {
  border-left: 2px solid #007bff;
  padding-left: 10px;
}
.reply-item {
  margin-bottom: 10px;
}
.no-comments {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

.comments-list {
  max-height: 450px;
  overflow-y: auto;
}

.comment {
  background-color: #f8f9fa;
  /* border: 1px solid #dee2e6; */
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

/* Make sure replies don't get too narrow */
.reply {
  min-width: 200px;
}

.comment-actions,
.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group textarea,
textarea.form-control {
  resize: none;
}

.input-group textarea,
textarea.form-control {
  resize: none;
}
@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>

<style>
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

.vs__selected {
  background: #6e3894 !important;
  color: #fff !important;
}

.vs__deselect {
  margin-left: 10px !important;
  fill: #fff !important;
}

.delete_button,
.edit_button {
  display: none !important;
}

/* Statistics Modal Styles */
.statistics-modal {
  max-width: 95vw !important;
  height: 90vh;
}

.statistics-modal .modal-header {
  position: relative;
}

.statistics-modal .modal-header .modal-title {
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.statistics-modal .modal-header .btn-close {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.statistics-modal .modal-body,
.statistics-content {
  /* max-width: 1200px; */
  /* margin: 0 auto; */
  padding: 10px;
}

.statistics-modal .modal-body {
  max-height: calc(90vh - 150px);
  overflow-y: auto;
}

.incident-link {
  color: #6e3894;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.incident-link:hover {
  color: #5a2d7a;
  text-decoration: underline;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.statistics-content {
  padding: 20px 0;
}

.incident-header-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.incident-header-stats h4 {
  margin: 0;
  color: #2c1a3d;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e3894, #5a2d7a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 6px 12px rgba(68, 34, 92, 0.25);
}

.metric-content h6 {
  margin: 0 0 5px 0;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

.metric-value {
  margin: 0;
  color: #2c1a3d;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-title i,
.stats-tabs-container .nav-link i,
.related-card h5 i {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e3894, #5a2d7a);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.stats-tabs-container {
  margin: 30px 0 20px 0;
}

.stats-tabs-container .nav-tabs {
  border-bottom: 2px solid #e5e7eb;
}

.stats-tabs-container .nav-link {
  color: #6e3894;
  border: none;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.stats-tabs-container .nav-link:hover {
  color: #5a2d7a;
  background: #f9fafb;
}

.stats-tabs-container .nav-link.active {
  color: #6e3894;
  border-bottom: 3px solid #6e3894;
  background: transparent;
  font-weight: 700;
}

.stats-tabs-container .nav-link i {
  margin-right: 8px;
}

.stats-tab-content {
  padding: 30px 0;
}

.tab-pane-stats {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

.chart-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-container h5 {
  color: #2c1a3d;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f3f4f6;
}

.related-data-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.related-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.related-card.full-width {
  grid-column: 1 / -1;
}

.related-card h5 {
  color: #2c1a3d;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.related-card h5 i {
  color: #6e3894;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.related-item:hover {
  background: #f3f4f6;
}

.related-name {
  color: #374151;
  font-weight: 500;
}

.playbook-progress-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.progress-summary {
  margin-bottom: 30px;
}

.progress-summary h5 {
  color: #2c1a3d;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.progress-bar-container {
  margin-top: 10px;
}

.actions-by-category {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.category-section h6 {
  color: #6e3894;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
}

.action-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-item-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.action-item-stats:hover {
  background: #f3f4f6;
}

.action-name {
  color: #374151;
  font-weight: 500;
}

.activity-log-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-timeline {
  margin-bottom: 30px;
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-left: 3px solid #e5e7eb;
  margin-bottom: 15px;
  transition: border-color 0.2s ease;
}

.activity-item:hover {
  border-left-color: #6e3894;
  background: #f9fafb;
}

.activity-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 5px 0;
  color: #374151;
  font-weight: 500;
}

.activity-time {
  color: #6b7280;
  font-size: 0.85rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .statistics-modal {
    max-width: 100vw !important;
    height: 100vh;
    margin: 0;
    border-radius: 0;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .related-data-section {
    grid-template-columns: 1fr;
  }

  .incident-header-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stats-tabs-container .nav-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .stats-tabs-container .nav-link {
    white-space: nowrap;
  }
}

/* TLP Styles */
.form-control-color {
  height: 38px;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
}

.form-control-color::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.form-control-color::-webkit-color-swatch {
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>
<style>
.vs__open-indicator {
  display: none !important;
}
</style>

<style scoped>
/* Statistics Modal Styles */
/* Statistics Modal Overlay */
.stats-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.stats-modal-content {
  background: #f8f8f8;
  border-radius: 20px;
  width: 96vw;
  max-width: 1800px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(68, 34, 92, 0.3);
  animation: statsSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes statsSlideIn {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal Header */
.stats-modal-header {
  background: linear-gradient(135deg, #ffffff 0%, #fdfeff 100%);
  padding: 24px 32px;
  border-bottom: 1px solid rgba(68, 34, 92, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
}

.stats-header-left {
  flex: 1;
}

.stats-modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #6e3894;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  letter-spacing: -0.5px;
}

.stats-subtitle {
  font-size: 13px;
  color: #848789;
  margin: 0;
  font-weight: 400;
}

.stats-modal-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.stats-filter-select {
  border: 1.5px solid rgba(110, 56, 148, 0.2);
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #6e3894;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.stats-filter-select:hover {
  border-color: #6e3894;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.12);
}

.stats-filter-select:focus {
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.stats-refresh-btn {
  background: linear-gradient(135deg, #6e3894 0%, #9560dd 100%);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: none;
  color: white;
  transition: all 0.2s ease;
}

.stats-refresh-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

.stats-refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-close-btn {
  background: #f1523d;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: none;
  color: white;
  transition: all 0.2s ease;
}

.stats-close-btn:hover {
  background: #d43d29;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(241, 82, 61, 0.3);
}

/* Modal Body */
.stats-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: #f8f8f8;
}

.stats-modal-body::-webkit-scrollbar {
  width: 8px;
}

.stats-modal-body::-webkit-scrollbar-track {
  background: #ededed;
  border-radius: 10px;
}

.stats-modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6e3894 0%, #9560dd 100%);
  border-radius: 10px;
}

.stats-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.stats-loading p {
  color: #6e3894;
  font-size: 16px;
  font-weight: 500;
}

.stats-spinner {
  border: 4px solid rgba(110, 56, 148, 0.1);
  border-top: 4px solid #6e3894;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.stats-content {
  /* display: flex; */
  flex-direction: column;
  /* gap: 24px; */
}

/* Main KPI Cards */
.stats-main-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 8px;
}

.stats-kpi-card-large {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stats-kpi-card-large::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--card-color-1, #6e3894),
    var(--card-color-2, #9560dd)
  );
}

/* .stats-kpi-card-large.stats-primary {
  --card-color-1: #6e3894;
  --card-color-2: #9560dd;
} */

.stats-kpi-card-large.stats-danger {
  --card-color-1: #f1523d;
  --card-color-2: #ff7961;
}

.stats-kpi-card-large.stats-warning {
  --card-color-1: #f8aa4b;
  --card-color-2: #ffc77d;
}

.stats-kpi-card-large.stats-success {
  --card-color-1: #63d5be;
  --card-color-2: #8ee4d3;
}

.stats-kpi-card-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.kpi-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(110, 56, 148, 0.08) 0%,
    rgba(149, 96, 221, 0.08) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color-1, #6e3894);
}

.kpi-label {
  font-size: 14px;
  font-weight: 600;
  color: #848789;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 36px;
  font-weight: 800;
  color: #6e3894;
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.kpi-subtitle,
.kpi-trend {
  font-size: 13px;
  color: #848789;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Secondary Metrics Grid */
.stats-secondary-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}

.stats-metric-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.stats-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-info-bg {
  background: rgba(149, 96, 221, 0.12);
}
.stats-purple-bg {
  background: rgba(68, 34, 92, 0.12);
}
.stats-orange-bg {
  background: rgba(255, 97, 80, 0.12);
}
.stats-teal-bg {
  background: rgba(99, 213, 190, 0.12);
}
.stats-indigo-bg {
  background: rgba(149, 96, 221, 0.12);
}
.stats-pink-bg {
  background: rgba(233, 30, 99, 0.12);
}

.metric-details {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #6e3894;
  line-height: 1.2;
  margin-bottom: 2px;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: #848789;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.metric-info {
  font-size: 11px;
  color: #999;
  font-weight: 500;
}

/* Charts Section */
.stats-charts-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-chart-full {
  grid-column: 1 / -1;
}

.stats-charts-grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.stats-chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.stats-chart-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-chart-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.chart-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.chart-title-wrapper h5 {
  font-size: 17px;
  font-weight: 700;
  color: #6e3894;
  margin: 0;
  letter-spacing: -0.3px;
}

.chart-subtitle {
  font-size: 12px;
  color: #848789;
  margin: 0;
  font-weight: 500;
}

/* Top Lists Styling */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
}

.stats-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(110, 56, 148, 0.02);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.stats-list-item:hover {
  background: rgba(110, 56, 148, 0.05);
  transform: translateX(4px);
}

.stats-list-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.stats-list-rank {
  background: linear-gradient(135deg, #6e3894 0%, #9560dd 100%);
  color: white;
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.2);
}

.stats-list-name {
  font-size: 14px;
  font-weight: 600;
  color: #6e3894;
}

.stats-list-value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-progress {
  flex: 1;
  height: 10px;
  background: rgba(110, 56, 148, 0.08);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stats-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6e3894 0%, #9560dd 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(110, 56, 148, 0.3);
}

.stats-progress-purple {
  background: linear-gradient(90deg, #6e3894 0%, #6e3894 100%);
}

.stats-count {
  font-size: 13px;
  font-weight: 600;
  color: #6e3894;
  white-space: nowrap;
  min-width: 80px;
  text-align: right;
}
</style>

<style>
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
.custom-table th,
td {
  text-align: center !important;
}
</style>

<style>
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

/* Secondary Metric Cards */
.secondary-metric-card {
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

.secondary-metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.secondary-metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-card-teal .secondary-metric-icon {
  background-color: #ccfbf1;
  color: #0f766e;
}

.metric-card-indigo .secondary-metric-icon {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.metric-card-pink .secondary-metric-icon {
  background-color: #fce7f3;
  color: #db2777;
}

.secondary-metric-content {
  flex: 1;
  min-width: 0;
}

.secondary-metric-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.secondary-metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.secondary-metric-info {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 12px;
}

.metric-card-teal .secondary-metric-value {
  color: #0f766e;
}

.metric-card-indigo .secondary-metric-value {
  color: #4f46e5;
}

.metric-card-pink .secondary-metric-value {
  color: #db2777;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stat-card-modern {
    padding: 16px;
    min-height: 100px;
  }

  .stat-icon-circle {
    width: 35px;
    height: 35px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-percentage {
    font-size: 0.75rem;
    padding: 3px 8px;
  }

  .secondary-metric-card {
    padding: 16px;
    min-height: 90px;
  }

  .secondary-metric-icon {
    width: 44px;
    height: 44px;
  }

  .secondary-metric-icon svg {
    width: 22px;
    height: 22px;
  }

  .secondary-metric-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .secondary-metric-card {
    padding: 14px;
    min-height: 85px;
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .secondary-metric-icon {
    width: 40px;
    height: 40px;
  }

  .secondary-metric-icon svg {
    width: 20px;
    height: 20px;
  }

  .secondary-metric-value {
    font-size: 1.125rem;
  }

  .secondary-metric-info {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
}
</style>
