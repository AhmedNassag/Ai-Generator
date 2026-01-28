<template>
  <!-- Asset value calculation modal -->
  <Modal v-model="isOpen" :title="$t('asset.asset_value_calculation')" size="fullpage" :showFooter="true"
    :hasSubmit="true" @close="handleClose" @submit="handleSubmit">
    <div>
      <!-- Custom Tabs Component -->
      <TabsComponent v-model="activeTab" :tabs="tabsList" @tab-change="onTabChange" />

      <!-- Tab Content -->
      <div class="tab-content pt-3">
        <!-- Confidentiality Tab -->
        <div v-show="activeTab === 'confidentiality'" class="mt-2">
          <form @submit.prevent>
            <div id="confidentiality-rows">
              <div v-for="(confidentiality, index) in confidentialityQuestions" :key="index"
                class="row align-items-center confidentiality">
                <div class="col-md-7 col-12">
                  <div class="mb-1">
                    <input type="text" class="form-control" v-model="confidentiality.question" disabled />
                  </div>
                </div>
                <div class="col-md-3 col-12 d-flex gap-3">
                  <div class="d-flex align-items-center">
                    <select v-model="selectedConfidentialityKeys[index]" class="form-select form-select-sm"
                      style="width: 20rem">
                      <option v-for="(value, key) in confidentiality.answers" :key="key" :value="key">
                        {{ key }}
                      </option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center">
                    <input type="text" class="form-control" disabled style="width: 18rem"
                      :value="confidentiality.answers[selectedConfidentialityKeys[index]]" />
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="col-md-9">
                <div class="mb-1">
                  <input type="text" class="form-control"
                    :value="$t('asset.total_confidentiality_number', { value: totalConfidentialitySum })" disabled />
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Integrity Tab -->
        <div v-show="activeTab === 'integrity'" class="mt-2">
          <form @submit.prevent>
            <div id="integrity-rows">
              <div v-for="(integrity, index) in integrityQuestions" :key="index"
                class="row align-items-center integrity">
                <div class="col-md-7 col-12">
                  <div class="mb-1">
                    <input type="text" class="form-control" v-model="integrity.question" disabled />
                  </div>
                </div>
                <div class="col-md-3 col-12 d-flex gap-3">
                  <div class="d-flex align-items-center">
                    <select v-model="selectedIntegrityKeys[index]" class="form-select form-select-sm"
                      style="width: 20rem">
                      <option v-for="(value, key) in integrity.answers" :key="key" :value="key">
                        {{ key }}
                      </option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center">
                    <input type="text" class="form-control" disabled style="width: 18rem"
                      :value="integrity.answers[selectedIntegrityKeys[index]]" />
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="col-md-9">
                <div class="mb-1">
                  <input type="text" class="form-control"
                    :value="$t('asset.total_integrity_number', { value: totalIntegritySum })" disabled />
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Availability Tab -->
        <div v-show="activeTab === 'availability'" class="mt-2">
          <div id="availability-rows">
            <div class="row align-items-center availability mb-3">
              <div class="col-md-5">
                <div class="d-flex align-items-start gap-2 mb-2"
                  v-for="(question, qIndex) in availabilityQuestions[0].question" :key="qIndex">
                  <div class="flex-grow-1">
                    <input type="text" class="form-control form-control-sm" :value="question" disabled />
                  </div>
                </div>
              </div>

              <div class="col-md-7">
                <div class="d-flex align-items-start gap-2 mb-2"
                  v-for="(answer, aIndex) in availabilityQuestions[0].answers" :key="aIndex">
                  <div class="flex-grow-1">
                    <select class="form-select form-select-sm" style="width: 45rem"
                      v-model="selectedAvailabilityKeys[aIndex]">
                      <option v-for="(answerSelect, sIndex) in availabilityQuestions[0].answers" :key="sIndex"
                        :value="answerSelect.value">
                        {{ answerSelect.answer }}
                      </option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center">
                    <input type="text" class="form-control" disabled style="width: 12rem"
                      :value="selectedAvailabilityKeys[aIndex]" />
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="col-md-9">
                <div class="mb-1">
                  <input type="text" class="form-control"
                    :value="$t('asset.total_availability_number', { value: averageAvailabilitySum })" disabled />
                </div>
              </div>

              <div class="col-md-9">
                <div class="mb-1">
                  <input type="text" class="form-control"
                    :value="$t('asset.business_impact_analysis', { value: businessImpactSum })" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal.vue';
