<template>
  <!-- Start ReAssign Modal -->
  <div class="modal fade" id="ViewModal" tabindex="-1" aria-labelledby="ViewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="ViewModalLabel">{{ $t('kpiassessment.ReAssign Assessment') }}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="container">
            <div class="row">
              <form action="">
                <div class="form-group">
                  <label for="assesment_by">{{ $t('kpiassessment.Select User') }}</label>
                  <UserSelect
                    v-model="localAssesmentBy"
                    :placeholder="$t('kpiassessment.Select One')"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-success" @click="handleSave">{{ $t('kpiassessment.Save') }}</button>
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">{{ $t('kpiassessment.Close') }}</button>
        </div>
      </div>
    </div>
  </div>
  <!-- End ReAssign Modal -->
</template>

<script>
import UserSelect from "@/components/UserSelect.vue";

export default {
  name: "ReAssignModal",

  components: {
    UserSelect,
  },

  props: {
    assesmentBy: {
      type: [Number, null],
      default: null,
    },
  },

  emits: ["save", "update:assesmentBy"],

  data() {
    return {
      localAssesmentBy: null,
    };
  },

  watch: {
    assesmentBy: {
      handler(newVal) {
        this.localAssesmentBy = newVal;
      },
      immediate: true,
    },
    localAssesmentBy(newVal) {
      this.$emit("update:assesmentBy", newVal);
    },
  },

  methods: {
    handleSave() {
      this.$emit("save");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
}

.modal-body .form-group {
  margin-bottom: 15px;
}

.modal-body .btn-primary {
  background-color: #44225c;
  border-color: #44225c;
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

.btn-success {
  color: white !important;
}
</style>
