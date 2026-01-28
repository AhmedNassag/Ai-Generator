<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('course.awareness')"
    :mainSubPage="this.$t('course.lms_management')"
    :subPage="this.$t('course.courses')"
    :titlePage="this.$t('course.courses')"
    v-permission:show
  >
  </main-page>
  <div
    class="container"
    style="
      background-color: white;
      padding: 10px;
      border-radius: 10px;
      max-width: 1250px;
    "
    v-permission:show
  >
    <button
      style="
        /* margin-top: 40px; */
        background-color: #6e3894 !important;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
      "
      class="btn-primary"
      :class="{ 'beating-button': courseList.length === 0 }"
      @click="openModal"
      v-permission:insert
    >
      <i class="icofont icofont-plus"></i>
      {{ $t("course.addcourse") }}
    </button>

    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>{{ $t("course.loadingCourses\t") }}</p>
    </div>

    <div id="main-div" style="margin-top: 100px; display: ruby">
      <!-- Cards Grid -->
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="row justify-content-center">
            <CourseCard
              v-for="(course, index) in visibleCourses"
              :key="index"
              :course="course"
              @manage="openManageModal"
              @edit="openEditModal"
              @delete="deleteCourse"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Course Modal -->
    <CourseFormModal
      :isOpen="isModalOpen"
      :formData="formData"
      :departmentList="departmentList"
      :teamList="teamList"
      :userList="userList"
      @close="closeModal"
      @submit="submitForm"
    />

    <!-- Manage Course Modal -->
    <CourseManageModal
      :isOpen="isManageModalOpen"
      :selectedCourse="selectedCourse"
      :courseLevels="courseLevels"
      @close="closeManageModal"
      @add-level="addNewLevel"
      @edit-level="editLevel"
      @delete-level="deleteLevel"
      @add-training-module="openNewModal"
      @edit-module="editModule"
      @delete-module="deleteModule"
    />

    <!-- Edit Course Modal -->
    <CourseEditModal
      :isOpen="isEditModalOpen"
      :courseData="editCourseData"
      :departmentList="departmentList"
      :teamList="teamList"
      :userList="userList"
      @close="closeEditModal"
      @submit="updateCourseFromEdit"
    />

    <!-- Level Form Modal -->
    <LevelFormModal
      :isOpen="isLevelModalOpen"
      :levelForm="levelForm"
      :editingLevel="editingLevel"
      :departmentList="departmentList"
      :teamList="teamList"
      :userList="userList"
      @close="closeLevelModal"
      @submit="submitLevel"
    />

    <!-- Training Module Modal -->
    <TrainingModuleModal
      :isOpen="isNewModalOpen"
      :trainingFormData="trainingFormData"
      :questions="questions"
      :statements="statements"
      :surveytList="surveytList"
      @close="closeTrainingModal"
      @submit="submitTrainingModule"
    />
  </div>
</template>

<script>
// Importing necessary components and API modules
import course from "@/API/Course/Course";
import module from "@/API/LmsModule/LmsModule";
import LmsUserAnswer from "@/API/LmsUserAnswer/LmsUserAnswer";
import level from "@/API/LmsLevel/LmsLevel";
import controlApi from "@/API/Control/Control";
import department from "@/API/Department/Department";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import Survey from "@/API/Survey/Survey";
import MainPage from "@/components/MainPage.vue";
import CourseCard from "./components/CourseCard.vue";
import CourseFormModal from "./components/CourseFormModal.vue";
import CourseManageModal from "./components/CourseManageModal.vue";
import CourseEditModal from "./components/CourseEditModal.vue";
import LevelFormModal from "./components/LevelFormModal.vue";
import TrainingModuleModal from "./components/TrainingModuleModal.vue";
import { useNotifyLogSetting } from "@/composables/useNotifyLogSetting";

