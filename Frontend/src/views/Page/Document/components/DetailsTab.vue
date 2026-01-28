<template>
  <div class="document-details">
    <!-- Preview Button -->
    <div class="preview-actions mb-3">
      <button @click="openPreview" class="btn btn-primary">
        <i class="fas fa-file-pdf me-2"></i>
        {{ $t('documentdetails.preview') }}
      </button>
    </div>

    <div class="row g-3">
      <!-- Content -->
      <div class="col-md-12">
        <div class="detail-item card p-3">
          <strong class="text-muted">{{ $t("documentdetails.content") }}</strong>
          <div class="content-preview mt-2 p-2 border rounded" v-html="document?.content || 'N/A'"></div>
        </div>
      </div>

      <!-- Notes -->
      <div class="col-md-12">
        <div class="detail-item card p-3">
          <strong class="text-muted">{{ $t("documentdetails.notes") }}</strong>
          <div class="content-preview mt-2 p-2 border rounded" v-html="document?.notes || 'N/A'"></div>
        </div>
      </div>

      <!-- File -->
      <div class="col-md-12">
        <div class="detail-item card p-3">
          <strong class="text-muted">{{ $t("documentdetails.file") }}</strong>
          <div class="mt-2">
            <a v-if="document.filepath" :href="document.file_url"
              class="btn btn-sm btn-outline-primary me-1" target="_blank" title="Download">
              <i class="fas fa-download"></i>
            </a>
            <span v-else class="text-muted">{{ $t("documentdetails.no_file_available") }}</span>
          </div>
        </div>
      </div>

      <!-- Clauses -->
      <div class="col-md-12">
        <div class="detail-item card p-3">
          <strong class="text-muted">{{ $t("documentdetails.clauses") }}</strong>
          <div v-if="document?.clauses?.length && document.clauses.some(c => c)" class="clauses-list mt-2">
            <div v-for="(clause, index) in document.clauses" :key="index"
              v-show="clause"
              class="clause-item mb-2 p-2 border rounded">
              <strong class="me-2">{{ index + 1 }}.</strong>
              <span v-html="clause"></span>
            </div>
          </div>
          <p v-else class="text-muted">{{ $t("documentdetails.no_clauses_available") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DetailsTab",
  props: {
    document: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    userList: {
      type: Array,
      default: () => []
    },
    teamList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    openPreview() {
      this.$emit('open-preview');
    }
  }
};
</script>

<style scoped>
.document-details {
  padding: 20px;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #44225c;
  color: white;
}

.btn-primary:hover {
  background: #5a2d75;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(68, 34, 92, 0.3);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-outline-primary {
  background: transparent;
  color: #44225c;
  border: 2px solid #44225c;
}

.btn-outline-primary:hover {
  background: #44225c;
  color: white;
}

.detail-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.detail-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.detail-item strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #44225c;
  margin-bottom: 10px;
}

.content-preview {
  background: #f8f9fa;
  border-radius: 6px;
  min-height: 100px;
  line-height: 1.6;
  color: #333;
}

.content-preview:deep(h1),
.content-preview:deep(h2),
.content-preview:deep(h3) {
  color: #44225c;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.content-preview:deep(p) {
  margin-bottom: 1em;
}

.content-preview:deep(ul),
.content-preview:deep(ol) {
  margin-left: 20px;
  margin-bottom: 1em;
}

.content-preview:deep(strong) {
  font-weight: 700;
  color: #333;
}

.clauses-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clause-item {
  background: #f8f9fa;
  border-left: 4px solid #44225c !important;
  padding: 15px !important;
  transition: all 0.3s;
}

.clause-item:hover {
  background: #e9ecef;
  border-left-color: #5a2d75 !important;
  transform: translateX(5px);
}

.clause-item strong {
  color: #44225c;
  font-size: 16px;
  display: inline;
}

.clause-item span {
  color: #333;
}

.clause-item span:deep(p) {
  margin: 0;
  display: inline;
}

.text-muted {
  color: #6c757d !important;
}

.card {
  border: 1px solid #e0e0e0;
  background: white;
}

.border {
  border: 1px solid #dee2e6 !important;
}

.rounded {
  border-radius: 6px !important;
}

.p-2 {
  padding: 15px !important;
}

.p-3 {
  padding: 20px !important;
}

.mt-2 {
  margin-top: 15px !important;
}

.mb-2 {
  margin-bottom: 15px !important;
}

.mb-3 {
  margin-bottom: 20px !important;
}

.me-1 {
  margin-right: 8px !important;
}

.me-2 {
  margin-right: 12px !important;
}

.col-md-12 {
  width: 100%;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.g-3 > * {
  padding: 0 15px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .document-details {
    padding: 15px;
  }

  .preview-actions {
    justify-content: center;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>