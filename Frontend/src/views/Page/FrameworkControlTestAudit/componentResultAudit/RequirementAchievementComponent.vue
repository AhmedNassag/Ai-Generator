<template>
    <v-btn v-if="!isEndAuditControl()" color="success" class="ml-3" style="display:flex;place-self:flex-end;"
        :disabled="controlAuditData?.requirements_with_evidence_data?.some(req => req.latest_control_audit?.control_mapped)"
        @click="openRequirementModal">{{ $t("requirementachievementcomponent.add_requirement") }}</v-btn>

    <div class="requirement-achievement">
        <!-- Control Mapping Tree -->
        <ControlMappingTree
            v-if="controlAuditData?.requirements_with_evidence_data?.some(req => req.latest_control_audit)"
            :controlAuditData="controlAuditData" />

        <v-card class="elevation-3 requirement-card">
            <v-card-title class="primary white--text card-header">
                <v-icon left color="black" class="header-icon">mdi-clipboard-check</v-icon>
                {{ $t("requirementachievementcomponent.requirements_achievement") }}
            </v-card-title>
            <!-- Main Table with Static Headers -->
            <div class="table-container">
                <table class="static-table">
                    <thead>
                        <tr>
                            <th class="font-weight-bold">{{ $t("requirementachievementcomponent.requirement_name") }}
                            </th>
                            <th class="font-weight-bold">{{ $t("requirementachievementcomponent.description") }}</th>
                            <th class="font-weight-bold">{{ $t("requirementachievementcomponent.due_date") }}</th>
                            <th class="font-weight-bold">{{ $t("requirementachievementcomponent.responsible") }}</th>
                            <th class="font-weight-bold">{{ $t("requirementachievementcomponent.status") }}</th>
                            <th class="font-weight-bold text-center">{{
                                $t("requirementachievementcomponent.evidence_count") }}</th>
                            <th class="font-weight-bold text-center">{{ $t("requirementachievementcomponent.actions") }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in paginatedRequirements" :key="item.id" class="table-row">
                            <td>
                                <span class="font-weight-bold requirement-name">{{ item.requirementRelation?.name ||
                                    'N/A' }}</span>
                            </td>
                            <td>
                                <div v-if="item.requirementRelation?.description" class="text-truncate description-cell"
                                    style="max-width: 200px;" v-html="item.requirementRelation.description"></div>
                                <span v-else>{{ $t("requirementachievementcomponent.na") }}</span>
                            </td>
                            <td>
                                <v-chip :color="getDueDateColor(item.requirementRelation?.due_date)" small
                                    class="due-date-chip">
                                    {{ formatDate(item.requirementRelation?.due_date) }}
                                </v-chip>
                            </td>
                            <td class="responsible-cell">{{ item.responsible_name }}</td>
                            <td>
                                <v-chip :color="getStatusColor(item.status)" small class="status-chip">
                                    {{ item.status || 'Pending' }}
                                </v-chip>
                            </td>
                            <td class="text-center">
                                <v-badge :content="item.evidence?.length || 0" color="primary" inline
                                    class="evidence-badge"></v-badge>
                            </td>

                            <td class="text-center">
                                <v-menu>
                                    <template v-slot:activator="{ props }">
                                        <v-btn v-bind="props" icon variant="text" size="small" class="action-btn">
                                            <v-icon>mdi-dots-vertical</v-icon>
                                        </v-btn>
                                    </template>

                                    <v-list class="action-menu" rounded="xl">
                                        <v-list-item @click="showEvidence(item)" class="menu-item menu-item--view"
                                            :ripple="true">
                                            <template v-slot:prepend>
                                                <v-avatar size="32" color="blue-lighten-5" class="menu-icon">
                                                    <v-icon color="blue-darken-2" size="18">mdi-eye</v-icon>
                                                </v-avatar>
                                            </template>
                                            <v-list-item-title class="menu-text">
                                                {{ $t('requirementachievementcomponent.view_evidence') }}
                                            </v-list-item-title>
                                            <template v-slot:append>
                                                <v-icon color="grey-lighten-1" size="16">mdi-chevron-right</v-icon>
                                            </template>
                                        </v-list-item>

                                        <v-divider class="menu-divider"></v-divider>

                                        <v-list-item v-if="!isEndAuditControl()" @click="openEvidenceModal(item)"
                                            :disabled="hasMappedControlInLatest(item)"
                                            class="menu-item menu-item--attach"
                                            :ripple="!hasMappedControlInLatest(item)"
                                            :class="{ 'menu-item--disabled': hasMappedControlInLatest(item) }">
                                            <template v-slot:prepend>
                                                <v-avatar size="32" color="green-lighten-5" class="menu-icon">
                                                    <v-icon color="green-darken-2" size="18">mdi-paperclip</v-icon>
                                                </v-avatar>
                                            </template>
                                            <v-list-item-title class="menu-text">
                                                {{ $t('requirementachievementcomponent.add_attachment') }}
                                            </v-list-item-title>
                                            <template v-slot:append>
                                                <v-icon color="grey-lighten-1" size="16">mdi-chevron-right</v-icon>
                                            </template>
                                        </v-list-item>

                                        <v-divider class="menu-divider"></v-divider>

                                        <v-list-item @click="openComments(item)" class="menu-item menu-item--comments"
                                            :ripple="true">
                                            <template v-slot:prepend>
                                                <v-avatar size="32" color="purple-lighten-5" class="menu-icon">
                                                    <v-icon color="purple-darken-2" size="18">mdi-comment-text</v-icon>
                                                </v-avatar>
                                            </template>
                                            <v-list-item-title class="menu-text">
                                                {{ $t('requirementachievementcomponent.comments') }}
                                            </v-list-item-title>
                                            <template v-slot:append>
                                                <v-icon color="grey-lighten-1" size="16">mdi-chevron-right</v-icon>
                                            </template>
                                        </v-list-item>

                                        <v-divider class="menu-divider thick-divider"></v-divider>

                                        <v-list-item v-if="!isEndAuditControl()" v-permission:updateRequirementStatus
                                            @click="updateRequirementStatus(item, 'approved')"
                                            :disabled="!canApproveRequirement(item) || hasMappedControlInLatest(item)"
                                            class="menu-item menu-item--approve"
                                            :class="{ 'menu-item--disabled': !canApproveRequirement(item) || hasMappedControlInLatest(item) }"
                                            :ripple="canApproveRequirement(item) && !hasMappedControlInLatest(item)">
                                            <template v-slot:prepend>
                                                <v-avatar size="32" color="success-lighten-5" class="menu-icon">
                                                    <v-icon color="success-darken-2" size="18">mdi-check-circle</v-icon>
                                                </v-avatar>
                                            </template>
                                            <v-list-item-title class="menu-text">
                                                {{ $t('requirementachievementcomponent.approve_requirement') }}
                                            </v-list-item-title>
                                            <template v-slot:append>
                                                <v-icon color="grey-lighten-1" size="16">mdi-chevron-right</v-icon>
                                            </template>
                                        </v-list-item>

                                        <v-divider class="menu-divider"></v-divider>

                                        <v-list-item v-if="!isEndAuditControl()" v-permission:updateRequirementStatus
                                            @click="updateRequirementStatus(item, 'rejected')"
                                            :disabled="hasMappedControlInLatest(item)"
                                            class="menu-item menu-item--reject"
                                            :class="{ 'menu-item--disabled': hasMappedControlInLatest(item) }"
                                            :ripple="!hasMappedControlInLatest(item)">
                                            <template v-slot:prepend>
                                                <v-avatar size="32" color="error-lighten-5" class="menu-icon">
                                                    <v-icon color="error-darken-2" size="18">mdi-close-circle</v-icon>
                                                </v-avatar>
                                            </template>
                                            <v-list-item-title class="menu-text">
                                                {{ $t('requirementachievementcomponent.reject_requirement') }}
                                            </v-list-item-title>
                                            <template v-slot:append>
                                                <v-icon color="grey-lighten-1" size="16">mdi-chevron-right</v-icon>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination for Requirements -->
            <div class="d-flex justify-center py-3">
                <v-pagination v-model="requirementPage" :length="requirementPageCount" :total-visible="7" rounded
                    color="primary"></v-pagination>
            </div>

            <!-- Evidence Dialog -->
            <v-dialog v-model="evidenceDialog" max-width="1300" scrollable persistent class="evidence-dialog">
                <v-card class="dialog-card">
                    <v-toolbar color="primary" dark flat class="dialog-header">
                        <v-toolbar-title class="dialog-title">
                            <v-icon left>mdi-file-document</v-icon>
                            {{ $t('requirementachievementcomponent.evidence_for') }}: {{
                                selectedRequirement?.requirementRelation?.name ||
                                $t('requirementachievementcomponent.requirement') }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="evidenceDialog = false" class="close-btn">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <v-card-text class="pa-4 dialog-content">
                        <!-- Evidence Table with Static Headers -->
                        <div class="table-container">
                            <table class="static-table evidence-table">
                                <thead>
                                    <tr>
                                        <th class="font-weight-bold">{{ $t('requirementachievementcomponent.name') }}
                                        </th>
                                        <th class="font-weight-bold">{{ $t('requirementachievementcomponent.created_by')
                                        }}</th>
                                        <th class="font-weight-bold text-center">{{
                                            $t('requirementachievementcomponent.file') }}
                                        </th>
                                        <th class="font-weight-bold">{{ $t('requirementachievementcomponent.created_at')
                                        }}</th>
                                        <th class="font-weight-bold">{{ $t('requirementachievementcomponent.updated_at')
                                        }}</th>
                                        <th class="font-weight-bold text-center">{{
                                            $t('requirementachievementcomponent.status') }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in paginatedEvidence" :key="item.id" class="evidence-row">
                                        <td>
                                            <span class="font-weight-medium evidence-name">{{ item.name ||
                                                $t('requirementachievementcomponent.na') }}</span>
                                        </td>
                                        <td>
                                            <span>{{ getCreatedByName(item.created_by) }}</span>
                                        </td>
                                        <td class="text-center">
                                            <v-btn v-if="item.evidenc_file" small color="primary"
                                                :href="getEvidenceFileUrl(item.evidenc_file)" target="_blank"
                                                class="download-btn" outlined>
                                                <v-icon left small>mdi-download</v-icon>
                                                {{ $t('requirementachievementcomponent.download') }}
                                            </v-btn>
                                            <span v-else>{{ $t('requirementachievementcomponent.na') }}</span>
                                        </td>
                                        <td>
                                            {{ formatDateTime(item.created_at) }}
                                        </td>
                                        <td>
                                            {{ item.updated_at ? formatDateTime(item.updated_at) :
                                                $t('requirementachievementcomponent.na') }}
                                        </td>
                                        <td class="text-center">
                                            <v-menu>
                                                <template v-slot:activator="{ props }">
                                                    <v-chip :color="getEvidenceStatusColor(item.status)" v-bind="props"
                                                        small class="cursor-pointer status-chip">
                                                        {{ $t(`requirementachievementcomponent.${item.status ||
                                                            'pending'}`) }}
                                                        <v-icon right small>mdi-menu-down</v-icon>
                                                    </v-chip>
                                                </template>
                                                <v-list dense class="py-0 status-menu">
                                                    <v-list-item v-if="!isEndAuditControl()"
                                                        v-permission:updateEvidenceStatus
                                                        @click="updateEvidenceStatus(item, 'approved')"
                                                        :disabled="hasMappedControlInLatest(selectedRequirement)"
                                                        class="status-item"
                                                        :class="{ 'menu-item--disabled': hasMappedControlInLatest(selectedRequirement) }">
                                                        <v-list-item-title>
                                                            <v-icon small color="success">mdi-check</v-icon>
                                                            {{ $t('requirementachievementcomponent.approve') }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                    <v-list-item v-if="!isEndAuditControl()"
                                                        v-permission:updateEvidenceStatus
                                                        @click="updateEvidenceStatus(item, 'rejected')"
                                                        :disabled="hasMappedControlInLatest(selectedRequirement)"
                                                        class="status-item"
                                                        :class="{ 'menu-item--disabled': hasMappedControlInLatest(selectedRequirement) }">
                                                        <v-list-item-title>
                                                            <v-icon small color="error">mdi-close</v-icon>
                                                            {{ $t('requirementachievementcomponent.reject') }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                    <v-list-item v-if="!isEndAuditControl()"
                                                        v-permission:updateEvidenceStatus
                                                        @click="updateEvidenceStatus(item, 'not_relevant')"
                                                        :disabled="hasMappedControlInLatest(selectedRequirement)"
                                                        class="status-item"
                                                        :class="{ 'menu-item--disabled': hasMappedControlInLatest(selectedRequirement) }">
                                                        <v-list-item-title>
                                                            <v-icon small color="warning">mdi-alert-circle</v-icon>
                                                            {{ $t('requirementachievementcomponent.not_relevant') }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination for Evidence -->
                        <div class="d-flex justify-center py-3 mt-3">
                            <v-pagination v-model="evidencePage" :length="evidencePageCount" :total-visible="7" rounded
                                color="primary"></v-pagination>
                        </div>
                    </v-card-text>

                    <v-card-actions class="pa-4 dialog-actions">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="evidenceDialog = false" class="close-dialog-btn">
                            {{ $t('requirementachievementcomponent.close') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
    </div>
    <v-dialog v-model="showRequirementModal" max-width="1200px" persistent>
        <v-card class="requirement-dialog elevation-12">
            <!-- Dialog Header -->
            <v-toolbar color="primary" dark flat class="dialog-header">
                <v-toolbar-title class="text-h5 font-weight-medium">
                    <v-icon left size="large">mdi-file-document-multiple</v-icon>
                    {{ useExistingRequirement ? $t('requirementachievementcomponent.select_requirement') :
                        $t('requirementachievementcomponent.create_new_requirement') }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeDialog" class="close-btn">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <!-- Dialog Content -->
            <v-card-text class="dialog-content pa-6">
                <!-- Toggle Section -->
                <div class="selection-toggle mb-6">
                    <div class="text-subtitle-1 mb-3 font-weight-medium">{{
                        $t('requirementachievementcomponent.how_to_add')
                    }}</div>
                    <v-btn-toggle v-model="useExistingRequirement" mandatory class="toggle-group" color="primary"
                        rounded="lg" border>
                        <v-btn :value="true" class="toggle-btn" height="48" min-width="180">
                            <v-icon left>mdi-file-find</v-icon>
                            {{ $t('requirementachievementcomponent.select_existing') }}
                        </v-btn>
                        <v-btn :value="false" class="toggle-btn" height="48" min-width="180">
                            <v-icon left>mdi-file-plus</v-icon>
                            {{ $t('requirementachievementcomponent.create_new') }}
                        </v-btn>
                    </v-btn-toggle>
                </div>

                <!-- Requirement Form -->
                <v-form ref="requirementForm" lazy-validation class="requirement-form">
                    <v-slide-y-transition>
                        <div class="new-requirement">
                            <v-row dense>
                                <!-- Select Existing Requirement -->
                                <v-col cols="12" md="6" class="py-2" v-if="useExistingRequirement">
                                    <v-select v-model="selectedExistingRequirement" :items="requirements"
                                        item-title="name" item-value="id"
                                        :label="$t('requirementachievementcomponent.select_requirement_field') + ' *'"
                                        :loading="loadingRequirements"
                                        :rules="[v => !!v || $t('validation.requirement_required')]" variant="outlined"
                                        prepend-inner-icon="mdi-file-document" return-object clearable
                                        density="comfortable" class="input-field"></v-select>
                                </v-col>

                                <!-- New Requirement Name -->
                                <v-col cols="12" class="py-2" v-if="!useExistingRequirement">
                                    <v-text-field v-model="newRequirement.name"
                                        :label="$t('requirementachievementcomponent.name_field') + ' *'"
                                        :rules="[v => !!v || $t('validation.name_required')]" variant="outlined"
                                        prepend-inner-icon="mdi-form-textbox" density="comfortable"
                                        class="input-field"></v-text-field>
                                </v-col>

                                <!-- Notes (CKEditor) -->
                                <v-col cols="12" class="py-2" v-if="!useExistingRequirement">
                                    <div class="notes-container">
                                        <label class="text-caption text-medium-emphasis mb-1 d-block">{{
                                            $t('requirementachievementcomponent.notes_label') }}</label>
                                        <ckeditor :editor="editor" v-model="newRequirement.description"
                                            :config="editorConfig" class="editor-container mt-1" />
                                    </div>
                                </v-col>

                                <!-- Responsible Type -->
                                <v-col cols="12" md="6" class="py-2">
                                    <v-select v-model="newRequirement.responsible_type" :items="responsibleTypes"
                                        item-title="name" item-value="id"
                                        :label="$t('requirementachievementcomponent.responsible_type_field') + ' *'"
                                        :rules="[v => !!v || $t('validation.type_required')]" variant="outlined"
                                        prepend-inner-icon="mdi-account-cog" density="comfortable"
                                        @update:modelValue="updateResponsibleOptions" class="input-field"
                                        :disabled="useExistingRequirement"></v-select>
                                </v-col>

                                <!-- Responsible -->
                                <v-col cols="12" md="6" class="py-2">
                                    <v-select v-model="newRequirement.responsible_id" :items="responsibleOptions"
                                        item-title="name" item-value="id"
                                        :label="$t('requirementachievementcomponent.responsible_field') + ' *'"
                                        :loading="loadingResponsibleOptions"
                                        :rules="[v => !!v || $t('validation.responsible_required')]"
                                        :disabled="useExistingRequirement || !newRequirement.responsible_type"
                                        variant="outlined" prepend-inner-icon="mdi-account" density="comfortable"
                                        class="input-field"></v-select>
                                </v-col>

                                <!-- Due Date -->
                                <v-col cols="12" md="6" class="py-2">
                                    <v-text-field v-model="newRequirement.due_date"
                                        :label="$t('requirementachievementcomponent.due_date_field')" type="date"
                                        variant="outlined" :disabled="useExistingRequirement"
                                        prepend-inner-icon="mdi-calendar" density="comfortable"
                                        class="input-field"></v-text-field>
                                </v-col>

                                <!-- Expire Days -->
                                <v-col cols="12" md="6" class="py-2">
                                    <v-text-field v-model="newRequirement.expire_days"
                                        :label="$t('requirementachievementcomponent.expire_days_field')" type="number"
                                        variant="outlined" prepend-inner-icon="mdi-clock-outline" density="comfortable"
                                        class="input-field"
                                        :hint="$t('requirementachievementcomponent.expire_days_hint')" persistent-hint
                                        :disabled="useExistingRequirement"></v-text-field>
                                </v-col>
                            </v-row>
                        </div>
                    </v-slide-y-transition>
                </v-form>
            </v-card-text>

            <!-- Dialog Actions -->
            <v-card-actions class="dialog-actions pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="outlined" color="grey-darken-1" @click="closeDialog" class="mr-3 action-btn" height="48"
                    min-width="120">
                    {{ $t('requirementachievementcomponent.cancel') }}
                </v-btn>
                <v-btn color="primary" variant="flat" v-permission:addRequirement @click="addRequirement"
                    :disabled="!isFormValid" :loading="isSaving" class="action-btn" height="48" min-width="160">
                    <v-icon left>{{ useExistingRequirement ? 'mdi-plus' : 'mdi-content-save' }}</v-icon>
                    {{ useExistingRequirement ? $t('requirementachievementcomponent.add_selected') :
                        $t('requirementachievementcomponent.create_and_add') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- Evidence Submission Modal -->
    <v-dialog v-model="showEvidenceModal" max-width="800px" persistent>
        <v-card class="evidence-submission-dialog">
            <v-toolbar color="primary" dark flat>
                <v-toolbar-title>
                    <v-icon left>mdi-file-upload</v-icon>
                    {{ $t('requirementachievementcomponent.add_new_evidence') }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeEvidenceModal">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text class="pa-6">
                <v-form ref="evidenceForm" @submit.prevent="addNewEvidence">
                    <!-- Description -->
                    <v-text-field v-model="newEvidence.name"
                        :label="$t('requirementachievementcomponent.requirement_name_field') + ' *'"
                        :rules="[v => !!v || $t('requirementachievementcomponent.name_required')]" variant="outlined"
                        prepend-inner-icon="mdi-form-textbox" density="comfortable" class="input-field"></v-text-field>

                    <v-textarea v-model="newEvidence.description"
                        :label="$t('requirementachievementcomponent.description_field') + ' *'"
                        :rules="[v => !!v || $t('requirementachievementcomponent.description_required')]"
                        variant="outlined" rows="3" prepend-inner-icon="mdi-text" class="mb-4"></v-textarea>

                    <!-- File Upload -->
                    <v-file-input v-model="newEvidence.file"
                        :label="$t('requirementachievementcomponent.evidence_file_field') + ' *'"
                        :rules="[v => !!v || $t('requirementachievementcomponent.file_required')]" variant="outlined"
                        prepend-inner-icon="mdi-paperclip" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" show-size
                        counter class="mb-4"></v-file-input>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey" variant="text" @click="closeEvidenceModal">
                    {{ $t('requirementachievementcomponent.cancel') }}
                </v-btn>
                <v-btn color="primary" variant="flat" v-permission:addNewEvidence @click="addNewEvidence"
                    :loading="isSubmittingEvidence">
                    {{ $t('requirementachievementcomponent.submit_evidence_button') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <CommentsModal :isVisible="isVisible" @close="closeComments" :users="userData"
        commentableType="App\Models\FrameworkControlTestAudit\FrameworkControlTestAudit"
        :commentableId="RequirementIdActive" :userId="userId" />


</template>

<script>
import frameworkcontroltestaudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import requirement from "@/API/Requirement/Requirement";
import { notify } from "@kyvg/vue3-notification";
import axios from "axios";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CommentsModal from "@/components/Comment.vue";
import ControlMappingTree from "./ControlMappingTree.vue";
import Auth from "@/API/Auth";

export default {
    name: 'RequirementAchievementComponent',
    components: {
        ckeditor: Ckeditor,
        CommentsModal: CommentsModal,
        ControlMappingTree: ControlMappingTree
    },
    props: {
        controlAuditData: {
            type: Object,
            required: true
        },
        userData: {
            type: Array,
            default: () => []
        },
        teamData: {
            type: Array,
            default: () => []
        },
        departmentData: {
            type: Array,
            default: () => []
        }
    },
    setup() {
        return {
            frameworkcontroltestauditApi: new frameworkcontroltestaudit(),
            requirementApi: new requirement(),
        };
    },
    data() {
        return {
            editor: ClassicEditor,
            editorConfig: {
                toolbar: {
                    items: [
                        'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
                        '|', 'indent', 'outdent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'
                    ],
                    shouldNotGroupWhenFull: true
                },
                licenseKey: "GPL",
                height: 120,
            },
            evidenceDialog: false,
            selectedRequirement: null,
            selectedEvidence: [],
            selectedExistingRequirement: null,
            useExistingRequirement: false, // Toggle between existing and new
            requirementHeaders: [
                { title: this.$t("requirementachievementcomponent.name"), value: 'name' },
                { title: this.$t("requirementachievementcomponent.description"), value: 'description' },
                { title: this.$t("requirementachievementcomponent.actions"), value: 'actions' }
            ],

            loadingResponsibleOptions: false,
            responsibleOptions: [],
            showRequirementModal: false,
            requirementTab: 'existing',
            loadingRequirements: false,
            requirements: [],
            newRequirement: {
                name: '',
                responsible_type: 'user',
                responsible_id: null,
                check_type: 'daily',
                due_date: null,
                description: '',
                expire_days: ''
            },
            responsibleTypes: [
                { name: 'User', id: 'user' },
                { name: 'Team', id: 'team' },
                { name: 'Department', id: 'department' }
            ],
            // Pagination data for requirements
            requirementPage: 1,
            requirementItemsPerPage: 3,
            // Pagination data for evidence
            evidencePage: 1,
            evidenceItemsPerPage: 3,
            isSaving: false,
            isVisible: false,
            RequirementIdActive: '',
            showEvidenceModal: false,
            isSubmittingEvidence: false,
            newEvidence: {
                requirement_id: null,
                description: '',
                file: null,
                name: ''
            },
            openRequirementId: '',
            userId: Auth.USER.id,

        }
    },
    computed: {
        requirementsWithEvidence() {
            const requirements = this.controlAuditData?.requirements_with_evidence_data ||
                this.controlAuditData?.requirements_with_evidence ||
                [];

            return requirements.map(req => ({
                ...req,
                responsible_name: this.getResponsibleName(req)
            }));
        },

        // Paginated requirements data
        paginatedRequirements() {
            const start = (this.requirementPage - 1) * this.requirementItemsPerPage;
            const end = start + this.requirementItemsPerPage;
            return this.requirementsWithEvidence.slice(start, end);
        },

        // Calculate the total number of requirement pages
        requirementPageCount() {
            return Math.ceil(this.requirementsWithEvidence.length / this.requirementItemsPerPage);
        },

        // Paginated evidence data
        paginatedEvidence() {
            const start = (this.evidencePage - 1) * this.evidenceItemsPerPage;
            const end = start + this.evidenceItemsPerPage;
            return this.selectedEvidence.slice(start, end);
        },

        // Calculate the total number of evidence pages
        evidencePageCount() {
            return Math.ceil(this.selectedEvidence.length / this.evidenceItemsPerPage);
        },

        isFormValid() {
            if (this.useExistingRequirement) {
                return !!this.selectedExistingRequirement;
            } else {
                return (
                    this.newRequirement.name &&
                    this.newRequirement.responsible_type &&
                    this.newRequirement.responsible_id &&
                    this.newRequirement.due_date);
            }
        },
        isExistingRequirementDisabled() {
            return this.useExistingRequirement;
        },


    },
    watch: {
        // Reset form fields when toggle changes
        useExistingRequirement(newVal) {
            if (newVal) {
                // If switching to existing requirement, reset new requirement form
                this.resetNewRequirementForm();
            } else {
                // If switching to new requirement, reset all input values
                this.resetNewRequirementForm();
            }
        },
        // Reset to first page when evidence dialog is opened with new data
        selectedEvidence() {
            this.evidencePage = 1;
        },
        selectedExistingRequirement(newVal) {
            if (newVal) {
                // Populate responsible, due_date, and responsible_type from selected requirement
                this.newRequirement.responsible_type = newVal.responsible_type;
                this.newRequirement.responsible_id = newVal.responsible_id;
                this.newRequirement.due_date = newVal.due_date;
                this.newRequirement.expire_days = newVal.expire_days;

            }
        },
    },
    methods: {
        isEndAuditControl() {
            if (this.controlAuditData?.end_audit_status == 1 || this.controlAuditData?.open_closed_status == 1) {
                return true;
            } else {
                return false
            }
        },
        hasMappedControlInLatest(requirement) {
            // Check if requirement has a mapped control in latest_control_audit
            return requirement?.latest_control_audit?.control_mapped ? true : false;
        },
        openComments(item) {
            this.isVisible = true;
            this.RequirementIdActive = item.requirement_generate_Id
        },
        closeComments() {
            this.isVisible = false;
        },

        formatDate(dateString) {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString();
        },
        formatDateTime(dateString) {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleString();
        },
        getResponsibleName(requirement) {
            if (!requirement) return 'N/A';

            const responsibleType = requirement.responsible_type;
            const responsibleId = requirement.responsible_id;

            if (responsibleType === 'user') {
                const user = this.userData.find(u => u.id === responsibleId);
                return user ? user.full_name : 'Unknown User';
            } else if (responsibleType === 'team') {
                const team = this.teamData.find(t => t.id === responsibleId);
                return team ? team.name : 'Unknown Team';
            } else {
                const department = this.departmentData.find(t => t.id === responsibleId);
                return department ? department.name : 'Unknown department';
            }
        },
        getDueDateColor(dueDate) {
            if (!dueDate) return 'grey';
            const today = new Date();
            const due = new Date(dueDate);
            return due < today ? 'error' : 'success';
        },
        getStatusColor(status) {
            switch (status?.toLowerCase()) {
                case 'approved': return 'success';
                case 'rejected': return 'error';
                case 'not_relevant': return 'warning';
                default: return 'grey';
            }
        },
        getEvidenceStatusColor(status) {
            return this.getStatusColor(status);
        },
        showEvidence(requirement) {
            this.selectedRequirement = requirement;
            this.selectedEvidence = requirement.evidence || [];
            this.evidencePage = 1; // Reset to first page when opening evidence dialog
            this.evidenceDialog = true;
        },
        getEvidenceFileUrl(filename) {
            if (!filename) return null;
            const url = `${BASEPATH}/storage/uploads/evidence/file/${filename}`;
            return url.replace('api//', ''); // Fix double slash after api
        },
        getCreatedByName(userId) {
            if (!userId) return 'N/A';
            const user = this.userData.find(u => u.id === userId);
            return user ? user.full_name : 'Unknown User';
        },
        async updateEvidenceStatus(evidence, status) {
            try {
                const payload = {
                    control_audit_id: this.controlAuditData.id,
                    requirement_id: this.selectedRequirement.requirement_id,
                    evidence_id: evidence.evidence_id,
                    status: status
                };

                const response = await this.frameworkcontroltestauditApi.updateEvidenceStatus(payload);

                evidence.status = status;
                if (response.data.status === 'success') {
                    notify({
                        title: this.$t("requirementachievementcomponent.success"),
                        text: this.$t("requirementachievementcomponent.evidence_status_updated"),
                        type: "success",
                    });
                    const actualData = response.data.data;
                    this.$emit('requirement-updated', {
                        controlAuditId: this.controlAuditData.id,
                        updatedControlAudit: actualData
                    });
                }
            } catch (error) {
                console.error('Error updating evidence status:', error);
                notify({
                    title: this.$t("requirementachievementcomponent.error"),
                    text: this.$t("requirementachievementcomponent.evidence_status_update_failed"),
                    type: "error",
                });
            }
        },
        canApproveRequirement(requirement) {
            if (!requirement.evidence || requirement.evidence.length === 0) {
                return true; // No evidence, can approve directly
            }

            // Check if all evidence is either approved or not_relevant
            return requirement.evidence.every(ev =>
                ev.status === 'approved' || ev.status === 'not_relevant'
            );
        },
        async updateRequirementStatus(requirement, status) {
            try {
                const payload = {
                    control_audit_id: this.controlAuditData.id,
                    requirement_id: requirement.requirement_id,
                    status: status
                };

                const response = await this.frameworkcontroltestauditApi.updateRequirementStatus(payload);

                requirement.status = status;

                this.$emit('requirement-updated', {
                    requirement_id: requirement.requirement_id,
                    status: status
                });

                if (response.data.status === 'success') {
                    notify({
                        title: this.$t("requirementachievementcomponent.success"),
                        text: this.$t("requirementachievementcomponent.requirement_status_updated"),
                        type: "success",
                    });
                }
            } catch (error) {
                console.error('Error updating requirement status:', error);
                notify({
                    title: this.$t("requirementachievementcomponent.error"),
                    text: this.$t("requirementachievementcomponent.requirement_status_update_failed"),
                    type: "error",
                });
            }
        },
        async openRequirementModal() {
            this.showRequirementModal = true;
            this.useExistingRequirement = true; // Default to existing requirement
            this.selectedExistingRequirement = null;
            this.resetNewRequirementForm(); // Reset new requirement form
            await this.fetchRequirements();
        },
        async closeDialog() {
            this.showRequirementModal = false;
            this.useExistingRequirement = true;
            this.selectedExistingRequirement = null;
            this.resetNewRequirementForm(); // Reset new requirement form
        },

        async fetchRequirements() {
            this.loadingRequirements = true;
            try {
                const response = await this.requirementApi.getAll({ select: "id|name|responsible_type|responsible_id|due_date|expire_days" });

                // Get IDs of requirements already associated with this control audit
                const existingRequirementIds = this.controlAuditData?.requirements_with_evidence_data?.map(
                    req => req.requirement_id
                ) || [];

                // Filter out requirements that are already associated
                this.requirements = response.filter(
                    req => !existingRequirementIds.includes(req.id)
                );
            } catch (error) {
                console.error('Error fetching requirements:', error);
            } finally {
                this.loadingRequirements = false;
            }
        },
        async updateResponsibleOptions() {
            this.loadingResponsibleOptions = true;
            this.newRequirement.responsible_id = null;

            try {
                if (this.newRequirement.responsible_type === 'user') {
                    this.responsibleOptions = this.userData.map(user => ({
                        id: user.id,
                        name: user.full_name
                    }));
                } else if (this.newRequirement.responsible_type === 'team') {
                    this.responsibleOptions = this.teamData.map(team => ({
                        id: team.id,
                        name: team.name
                    }));
                } else if (this.newRequirement.responsible_type === 'department') {
                    // If you have department data, map it here
                    this.responsibleOptions = this.departmentData.map(department => ({
                        id: department.id,
                        name: department.name
                    }));
                }
            } catch (error) {
                console.error('Error fetching responsible options:', error);
            } finally {
                this.loadingResponsibleOptions = false;
            }
        },

        async addRequirement() {
            // Due date validation
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (!this.useExistingRequirement) {
                // Creating new requirement: due date must not be in the past
                if (!this.newRequirement.due_date) {
                    notify({
                        title: this.$t("requirementachievementcomponent.validation_error"),
                        text: this.$t("requirementachievementcomponent.due_date_required"),
                        type: 'error'
                    });
                    return;
                }
                if (new Date(this.newRequirement.due_date) < today) {
                    notify({
                        title: this.$t("requirementachievementcomponent.validation_error"),
                        text: this.$t("requirementachievementcomponent.due_date_past"),
                        type: 'error'
                    });
                    return;
                }
            } else if (this.useExistingRequirement && this.selectedExistingRequirement) {
                // Editing existing requirement
                if (!this.newRequirement.due_date) {
                    notify({
                        title: this.$t("requirementachievementcomponent.validation_error"),
                        text: this.$t("requirementachievementcomponent.due_date_required"),
                        type: 'error'
                    });
                    return;
                }
                if (this.selectedExistingRequirement.due_date !== this.newRequirement.due_date &&
                    new Date(this.newRequirement.due_date) < today) {
                    notify({
                        title: this.$t("requirementachievementcomponent.validation_error"),
                        text: this.$t("requirementachievementcomponent.due_date_past"),
                        type: 'error'
                    });
                    return;
                }
            }

            try {
                this.isSaving = true;

                const payload = {
                    control_audit_id: this.controlAuditData.id,
                    control_id: this.controlAuditData.control_id,
                    framework_id: this.controlAuditData?.control?.framework_id,
                    requirementSaved: this.newRequirement
                };

                if (this.useExistingRequirement && this.selectedExistingRequirement) {
                    payload.requirement_id = this.selectedExistingRequirement.id;
                }

                const response = await this.frameworkcontroltestauditApi.addNewRequirement(payload);

                console.log('Full response:', response); // Debug log

                if (response.data.status == "success") {
                    const actualData = response.data.data;
                    // Close modal first
                    this.showRequirementModal = false;
                    this.selectedExistingRequirement = null;
                    this.resetNewRequirementForm();

                    this.$emit('requirement-updated', {
                        controlAuditId: this.controlAuditData.id,
                        updatedControlAudit: actualData
                    });

                    notify({
                        title: this.$t("requirementachievementcomponent.success"),
                        text: this.$t("requirementachievementcomponent.requirement_added"),
                        type: "success",
                    });
                }
            } catch (error) {
                console.error('Error adding requirement:', error);
                let errorMessage = this.$t("requirementachievementcomponent.add_requirement_failed");
                if (error.response) {
                    if (error.response.data.errors) {
                        errorMessage = Object.values(error.response.data.errors).flat().join(' ');
                    }
                }
                notify({
                    title: this.$t("requirementachievementcomponent.error"),
                    text: errorMessage,
                    type: "error",
                });
            } finally {
                this.isSaving = false;
            }
        },

        resetNewRequirementForm() {
            this.newRequirement = {
                name: '',
                responsible_type: 'user',
                responsible_id: null,
                check_type: 'daily',
                due_date: null,
                description: '',
                expire_days: ''
            };
        },
        openEvidenceModal(item) {
            this.openRequirementId = item.requirement_id;
            this.showEvidenceModal = true;
            this.resetEvidenceForm();
        },

        closeEvidenceModal() {
            this.showEvidenceModal = false;
            this.resetEvidenceForm();
        },

        resetEvidenceForm() {
            this.newEvidence = {
                requirement_id: null,
                description: '',
                name: '',
                file: null
            };
            this.$refs.evidenceForm?.resetValidation();
        },

        async addNewEvidence() {
            if (!this.$refs.evidenceForm.validate()) return;

            this.isSubmittingEvidence = true;

            try {
                const payload = {
                    control_audit_id: this.controlAuditData.id,
                    requirement_id: this.openRequirementId,
                    description: this.newEvidence.description,
                    name: this.newEvidence.name,
                    file: this.newEvidence.file,
                };

                const response = await this.frameworkcontroltestauditApi.addNewEvidence(payload);

                if (response.data.status === 'success') {
                    notify({
                        title: this.$t("requirementachievementcomponent.success"),
                        text: this.$t("requirementachievementcomponent.evidence_submitted"),
                        type: "success",
                    });

                    // Emit event to refresh the requirements data
                    this.$emit('requirement-updated', {
                        controlAuditId: this.controlAuditData.id,
                    });
                    this.closeEvidenceModal();
                }
            } catch (error) {
                console.error('Error submitting evidence:', error);
                notify({
                    title: this.$t("requirementachievementcomponent.error"),
                    text: error.response?.data?.message || this.$t("requirementachievementcomponent.submit_evidence_failed"),
                    type: "error",
                });
            } finally {
                this.isSubmittingEvidence = false;
            }
        },

        // Helper method to convert file to base64
        getBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    // Remove the data URL prefix (e.g., "data:image/png;base64,")
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = error => reject(error);
            });
        }
    },
    mounted() {
        // Initialize responsible options based on default type
        this.updateResponsibleOptions();
    }
};
</script>


<style scoped>
.requirement-achievement {
    margin-top: 30px;
    padding-bottom: 30px;
}

.requirement-card {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
    background-color: white;
}

.card-header {
    padding: 20px 24px;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: #f0f0f0 !important;
}

.header-icon {
    margin-right: 10px;
    font-size: 22px;
}

.table-container {
    overflow-x: auto;
    width: 100%;
    padding: 0;
    box-shadow: none;
    border-radius: 0;
}

.static-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    background-color: white;
}

.static-table thead th {
    background-color: #f8fafc;
    padding: 16px;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 2;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 2px solid rgba(0, 0, 0, 0.08);
}

.static-table tbody td {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    vertical-align: middle;
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background-color: rgba(52, 152, 219, 0.05);
}

.text-center {
    text-align: center;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.requirement-name {
    color: #2c3e50;
    font-weight: 600;
}

.description-cell {
    color: #555;
    line-height: 1.4;
}

.responsible-cell {
    font-weight: 500;
}

.due-date-chip,
.status-chip {
    font-weight: 600;
    border-radius: 16px;
    height: 26px !important;
    font-size: 0.75rem;
    padding: 0 12px;
    text-transform: capitalize;
}

.evidence-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(52, 152, 219, 0.1);
    border-radius: 50%;
    padding: 8px;
}

.action-btn {
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 15px;
    transition: background-color 0.2s ease;
}

.action-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.action-menu {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.menu-item {
    padding: 8px 16px;
    transition: background-color 0.2s ease;
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

/* Dialog styles */
.evidence-dialog {
    border-radius: 16px;
}

.dialog-card {
    border-radius: 12px;
    overflow: hidden;
}

.dialog-header {
    background: #f0f0f0 !important;
}

.dialog-title {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: black;
}

.dialog-content {
    padding: 24px !important;
    background-color: #f8fafc;
}

.evidence-table {
    margin-top: 10px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-menu>.v-overlay__content>.v-list {

    overflow: hidden;
}

.evidence-table thead th {
    background-color: #f0f4f8;
}

.evidence-row {
    background-color: white;
}

.evidence-row:hover {
    background-color: rgba(52, 152, 219, 0.05);
}

.evidence-name {
    font-weight: 600;
    color: #2c3e50;
}

.download-btn {
    text-transform: none;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 20px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.download-btn:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.status-menu {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.status-item {
    padding: 8px 16px;
    transition: background-color 0.2s ease;
}

.status-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.dialog-actions {
    background-color: white;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.close-dialog-btn {
    text-transform: none;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 8px;
    padding: 0 24px;
    background: #f0f0f0 !important;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.close-dialog-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.close-btn {
    transition: background-color 0.2s ease;
    color: black;
}

.close-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

/* Custom scrollbar */
.dialog-content {
    scrollbar-width: thin;
    scrollbar-color: #3498db #f5f5f5;
}

.dialog-content::-webkit-scrollbar {
    width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 8px;
}

.dialog-content::-webkit-scrollbar-thumb {
    background-color: #3498db;
    border-radius: 8px;
}

.requirement-dialog {
    border-radius: 12px;
    overflow: hidden;
}

.toggle-group {
    width: 100%;
    border-radius: 8px;
}

.toggle-btn {
    flex: 1;
    height: 48px;
    text-transform: none;
    letter-spacing: normal;
}

.editor-container {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    padding: 8px;
    min-height: 150px;
}

.editor-container:hover {
    border-color: rgba(0, 0, 0, 0.38);
}

.editor-container:focus-within {
    border-color: var(--v-primary-base);
    border-width: 2px;
}

.v-card-actions {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Dialog overall styling */
.requirement-dialog {
    border-radius: 12px !important;
    overflow: hidden;
}

.dialog-header {
    padding: 16px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.dialog-content {
    max-height: 70vh;
    overflow-y: auto;
}

/* Form elements styling */
.input-field {
    margin-bottom: 8px;
}

.toggle-group {
    width: 100%;
    justify-content: center;
}

.toggle-btn {
    flex: 1;
    max-width: 240px;
}

/* Editor styling */
.notes-container {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 8px;
}

.editor-container .ck-editor__editable {
    min-height: 120px;
    max-height: 200px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

/* Action buttons */
.dialog-actions {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    padding: 16px 24px;
}

.action-btn {
    text-transform: none;
    letter-spacing: normal;
    font-weight: 500;
}

.action-menu {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    max-width: 280px;
}

.menu-item {
    padding: 12px 16px;
    min-height: 56px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    background: transparent;
}

.menu-item:hover:not(.menu-item--disabled) {
    background: linear-gradient(90deg, rgba(33, 150, 243, 0.04) 0%, rgba(33, 150, 243, 0.02) 100%);
    transform: translateX(2px);
}

.menu-item--view:hover {
    background: linear-gradient(90deg, rgba(33, 150, 243, 0.06) 0%, rgba(33, 150, 243, 0.02) 100%);
}

.menu-item--attach:hover {
    background: linear-gradient(90deg, rgba(76, 175, 80, 0.06) 0%, rgba(76, 175, 80, 0.02) 100%);
}

.menu-item--comments:hover {
    background: linear-gradient(90deg, rgba(156, 39, 176, 0.06) 0%, rgba(156, 39, 176, 0.02) 100%);
}

.menu-item--approve:hover:not(.menu-item--disabled) {
    background: linear-gradient(90deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.02) 100%);
}

.menu-item--reject:hover {
    background: linear-gradient(90deg, rgba(244, 67, 54, 0.06) 0%, rgba(244, 67, 54, 0.02) 100%);
}

.menu-item--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.menu-item--disabled:hover {
    transform: none;
    background: transparent;
}

.menu-icon {
    margin-right: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item:hover:not(.menu-item--disabled) .menu-icon {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-text {
    font-weight: 500;
    font-size: 14px;
    color: #424242;
    transition: color 0.3s ease;
}

.menu-item:hover:not(.menu-item--disabled) .menu-text {
    color: #1976d2;
}

.menu-item--approve:hover:not(.menu-item--disabled) .menu-text {
    color: #388e3c;
}

.menu-item--reject:hover .menu-text {
    color: #d32f2f;
}

.menu-divider {
    margin: 0 16px;
    opacity: 0.12;
}

.thick-divider {
    border-width: 2px;
    margin: 4px 16px;
    opacity: 0.2;
}

/* Add subtle animation on menu open */
.action-menu {
    animation: slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .action-menu {
        max-width: 100%;
    }

    .menu-item {
        padding: 14px 16px;
        min-height: 60px;
    }

    .menu-text {
        font-size: 15px;
    }
}

/* Dark theme support */
.v-theme--dark .action-menu {
    background: linear-gradient(145deg, #2d2d2d 0%, #1e1e1e 100%);
    border-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .menu-text {
    color: #e0e0e0;
}

.v-theme--dark .menu-item:hover:not(.menu-item--disabled) .menu-text {
    color: #90caf9;
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .dialog-content {
        padding: 16px !important;
    }

    .toggle-btn {
        min-width: 140px !important;
    }

    .action-btn {
        min-width: 100px !important;
    }
}

/* Responsive adjustments */
@media (max-width: 960px) {
    .static-table {
        font-size: 0.8rem;
    }

    .static-table thead th,
    .static-table tbody td {
        padding: 12px;
    }
}
</style>