export default {
  components: {
    MainPage,
    CourseCard,
    CourseFormModal,
    CourseManageModal,
    CourseEditModal,
    LevelFormModal,
    TrainingModuleModal,
  },

  setup() {
    // Initialize API and other required properties
    const api = new course();
    const levelApi = new level();
    const LmsUserAnswerApi = new LmsUserAnswer();
    const moduleApi = new module();
    const departmentApi = new department();
    const surveyApi = new Survey();
    const userApi = new user();
    const teamApi = new team();
    const control = new controlApi();

    // Return properties for setup to be used in the template
    return {
      api,
      levelApi,
      control,
      moduleApi,
      departmentApi,
      userApi,
      teamApi,
      LmsUserAnswerApi,
      surveyApi,
    };
  },

  async mounted() {
    // Call the composable
    useNotifyLogSetting(
      [
        { label: "Course", model: "Course" },
        { label: "Training Module", model: "LmsModule" },
      ],
      true
    );

    this.updateStyles();
    this.isLoading = true;
    try {
      await this.fetchControls();
      await this.fetchCourses();
      await this.fetchDepartments();
      await this.fetchTeams();
      await this.fetchUsers();
      this.loadInitialCourses();
    } catch (error) {
      console.error("Error in mounted:", error);
    } finally {
      this.isLoading = false;
    }
    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("scroll", this.handleScroll);
  },

  data() {
    return {
      isLoading: false,
      departmentList: [],
      surveytList: [],
      userList: [],
      teamList: [],
      selectedLevel: null,
      isNewModalOpen: false,
      trainingFormData: {
        name: "",
        passing_score: "",
        order: "",
        completionTime: "",
        count_of_entering_exam: "",
        survey_id: null,
      },
      isModalOpen: false,
      isManageModalOpen: false,
      isEditModalOpen: false,
      isLevelModalOpen: false,
      selectedCourse: {
        name: "",
        description: "",
        image: "",
      },
      editCourseData: {
        name: "",
        description: "",
        courseType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        department_ids: [],
        team_ids: [],
        user_ids: [],
        days_to_complete: null,
        disable_menu: false,
      },
      courseLevels: [],
      levelForm: {
        title: "",
        order: "",
        levelType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        department_ids: [],
        team_ids: [],
        user_ids: [],
        days_to_complete: null,
        disable_menu: false,
      },
      editingLevel: null,
      isFlipped: false,
      newItem: {
        control_ids: "",
      },
      questions: [],
      statements: [],
      formData: {
        name: "",
        description: "",
        days_to_complete: "",
        department_ids: [],
        team_ids: [],
        user_ids: [],
        courseType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        disable_menu: false,
      },
      courseList: [],
      visibleCourses: [],
      visibleCount: 6,
      controlList: [],
    };
  },

  computed: {
    currentDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },
  },

  watch: {
    "$route.params.id": {
      handler(newId) {
        this.updateStyles();
      },
      immediate: true,
    },
  },

  methods: {
    updateStyles() {
      if (this.styleElement) {
        document.head.removeChild(this.styleElement);
        this.styleElement = null;
      }

      const log =
        this.$route.params.id &&
        this.$route.path.includes("log-setting/Course");

      if (log) {
        const styles = `
          #card {
            display: block;
          }
        `;

        this.styleElement = document.createElement("style");
        this.styleElement.textContent = styles;
        document.head.appendChild(this.styleElement);
      }
    },

    handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    },

    async submitForm(formData) {
      try {
        // For optional courses, include all user IDs
        if (
          formData.courseType.optional &&
          !formData.courseType.mandatory &&
          !formData.courseType.campaign
        ) {
          formData.user_ids = this.userList.map((user) => user.id);
        } else if (formData.courseType.mandatory) {
          formData.department_ids = formData.department_ids
            ? formData.department_ids.filter((id) => id !== null)
            : [];
          formData.team_ids = formData.team_ids
            ? formData.team_ids.filter((id) => id !== null)
            : [];
          formData.user_ids = formData.user_ids
            ? formData.user_ids.filter((id) => id !== null)
            : [];
        } else {
          formData.department_ids = [];
          formData.team_ids = [];
          formData.user_ids = [];
        }

        // Validate mandatory fields
        if (formData.courseType.mandatory) {
          if (
            !formData.department_ids.length &&
            !formData.team_ids.length &&
            !formData.user_ids.length
          ) {
            this.$notify({
              type: "error",
              text: "Please select at least one department, team, or user for a mandatory course",
            });
            return;
          }

          if (!formData.days_to_complete) {
            this.$notify({
              type: "error",
              text: "Please insert days to complete for a mandatory course",
            });
            return;
          }
        }

        if (
          !formData.courseType.mandatory &&
          !formData.courseType.optional &&
          !formData.courseType.campaign
        ) {
          this.$notify({
            type: "error",
            text: "Please select at least one course classification (Mandatory, Optional, or Campaign).",
          });
          return;
        }

        const imageInput = document.getElementById("photo");
        if (imageInput.files[0]) {
          formData = {
            ...formData,
            photo: imageInput.files[0],
          };
        }

        const formDataToSend = {
          ...formData,
          mandatory: formData.courseType.mandatory,
          optional: formData.courseType.optional,
          campaign: formData.courseType.campaign,
          department_ids: formData.courseType.mandatory
            ? formData.department_ids
            : [],
          team_ids: formData.courseType.mandatory ? formData.team_ids : [],
          user_ids:
            formData.courseType.mandatory || formData.courseType.optional
              ? formData.user_ids
              : [],
          days_to_complete: formData.courseType.mandatory
            ? formData.days_to_complete
            : null,
          disable_menu: formData.courseType.mandatory
            ? formData.disable_menu
            : false,
        };

        const response = await this.api.from(formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.status === "success") {
          this.closeModal();
          this.resetFormData();
          await this.fetchCourses();
          this.visibleCourses = [];
          this.loadInitialCourses();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        this.$notify({
          type: "error",
          text: "Failed to create course. Please try again.",
        });
      }
    },

    async submitLevel(levelFormData) {
      try {
        // Validation for mandatory fields
        if (levelFormData.levelType.mandatory) {
          if (
            (!levelFormData.department_ids ||
              levelFormData.department_ids.length === 0) &&
            (!levelFormData.team_ids || levelFormData.team_ids.length === 0) &&
            (!levelFormData.user_ids || levelFormData.user_ids.length === 0)
          ) {
            this.$notify({
              type: "error",
              text: "Please select at least one department, team, or user for a mandatory level.",
            });
            return;
          }
          if (!levelFormData.days_to_complete) {
            this.$notify({
              type: "error",
              text: "Please insert days to complete for a mandatory level.",
            });
            return;
          }
        }

        const levelData = {
          ...levelFormData,
          course_id: this.selectedCourse.id,
          mandatory: levelFormData.levelType?.mandatory,
          optional: levelFormData.levelType.optional,
          campaign: levelFormData.levelType.campaign,
          department_ids: levelFormData.levelType?.mandatory
            ? levelFormData.department_ids
            : [],
          team_ids: levelFormData.levelType?.mandatory
            ? levelFormData.team_ids
            : [],
          user_ids:
            levelFormData.levelType?.mandatory ||
            levelFormData.levelType.optional
              ? levelFormData.user_ids
              : [],
          days_to_complete: levelFormData.levelType?.mandatory
            ? levelFormData.days_to_complete
            : null,
          disable_menu: levelFormData.levelType?.mandatory
            ? levelFormData.disable_menu
            : false,
        };

        let response;
        if (this.editingLevel) {
          response = await this.levelApi.from(levelData);
        } else {
          response = await this.levelApi.from(levelData);
        }

        if (response) {
          this.closeLevelModal();
          this.fetchCourseLevels(this.selectedCourse.id);
        }
      } catch (error) {
        console.error("Error submitting level:", error);
        this.$notify({
          type: "error",
          text: "Failed to save level. Please try again.",
        });
      }
    },

    resetFormData() {
      this.formData = {
        name: "",
        description: "",
        days_to_complete: null,
        department_ids: [],
        team_ids: [],
        user_ids: [],
        courseType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        disable_menu: false,
      };
    },

    async fetchCourses() {
      this.isLoading = true;
      try {
        this.courseList = await this.api.getAll({
          select:
            "id|name|description|photo|fullCourseImagePath|updated_at|courseType|department_ids|team_ids|user_ids|days_to_complete|disable_menu",
        });

        let coursesIds = [];
        let levelsIds = "";
        for (let course of this.courseList) {
          coursesIds.push(course.id);
        }

        let coursesIdsFilter = coursesIds.join(",");
        let levels = await this.levelApi.getAll({
          filterIn: `course_id|${coursesIdsFilter}`,
        });

        for (let index = 0; index < this.courseList.length; index++) {
          this.courseList[index].levels = [];
          for (let level of levels) {
            if (level.course_id === this.courseList[index].id) {
              levelsIds += level.id + ",";
              this.courseList[index].levels.push(level);
            }
          }
        }

        const modules = await this.moduleApi.getAll({
          filterIn: `level_id|${levelsIds}`,
        });

        for (let index = 0; index < this.courseList.length; index++) {
          this.courseList[index].modulesCount = 0;
          this.courseList[index].questionsCount = 0;
          this.courseList[index].statementsCount = 0;

          for (let j = 0; j < this.courseList[index].levels.length; j++) {
            let level = this.courseList[index].levels[j];
            this.courseList[index].levels[j].modules = [];

            for (let module of modules) {
              if (module.level_id == level.id) {
                this.courseList[index].levels[j].modules.push(module);
                this.courseList[index].modulesCount++;
                if (
                  module?.questions?.length > 0 &&
                  module.questions[0] != null
                ) {
                  this.courseList[index].questionsCount +=
                    module?.questions?.length;
                }
                if (
                  module?.statements?.length > 0 &&
                  module.statements[0] != null
                ) {
                  this.courseList[index].statementsCount +=
                    module?.statements?.length;
                }
              }
            }
          }
        }

        if (this.courseList.length < 7) {
          this.loadMore();
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        this.$notify({
          type: "error",
          text: "Failed to fetch courses. Please try again.",
        });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDepartments() {
      this.departmentList = await this.departmentApi.getAll({
        select: "id|name",
      });

      this.surveytList = await this.surveyApi.getAll({
        select: "id|name",
      });
    },

    async fetchTeams() {
      this.teamList = await this.teamApi.getAll({
        select: "id|name",
      });
    },

    async fetchUsers() {
      this.userList = await this.userApi.getAll({
        select: "id|full_name|department_id|team_ids",
      });
    },

    async fetchControls() {
      const response = await this.control.getAll({
        select: "id|long_name|framework_id",
      });
      this.controlList = response;
    },

    loadInitialCourses() {
      this.visibleCourses = this.courseList.slice(0, this.visibleCount);
    },

    loadMore() {
      const nextCourses = this.courseList.slice(
        this.visibleCourses.length,
        this.visibleCourses.length + this.visibleCount
      );
      this.visibleCourses = [...this.visibleCourses, ...nextCourses];
    },

    handleScroll() {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const eightyPercentHeight = totalHeight * 0.9;

      if (scrollPosition >= eightyPercentHeight) {
        this.loadMore();
      }
    },

    openModal() {
      this.isModalOpen = true;
    },

    async closeModal() {
      this.isModalOpen = false;
      this.resetFormData();
    },

    async openManageModal(course) {
      this.selectedCourse = {
        ...course,
        courseType: {
          mandatory: course.courseType?.mandatory === "true" || false,
          optional: course.courseType?.optional === "true" || false,
          campaign: course.courseType?.campaign === "true" || false,
        },
        department_ids: course.department_ids
          ? course.department_ids.filter((id) => id !== null)
          : [],
        team_ids: course.team_ids
          ? course.team_ids.filter((id) => id !== null)
          : [],
        user_ids: course.user_ids
          ? course.user_ids.filter((id) => id !== null)
          : [],
        days_to_complete: course.days_to_complete || null,
        disable_menu: course.disable_menu === "true" || false,
      };

      await this.fetchCourseLevels(course.id);
      this.isManageModalOpen = true;
    },

    openEditModal(course) {
      this.editCourseData = {
        ...course,
        courseType: {
          mandatory: course.courseType?.mandatory === "true" || false,
          optional: course.courseType?.optional === "true" || false,
          campaign: course.courseType?.campaign === "true" || false,
        },
        department_ids: course.department_ids
          ? course.department_ids.filter((id) => id !== null)
          : [],
        team_ids: course.team_ids
          ? course.team_ids.filter((id) => id !== null)
          : [],
        user_ids: course.user_ids
          ? course.user_ids.filter((id) => id !== null)
          : [],
        days_to_complete: course.days_to_complete || null,
        disable_menu: course.disable_menu === "true" || false,
      };

      this.isEditModalOpen = true;
    },

    closeEditModal() {
      this.isEditModalOpen = false;
      this.editCourseData = {
        name: "",
        description: "",
        courseType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        department_ids: [],
        team_ids: [],
        user_ids: [],
        days_to_complete: null,
        disable_menu: false,
      };
    },

    async fetchCourseLevels(courseId) {
      try {
        const levels = await this.api.getLevels(courseId, {
          select:
            "id|title|order|mandatory|optional|campaign|department_ids|team_ids|user_ids|days_to_complete|disable_menu",
        });

        for (let level of levels) {
          const modules = await this.moduleApi.getAll({
            filter: `level_id|${level.id}`,
            select:
              "id|name|order|passing_score|completionTime|questions|statements",
          });
          level.modules = modules
            ? modules.sort((a, b) => a.order - b.order)
            : [];
        }

        this.courseLevels = levels;
      } catch (error) {
        console.error("Error fetching course levels and modules:", error);
        this.$notify({
          type: "error",
          text: "Failed to fetch course levels. Please try again.",
        });
      }
    },

    async deleteModule(moduleId) {
      try {
        await this.moduleApi.delete(moduleId);
        await this.fetchCourseLevels(this.selectedCourse.id);
      } catch (error) {
        console.error("Error deleting module:", error);
      }
    },

    async deleteCourse(courseId) {
      try {
        const response = await this.api.delete(courseId);

        if (response.status === "success") {
          this.isManageModalOpen = false;
          await this.fetchCourses();
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    },

    async editModule(module) {
      try {
        const completeModule = await this.moduleApi.show(module.id);

        this.trainingFormData = {
          id: completeModule.id,
          name: completeModule.name,
          count_of_entering_exam: completeModule.count_of_entering_exam || "",
          survey_id: completeModule.survey_id || null,
          passing_score: completeModule.passing_score,
          order: completeModule.order,
          completionTime: completeModule.completionTime,
          level_id: completeModule.level_id,
          control_ids: completeModule.control_ids || [],
          coverImage: completeModule.coverImage || null,
          fullCoverImagePath: completeModule.fullCoverImagePath || null,
        };

        if (
          completeModule.questions &&
          completeModule.questions.filter((q) => q !== null && q !== undefined)
            .length > 0
        ) {
          this.questions = completeModule.questions.map((q) => ({
            id: q.id,
            english: q.question_en,
            arabic: q.question_ar,
            questionType: q.question_type,
            descriptionEn: q.description_en,
            descriptionAr: q.description_ar,
            options: q.options
              ? q.options.map((opt) => ({
                  id: opt.id,
                  english: opt.option_en,
                  arabic: opt.option_ar,
                  is_correct: opt.is_correct,
                }))
              : [],
            correctOption: q.options
              ? q.options.findIndex(
                  (opt) => opt.is_correct === true || opt.is_correct === "true"
                )
              : null,
            correctAnswer: q.correct_answer,
          }));
        }

        if (
          completeModule.statements &&
          completeModule.statements.filter((s) => s !== null && s !== undefined)
            .length > 0
        ) {
          this.statements = completeModule.statements.map((s) => ({
            id: s.id,
            statement_en: s.statement_en,
            statement_ar: s.statement_ar,
            content_ar: s.content_ar,
            content_en: s.content_en,
            additional_content_type: s.additional_content_type,
            file_en: s.file_en,
            file_ar: s.file_ar,
          }));
        }

        this.isNewModalOpen = true;
      } catch (error) {
        console.error("Error loading module data:", error);
        this.$notify({
          type: "error",
          text: "Failed to load module data",
        });
      }
    },

    addNewLevel() {
      this.editingLevel = null;
      this.levelForm = {
        title: "",
        order: "",
        levelType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        department_ids: [],
        team_ids: [],
        user_ids: [],
        days_to_complete: null,
        disable_menu: false,
      };
      this.isLevelModalOpen = true;
    },

    editLevel(level) {
      this.editingLevel = level;
      this.levelForm = {
        id: level.id || null,
        title: level.title || "",
        order: level.order ? parseInt(level.order) : "",
        levelType: {
          mandatory:
            level.levelType.mandatory === "true" ||
            level.levelType.mandatory === true ||
            false,
          optional:
            level.levelType.optional === "true" ||
            level.levelType.optional === true ||
            false,
          campaign:
            level.levelType.campaign === "true" ||
            level.levelType.campaign === true ||
            false,
        },
        department_ids: Array.isArray(level.department_ids)
          ? level.department_ids.filter((id) => id !== null && id !== undefined)
          : [],
        team_ids: Array.isArray(level.team_ids)
          ? level.team_ids.filter((id) => id !== null && id !== undefined)
          : [],
        user_ids: Array.isArray(level.user_ids)
          ? level.user_ids.filter((id) => id !== null && id !== undefined)
          : [],
        days_to_complete: level.days_to_complete
          ? parseInt(level.days_to_complete)
          : null,
        disable_menu:
          level.disable_menu === "true" || level.disable_menu === true || false,
      };
      this.isLevelModalOpen = true;
    },

    closeLevelModal() {
      this.isLevelModalOpen = false;
      this.levelForm = {
        title: "",
        order: "",
        levelType: {
          mandatory: false,
          optional: false,
          campaign: false,
        },
        department_ids: [],
        team_ids: [],
        user_ids: [],
        days_to_complete: null,
        disable_menu: false,
      };
      this.editingLevel = null;
    },

    async deleteLevel(levelId) {
      try {
        await this.levelApi.delete(0, [levelId].map(String));
        this.fetchCourseLevels(this.selectedCourse.id);
      } catch (error) {
        console.error("Error deleting level:", error);
      }
    },

    async updateCourseFromEdit(courseData) {
      try {
        const courseExist = await this.LmsUserAnswerApi.getAll({
          filter: `course_id|${courseData.id}`,
        });

        if (courseExist && courseExist.length > 0) {
          this.$notify({
            type: "error",
            text: "This course is already associated with user training modules and users started it.",
          });
          return;
        }

        if (
          !courseData.courseType.mandatory &&
          !courseData.courseType.optional &&
          !courseData.courseType.campaign
        ) {
          this.$notify({
            type: "error",
            text: "Please select at least one course classification",
          });
          return;
        }

        if (courseData.courseType.mandatory) {
          if (
            !courseData.department_ids?.length &&
            !courseData.team_ids?.length &&
            !courseData.user_ids?.length
          ) {
            this.$notify({
              type: "error",
              text: "Please select at least one department, team, or user for a mandatory course",
            });
            return;
          }
        }

        const imageInput = document.getElementById("courseCoverEdit");
        const courseType = {
          mandatory: courseData.courseType.mandatory,
          optional: courseData.courseType.optional,
          campaign: courseData.courseType.campaign,
        };

        let updatedCourseData = {
          id: courseData.id,
          name: courseData.name,
          description: courseData.description,
          courseType: courseType,
          department_ids: courseData.courseType.mandatory
            ? courseData.department_ids
            : [],
          team_ids: courseData.courseType.mandatory ? courseData.team_ids : [],
          user_ids: courseData.courseType.mandatory ? courseData.user_ids : [],
          days_to_complete: courseData.courseType.mandatory
            ? courseData.days_to_complete
            : null,
          disable_menu: courseData.courseType.mandatory
            ? courseData.disable_menu
            : false,
        };

        if (imageInput && imageInput.files[0]) {
          updatedCourseData = {
            ...updatedCourseData,
            photo: imageInput.files[0],
          };
        }

        const response = await this.api.from(updatedCourseData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response) {
          this.closeEditModal();
          await this.fetchCourses();
          this.visibleCourses = [];
          this.loadInitialCourses();

          this.$notify({
            type: "success",
            text: "Course updated successfully",
          });
        }
      } catch (error) {
        console.error("Error updating course:", error);
        this.$notify({
          type: "error",
          text: "Failed to update course. Please try again.",
        });
      }
    },

    async closeManageModal() {
      this.isManageModalOpen = false;
      this.selectedCourse = { name: "", description: "", image: "" };
      await this.fetchCourses();
      this.visibleCourses = [];
      this.loadInitialCourses();
    },

    openNewModal(level) {
      this.trainingFormData = { ...this.trainingFormData, level_id: level.id };
      this.selectedLevel = level;
      this.isNewModalOpen = true;
    },

    closeTrainingModal() {
      this.trainingFormData = {
        name: "",
        passing_score: "",
        order: "",
        completionTime: "",
        count_of_entering_exam: "",
        survey_id: null,
      };

      this.questions = [];
      this.statements = [];
      this.newItem.control_ids = "";

      const imageInput = document.getElementById("trainingImage");
      if (imageInput) {
        imageInput.value = "";
      }

      this.isNewModalOpen = false;
    },

    async submitTrainingModule(data) {
      try {
        if (!this.validateTrainingForm(data)) {
          return;
        }

        const imageInput = document.getElementById("trainingImage");
        if (imageInput.files[0]) {
          data.trainingFormData = {
            ...data.trainingFormData,
            coverImage: imageInput.files[0],
          };
        }

        const questions = data.questions.map((question) => {
          const questionData = {
            id:
              question.id ||
              `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            question_en: question.english,
            question_ar: question.arabic,
            question_type: question.questionType,
            description_en: question.descriptionEn,
            description_ar: question.descriptionAr,
          };

          if (question.questionType === "true_or_false") {
            questionData.correct_answer = question.correctAnswer;
          } else {
            questionData.options = question.options.map((option, index) => ({
              option_en: option.english,
              option_ar: option.arabic,
              is_correct: index === parseInt(question.correctOption),
            }));
          }

          return questionData;
        });

        const statements = data.statements.map((statement, index) => {
          const statementData = {
            statement_en: statement.statement_en,
            statement_ar: statement.statement_ar,
            content_en: statement.content_en,
            content_ar: statement.content_ar,
            additional_content_type: statement.additional_content_type,
            file_en: statement.file_en,
            file_ar: statement.file_ar,
          };

          const fileEn = document.getElementById(`fileEnglish${index}`);
          if (fileEn && fileEn.files[0]) {
            statementData.file_en = fileEn.files[0];
          } else if (statement.file_en) {
            statementData.file_en = statement.file_en;
          } else {
            statementData.file_en = null;
          }

          const fileAr = document.getElementById(`fileArabic${index}`);
          if (fileAr && fileAr.files[0]) {
            statementData.file_ar = fileAr.files[0];
          } else if (statement.file_ar) {
            statementData.file_ar = statement.file_ar;
          } else {
            statementData.file_ar = null;
          }

          return statementData;
        });

        const trainingFormData = {
          ...data.trainingFormData,
          questions: questions,
          statements: statements,
        };

        let response;
        if (trainingFormData.id) {
          response = await this.moduleApi.from(trainingFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (response) {
            this.closeTrainingModal();
            this.resetTrainingForm();
            await this.fetchCourseLevels(this.selectedCourse.id);
            await this.fetchCourses();
          }
        } else {
          response = await this.moduleApi.from(trainingFormData);
          if (response) {
            this.closeTrainingModal();
            this.resetTrainingForm();
            await this.fetchCourseLevels(this.selectedCourse.id);
          }
        }
      } catch (error) {
        console.error("Error creating training module:", error);
        this.$notify({
          type: "error",
          text: "Error creating training module. Please try again.",
        });
      }
    },

    validateTrainingForm(data) {
      const arabicRegex = /[\u0600-\u06FF]/;

      if (
        !data.trainingFormData.name ||
        !data.trainingFormData.passing_score ||
        !data.trainingFormData.order ||
        !data.trainingFormData.survey_id ||
        !data.trainingFormData.count_of_entering_exam
      ) {
        this.$notify({
          type: "error",
          text: "Please fill in all required fields",
        });
        return false;
      }

      if (data.questions.length === 0 && data.statements.length === 0) {
        this.$notify({
          type: "error",
          text: "Please add at least one question or statement",
        });
        return false;
      }

      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];

        if (!question.english || !question.arabic) {
          this.$notify({
            type: "error",
            text: `You should fill question ${i + 1} in both languages`,
          });
          return false;
        }

        if (!arabicRegex.test(question.arabic)) {
          this.$notify({
            type: "error",
            text: `Question ${i + 1} (Arabic) must contain Arabic characters`,
          });
          return false;
        }

        if (question.questionType === "multi_choice") {
          if (
            !question.options.every((option) => option.english && option.arabic)
          ) {
            this.$notify({
              type: "error",
              text: `All options in question ${
                i + 1
              } must be filled in both languages`,
            });
            return false;
          }

          for (let j = 0; j < question.options.length; j++) {
            if (!arabicRegex.test(question.options[j].arabic)) {
              this.$notify({
                type: "error",
                text: `Option ${j + 1} in question ${
                  i + 1
                } (Arabic) must contain Arabic characters`,
              });
              return false;
            }
          }

          if (
            question.correctOption === null ||
            question.correctOption === undefined ||
            question.correctOption < 0 ||
            question.correctOption >= question.options.length
          ) {
            this.$notify({
              type: "error",
              text: `Please select a correct option for question ${i + 1}`,
            });
            return false;
          }
        } else if (question.questionType === "true_or_false") {
          if (
            question.correctAnswer === null ||
            question.correctAnswer === undefined ||
            question.correctAnswer === ""
          ) {
            this.$notify({
              type: "error",
              text: `Please select the correct answer for question ${i + 1}`,
            });
            return false;
          }
        }

        if (!question.descriptionEn || !question.descriptionAr) {
          this.$notify({
            type: "error",
            text: `Please fill the description in both languages for question ${
              i + 1
            }`,
          });
          return false;
        }

        if (!arabicRegex.test(question.descriptionAr)) {
          this.$notify({
            type: "error",
            text: `Question ${
              i + 1
            } (Arabic) description must contain Arabic characters`,
          });
          return false;
        }
      }

      for (let i = 0; i < data.statements.length; i++) {
        const statement = data.statements[i];

        if (!statement.statement_en || !statement.statement_ar) {
          this.$notify({
            type: "error",
            text: `You should fill statement ${i + 1} in both languages`,
          });
          return false;
        }

        if (!arabicRegex.test(statement.statement_ar)) {
          this.$notify({
            type: "error",
            text: `Statement ${i + 1} (Arabic) must contain Arabic characters`,
          });
          return false;
        }

        if (!statement.content_en || !statement.content_ar) {
          this.$notify({
            type: "error",
            text: `Please fill the content in both languages for statement ${
              i + 1
            }`,
          });
          return false;
        }

        if (!arabicRegex.test(statement.content_ar)) {
          this.$notify({
            type: "error",
            text: `Statement ${
              i + 1
            } content (Arabic) must contain Arabic characters`,
          });
          return false;
        }

        if (!statement.additional_content_type) {
          this.$notify({
            type: "error",
            text: `Please select an additional content type for statement ${
              i + 1
            }`,
          });
          return false;
        }

        const fileEn = document.getElementById(`fileEnglish${i}`);
        const fileAr = document.getElementById(`fileArabic${i}`);

        if (statement.additional_content_type === "Embedded PDF") {
          const allowedTypes = ["application/pdf"];
          if (
            (!statement.file_ar || !statement.file_en) &&
            (!allowedTypes.includes(fileEn.files[0]?.type) ||
              !allowedTypes.includes(fileAr.files[0]?.type))
          ) {
            this.$notify({
              type: "error",
              text: `Please upload valid PDF files for statement ${i + 1}`,
            });
            return false;
          }
        }
      }

      return true;
    },

    resetTrainingForm() {
      this.trainingFormData = {
        name: "",
        passing_score: "",
        order: "",
        completionTime: "",
        count_of_entering_exam: "",
        survey_id: null,
      };
      this.newItem.control_ids = "";
      this.questions = [];
      this.statements = [];
      const imageInput = document.getElementById("trainingImage");
      if (imageInput) {
        imageInput.value = "";
      }
    },
  },
};
</script>

<style scoped>
.btn-primary {
  margin-top: 20px;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  float: inline-end;
}

@keyframes beat {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.beating-button {
  animation: beat 2s infinite;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
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

.loading-container p {
  margin-top: 10px;
  font-size: 16px;
  color: #333;
}
</style>

<style>
#card {
  display: none;
}

.flip-container {
  display: none !important;
}
</style>
