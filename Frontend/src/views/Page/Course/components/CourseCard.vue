<template>
  <div class="col-md-6 col-lg-4 mb-4">
    <div class="course-card">
      <!-- Image section with badge overlay -->
      <div class="card-image-container">
        <img
          class="card-image"
          :src="course.fullCourseImagePath"
          alt="Course Cover"
        />
        <!-- Badge positioned on top-right of image -->
        <div class="card-badge">
          <span
            v-if="course.courseType.mandatory == 'true'"
            class="badge badge-mandatory"
          >
            {{ $t("course.mandatory") }}
          </span>
          <span
            v-else-if="
              course.courseType.optional == 'true' &&
              course.courseType.campaign == 'false'
            "
            class="badge badge-optional"
          >
            {{ $t("course.optional") }}
          </span>
          <span
            v-else-if="course.courseType.campaign == 'true'"
            class="badge badge-campaign"
          >
            {{ $t("course.campaign") }}
          </span>
        </div>
      </div>

      <!-- Content section -->
      <div class="card-content">
        <h3 class="card-title">{{ course.name }}</h3>

        <!-- Statistics Row -->
        <div class="card-stats">
          <div class="stat-item">
            <i class="fa fa-layer-group stat-icon"></i>
            <span>{{ $t("course.levels") }}: {{ course.levels ? course.levels.length : 0 }}</span>
          </div>
          <div class="stat-item">
            <i class="fa fa-book stat-icon"></i>
            <span>{{ $t("course.trainingmodules") }}: {{ course.modulesCount }}</span>
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-item">
            <i class="fa fa-question-circle stat-icon"></i>
            <span>{{ $t("course.questions") }}: {{ course.questionsCount ? course.questionsCount : 0 }}</span>
          </div>
          <div class="stat-item">
            <i class="fa fa-file-alt stat-icon"></i>
            <span>{{ $t("course.statements") }}: {{ course.statementsCount ? course.statementsCount : 0 }}</span>
          </div>
        </div>

        <!-- Last update date -->
        <div class="last-update">
          {{ $t("course.lastupdateddate") }}: {{ formatDate(course.updated_at) }}
        </div>

        <!-- Action Buttons -->
        <div class="card-actions">
          <button
            class="btn-manage"
            @click="$emit('manage', course)"
            v-permission:update
          >
            {{ $t("course.managecourse") }}
          </button>
          <button
            class="btn-icon btn-delete"
            @click="$emit('delete', course.id)"
            v-permission:delete
          >
            <i class="fa fa-trash"></i>
          </button>
          <button
            class="btn-icon btn-edit"
            @click="$emit('edit', course)"
            v-permission:update
          >
            <i class="fa-solid fa-pen"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  emits: ['manage', 'delete', 'edit'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16).replace("T", " ");
    }
  }
};
</script>

<style scoped>
/* Course Card Styles - Matching the provided image */
.course-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-badge .badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

.badge-mandatory {
  background-color: #A92525;
}

.badge-optional {
  background-color: #28a745;
}

.badge-campaign {
  background-color: #e63946;
}

.card-content {
  padding: 16px 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  /* margin-bottom: 14px; */
  line-height: 1.4;
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  flex: 1;
}

.stat-icon {
  width: 14px;
  height: 14px;
  color: #666;
  font-size: 14px;
}

.last-update {
  font-size: 12px;
  color: #888;
  /* margin-top: 6px; */
  margin-bottom: 16px;
  /* padding-top: 10px; */
  /* border-top: 1px solid #f0f0f0; */
}

.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-manage {
  flex: 1;
  background-color: #6e3894;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: capitalize;
}

.btn-manage:hover {
  background-color: #5a2d7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.3);
}

.btn-icon {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.btn-delete {
  background-color: #fff;
  color: #A92525;
  border: 2px solid #A92525;
}

.btn-delete:hover {
  background-color: #A92525;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.btn-edit {
  background-color: #fff;
  color: #C4951B;
  border: 2px solid #C4951B;
}

.btn-edit:hover {
  background-color: #C4951B;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.btn-icon:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-title {
    font-size: 15px;
    min-height: 40px;
    font-weight: 500;
  }

  .stat-item {
    font-size: 12px;
    font-weight: 500;
  }

  .btn-manage {
    font-size: 12px;
    padding: 8px 12px;
  }

  .btn-icon {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }
}
</style>
