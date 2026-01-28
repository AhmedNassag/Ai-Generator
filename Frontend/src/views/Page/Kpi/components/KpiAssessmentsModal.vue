<template>
  <!-- Start Assessments Modal -->
  <div class="modal fade" id="ViewModal" tabindex="-1" aria-labelledby="ViewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="ViewModalLabel">{{ $t('kpi.Assessments Details') }}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="container">
            <div class="row">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th class="text-center">{{ $t('kpi.Kpi Value') }}</th>
                    <th class="text-center">{{ $t('kpi.Department') }}</th>
                    <th class="text-center">{{ $t('kpi.Department Value') }}</th>
                    <th class="text-center">{{ $t('kpi.CreatedBy') }}</th>
                    <th class="text-center">{{ $t('kpi.Initiated Date') }}</th>
                    <th class="text-center">{{ $t('kpi.Assessment By') }}</th>
                    <th class="text-center">{{ $t('kpi.Assessment Date') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(assessment, index) in kpiAssessmentsData" :key="index">
                    <td class="text-center">{{ assessment?.kpi_value }}</td>
                    <td class="text-center">{{ getDepartmentName(assessment?.department_id) }}</td>
                    <td class="text-center">{{ assessment?.value }}</td>
                    <td class="text-center">
                      <AvatarGroup
                        :users="getMemberUsers(assessment.created_by)"
                        :maxVisible="3"
                        :spacing="20"
                      />
                    </td>
                    <td class="text-center">{{ assessment?.created_date }}</td>
                    <td class="text-center">
                      <AvatarGroup
                        :users="getMemberUsers(assessment.assesment_by)"
                        :maxVisible="3"
                        :spacing="20"
                      />
                    </td>
                    <td class="text-center">{{ assessment?.assesment_date }}</td>
                  </tr>
                  <tr v-if="kpiAssessmentsData.length === 0">
                    <td class="text-center" colspan="7">{{ $t('kpi.No Data Found') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">{{ $t('kpi.Close') }}</button>
        </div>
      </div>
    </div>
  </div>
  <!-- End Assessments Modal -->
</template>

<script>
import AvatarGroup from "@/components/AvatarGroup.vue";

export default {
  name: "KpiAssessmentsModal",

  components: {
    AvatarGroup,
  },

  props: {
    kpiAssessmentsData: {
      type: Array,
      default: () => [],
    },
    getMemberUsers: {
      type: Function,
      required: true,
    },
    getDepartmentName: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}

.btn-danger {
  color: white !important;
}
</style>