import TabsComponent from '@/components/TabsComponent.vue';
import AssetValueQuestion from "@/API/AssetValueQuestion/AssetValueQuestion";

export default {
  name: 'AssetValueCalculationModal',

  components: {
    Modal,
    TabsComponent,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'submit'],

  setup() {
    const assetvaluequestionApi = new AssetValueQuestion();
    return {
      assetvaluequestionApi,
    };
  },

  data() {
    return {
      activeTab: 'confidentiality',
      tabsList: [
        {
          id: 'confidentiality',
          label: this.$t('asset.confidentiality')
        },
        {
          id: 'integrity',
          label: this.$t('asset.integrity')
        },
        {
          id: 'availability',
          label: this.$t('asset.availability')
        }
      ],
      confidentialityQuestions: [],
      integrityQuestions: [],
      availabilityQuestions: [],
      selectedConfidentialityKeys: {}, // Stores selected Confidentiality keys per question
      selectedIntegrityKeys: {}, // Stores selected Integrity keys per question
      selectedAvailabilityKeys: [], // Stores selected Availability keys per question
      availabilitySum: 0,
    };
  },

  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },

    totalConfidentialitySum() {
      return this.confidentialityQuestions.reduce(
        (sum, confidentiality, index) => {
          let selectedValue =
            confidentiality.answers[this.selectedConfidentialityKeys[index]];
          return sum + (parseFloat(selectedValue) || 0)
        },
        0
      );
    },

    totalIntegritySum() {
      return this.integrityQuestions.reduce((sum, integrity, index) => {
        let selectedValue =
          integrity.answers[this.selectedIntegrityKeys[index]];
        return sum + (parseFloat(selectedValue) || 0)
      }, 0);
    },

    averageAvailabilitySum() {
      if (this.selectedAvailabilityKeys.length === 0) return 0;
      const total = this.selectedAvailabilityKeys.reduce(
        (sum, value) => sum + Number(value),
        0
      );
      const average = total / this.selectedAvailabilityKeys.length;
      return Math.round(average); // Round to the nearest whole number
    },

    businessImpactSum() {
      const maxConfidentialityIntegrity = Math.max(
        this.totalIntegritySum,
        this.totalConfidentialitySum
      );
      return Math.max(maxConfidentialityIntegrity, this.averageAvailabilitySum);
    },
  },

  async mounted() {
    await this.loadAssetQuestions();
  },

  methods: {
    handleClose() {
      this.isOpen = false;
    },

    handleSubmit() {
      this.$emit('submit', {
        businessImpactSum: this.businessImpactSum,
        selectedConfidentialityKeys: this.selectedConfidentialityKeys,
        selectedIntegrityKeys: this.selectedIntegrityKeys,
        selectedAvailabilityKeys: this.selectedAvailabilityKeys
      });
      this.isOpen = false;
    },

    async loadAssetQuestions() {
      try {
        const response = await this.assetvaluequestionApi.getAll();

        // Reset the arrays to avoid duplicate entries
        this.confidentialityQuestions = [];
        this.integrityQuestions = [];
        this.availabilityQuestions = [];

        // Loop through the response and categorize questions
        response.forEach((question) => {
          if (question.question_category === 1) {
            this.confidentialityQuestions.push(question);
          } else if (question.question_category === 2) {
            this.integrityQuestions.push(question);
          } else if (question.question_category === 3) {
            this.availabilityQuestions.push(question);
          }
        });

        console.log(this.confidentialityQuestions);
        console.log(this.integrityQuestions);
        console.log(this.availabilityQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    },

    onTabChange(newTab) {
      this.activeTab = newTab;
    },

    // Method to calculate the sum (or perform any other action)
    updateAvailabilitySum() {
      this.availabilitySum = this.selectedAvailabilityKeys.reduce(
        (sum, value) => sum + Number(value),
        0
      );
    },
  },

  watch: {
    selectedAvailabilityKeys: {
      handler(newValues) {
        // console.log("Updated selectedAvailabilityKeys:", newValues);
        this.updateAvailabilitySum();
      },
      deep: true, // Ensures nested changes are detected
    },
  },
};
</script>

<style scoped>
/* Basic styling for the modal overlay and content */
.tab-content {
  padding-top: 1rem;
}
</style>