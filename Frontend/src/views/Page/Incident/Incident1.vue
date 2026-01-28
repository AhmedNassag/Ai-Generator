<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'Risk Management'"
    :mainSubPage="'Incident'"
    :subPage="'Incident Management'"
    :titlePage="'Incident Management'"
  >
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
        :Configurations="openConfigurationsModal"
        :hideConfigurationsButton="false"
      >
        <template #Type="{ item }">
          {{ getCaseTypeName(item.caseType) }}
        </template>
        <template #Direction="{ item }">
          {{ getCaseDirectionName(item.direction) }}
        </template>
        <template #Attack="{ item }">
          {{ getAttackName(item.attack) }}
        </template>
        <template #Detector="{ item }">
          {{ getDetectorName(item.detectedBy) }}
        </template>
        <template #Status="{ item }">
          <span
            style="width: 100%"
            v-if="item.status == '3'"
            class="badge bg-danger text-light"
          >
            Closed
          </span>
          <span
            style="width: 100%"
            v-else-if="item.status == '2'"
            class="badge bg-warning text-dark"
          >
            <i class="fa-solid fa-spinner fa-spin"></i> In Progress
          </span>
          <span
            style="width: 100%"
            v-else="item.status == '1'"
            class="badge bg-success text-light"
          >
            Open
          </span>
        </template>
        <template #edit="{ item }">
          <a
            v-if="item.status != '3'"
            href="javascript:void(0)"
            @click="editItem(item)"
            class="dropdown-item"
            v-permission:update
          >
            <i class="icofont icofont-fountain-pen"></i> Edit
          </a>
        </template>

        <template #incidentResponse="{ item }">
          <a
            v-if="
              item.status != '3' &&
              ira &&
              ira.responsibleId.includes(loggedInUser.id)
            "
            href="javascript:void(0)"
            @click="response(item)"
            class="dropdown-item"
            v-permission:update
          >
            <i class="fa-solid fa-gear"></i> Incident Response
          </a>
        </template>

        <template #delete="{ item }">
          <a
            v-if="item.status != '3'"
            href="javascript:void(0)"
            @click="deleteItem(item)"
            title="Delete Exception"
            class="dropdown-item"
          >
            <i class="icofont icofont-trash text-danger"></i> Delete
          </a>
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
            <label for="caseType">Case Type</label>
            <select
              class="form-select"
              id="caseType"
              aria-label="Default select example"
              v-model="newItem.caseType"
            >
              <option
                v-for="(caseType, index) in caseTypes"
                :key="index"
                :value="index"
              >
                {{ caseType }}
              </option>
            </select>
          </div>
        </template>
        <template #direction="{ item }">
          <div class="col-md-6 mb-3">
            <label for="direction">Direction</label>
            <select
              class="form-select"
              id="direction"
              aria-label="Default select example"
              v-model="newItem.direction"
            >
              <option
                v-for="(direction, index) in caseDirections"
                :key="index"
                :value="index"
              >
                {{ direction }}
              </option>
            </select>
          </div>
        </template>
        <template #attack="{ item }">
          <div class="col-md-6 mb-3">
            <label for="attack">Attack</label>
            <select
              class="form-select"
              id="attack"
              aria-label="Default select example"
              v-model="newItem.attack"
            >
              <option
                v-for="(attack, index) in attacks"
                :key="index"
                :value="index"
              >
                {{ attack }}
              </option>
            </select>
          </div>
        </template>

        <template #detectedBy="{ item }">
          <div class="col-md-6 mb-3">
            <label for="attack">Detected By</label>
            <select
              class="form-select"
              id="detectedBy"
              aria-label="Default select example"
              v-model="newItem.detectedBy"
            >
              <option
                v-for="(detector, index) in detectedBy"
                :key="index"
                :value="index"
              >
                {{ detector }}
              </option>
            </select>
          </div>
        </template>

        <template #status="{ item }">
          <div class="col-md-6 mb-3">
            <label for="status">Status</label>
            <select
              placeholder="Select Status"
              class="form-select"
              id="status"
              aria-label="Default select example"
              v-model="newItem.status"
            >
              <option value="1" selected>Open</option>
              <option value="2">In Progress</option>
              <option value="3">Closed</option>
            </select>
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
          Incidents Configurations
        </h5>
        <button
          class="btn-close"
          aria-label="Close"
          @click="closeConfigurationsModal"
        ></button>
      </div>
      <div class="modal-body">
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
          <div class="tab-content mt-5" :key="activeTab">
            <!-- Case Type -->
            <div v-if="activeTab === 'caseType'" class="form-group">
              <!-- Case Type Inputs -->
              <div
                v-for="(caseType, index) in caseTypeInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="caseTypeInputs[index]"
                  type="text"
                  class="form-control me-2"
                  placeholder="Enter case type"
                  @input="trackCaseTypeChange"
                  :class="{
                    'is-invalid':
                      duplicateError && isDuplicate(caseType, index),
                  }"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeCaseTypeInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div v-if="duplicateError" class="text-danger mt-2">
                Case type already exists. Please enter a unique one.
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addCaseTypeInput"
                  :disabled="
                    caseTypeInputs.length > 0 &&
                    !caseTypeInputs[caseTypeInputs.length - 1]?.trim()
                  "
                >
                  Add Case Type
                </button>
                <button
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveCaseTypes"
                >
                  Save
                </button>
              </div>
            </div>

            <!-- Case Direction -->
            <div v-if="activeTab === 'caseDirection'" class="form-group">
              <!-- Case Direction Inputs -->
              <div
                v-for="(caseDirection, index) in caseDirectionInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="caseDirectionInputs[index]"
                  type="text"
                  class="form-control me-2"
                  placeholder="Enter case direction"
                  @input="trackCaseDirectionChange"
                  :class="{
                    'is-invalid':
                      duplicateError && isDuplicate(caseDirection, index),
                  }"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeCaseDirectionInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div v-if="duplicateError" class="text-danger mt-2">
                Case direction already exists. Please enter a unique one.
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addCaseDirectionInput"
                  :disabled="
                    caseDirectionInputs.length > 0 &&
                    !caseDirectionInputs[caseDirectionInputs.length - 1]?.trim()
                  "
                >
                  Add Case Direction
                </button>
                <button
                  v-if="
                    caseDirectionInputs.some((direction) => direction.trim())
                  "
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveCaseDirections"
                >
                  Save
                </button>
              </div>
            </div>

            <!-- Attacks -->
            <div v-if="activeTab === 'attacks'" class="form-group">
              <div
                v-for="(attack, index) in attackInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="attackInputs[index]"
                  type="text"
                  class="form-control me-2"
                  placeholder="Enter attack"
                  @input="trackAttackChange"
                  :class="{
                    'is-invalid':
                      duplicateAttackError &&
                      isAttackDuplicate(attackInputs[index], index),
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

              <div v-if="duplicateAttackError" class="text-danger mt-2">
                Attack already exists. Please ensure all attacks are unique.
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addAttackInput"
                  :disabled="
                    attackInputs.length > 0 &&
                    (!attackInputs[attackInputs.length - 1] ||
                      !attackInputs[attackInputs.length - 1].trim())
                  "
                >
                  Add Attack
                </button>
                <button
                  v-if="attackInputs.some((attack) => attack && attack.trim())"
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveAttacks"
                >
                  Save
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
                  v-model="detectedByInputs[index]"
                  type="text"
                  class="form-control me-2"
                  placeholder="Enter detected by"
                  @input="trackDetectedByChange"
                  :class="{
                    'is-invalid':
                      duplicateDetectedByError &&
                      isDetectedByDuplicate(detectedByInputs[index], index),
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

              <div v-if="duplicateDetectedByError" class="text-danger mt-2">
                This Detector already exists. Please ensure all entries are
                unique.
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addDetectedByInput"
                  :disabled="
                    detectedByInputs.length > 0 &&
                    (!detectedByInputs[detectedByInputs.length - 1] ||
                      !detectedByInputs[detectedByInputs.length - 1].trim())
                  "
                >
                  Add Detector
                </button>
                <button
                  v-if="
                    detectedByInputs.some(
                      (detectedBy) => detectedBy && detectedBy.trim()
                    )
                  "
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveDetectedBy"
                >
                  Save
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'siteLocation'" class="form-group">
              <!-- Site/Location Inputs -->
              <div
                v-for="(siteLocation, index) in siteLocationInputs"
                :key="index"
                class="d-flex align-items-center mt-2"
              >
                <input
                  v-model="siteLocationInputs[index].name"
                  type="text"
                  class="form-control me-2"
                  placeholder="Enter location name"
                  @input="trackSiteLocationChange"
                />
                <button
                  style="color: red"
                  class="btn btn-sm"
                  @click="removeSiteLocationInput(index)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="mt-3 ms-5">
                <button
                  style="text-align: center"
                  class="btn btn-sm mt-2 me-2 btn-primary"
                  @click="addSiteLocationInput"
                  :disabled="
                    siteLocationInputs.length > 0 &&
                    !siteLocationInputs[
                      siteLocationInputs.length - 1
                    ]?.name?.trim()
                  "
                >
                  Add Location
                </button>
                <button
                  v-if="
                    siteLocationInputs.some((location) => location.name.trim())
                  "
                  class="btn mt-2 btn-sm btn-primary"
                  @click="saveSiteLocations"
                >
                  Save
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
                  Add Incident Score
                </button>
              </div>

              <!-- Score Section -->
              <div class="score-section mt-4">
                <h5 class="section-title">Score Criteria</h5>
                <div v-if="incidentScoreCriteria.length === 0" class="no-data">
                  No criteria defined yet.
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
                          <th>Level</th>
                          <th>Point</th>
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
                <h5 class="section-title">Classifications</h5>
                <div
                  v-if="incidentClassifications.length === 0"
                  class="no-data"
                >
                  No classifications defined yet.
                </div>
                <div v-else class="classification-container">
                  <table class="table classify-table">
                    <thead>
                      <tr>
                        <th>Priority</th>
                        <th>Value</th>
                        <th>Color</th>
                        <th>SLA (hours)</th>
                        <th>Description</th>
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
                    <h5 class="modal-title">Incident Score Definition</h5>
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
                        <span class="step-label">Define Criteria</span>
                      </div>
                      <div class="step-line"></div>
                      <div
                        class="step"
                        :class="{ active: currentWizardStep === 2 }"
                      >
                        <span class="step-number">2</span>
                        <span class="step-label">Scoring System</span>
                      </div>
                      <div class="step-line"></div>
                      <div
                        class="step"
                        :class="{ active: currentWizardStep === 3 }"
                      >
                        <span class="step-number">3</span>
                        <span class="step-label">Classify Incident</span>
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
                            class="d-flex align-items-center mt-2"
                          >
                            <div class="position-relative">
                              <input
                                style="width: 30%"
                                v-model="incidentScoreCriteria[index].name"
                                type="text"
                                class="form-control me-2"
                                :class="{
                                  'is-invalid': isDuplicateCriteriaName(
                                    criteria.name,
                                    index
                                  ),
                                }"
                                placeholder="Enter criteria name"
                                @input="trackCriteriaNameChange(index)"
                              />
                            </div>
                            <div
                              class="position-absolute"
                              v-if="
                                isDuplicateCriteriaName(criteria.name, index)
                              "
                            >
                              Criteria name already exists.
                            </div>
                            <input
                              v-model="incidentScoreCriteria[index].description"
                              type="text"
                              class="form-control me-2"
                              placeholder="Enter criteria description"
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
                                ]?.name?.trim() ||
                                  !incidentScoreCriteria[
                                    incidentScoreCriteria.length - 1
                                  ]?.description?.trim() ||
                                  isDuplicateCriteriaName(
                                    incidentScoreCriteria[
                                      incidentScoreCriteria.length - 1
                                    ]?.name,
                                    incidentScoreCriteria.length - 1
                                  ))
                              "
                            >
                              <i class="fa-solid fa-plus"></i> Add Criteria
                            </button>
                            <button
                              v-if="
                                incidentScoreCriteria.some(
                                  (c) =>
                                    c.name.trim() &&
                                    c.description.trim() &&
                                    !isDuplicateCriteriaName(
                                      c.name,
                                      incidentScoreCriteria.indexOf(c)
                                    )
                                )
                              "
                              class="btn mt-2 btn-sm btn-secondary"
                              @click="saveCriteria"
                              type="button"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        <!-- Step 2: Scoring System -->
                        <div v-if="currentWizardStep === 2" class="form-group">
                          <h5 style="text-align: center">
                            Predefined Criteria
                          </h5>
                          <div class="sub-nav-tabs-container">
                            <ul class="nav nav-tabs sub-nav-tabs">
                              <li
                                class="nav-item"
                                v-for="(
                                  criteria, index
                                ) in incidentScoreCriteria"
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
                                      :class="{
                                        'is-invalid': !isLevelUnique(
                                          criteria.name,
                                          scoringInputs[criteria.name][
                                            scoreIndex
                                          ].level,
                                          scoreIndex
                                        ),
                                      }"
                                      placeholder="Name"
                                      @blur="
                                        validateScoringInputs(criteria.name)
                                      "
                                    />
                                    <div
                                      v-if="
                                        !isLevelUnique(
                                          criteria.name,
                                          scoringInputs[criteria.name][
                                            scoreIndex
                                          ].level,
                                          scoreIndex
                                        )
                                      "
                                      class="invalid-feedback position-absolute"
                                      style="top: 100%; left: 0"
                                    >
                                      Level must be unique
                                    </div>
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
                                      placeholder="Point"
                                      @blur="
                                        validateScoringInputs(criteria.name)
                                      "
                                    />
                                    <div
                                      v-if="
                                        !isPointValid(
                                          criteria.name,
                                          scoringInputs[criteria.name][
                                            scoreIndex
                                          ].point,
                                          scoreIndex
                                        )
                                      "
                                      class="invalid-feedback position-absolute"
                                    >
                                      {{
                                        getPointErrorMessage(
                                          criteria.name,
                                          scoringInputs[criteria.name][
                                            scoreIndex
                                          ].point,
                                          scoreIndex
                                        )
                                      }}
                                    </div>
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
                                        ]?.point === '' ||
                                        !isPointValid(
                                          criteria.name,
                                          scoringInputs[criteria.name][
                                            getScoringInputs(criteria.name)
                                              .length - 1
                                          ]?.point,
                                          getScoringInputs(criteria.name)
                                            .length - 1
                                        ))
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
                                      !areAllPointsValid(criteria.name)
                                    "
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>

                        <!-- Step 3: Classify Incident -->
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
                                  >Priority</label
                                >
                                <input
                                  v-model="
                                    incidentClassifications[index].priority
                                  "
                                  type="text"
                                  class="form-control"
                                  placeholder="Priority (e.g., High)"
                                  :class="{
                                    'is-invalid': !isPriorityUnique(
                                      incidentClassifications[index].priority,
                                      index
                                    ),
                                  }"
                                />
                                <div
                                  v-if="
                                    !isPriorityUnique(
                                      incidentClassifications[index].priority,
                                      index
                                    )
                                  "
                                  class="invalid-feedback"
                                >
                                  Priority must be unique
                                </div>
                              </div>
                              <div class="form-group me-2" style="width: 140px">
                                <label
                                  style="font-size: 12px !important"
                                  for="value"
                                  >Value</label
                                >
                                <input
                                  v-model.number="
                                    incidentClassifications[index].value
                                  "
                                  type="number"
                                  min="1"
                                  class="form-control"
                                  placeholder="Value"
                                  :class="{
                                    'is-invalid': !isValueValid(
                                      incidentClassifications[index].value,
                                      index
                                    ),
                                  }"
                                  @blur="validateValue(index)"
                                />
                                <div
                                  v-if="
                                    !isValueUnique(
                                      incidentClassifications[index].value,
                                      index
                                    )
                                  "
                                  class="invalid-feedback"
                                >
                                  Value must be unique
                                </div>
                                <div
                                  v-if="
                                    isValueUnique(
                                      incidentClassifications[index].value,
                                      index
                                    ) &&
                                    incidentClassifications[index].value >
                                      maxTotalScore
                                  "
                                  class="invalid-feedback"
                                >
                                  Value cannot exceed total score ({{
                                    maxTotalScore
                                  }})
                                </div>
                              </div>
                              <div class="form-group me-2" style="width: 140px">
                                <label
                                  style="font-size: 12px !important"
                                  for="sla"
                                  >SLA (hours)</label
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
                                  placeholder="SLA (hours)"
                                />
                              </div>
                              <div class="form-group me-2" style="width: 80px">
                                <label
                                  style="font-size: 12px !important"
                                  for="color"
                                  >Color</label
                                >
                                <input
                                  v-model="incidentClassifications[index].color"
                                  type="color"
                                  class="form-control form-control-color"
                                  title="Choose color"
                                />
                              </div>
                              <button
                                style="color: red; margin-top: 15px"
                                class="btn btn-sm"
                                @click="removeClassificationInput(index)"
                                type="button"
                              >
                                <i class="fa-solid fa-trash"></i>
                              </button>
                            </div>
                            <div class="form-group mt-2">
                              <input
                                v-model="
                                  incidentClassifications[index].description
                                "
                                type="text"
                                class="form-control"
                                placeholder="Description"
                              />
                            </div>
                          </div>
                          <div class="mt-3 ms-5">
                            <button
                              class="btn btn-sm mt-2 me-2 btn-secondary"
                              @click="addClassificationInput"
                              type="button"
                            >
                              <i class="fa-solid fa-plus"></i> Add
                              Classification
                            </button>
                            <button
                              v-if="
                                incidentClassifications.some(
                                  (c) =>
                                    c.priority.trim() &&
                                    Number.isInteger(Number(c.value)) &&
                                    c.value <= maxTotalScore &&
                                    c.color &&
                                    Number.isInteger(Number(c.sla))
                                )
                              "
                              class="btn mt-2 btn-sm btn-secondary"
                              @click="saveClassifications"
                              type="button"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>
                  <div class="modal-footer">
                    <button
                      v-if="currentWizardStep > 1"
                      class="btn btn-sm btn-secondary me-2"
                      @click="setWizardStep(currentWizardStep - 1)"
                      type="button"
                    >
                      Back
                    </button>
                    <button
                      v-if="currentWizardStep < wizardSteps.length"
                      class="btn btn-sm btn-secondary"
                      @click="setWizardStep(currentWizardStep + 1)"
                      :disabled="!canProceedToNextStep"
                      type="button"
                    >
                      Next
                    </button>
                    <button
                      v-if="currentWizardStep === wizardSteps.length"
                      class="btn btn-sm btn-secondary"
                      @click="saveIncidentScore"
                      :disabled="!canProceedToNextStep"
                      type="button"
                    >
                      End
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
                        placeholder="Enter containment category"
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
                        Add Containment
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
                        Save
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
                        placeholder="Enter eradication category"
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
                        Add Eradication
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
                        Save
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
                        placeholder="Enter recovery category"
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
                        Add Recovery
                      </button>
                      <button
                        v-if="recoveryInputs.some((item) => item.trim())"
                        class="btn mt-2 btn-sm btn-primary"
                        @click="saveRecoveries"
                      >
                        Save
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
                  Add Play Book
                </button>
              </div>

              <!-- Play Books Table -->
              <div class="mt-6">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>
                        <i class="fa-solid fa-signature"></i> {{ $t("Name") }}
                      </th>
                      <th>
                        <i class="fa-solid fa-file-signature"></i>
                        {{ $t("Type") }}
                      </th>
                      <th>
                        <i class="fa-solid fa-users"></i>
                        {{ $t("Responsibles") }}
                      </th>
                      <th><!-- Actions column --></th>
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
                          title="Edit Play Book"
                        >
                          <i class="fa-solid fa-edit"></i>
                        </button>
                        <button
                          class="btn"
                          @click="deletePlayBook(index)"
                          title="Delete Play Book"
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
                    <h5 class="modal-title">Play Book Actions</h5>
                    {{ selectedPlayBook?.name }}
                    <button
                      class="btn-close"
                      aria-label="Close"
                      @click="closePlayBookActionsModal"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <!-- Tab Navigation for Actions -->
                    <div class="nav-tabs-container">
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
                            Add Action
                          </button>
                        </div>

                        <!-- Actions Table -->
                        <div class="mt-3">
                          <table class="table table-striped">
                            <thead>
                              <tr>
                                <th>{{ $t("Name") }}</th>
                                <th>{{ $t("Category") }}</th>
                                <th>{{ $t("Operations") }}</th>
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
                                  {{ action?.category || "" }}
                                </td>
                                <td>
                                  <button
                                    class="btn"
                                    @click="editAction(actionIndex)"
                                    title="Edit Action"
                                    :disabled="!action"
                                  >
                                    <i class="fa-solid fa-edit"></i>
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
                      {{ $t("Cancel") }}
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
                      <label for="actionCategory">Action Category</label>
                      <v-select
                        v-model="newAction.category"
                        :options="actionCategoryOptions"
                        :reduce="(item) => item.value"
                        label="label"
                        id="actionCategory"
                        class="form-control"
                        placeholder="Select category"
                      />
                    </div>
                    <!-- Action Type Selection -->
                    <div class="form-group radio-group">
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
                    </div>
                    <!-- Existing Action Selection -->
                    <div
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
                    </div>
                    <!-- New Action Input -->
                    <div v-if="newAction.type === 'new'" class="form-group">
                      <label for="newActionName">Action Name</label>
                      <input
                        v-model="newAction.name"
                        id="newActionName"
                        type="text"
                        class="form-control"
                        placeholder="Enter action name"
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
                    <h5 class="modal-title">Add Play Book</h5>
                    <button aria-label="Close" @click="closePlayBookModal">
                      <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                  </div>
                  <div class="modal-body">
                    <div class="form-group">
                      <label for="playBookName">Name</label>
                      <input
                        v-model="newPlayBook.name"
                        id="playBookName"
                        type="text"
                        class="form-control"
                        placeholder="Enter play book name"
                      />
                    </div>
                    <div class="form-group radio-group">
                      <label for="responsibleType">Responsible Type</label>
                      <div class="radio-options ms-3">
                        <div class="radio-item">
                          <input
                            type="radio"
                            id="user"
                            value="User"
                            v-model="newPlayBook.responsibleType"
                            name="responsibleType"
                          />
                          <label for="user">User</label>
                        </div>
                        <div class="radio-item">
                          <input
                            type="radio"
                            id="team"
                            value="Team"
                            v-model="newPlayBook.responsibleType"
                            name="responsibleType"
                          />
                          <label for="team">Team</label>
                        </div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="responsible">Responsibles (CSIRT)</label>
                      <v-select
                        v-model="newPlayBook.responsibleId"
                        :options="responsibleOptions"
                        :reduce="(item) => item.id"
                        :label="
                          newPlayBook.responsibleType === 'Team'
                            ? 'name'
                            : 'full_name'
                        "
                        multiple
                        id="responsible"
                        class="form-control"
                        placeholder="Select responsibles"
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
                      Save
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
                    <label for="iraName">Name</label>
                    <input
                      v-model="newIRA.name"
                      id="iraName"
                      type="text"
                      class="form-control"
                      placeholder="Enter IRA name"
                      :class="{ 'is-invalid': !newIRA.name.trim() }"
                    />
                    <!-- <div v-if="!newIRA.name.trim()" class="invalid-feedback">
                      IRA name is required
                    </div> -->
                  </div>

                  <div class="form-group radio-group">
                    <label>Responsible Type</label>
                    <div class="radio-options ms-3">
                      <div class="radio-item">
                        <input
                          type="radio"
                          id="iraUser"
                          value="User"
                          v-model="newIRA.responsibleType"
                          name="iraResponsibleType"
                        />
                        <label for="iraUser">User</label>
                      </div>
                      <div class="radio-item">
                        <input
                          type="radio"
                          id="iraTeam"
                          value="Team"
                          v-model="newIRA.responsibleType"
                          name="iraResponsibleType"
                        />
                        <label for="iraTeam">Team</label>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="iraResponsibles">Responsibles</label>
                    <v-select
                      v-model="newIRA.responsibleId"
                      :options="iraResponsibleOptions"
                      :reduce="(item) => item.id"
                      label="full_name"
                      multiple
                      id="iraResponsibles"
                      class="form-control"
                      :class="{
                        'is-invalid': newIRA.responsibleId.length === 0,
                      }"
                      placeholder="Select responsibles"
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
                      {{ ira ? "Update IRA" : "Save IRA" }}
                    </button>
                    <button
                      class="btn btn-sm btn-secondary"
                      @click="cancelEditIRA"
                      v-if="ira"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <!-- Updated IRA Display (shown when IRA exists and not editing) -->
                <div v-else class="ira-display-container">
                  <div class="mt-3">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>
                            <i class="fa-solid fa-signature"></i>
                            {{ $t("Name") }}
                          </th>
                          <th>
                            <i class="fa-solid fa-file-signature"></i>
                            {{ $t("Type") }}
                          </th>
                          <th>
                            <i class="fa-solid fa-users"></i>
                            {{ $t("Responsibles") }}
                          </th>
                          <th>{{ $t("Actions") }}</th>
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
                              <i class="fa-solid fa-edit"></i>
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
                            No IRA defined yet.
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
          {{ $t("Cancel") }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="isIncidentEditModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Incident Response</h5>
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
            <span class="step-label">Detection</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentEditWizardStep === 2 }">
            <span class="step-number">2</span>
            <span class="step-label">Association</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentEditWizardStep === 3 }">
            <span class="step-number">3</span>
            <span class="step-label">Assessment</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentEditWizardStep === 4 }">
            <span class="step-number">4</span>
            <span class="step-label">Assignment</span>
          </div>
          <div class="step-line" v-if="canAccessReviewStep"></div>
          <div
            class="step"
            :class="{ active: currentEditWizardStep === 5 }"
            v-if="canAccessReviewStep"
          >
            <span class="step-number">5</span>
            <span class="step-label">Play Book</span>
          </div>
        </div>

        <!-- Wizard Content -->
        <transition name="fade" mode="out-in">
          <div class="tab-content mt-5" :key="currentEditWizardStep">
            <!-- Step 1: Detection -->
            <div v-if="currentEditWizardStep === 1" class="incident-details">
              <div class="incident-card">
                <div class="incident-card-body">
                  <!-- Summary -->
                  <div class="detail-row">
                    <span class="detail-label">Summary</span>
                    <span class="detail-value">{{
                      editingIncident.summary || "N/A"
                    }}</span>
                  </div>
                  <!-- Details -->
                  <div class="detail-row">
                    <span class="detail-label">Details</span>
                    <span class="detail-value">{{
                      stripHtmlTags(editingIncident.details) || "N/A"
                    }}</span>
                  </div>

                  <!-- Two-Column Grid for Other Attributes -->
                  <div class="row">
                    <!-- Row 1: Type and Direction -->
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">Type</span>
                        <span class="detail-value">{{
                          getCaseTypeName(editingIncident.caseType)
                        }}</span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">Direction</span>
                        <span class="detail-value">{{
                          getCaseDirectionName(editingIncident.direction)
                        }}</span>
                      </div>
                    </div>

                    <!-- Row 2: Attack and Detector -->
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">Attack</span>
                        <span class="detail-value">{{
                          getAttackName(editingIncident.attack)
                        }}</span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">Detector</span>
                        <span class="detail-value">{{
                          getDetectorName(editingIncident.detectedBy)
                        }}</span>
                      </div>
                    </div>

                    <!-- Row 3: Detection Time and Status -->
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">Detection Time</span>
                        <span class="detail-value">{{
                          editingIncident.detectedAt || "N/A"
                        }}</span>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <select
                          class="status-select"
                          v-model="editingIncident.status"
                          aria-label="Incident status"
                        >
                          <option value="1">Open</option>
                          <option value="2">In Progress</option>
                          <option value="3">Closed</option>
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
                <div class="col-12 mb-3">
                  <label for="relatedIncidents" class="detail-label"
                    >Related Incidents</label
                  >
                  <v-select
                    id="relatedIncidents"
                    v-model="editingIncident.relatedIncidents"
                    :options="availableIncidents"
                    :reduce="(incident) => incident.id"
                    label="summary"
                    multiple
                    placeholder="Select related incidents"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                    class="form-select"
                  >
                    <template #option="{ summary, id }">
                      <span>{{ summary }} (ID: {{ id }})</span>
                    </template>
                  </v-select>
                </div>

                <!-- Related Risks -->
                <div class="col-12 mb-3">
                  <label for="relatedRisks" class="detail-label"
                    >Related Risks</label
                  >

                  <v-select
                    multiple
                    class="form-select"
                    id="relatedRisks"
                    v-model="editingIncident.relatedRisks"
                    :options="availableRisks"
                    label="subject"
                    :reduce="(item) => item.id"
                    placeholder="Select risks"
                  ></v-select>
                </div>

                <!-- Related Assets -->
                <div class="col-12 mb-3">
                  <label for="relatedAssets" class="detail-label"
                    >Related Assets</label
                  >
                  <v-select
                    multiple
                    class="form-select"
                    id="relatedAssets"
                    v-model="editingIncident.relatedAssets"
                    :options="availableAssets"
                    label="name"
                    :reduce="(item) => item.id"
                    placeholder="Select assets"
                  ></v-select>
                </div>

                <!-- Source Tag -->
                <div class="col-12 mb-3">
                  <label for="sourceTag" class="detail-label">Source Tag</label>
                  <input
                    id="sourceTag"
                    v-model="editingIncident.sourceTag"
                    type="text"
                    class="form-control"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                    placeholder="Enter source tag"
                  />
                </div>

                <!-- Destination Tag -->
                <div class="col-12 mb-3">
                  <label for="destinationTag" class="detail-label"
                    >Destination Tag</label
                  >
                  <input
                    id="destinationTag"
                    v-model="editingIncident.destinationTag"
                    type="text"
                    class="form-control"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                    placeholder="Enter destination tag"
                  />
                </div>

                <!-- New file upload field -->
                <div class="form-group" v-show="!canAccessReviewStep">
                  <label class="detail-label"
                    >Supporting Files (Multiple)</label
                  >
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    class="form-control file-input"
                    multiple
                  />
                  <!-- <div v-if="filePreview" class="file-preview">
                    <p>Selected file: {{ editingIncident.file?.name }}</p>
                    <img
                      v-if="isImageFile"
                      :src="filePreview"
                      alt="File preview"
                      class="preview-image"
                    />
                    <button class="btn btn-danger btn-sm" @click="removeFile">
                      Remove
                    </button>
                  </div> -->
                  <small class="form-text text-muted">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB.
                  </small>
                </div>
              </div>
            </div>

            <!-- Step 3: Assessment (Placeholder) -->
            <div
              v-if="currentEditWizardStep === 3"
              class="form-group assessment-step"
            >
              <h4 class="section-title">Incident Assessment</h4>
              <div v-if="incidentScoreCriteria.length" class="criteria-table">
                <div class="table-header">
                  <div class="header-item">Criterion</div>
                  <div class="header-item">Description</div>
                  <div class="header-item">Severity Level</div>
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
                    <select
                      :id="'assessment-level-' + index"
                      v-model="editingIncident.assessment[criterion.name]"
                      class="form-select"
                      :disabled="
                        canAccessReviewStep &&
                        !ira.responsibleId.includes(loggedInUser.id)
                      "
                      @change="calculateTotalScore"
                    >
                      <option
                        v-for="score in criterion.scores"
                        :key="score.level"
                        :value="score.point"
                      >
                        {{ score.level }} ({{ score.point }} points)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div v-else class="no-data">
                No assessment criteria defined. Please configure criteria in the
                settings.
              </div>
              <div class="score-summary">
                <span class="summary-label">Total Assessment Score :</span>
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
                  <label for="assignmentCaseType" class="detail-label"
                    >Case Type</label
                  >
                  <select
                    id="assignmentCaseType"
                    v-model="editingIncident.caseType"
                    class="form-select"
                    aria-label="Select case type"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                    <option value="" disabled>Select Case Type</option>
                    <option
                      v-for="(caseType, index) in caseTypes"
                      :key="index"
                      :value="index"
                    >
                      {{ caseType }}
                    </option>
                  </select>
                </div>
                <!-- Reporter -->
                <div class="col-md-6 mb-3">
                  <label for="reporter" class="detail-label">Reporter</label>
                  <select
                    id="reporter"
                    v-model="editingIncident.reporterId"
                    class="form-select"
                    aria-label="Select reporter"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                    <option value="" disabled>Select Reporter</option>
                    <option
                      v-for="user in users"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.full_name }}
                    </option>
                  </select>
                </div>
                <!-- Owner -->
                <div class="col-md-6 mb-3">
                  <label for="owner" class="detail-label">Owner</label>
                  <select
                    id="owner"
                    v-model="editingIncident.ownerId"
                    class="form-select"
                    aria-label="Select owner"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                    <option value="" disabled>Select Owner</option>
                    <option
                      v-for="user in users"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.full_name }}
                    </option>
                  </select>
                </div>
                <!-- Play Book -->
                <div class="col-md-6 mb-3">
                  <label for="playBook" class="detail-label">Play Book</label>
                  <select
                    id="playBook"
                    v-model="editingIncident.playBookId"
                    class="form-select"
                    aria-label="Select play book"
                    :disabled="
                      canAccessReviewStep &&
                      !ira.responsibleId.includes(loggedInUser.id)
                    "
                  >
                    <option value="" disabled>Select Play Book</option>
                    <option
                      v-for="playBook in playBooks"
                      :key="playBook.id"
                      :value="playBook.id"
                    >
                      {{ playBook.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 5: Review -->
            <div
              v-if="currentEditWizardStep === 5 && canAccessReviewStep"
              class="form-group review-step"
            >
              <!-- Tab Navigation for Review Actions -->
              <div class="nav-tabs-container">
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
                      <span>{{ action.name }} ({{ action.category }})</span>
                      <div>
                        <select
                          v-model="action.status"
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
                        <span class="badge badge-primary rounded-circle">{{
                          editingIncident.evidence.filter(
                            (evidence) =>
                              evidence.actionTab === "containments" &&
                              evidence.actionName === action.name
                          ).length
                        }}</span>
                      </div>
                    </li>
                  </ul>
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
                      <span>{{ action.name }} ({{ action.category }})</span>
                      <div>
                        <select
                          v-model="action.status"
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
                        <span class="badge badge-primary rounded-circle">{{
                          editingIncident.evidence.filter(
                            (evidence) =>
                              evidence.actionTab === "eradications" &&
                              evidence.actionName === action.name
                          ).length
                        }}</span>
                      </div>
                    </li>
                  </ul>
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
                      <span>{{ action.name }} ({{ action.category }})</span>
                      <div>
                        <select
                          v-model="action.status"
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
                        <span class="badge badge-primary rounded-circle">{{
                          editingIncident.evidence.filter(
                            (evidence) =>
                              evidence.actionTab === "recoveries" &&
                              evidence.actionName === action.name
                          ).length
                        }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Save Button -->
              <!-- <div class="mt-4">
                <button
                  class="btn btn-sm btn-secondary"
                  @click="saveIncident"
                >
                  Save
                </button>
              </div> -->

              <div class="evidence-section">
                <h3 class="section-title">Evidence</h3>
                <div
                  v-if="
                    editingIncident.evidence && editingIncident.evidence.length
                  "
                  class="table-container"
                >
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>File</th>
                        <th>Stage</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(evidence, index) in editingIncident.evidence"
                        :key="index"
                      >
                        <td>{{ evidence.name }}</td>
                        <td>
                          <a
                            :href="evidence.file"
                            target="_blank"
                            class="btn-link"
                            >{{ evidence.file }}</a
                          >
                        </td>
                        <td>{{ formatActionTab(evidence.actionTab) }}</td>
                        <td>{{ evidence.actionName }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="no-data">
                  No evidence available for this incident.
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <div class="modal-footer">
        <button
          v-if="currentEditWizardStep > 1"
          class="btn btn-sm btn-secondary me-2"
          @click="setEditWizardStep(currentEditWizardStep - 1)"
          type="button"
        >
          Back
        </button>
        <button
          v-if="currentEditWizardStep < (canAccessReviewStep ? 5 : 4)"
          class="btn btn-sm btn-secondary"
          @click="setEditWizardStep(currentEditWizardStep + 1)"
          type="button"
        >
          Next
        </button>
        <button
          v-if="currentEditWizardStep === (canAccessReviewStep ? 5 : 4)"
          class="btn btn-sm btn-secondary"
          @click="saveIncident"
          type="button"
        >
          Save
        </button>
      </div>

      <!-- Evidence Modal -->
      <div
        v-if="isEvidenceModalOpen"
        class="modal-overlay"
        tabindex="-1"
        style="background-color: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Evidence</h5>
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
              <label for="evidenceName" class="form-label">Evidence Name</label>
              <input
                v-model="newEvidence.name"
                type="text"
                class="form-control"
                id="evidenceName"
                placeholder="Enter evidence name"
                required
              />
            </div>
            <div class="mb-3">
              <label for="evidenceFile" class="form-label">Upload File</label>
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
              class="btn btn-primary"
              :disabled="!isEvidenceValid"
              @click="saveEvidence"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import incident from "@/API/Incident/Incident";
import risk from "@/API/Risk/Risk";
import asset from "@/API/Asset/Asset";
import location from "@/API/Location/Location";
import incidentSetting from "@/API/IncidentSetting/IncidentSetting";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import Swal from "sweetalert2";
import Auth from "@/API/Auth";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    "v-select": VueSelect,
  },

  setup() {
    const api = new incident();
    const apiIncidentSetting = new incidentSetting();
    const userApi = new user();
    const teamApi = new team();
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
    };
  },

  data() {
    return {
      isEvidenceModalOpen: false,
      newEvidence: {
        name: "",
        file: null,
      },
      selectedAction: {
        tab: null, // 'containments', 'eradications', or 'recoveries'
        index: null, // Index of the action in filtered actions
      },
      statusOptions: ["None", "Progress", "Done"],
      reviewTabs: [
        { name: "containments", label: "Containments" },
        { name: "eradications", label: "Eradications" },
        { name: "recoveries", label: "Recoveries" },
      ],
      activeReviewTab: "containments",
      containmentActions: [],
      eradicationActions: [],
      recoveryActions: [],
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      isConfigurationsModalOpen: false,
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
        { name: "caseType", label: "Case Type" },
        { name: "caseDirection", label: "Case Direction" },
        { name: "attacks", label: "Attacks" },
        { name: "detectedBy", label: "Detected By" },
        { name: "siteLocation", label: "Site/Location" },
        { name: "incidentScore", label: "Incident Score" },
        { name: "playBookCategory", label: "Play Book Category" },
        { name: "playBook", label: "Play Book" },
        { name: "ira", label: "IRA" },
      ],
      caseTypeInputs: [],
      caseDirectionInputs: [],
      duplicateError: false,
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
      actionCategoryOptions: [
        { value: "containments", label: "Containments" },
        { value: "eradications", label: "Eradications" },
        { value: "recoveries", label: "Recoveries" },
      ],
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
        responsibleType: "User",
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

      availableIncidents: [], // List of incidents excluding the current one
      availableRisks: [], // List of available risks
      availableAssets: [], // List of available assets
      filePreview: null,
      sourceTag: "",
      destinationTag: "",
      editingIncident: {
        caseType: "",
        reporterId: "",
        ownerId: "",
        playBookId: "",
        relatedIncidents: [],
        relatedRisks: [],
        relatedAssets: [],
        assessment: {},
        file: [],
      },
    };
  },

  computed: {
    canAccessReviewStep() {
      return (
        this.selectedPlayBook &&
        this.isUserResponsibleForPlaybook(this.selectedPlayBook)
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
      return Object.values(this.editingIncident.assessment).reduce(
        (sum, score) => sum + (Number(score) || 0),
        0
      );
    },

filteredContainmentActions() {
  if (!this.selectedPlayBook?.actions?.containments || !this.editingIncident?.playBookActionsStatus) {
    return [];
  }
  return this.selectedPlayBook.actions.containments
    .filter((action) => action && typeof action === "object" && action.name)
    .map((action) => {
      // Find the action's status in playBookActionsStatus
      const statusEntry = this.editingIncident.playBookActionsStatus.find(
        (status) => status.name === action.name && status.type === "containment"
      );
      return {
        name: action.name,
        category: action.category || "",
        status: statusEntry?.status || action.status || "None",
        evidence: action.evidence || [],
        canAddEvidence: statusEntry?.status !== "Done" // Icon shown if status is not "Done"
      };
    });
},

    filteredEradicationActions() {
      if (!this.selectedPlayBook?.actions?.eradications) return [];
      return this.selectedPlayBook.actions.eradications
        .filter((action) => action && typeof action === "object" && action.name)
        .map((action) => ({
          name: action.name,
          category: action.category || "",
          status: action.status || "None",
          evidence: action.evidence || [],
        }));
    },

    filteredRecoveryActions() {
      if (!this.selectedPlayBook?.actions?.recoveries) return [];
      return this.selectedPlayBook.actions.recoveries
        .filter((action) => action && typeof action === "object" && action.name)
        .map((action) => ({
          name: action.name,
          category: action.category || "",
          status: action.status || "None",
          evidence: action.evidence || [],
        }));
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

      const criteriaWithMaxPoints = this.incidentScoreCriteria.map(
        (criteria) => {
          const scores = this.scoringInputs[criteria.name] || [];
          const maxPoint =
            scores.length > 0
              ? Math.max(...scores.map((score) => Number(score.point)))
              : 0;
          return { name: criteria.name, maxPoint };
        }
      );

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
        return this.incidentScoreCriteria.some(
          (c) => c.name.trim() && c.description.trim()
        );
      } else if (this.currentWizardStep === 3) {
        return this.incidentClassifications.some(
          (c) =>
            c.priority.trim() &&
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
        return this.incidentScoreCriteria.some(
          (c) => c.name.trim() && c.description.trim()
        );
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
    selectedPlayBook() {
      const playBook = this.playBooks[this.selecd];
      return playBook && typeof playBook === "object" && playBook.name
        ? playBook
        : {};
    },
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
      if (!this.newAction.category) return false;

      if (this.newAction.type === "existing") {
        return !!this.newAction.actionId;
      } else {
        return !!this.newAction.name && this.newAction.name.trim() !== "";
      }
    },

    getScoringInputs() {
      return (criteriaName) => {
        return this.scoringInputs[criteriaName] || [];
      };
    },
  },
  mounted() {
    this.loggedInUser = Auth.USER;
    // Fetch incident settings first
    Promise.all([
      this.fetchContainments(),
      this.fetchEradications(),
      this.fetchRecoveries(),
      this.fetchCaseTypes(),
      this.fetchCaseDirections(),
      this.fetchAttacks(),
      this.fetchDetectedBy(),
      this.fetchIRAs(),
      this.fetchIncidentScores(),
      this.fetchUsers(),
      this.fetchTeams(),
    ]).then(() => {
      // Fetch playbooks after incident settings
      this.fetchPlayBooks();
    });
  },

  created() {
    this.tableColumns = [
      {
        title: this.$t("Summary"),
        data: "summary",
        defaultContent: "N/A",
      },
      {
        title: this.$t("Type"),
        data: "caseType",
        defaultContent: "N/A",
      },
      {
        title: this.$t("Direction"),
        data: "direction",
        defaultContent: "N/A",
      },
      {
        title: this.$t("Attack"),
        data: "attack",
        defaultContent: "N/A",
      },
      {
        title: this.$t("Detector"),
        data: "detectedBy",
        defaultContent: "N/A",
      },
      {
        title: this.$t("Detected At"),
        data: "detectedAt",
        defaultContent: "N/A",
      },
      {
        title: this.$t("Status"),
        data: "status",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "summary",
        label: this.$t("Summary"),
        type: "text",
        rules: "required",
        description: "Please enter the summary of the incident.",
        col: 12,
      },
      {
        name: "details",
        label: this.$t("Details"),
        type: "textarea",
        rules: "required",
        description: "Please enter the details of the incident.",
        col: 12,
      },
      {
        type: "options",
        name: "caseType",
        label: this.$t("Case Type"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select a case type.",
      },
      {
        type: "options",
        name: "direction",
        label: this.$t("Direction"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select a direction.",
      },
      {
        type: "options",
        name: "attack",
        label: this.$t("Attack"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select an attack.",
      },
      {
        type: "options",
        name: "detectedBy",
        label: this.$t("Detected By"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select a detector",
      },
      {
        name: "detectedAt",
        label: this.$t("Detected At"),
        type: "date",
        rules: "required",
        description: "Please select a date.",
        col: 6,
      },
      {
        type: "options",
        name: "status",
        label: this.$t("Status"),
        options: [
          { id: 1, name: "Open" },
          { id: 2, name: "Progress" },
          { id: 2, name: "Closed" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select an attack.",
      },
      {
        name: "createdBy",
        label: "",
        type: "hidden", // Hidden field
        rules: "", // Validation rule: required field
        description: "",
        col: 12, // Column size in the form layout
      },
    ];
  },

  watch: {
    "newPlayBook.responsibleType"(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.newPlayBook.responsibleId = []; // Clear selected responsibles when type changes
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
        (type, index) =>
          index !== currentIndex && type.trim().toLowerCase() === trimmedType
      );
    },
    trackCaseDirectionChange() {
      this.duplicateError = false; // Reset error on input change
    },
    isDuplicate(caseDirection, currentIndex) {
      const trimmedDirection = caseDirection.trim().toLowerCase();
      return this.caseDirectionInputs.some(
        (direction, index) =>
          index !== currentIndex &&
          direction.trim().toLowerCase() === trimmedDirection
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
      // Validate evidence input
      if (!this.isEvidenceValid) {
        await Swal.fire({
          icon: "warning",
          title: "Invalid Input",
          text: "Please provide a name and select a file.",
        });
        return;
      }

      // Validate editing incident exists
      if (!this.editingIncident || !this.editingIncident.id) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No incident selected for editing.",
        });
        return;
      }

      // Validate playbook is selected
      if (!this.selectedPlayBook) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No playbook selected for this incident.",
        });
        return;
      }

      try {
        // Determine which actions array to use based on tab
        let filteredActions = [];
        switch (this.selectedAction.tab) {
          case "containments":
            filteredActions = this.filteredContainmentActions;
            break;
          case "eradications":
            filteredActions = this.filteredEradicationActions;
            break;
          case "recoveries":
            filteredActions = this.filteredRecoveryActions;
            break;
          default:
            console.error(
              "Invalid selectedAction.tab:",
              this.selectedAction.tab
            );
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: "Invalid action category detected. Please refresh or contact support.",
            });
            return;
        }

        // Validate action index
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
            title: "Error",
            text: "The selected action could not be found. Please try again.",
          });
          return;
        }

        const action = filteredActions[actionIndex];

        // Create new evidence entry
        const newEvidenceEntry = {
          id: this.editingIncident.id,
          name: this.newEvidence.name.trim(),
          file: this.newEvidence.file,
          fileType: this.newEvidence.file.type,
          uploadedAt: new Date().toISOString(),
          actionTab: this.selectedAction.tab,
          actionName: action.name,
        };

        // Create new evidence array immutably
        const updatedEvidence = [
          ...(this.editingIncident.evidence || []), // Handle undefined/null evidence array
          newEvidenceEntry,
        ];

        // Create new incident payload
        const incidentPayload = {
          ...this.editingIncident,
          evidence: updatedEvidence,
        };

        // Save to API
        await this.api.from(incidentPayload);

        // Update local reference
        this.editingIncident = incidentPayload;

        // Reset form
        this.newEvidence = {
          name: "",
          file: null,
        };

        // Show success message
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Evidence added to incident and saved successfully.",
        });

        this.closeEvidenceModal();
      } catch (error) {
        console.error("Error saving evidence:", error);
        let errorMessage = "Failed to save evidence.";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    },
    updateActionStatus(tab, index, newStatus) {
      // Defensive checks
      if (!this.selectedPlayBook?.actions?.[tab]) {
        console.error(`No actions for tab ${tab} in selectedPlayBook`);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No valid playbook actions found.",
        });
        return;
      }

      const originalActions = this.selectedPlayBook.actions[tab];
      const filteredActions =
        this[`filtered${tab.charAt(0).toUpperCase() + tab.slice(1)}Actions`];

      if (
        !Array.isArray(filteredActions) ||
        index < 0 ||
        index >= filteredActions.length
      ) {
        console.error(
          `Invalid filteredActions or index ${index} for tab ${tab}`,
          {
            filteredActions,
            index,
          }
        );
        return;
      }

      const action = filteredActions[index];
      if (!action) {
        console.error(`Action at index ${index} is undefined for tab ${tab}`);
        return;
      }

      // Find the original action
      const originalIndex = originalActions.findIndex(
        (a) => a && a.name === action.name
      );

      if (originalIndex === -1) {
        console.error(`Original action not found for ${action.name} in ${tab}`);
        return;
      }

      // Update status reactively
      this.$set(originalActions[originalIndex], "status", newStatus);
      console.log(
        `Updated ${tab} action ${action.name} to status: ${newStatus}`
      );
    },

    async saveReviewActions() {
      if (!this.selectedPlayBook) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No playbook selected.",
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
            })),
            eradications: this.filteredEradicationActions.map((action) => ({
              ...action,
              evidence: action.evidence || [],
            })),
            recoveries: this.filteredRecoveryActions.map((action) => ({
              ...action,
              evidence: action.evidence || [],
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
          title: "Success",
          text: "Review actions saved successfully.",
        });
      } catch (error) {
        console.error("Error saving review actions:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save review actions.",
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
      } else if (this.loggedInUser.id === this.editingIncident.ownerId) {
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
          title: "Error",
          text: "Failed to fetch incidents.",
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
          title: "Error",
          text: "Failed to fetch risks.",
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
          title: "Error",
          text: "Failed to fetch assets.",
        });
      }
    },

    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    getCaseTypeName(caseTypeIndex) {
      const index = parseInt(caseTypeIndex, 10);
      return this.incidentCaseTypes[index] || "N/A";
    },

    getCaseDirectionName(caseDirectionIndex) {
      const index = parseInt(caseDirectionIndex, 10);
      return this.incidentCaseDirections[index] || "N/A";
    },

    getAttackName(attackIndex) {
      const index = parseInt(attackIndex, 10);
      return this.incidentAttacks[index] || "N/A";
    },

    getDetectorName(detectorIndex) {
      const index = parseInt(detectorIndex, 10);
      return this.incidentDetectedBy[index] || "N/A";
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
          title: "Invalid Input",
          text: "Please provide a name and select at least one responsible.",
        });
        return;
      }

      try {
        const responsibleNames = this.iraResponsibleOptions
          .filter((item) => this.newIRA.responsibleId.includes(item.id))
          .map((item) => item.name)
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
          responsibleType: "User",
          responsibleId: [],
        };

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "IRA saved successfully.",
        });
      } catch (error) {
        console.error("Error saving IRA:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save IRA.",
        });
      }
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
        title: "Are you sure?",
        text: "The IRA will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
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
          title: "Deleted!",
          text: "The IRA has been deleted.",
        });
      } catch (error) {
        console.error("Error deleting IRA:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete IRA.",
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
      if (this.incidentClassifications[index].value > this.maxTotalScore) {
        this.incidentClassifications[index].value = this.maxTotalScore;
      }
    },

    isPriorityUnique(priority, currentIndex) {
      return !this.incidentClassifications.some((classification, index) => {
        return (
          index !== currentIndex &&
          classification.priority &&
          classification.priority.trim().toLowerCase() ===
            priority.trim().toLowerCase()
        );
      });
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

    addClassificationInput() {
      this.incidentClassifications.push({
        priority: "",
        value: 0,
        color: "#000000",
        sla: "",
        description: "",
      });
    },

    removeClassificationInput(index) {
      this.incidentClassifications.splice(index, 1);
    },

    async saveClassifications() {
      const validClassifications = this.incidentClassifications
        .filter(
          (c) =>
            c.priority.trim() &&
            Number.isInteger(Number(c.value)) &&
            c.color &&
            Number.isInteger(Number(c.sla))
        )
        .map((c) => ({
          priority: c.priority.trim(),
          value: Number(c.value),
          color: c.color,
          sla: Number(c.sla),
          description: c.description.trim(),
        }));

      if (validClassifications.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Input",
          text: "Please enter valid classification details.",
        });
        return;
      }

      // Validate unique priority and value
      const prioritySet = new Set();
      const valueSet = new Set();
      for (const c of validClassifications) {
        const priorityKey = c.priority.trim().toLowerCase();
        const valueKey = Number(c.value);
        if (prioritySet.has(priorityKey) || valueSet.has(valueKey)) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Priority and value must be unique for each classification.",
          });
          return;
        }
        prioritySet.add(priorityKey);
        valueSet.add(valueKey);
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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch classifications.",
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

    async saveIncidentScore() {
      const validCriteria = this.incidentScoreCriteria
        .filter(
          (criteria) => criteria.name.trim() && criteria.description.trim()
        )
        .map((criteria) => ({
          name: criteria.name.trim(),
          description: criteria.description.trim(),
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

      const validClassifications = this.incidentClassifications
        .filter(
          (c) =>
            c.priority.trim() &&
            Number.isInteger(Number(c.value)) &&
            c.color &&
            Number.isInteger(Number(c.sla))
        )
        .map((c) => ({
          priority: c.priority.trim(),
          value: Number(c.value),
          color: c.color,
          sla: Number(c.sla),
          description: c.description.trim(),
        }));

      if (validCriteria.length > 0 || validClassifications.length > 0) {
        try {
          const criteriaPayload = {
            type: "incident-score-criteria",
            data: validCriteria,
          };
          const classificationsPayload = {
            type: "incident-classifications",
            data: validClassifications,
          };
          const responses = await Promise.all([
            validCriteria.length > 0
              ? this.apiIncidentSetting.from(criteriaPayload)
              : Promise.resolve(null),
            validClassifications.length > 0
              ? this.apiIncidentSetting.from(classificationsPayload)
              : Promise.resolve(null),
          ]);
          console.log("Saved incident score:", responses);
          this.incidentScores = validCriteria;
          this.incidentClassifications = validClassifications;
          this.scoringInputs = validCriteria.reduce((acc, criteria) => {
            acc[criteria.name] = criteria.scores;
            return acc;
          }, {});
          this.closeIncidentScoreWizard();
        } catch (error) {
          console.error("Error saving incident score:", error);
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Invalid Input",
          text: "No valid criteria or classifications defined.",
        });
      }
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
        return "Point must be greater than 0";
      }
      if (!this.isPointUnique(criteriaName, point, index)) {
        return "Point must be unique";
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
      const pointSet = new Set();
      let isValid = true;

      for (const input of inputs) {
        if (!input.level || !input.point) {
          isValid = false;
          continue;
        }

        const levelKey = input.level.trim().toLowerCase();
        const pointKey = Number(input.point);

        if (levelSet.has(levelKey) || pointSet.has(pointKey)) {
          isValid = false;
        }

        levelSet.add(levelKey);
        pointSet.add(pointKey);
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
      this.scoringInputs[criteriaName].push({ level: "", point: 0 });
    },

    removeScoringInput(criteriaName, index) {
      if (this.scoringInputs[criteriaName]) {
        this.scoringInputs[criteriaName].splice(index, 1);
      }
    },

    async saveScoring(criteriaName) {
      if (!this.scoringInputs[criteriaName]) {
        this.scoringInputs[criteriaName] = [];
      }

      // Validate inputs before saving
      if (!this.validateScoringInputs(criteriaName)) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Level names and points must be unique within the same criteria.",
        });
        return;
      }

      const validScores = this.scoringInputs[criteriaName]
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
        }));

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
                  Number(score.point) >= 0
              )
              .map((score) => ({
                level: score.level.trim(),
                point: Number(score.point),
              })),
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

        // Swal.fire({
        //   icon: "success",
        //   title: "Success",
        //   text: `Scoring for ${criteriaName} saved successfully.`,
        // });
      } catch (error) {
        console.error(`Error saving scoring for ${criteriaName}:`, error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: `Failed to save scoring for ${criteriaName}.`,
        // });
      }
    },
    openForm() {
      this.newItem.createdBy = Auth.USER.id; // Set the requestor_id to the current user's ID
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },
    response(data) {
      this.editingIncident = {
        ...data,
        assessment: {},
        caseType: data.caseType || "",
        reporterId: data.reporterId || "",
        ownerId: data.ownerId || "",
        playBookId: data.playBookId || "",
        id: data.id,
        relatedIncidents: data.relatedIncidents || [],
        relatedRisks: data.relatedRisks || [],
        relatedAssets: data.relatedAssets || [],
      };
      this.incidentScoreCriteria.forEach((criterion) => {
        this.editingIncident.assessment[criterion.name] =
          data.assessment?.[criterion.name] || criterion.scores[0]?.point || 0;
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
        });
      });

      // Collect eradication actions
      this.filteredEradicationActions.forEach((action) => {
        actions.push({
          name: action.name,
          type: "eradication",
          status: action.status || "None",
        });
      });

      // Collect recovery actions
      this.filteredRecoveryActions.forEach((action) => {
        actions.push({
          name: action.name,
          type: "recovery",
          status: action.status || "None",
        });
      });

      return actions;
    },
    async saveIncident() {
      try {
        // Validate assessment data
        if (
          !this.editingIncident.assessment ||
          Object.keys(this.editingIncident.assessment).length === 0
        ) {
          await Swal.fire({
            icon: "warning",
            title: "Invalid Assessment",
            text: "Assessment data is missing or empty.",
          });
          return;
        }

        // Ensure all incident score criteria have a corresponding assessment value
        const missingCriteria = this.incidentScoreCriteria.filter(
          (criterion) =>
            this.editingIncident.assessment[criterion.name] === undefined
        );
        if (missingCriteria.length > 0) {
          await Swal.fire({
            icon: "warning",
            title: "Incomplete Assessment",
            text: `Please provide scores for: ${missingCriteria
              .map((c) => c.name)
              .join(", ")}.`,
          });
          return;
        }

        // Extract only IDs from related assets and risks
        const relatedAssetIds = this.editingIncident.relatedAssets.map(
          (asset) => asset.id
        );
        const relatedRiskIds = this.editingIncident.relatedRisks.map(
          (risk) => risk.id
        );

        // Prepare the assessment payload
        const assessmentPayload = {
          ...this.editingIncident.assessment, // Include individual criterion scores
          totalScore: this.totalAssessmentScore, // Include total score
        };

        // Collect playBookActionsStatus from actions
        const playBookActionsStatus = this.collectPlayBookActionsStatus();

        // Create the incident payload
        const payload = {
          ...this.editingIncident,
          status: this.editingIncident.status,
          ResponseCaseType: this.editingIncident.caseType,
          file: this.editingIncident.file,
          reporterId: this.editingIncident.reporterId,
          ownerId: this.editingIncident.ownerId,
          playBookId: this.editingIncident.playBookId,
          relatedIncidents: this.editingIncident.relatedIncidents,
          relatedRisks: relatedRiskIds,
          relatedAssets: relatedAssetIds,
          sourceTag: this.editingIncident.sourceTag,
          destinationTag: this.editingIncident.destinationTag,
          assessment: assessmentPayload, // Include assessment with total score
          playBookActionsStatus: playBookActionsStatus, // Include playBookActionsStatus
        };

        // Save the incident
        const response = await this.api.from(payload);
        console.log("Updated incident:", response);

        this.closeIncidentEditModal();
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Error updating incident:", error);
        let errorMessage = "Failed to update incident.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    },
    closeIncidentEditModal() {
      this.isIncidentEditModalOpen = false;
      this.editingIncident = {};
      this.currentEditWizardStep = 1;
    },

    openConfigurationsModal() {
      this.isConfigurationsModalOpen = true;
    },

    closeConfigurationsModal() {
      this.isConfigurationsModalOpen = false;
      this.caseTypeInputs = [];
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
      const lastCriteria =
        this.incidentScoreCriteria[this.incidentScoreCriteria.length - 1];
      if (
        lastCriteria &&
        this.isDuplicateCriteriaName(
          lastCriteria.name,
          this.incidentScoreCriteria.length - 1
        )
      ) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Criteria Name",
          text: "Criteria names must be unique.",
        });
        return;
      }
      this.incidentScoreCriteria.push({ name: "", description: "" });
    },
    removeCriteriaInput(index) {
      this.incidentScoreCriteria.splice(index, 1);
      this.$forceUpdate(); // Ensure UI updates
    },

    async saveCriteria() {
      const validCriteria = this.incidentScoreCriteria.filter(
        (criteria) => criteria.name.trim() && criteria.description.trim()
      );
      if (validCriteria.length > 0) {
        // Check for duplicates before saving
        const lowercasedNames = validCriteria.map((c) =>
          c.name.trim().toLowerCase()
        );
        const uniqueNames = new Set(lowercasedNames);
        if (uniqueNames.size !== validCriteria.length) {
          Swal.fire({
            icon: "error",
            title: "Duplicate Criteria Name",
            text: "Criteria names must be unique.",
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
          this.incidentScores = validCriteria;
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Criteria saved successfully.",
          });
        } catch (error) {
          console.error("Error saving incident score criteria:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to save criteria.",
          });
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Invalid Input",
          text: "Please enter valid criteria with both name and description.",
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

    // async saveIncidentScore() {
    //   const validCriteria = this.incidentScoreCriteria
    //     .filter(
    //       (criteria) => criteria.name.trim() && criteria.description.trim()
    //     )
    //     .map((criteria) => ({
    //       name: criteria.name.trim(),
    //       description: criteria.description.trim(),
    //       scores: (this.scoringInputs[criteria.name] || [])
    //         .filter(
    //           (score) =>
    //             score &&
    //             typeof score === "object" &&
    //             score.level &&
    //             score.level.trim() &&
    //             Number.isInteger(Number(score.point)) &&
    //             Number(score.point) >= 0
    //         )
    //         .map((score) => ({
    //           level: score.level.trim(),
    //           point: Number(score.point),
    //         })),
    //     }));
    //   if (validCriteria.length > 0) {
    //     try {
    //       const payload = {
    //         type: "incident-score-criteria",
    //         data: validCriteria,
    //       };
    //       const response = await this.apiIncidentSetting.from(payload);
    //       console.log("Saved incident score:", response);
    //       this.incidentScores = validCriteria;
    //       // Update scoringInputs to reflect saved data
    //       this.scoringInputs = validCriteria.reduce((acc, criteria) => {
    //         acc[criteria.name] = criteria.scores;
    //         return acc;
    //       }, {});
    //       // Swal.fire({
    //       //   icon: "success",
    //       //   title: "Success",
    //       //   text: "Incident score wizard completed and saved successfully.",
    //       // });
    //       this.closeIncidentScoreWizard();
    //     } catch (error) {
    //       console.error("Error saving incident score:", error);
    //       // Swal.fire({
    //       //   icon: "error",
    //       //   title: "Error",
    //       //   text: "Failed to save incident score.",
    //       // });
    //     }
    //   } else {
    //     // Swal.fire({
    //     //   icon: "warning",
    //     //   title: "Invalid Input",
    //     //   text: "No valid criteria defined.",
    //     // });
    //   }
    // },

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

    editAction(actionIndex) {
      const action = this.validActions[actionIndex];
      if (!action) {
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Cannot edit invalid action.",
        // });
        return;
      }

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
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Could not find original action to edit.",
        // });
        return;
      }

      this.isEditingAction = true;
      this.editingActionIndex = originalIndex;

      this.newAction = {
        type: "new",
        actionId: null,
        name: action.name || "",
        category: action.category || this.findCategoryForAction(action.name),
      };

      this.isActionModalOpen = true;
    },

    findCategoryForAction(actionName) {
      if (!actionName) return "";

      const incidentDataMap = {
        containments: this.incidentContainments,
        eradications: this.incidentEradications,
        recoveries: this.incidentRecoveries,
      };

      const incidentData = incidentDataMap[this.activeActionTab] || [];

      for (const category of incidentData) {
        if (category.actions && category.actions.includes(actionName)) {
          return category.category;
        }
      }

      return "";
    },

    async saveAction() {
      if (!this.newAction.category || !this.isActionValid) {
        // Swal.fire({
        //   icon: "error",
        //   title: "Invalid Action",
        //   text: "Please select a valid category and action.",
        // });
        return;
      }

      let actionName;
      if (this.newAction.type === "existing") {
        const selectedOption = this.filteredActionOptions.find(
          (option) => option.id === this.newAction.actionId
        );
        actionName = selectedOption?.name;
      } else {
        actionName = this.newAction.name.trim();
      }

      if (!actionName) {
        // Swal.fire({
        //   icon: "error",
        //   title: "Invalid Action",
        //   text: "Action name cannot be empty.",
        // });
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

      if (this.isEditingAction && this.editingActionIndex !== null) {
        if (this.editingActionIndex >= currentActions.length) {
          // Swal.fire({
          //   icon: "error",
          //   title: "Error",
          //   text: "Invalid action index for editing.",
          // });
          return;
        }

        currentActions[this.editingActionIndex] = {
          name: actionName,
          category: this.newAction.category,
        };
      } else {
        currentActions.push({
          name: actionName,
          category: this.newAction.category,
        });
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

        // Swal.fire({
        //   icon: "success",
        //   title: "Success",
        //   text: this.isEditingAction
        //     ? "Action updated successfully."
        //     : "Action added successfully.",
        // });
      } catch (error) {
        console.error("Error saving play book actions:", error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Failed to save playbook actions.",
        // });
        return;
      }

      this.closeActionModal();
    },

    async deleteAction(category, actionToDelete) {
      if (!actionToDelete) {
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Cannot delete null action.",
        // });
        return;
      }

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
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

    openPlayBookModal() {
      this.isPlayBookModalOpen = true;
      this.newPlayBook = {
        name: "",
        responsibleType: "User",
        responsibleId: [],
      };
    },

    editPlayBook(index) {
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

    async deletePlayBook(index) {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This playbook will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;
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
        this.users = await this.userApi.getAll({ select: "id|full_name" });
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
        return;
      }
      try {
        const responsibleNames = this.responsibleOptions
          .filter((item) => this.newPlayBook.responsibleId.includes(item.id))
          .map((item) => item.name)
          .join(", ");

        const playBook = {
          name: this.newPlayBook.name,
          responsibleType: this.newPlayBook.responsibleType,
          responsibleId: this.newPlayBook.responsibleId,
          responsibleName: responsibleNames,
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
        this.closePlayBookModal();
      } catch (error) {
        console.error("Error saving play book:", error);
      }
    },

    async fetchContainments() {
      try {
        const response = await this.apiIncidentSetting.getAll();
        const containmentData = response.find(
          (item) => item.type === "incident-containments"
        );
        if (containmentData && containmentData.data) {
          this.incidentContainments = Array.isArray(containmentData.data)
            ? containmentData.data.map((item) =>
                typeof item === "string"
                  ? { category: item, actions: [] }
                  : {
                      category: item.category || "",
                      actions: (item.actions || []).filter(
                        (a) => a !== null && a !== ""
                      ),
                    }
              )
            : [];
          this.containmentInputs = this.incidentContainments.map(
            (item) => item.category || ""
          );
          this.containments = this.incidentContainments.map(
            (item) => item.category || ""
          );
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
          this.incidentEradications = Array.isArray(eradicationData.data)
            ? eradicationData.data.map((item) =>
                typeof item === "string"
                  ? { category: item, actions: [] }
                  : {
                      category: item.category || "",
                      actions: (item.actions || []).filter(
                        (action) => action !== null && action !== ""
                      ),
                    }
              )
            : [];
          this.eradicationInputs = this.incidentEradications.map(
            (item) => item.category || ""
          );
          this.eradications = this.incidentEradications.map(
            (item) => item.category || ""
          );
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
          this.incidentRecoveries = Array.isArray(recoveryData.data)
            ? recoveryData.data.map((item) =>
                typeof item === "string"
                  ? { category: item, actions: [] }
                  : {
                      category: item.category || "",
                      actions: (item.actions || []).filter(
                        (action) => action !== null && action !== ""
                      ),
                    }
              )
            : [];
          this.recoveryInputs = this.incidentRecoveries.map(
            (item) => item.category || ""
          );
          this.recoveries = this.incidentRecoveries.map(
            (item) => item.category || ""
          );
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

    removeContainmentInput(index) {
      this.containmentInputs.splice(index, 1);
    },

    async saveContainments() {
      const validContainments = this.containmentInputs
        .filter((category) => typeof category === "string" && category.trim())
        .map((category) => ({
          category,
          actions:
            this.incidentContainments.find((c) => c.category === category)
              ?.actions || [],
        }))
        .map((item) => ({
          ...item,
          actions: item.actions.filter((a) => a !== null && a !== ""),
        }));
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

    removeEradicationInput(index) {
      this.eradicationInputs.splice(index, 1);
    },

    async saveEradications() {
      const validEradications = this.eradicationInputs
        .filter((category) => typeof category === "string" && category.trim())
        .map((category) => ({
          category,
          actions:
            this.incidentEradications.find((c) => c.category === category)
              ?.actions || [],
        }));
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
          actions:
            this.incidentRecoveries.find((c) => c.category === category)
              ?.actions || [],
        }));
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
          this.incidentCaseTypes = caseTypeData[0].data;
          this.caseTypeInputs = [...caseTypeData[0].data];
          this.caseTypes = [...caseTypeData[0].data];
          console.log("caseTypes", this.caseTypes);
          this.fromFields.find((field) => field.name === "caseType").options =
            caseTypeData[0].data;
        }
      } catch (error) {
        console.error("Error fetching case types:", error);
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
          title: "Error",
          text: "Failed to fetch site locations.",
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
      const lastInput = this.detectedByInputs[this.detectedByInputs.length - 1];
      if (lastInput && lastInput.trim()) {
        if (
          this.isDetectedByDuplicate(
            lastInput,
            this.detectedByInputs.length - 1
          )
        ) {
          this.duplicateDetectedByError = true;
          return;
        }
      }

      this.duplicateDetectedByError = false; // Reset error if we are able to add
      this.detectedByInputs.push("");
    },

    removeDetectedByInput(index) {
      this.detectedByInputs.splice(index, 1);
      // After removing, reset the global error.
      // The per-input styling will update if other duplicates still exist.
      this.duplicateDetectedByError = false;
    },
    trackDetectedByChange() {
      this.duplicateDetectedByError = false; // Reset error on input change
    },

    isDetectedByDuplicate(detectedByValue, currentIndex) {
      if (!detectedByValue) return false; // Don't consider empty strings as duplicates for styling
      const trimmedValue = detectedByValue.trim().toLowerCase();
      return this.detectedByInputs.some(
        (input, index) =>
          index !== currentIndex &&
          input &&
          input.trim().toLowerCase() === trimmedValue
      );
    },
    async saveDetectedBy() {
      const validDetectedBy = this.detectedByInputs
        .map((detectedBy) => detectedBy.trim())
        .filter((detectedBy) => detectedBy);

      // Check for duplicates before saving
      const lowercasedDetectedBy = validDetectedBy.map((item) =>
        item.toLowerCase()
      );
      const uniqueDetectedBySet = new Set(lowercasedDetectedBy);
      if (uniqueDetectedBySet.size !== validDetectedBy.length) {
        this.duplicateDetectedByError = true;
        return;
      }

      this.duplicateDetectedByError = false; // Clear error if no duplicates found

      if (validDetectedBy.length > 0) {
        try {
          const payload = {
            type: "incident-detected-by",
            data: Array.from(uniqueDetectedBySet),
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved detected by:", response);
          this.incidentDetectedBy = Array.from(uniqueDetectedBySet);
          this.detectedBy = Array.from(uniqueDetectedBySet);
        } catch (error) {
          console.error("Error saving detected by:", error);
          // Handle server-side errors if necessary
        }
      } else {
        this.incidentDetectedBy = [];
        this.detectedBy = [];
        console.log("No valid 'detected by' entries to save.");
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
      if (!attackValue) return false; // Don't consider empty strings as duplicates for styling
      const trimmedAttack = attackValue.trim().toLowerCase();
      return this.attackInputs.some(
        (input, index) =>
          index !== currentIndex &&
          input &&
          input.trim().toLowerCase() === trimmedAttack
      );
    },
    async saveAttacks() {
      const validAttacks = this.attackInputs
        .map((attack) => attack.trim())
        .filter((attack) => attack);

      // Check for duplicates before saving
      const lowercasedAttacks = validAttacks.map((attack) =>
        attack.toLowerCase()
      );
      const uniqueAttacks = new Set(lowercasedAttacks);
      if (uniqueAttacks.size !== validAttacks.length) {
        this.duplicateAttackError = true;
        // Optionally, identify which ones are duplicates to highlight them
        // For now, the global error message and individual input styling should help
        return;
      }

      this.duplicateAttackError = false; // Clear error if no duplicates found

      if (validAttacks.length > 0) {
        try {
          const payload = {
            type: "incident-attacks",
            data: Array.from(uniqueAttacks), // Send the unique, trimmed attacks
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved attacks:", response);
          this.incidentAttacks = Array.from(uniqueAttacks); // Store the saved unique attacks
          this.attacks = Array.from(uniqueAttacks); // Assuming 'attacks' is for display/elsewhere
        } catch (error) {
          console.error("Error saving attacks:", error);
        }
      } else {
        this.incidentAttacks = [];
        this.attacks = [];
        console.log("No valid attacks to save.");
      }
    },

    addAttackInput() {
      // Check if the last input (if it exists and is not empty) is a duplicate
      const lastInput = this.attackInputs[this.attackInputs.length - 1];
      if (lastInput && lastInput.trim()) {
        if (this.isAttackDuplicate(lastInput, this.attackInputs.length - 1)) {
          this.duplicateAttackError = true;
          return;
        }
      }

      this.duplicateAttackError = false; // Reset error if we are able to add
      this.attackInputs.push("");
    },

    removeAttackInput(index) {
      this.attackInputs.splice(index, 1);
      this.duplicateAttackError = false;
    },
    addCaseTypeInput() {
      const lastInput =
        this.caseTypeInputs[this.caseTypeInputs.length - 1]?.trim();
      if (
        lastInput &&
        this.isDuplicate(lastInput, this.caseTypeInputs.length - 1)
      ) {
        this.duplicateError = true;
        return;
      }
      this.duplicateError = false;
      this.caseTypeInputs.push("");
    },

    addCaseDirectionInput() {
      const lastInput =
        this.caseDirectionInputs[this.caseDirectionInputs.length - 1]?.trim();
      if (
        lastInput &&
        this.isDuplicate(lastInput, this.caseDirectionInputs.length - 1)
      ) {
        this.duplicateError = true;
        return;
      }
      this.duplicateError = false;
      this.caseDirectionInputs.push("");
    },
    removeCaseTypeInput(index) {
      this.caseTypeInputs.splice(index, 1);
      this.duplicateError = false;
    },

    removeCaseDirectionInput(index) {
      this.caseDirectionInputs.splice(index, 1);
      this.duplicateError = false;
    },

    async saveCaseTypes() {
      const validCaseTypes = this.caseTypeInputs
        .map((type) => type.trim())
        .filter((type) => type);

      // Check for duplicates
      const uniqueCaseTypes = new Set(
        validCaseTypes.map((type) => type.toLowerCase())
      );
      if (uniqueCaseTypes.size !== validCaseTypes.length) {
        this.duplicateError = true;
        return;
      }

      if (validCaseTypes.length > 0) {
        try {
          const payload = {
            type: "incident-case-type",
            data: validCaseTypes,
          };
          const response = await this.apiIncidentSetting.from(payload);
          console.log("Saved case types:", response);
          this.incidentCaseTypes = validCaseTypes;
          this.caseTypes = validCaseTypes;
          this.duplicateError = false;
        } catch (error) {
          console.error("Error saving case types:", error);
        }
      }
    },

    async saveCaseDirections() {
      const validCaseDirections = this.caseDirectionInputs
        .map((direction) => direction.trim())
        .filter((direction) => direction);

      // Check for duplicates
      const uniqueCaseDirections = new Set(
        validCaseDirections.map((direction) => direction.toLowerCase())
      );
      if (uniqueCaseDirections.size !== validCaseDirections.length) {
        this.duplicateError = true;
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

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  width: 90% !important;
  height: 95vh;
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
  width: 100%;
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
  transition: color 0.4s ease, font-weight 0.4s ease;
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
  background-color: #44225c;
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
  color: #44225c;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.875rem;
}

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
}

.sub-nav-tabs {
  display: inline-flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #f8f9fa;
}

.sub-nav-tabs .nav-item {
  margin-right: 8px;
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
  height: auto;
  max-height: 80vh;
}

/* Style for table */
.table {
  margin-top: 1rem;
  width: 100%;
  border-collapse: collapse;
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
  color: #44225c;
}

.table td {
  border-bottom: 1px solid #e5e7eb;
}

.table td:last-child {
  display: flex;
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
  color: #44225c;
  font-weight: 500;
}

.vue-form-wizard .wizard-nav-pills li.active a {
  background-color: #44225c;
  color: white;
  border-radius: 4px;
}

.vue-form-wizard .wizard-btn {
  background-color: #44225c;
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
  border-color: #44225c;
  background-color: #44225c;
  color: #fff;
}

.step-label {
  margin-top: 5px;
  font-size: 0.9rem;
  color: #666;
  transition: color 0.3s ease;
}

.step.active .step-label {
  color: #44225c;
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
  color: #44225c;
  font-size: 1rem;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.score-section,
.classify-section {
  background: linear-gradient(145deg, #ffffff, #f6f8fa);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.score-section:hover,
.classify-section:hover {
  transform: translateY(-3px);
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
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.criteria-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
  background: linear-gradient(90deg, #5a2d7a, #44225c);
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.score-table tbody tr,
.classify-table tbody tr {
  transition: background-color 0.2s ease;
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
  background: linear-gradient(90deg, #5a2d7a, #44225c);
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
  background-color: #44225c;
  border-color: #44225c;
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
  background: linear-gradient(90deg, #5a2d7a, #44225c);
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
  border-color: #44225c;
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
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.assessment-step .table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background: linear-gradient(90deg, #5a2d7a, #44225c);
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
  border-color: #44225c;
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
  color: #44225c;
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
  font-weight: 900;
  color: #44225c;
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
  border-color: #44225c;
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
  border-color: #44225c;
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
  border-collapse: collapse;
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
  background: linear-gradient(90deg, #5a2d7a, #44225c);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
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
  color: #44225c;
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
@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>

<style>
.vs__selected {
  background: #44225c !important;
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
</style>
