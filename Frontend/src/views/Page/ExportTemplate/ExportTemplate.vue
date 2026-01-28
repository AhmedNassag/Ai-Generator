<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'exporttemplate.manager'"
    :subPage="'exporttemplate.templates'"
    :titlePage="'Export Template Manager'"
  >
    <template #datatable>
      <DataTable
        ref="table"
        id="export-template-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="{}"
        :editItem="editItem"
        :openForm="openForm"
        :filters="filterConfig"
      >
        <template #Type="{ item }">
          <span
            class="badge"
            :class="item.type === 'Excel' ? 'badge-excel' : 'badge-pdf'"
          >
            <svg
              v-if="item.type === 'Excel'"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M14 2v6h6M10 13l2 2-2 2M14 13l-2 2 2 2"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M14 2v6h6M10 9h4M10 13h4M10 17h4"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            {{ item.type }}
          </span>
        </template>

        <template #Active="{ item }">
          <div class="form-check form-switch">
            <input
              type="checkbox"
              class="form-check-input"
              :checked="item.active"
              @change="toggleActive(item)"
              role="switch"
            />
          </div>
        </template>

        <template #addAction="{ item }">
          <v-list-item @click="previewTemplate(item)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-eye-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">Preview</v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <template #form>
      <div class="template-form-container">
        <!-- Form Header with Steps -->
        <div class="form-steps">
          <div
            class="step-item"
            :class="{ active: currentStep === 1, completed: currentStep > 1 }"
            @click="goToStep(1)"
          >
            <div class="step-number">1</div>
            <div class="step-label">Basic Info</div>
          </div>
          <div class="step-divider"></div>
          <div
            class="step-item"
            :class="{ active: currentStep === 2, completed: currentStep > 2 }"
            @click="goToStep(2)"
          >
            <div class="step-number">2</div>
            <div class="step-label">{{ newItem.type }} Layout</div>
          </div>
          <div class="step-divider"></div>
          <div
            class="step-item"
            :class="{ active: currentStep === 3 }"
            @click="goToStep(3)"
          >
            <div class="step-number">3</div>
            <div class="step-label">Preview & Save</div>
          </div>
        </div>

        <!-- Step 1: Basic Information -->
        <div v-show="currentStep === 1" class="form-step">
          <h3 class="step-title">Basic Information</h3>

          <div class="form-group">
            <label>Template Name <span class="required">*</span></label>
            <input
              v-model="newItem.name"
              type="text"
              class="form-control"
              placeholder="e.g., Monthly Sales Report - Excel"
            />
          </div>

          <div class="form-group">
            <label>Export Type <span class="required">*</span></label>
            <div class="type-selector">
              <label class="type-option" :class="{ selected: newItem.type === 'Excel' }">
                <input type="radio" v-model="newItem.type" value="Excel" />
                <div class="type-card">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M14 2v6h6M10 13l2 2-2 2M14 13l-2 2 2 2"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  <span>Excel</span>
                  <small>Spreadsheet with formulas</small>
                </div>
              </label>

              <label class="type-option" :class="{ selected: newItem.type === 'PDF' }">
                <input type="radio" v-model="newItem.type" value="PDF" />
                <div class="type-card">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M14 2v6h6M10 9h4M10 13h4M10 17h4"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  <span>PDF</span>
                  <small>Print-ready document</small>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="newItem.description"
              class="form-control"
              rows="3"
              placeholder="Brief description of this template's purpose..."
            ></textarea>
          </div>

         
        </div>

        <!-- Step 2: Excel Layout -->
        <div v-show="currentStep === 2 && newItem.type === 'Excel'" class="form-step">
          <h3 class="step-title">Excel Layout Configuration</h3>

          <div class="layout-section">
            <h4>Header Styling</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Header Background</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="newItem.excel_config.header_bg_color"
                    class="color-input"
                  />
                  <input
                    type="text"
                    v-model="newItem.excel_config.header_bg_color"
                    class="color-text"
                    placeholder="#6e3894"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Header Text Color</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="newItem.excel_config.header_text_color"
                    class="color-input"
                  />
                  <input
                    type="text"
                    v-model="newItem.excel_config.header_text_color"
                    class="color-text"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Header Font Size</label>
                <select
                  v-model="newItem.excel_config.header_font_size"
                  class="form-control"
                >
                  <option :value="10">10pt</option>
                  <option :value="11">11pt</option>
                  <option :value="12">12pt</option>
                  <option :value="14">14pt</option>
                  <option :value="16">16pt</option>
                  <option :value="18">18pt</option>
                </select>
              </div>
            </div>
          </div>

          <div class="layout-section">
            <h4>Body Styling</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Font Family</label>
                <select v-model="newItem.excel_config.font_family" class="form-control">
                  <option>Arial</option>
                  <option>Calibri</option>
                  <option>Times New Roman</option>
                  <option>Verdana</option>
                  <option>Helvetica</option>
                </select>
              </div>

              <div class="form-group">
                <label>Font Size</label>
                <select v-model="newItem.excel_config.font_size" class="form-control">
                  <option :value="9">9pt</option>
                  <option :value="10">10pt</option>
                  <option :value="11">11pt</option>
                  <option :value="12">12pt</option>
                  <option :value="14">14pt</option>
                </select>
              </div>

              <div class="form-group">
                <label>Row Height</label>
                <select v-model="newItem.excel_config.row_height" class="form-control">
                  <option :value="15">Compact (15)</option>
                  <option :value="20">Normal (20)</option>
                  <option :value="25">Comfortable (25)</option>
                  <option :value="30">Spacious (30)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="layout-section">
            <h4>Borders & Lines</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Border Style</label>
                <select v-model="newItem.excel_config.border_style" class="form-control">
                  <option value="none">None</option>
                  <option value="thin">Thin</option>
                  <option value="medium">Medium</option>
                  <option value="thick">Thick</option>
                </select>
              </div>

              <div class="form-group">
                <label>Border Color</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="newItem.excel_config.border_color"
                    class="color-input"
                  />
                  <input
                    type="text"
                    v-model="newItem.excel_config.border_color"
                    class="color-text"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Alternating Rows</label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newItem.excel_config.alternating_rows"
                  />
                  <span>Enable zebra stripes</span>
                </label>
              </div>
            </div>
          </div>

          <div class="layout-section">
            <h4>Additional Options</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newItem.excel_config.freeze_header" />
                  <span>Freeze header row</span>
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newItem.excel_config.auto_filter" />
                  <span>Enable auto-filter</span>
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newItem.excel_config.auto_width" />
                  <span>Auto-adjust column width</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: PDF Layout -->
        <div v-show="currentStep === 2 && newItem.type === 'PDF'" class="form-step">
          <h3 class="step-title">PDF Layout Configuration</h3>

          <div class="layout-section">
            <h4>Page Setup</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Page Size</label>
                <select v-model="newItem.pdf_config.page_size" class="form-control">
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="Letter">Letter (8.5 x 11 in)</option>
                  <option value="Legal">Legal (8.5 x 14 in)</option>
                  <option value="A3">A3 (297 x 420 mm)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Orientation</label>
                <select v-model="newItem.pdf_config.orientation" class="form-control">
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div class="form-group">
                <label>Margins</label>
                <select v-model="newItem.pdf_config.margin" class="form-control">
                  <option value="narrow">Narrow (10mm)</option>
                  <option value="normal">Normal (15mm)</option>
                  <option value="wide">Wide (25mm)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="layout-section">
            <h4>Header & Footer</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Header Background</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="newItem.pdf_config.header_bg_color"
                    class="color-input"
                  />
                  <input
                    type="text"
                    v-model="newItem.pdf_config.header_bg_color"
                    class="color-text"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Header Text Color</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="newItem.pdf_config.header_text_color"
                    class="color-input"
                  />
                  <input
                    type="text"
                    v-model="newItem.pdf_config.header_text_color"
                    class="color-text"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="newItem.pdf_config.show_page_numbers" />
                <span>Show page numbers</span>
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="newItem.pdf_config.show_date" />
                <span>Show export date</span>
              </label>
            </div>
          </div>

          <div class="layout-section">
            <h4>Table Styling</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Font Family</label>
                <select v-model="newItem.pdf_config.font_family" class="form-control">
                  <option>Arial</option>
                  <option>Times</option>
                  <option>Courier</option>
                  <option>Helvetica</option>
                </select>
              </div>

              <div class="form-group">
                <label>Font Size</label>
                <select v-model="newItem.pdf_config.font_size" class="form-control">
                  <option :value="8">8pt</option>
                  <option :value="9">9pt</option>
                  <option :value="10">10pt</option>
                  <option :value="11">11pt</option>
                  <option :value="12">12pt</option>
                </select>
              </div>

              <div class="form-group">
                <label>Border Style</label>
                <select v-model="newItem.pdf_config.border_style" class="form-control">
                  <option value="all">All borders</option>
                  <option value="horizontal">Horizontal only</option>
                  <option value="none">No borders</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newItem.pdf_config.alternating_rows" />
                  <span>Alternating row colors</span>
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newItem.pdf_config.repeat_header" />
                  <span>Repeat header on each page</span>
                </label>
              </div>
            </div>
          </div>

          <div class="layout-section">
            <h4>Logo & Branding (Optional)</h4>
            <div class="form-group">
              <label>Company Logo</label>
              <div class="file-upload-wrapper">
                <input
                  type="file"
                  ref="logoInput"
                  @change="handleLogoUpload"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  class="file-input"
                  id="logo-upload"
                />
                <label for="logo-upload" class="file-upload-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ logoFileName || "Choose logo image" }}</span>
                </label>

                <!-- Logo Preview -->
                <div v-if="logoPreview" class="logo-preview">
                  <img :src="logoPreview" alt="Logo preview" />
                  <button @click="removeLogo" type="button" class="remove-logo-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <small class="help-text">Accepts: PNG, JPG, SVG (Max 2MB)</small>
            </div>

            <div class="form-group">
              <label>Document Title</label>
              <input
                v-model="newItem.pdf_config.document_title"
                type="text"
                class="form-control"
                placeholder="e.g., Monthly Sales Report"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Preview & Save -->
        <div v-show="currentStep === 3" class="form-step">
          <h3 class="step-title">Template Preview</h3>

          <div class="preview-container">
            <div class="preview-info">
              <div class="info-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <div>
                  <strong>{{ newItem.name || "Unnamed Template" }}</strong>
                  <small>{{ newItem.type }} Export</small>
                </div>
              </div>

              <div class="info-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path d="M12 3v6h6" stroke="currentColor" stroke-width="2" />
                </svg>
                <div>
                  <strong>Style Preview</strong>
                  <small
                    >{{
                      newItem.type === "Excel" ? "Spreadsheet" : "Document"
                    }}
                    format</small
                  >
                </div>
              </div>
            </div>

            <div class="preview-table-wrapper">
              <table class="preview-table" :style="getPreviewTableStyles()">
                <thead>
                  <tr>
                    <th :style="getPreviewHeaderStyles()">ID</th>
                    <th :style="getPreviewHeaderStyles()">Name</th>
                    <th :style="getPreviewHeaderStyles()">Email</th>
                    <th :style="getPreviewHeaderStyles()">Status</th>
                    <th :style="getPreviewHeaderStyles()">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr :style="hasAlternatingRows() ? {} : {}">
                    <td :style="getPreviewCellStyles()">001</td>
                    <td :style="getPreviewCellStyles()">Ahmed Abdulaziz</td>
                    <td :style="getPreviewCellStyles()">Ahmed@example.com</td>
                    <td :style="getPreviewCellStyles()">Active</td>
                    <td :style="getPreviewCellStyles()">2025-01-15</td>
                  </tr>
                  <tr :style="hasAlternatingRows() ? getAlternateRowStyle() : {}">
                    <td :style="getPreviewCellStyles()">002</td>
                    <td :style="getPreviewCellStyles()">Khaled</td>
                    <td :style="getPreviewCellStyles()">Khaled@example.com</td>
                    <td :style="getPreviewCellStyles()">Pending</td>
                    <td :style="getPreviewCellStyles()">2025-01-16</td>
                  </tr>
                  <tr :style="hasAlternatingRows() ? {} : {}">
                    <td :style="getPreviewCellStyles()">003</td>
                    <td :style="getPreviewCellStyles()">Bob Johnson</td>
                    <td :style="getPreviewCellStyles()">bob@example.com</td>
                    <td :style="getPreviewCellStyles()">Inactive</td>
                    <td :style="getPreviewCellStyles()">2025-01-17</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="preview-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path
                  d="M12 16v-4M12 8h.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span
                >This is a style preview with sample data. The actual export will use your
                real data with this styling.</span
              >
            </div>
          </div>
        </div>

        <!-- Form Footer with Navigation -->
        <div class="form-footer">
          <button
            v-if="currentStep > 1"
            @click="currentStep--"
            type="button"
            class="btn btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Previous
          </button>

          <button
            v-if="currentStep < 3"
            @click="nextStep"
            type="button"
            class="btn btn-primary"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <button
            v-if="currentStep === 3"
            @click="saveTemplate"
            type="button"
            class="btn btn-success"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                stroke="currentColor"
                stroke-width="2"
              />
              <polyline
                points="17 21 17 13 7 13 7 21"
                stroke="currentColor"
                stroke-width="2"
              />
              <polyline points="7 3 7 8 15 8" stroke="currentColor" stroke-width="2" />
            </svg>
            Save Template
          </button>

          <button @click="closeForm" type="button" class="btn btn-outline">Cancel</button>
        </div>
      </div>
    </template>
    <!-- Preview Dialog -->
  </main-page>
  <v-dialog v-model="previewDialog" persistent max-width="1200px" scrollable>
    <v-card>
      <!-- Dialog Header -->
      <v-card-title class="preview-dialog-header">
        <div class="header-content">
          <div>
            <h3>{{ previewItem?.name || "Template Preview" }}</h3>
            <span
              class="badge"
              :class="previewItem?.type === 'Excel' ? 'badge-excel' : 'badge-pdf'"
            >
              <svg
                v-if="previewItem?.type === 'Excel'"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M14 2v6h6M10 13l2 2-2 2M14 13l-2 2 2 2"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M14 2v6h6M10 9h4M10 13h4M10 17h4"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              {{ previewItem?.type }}
            </span>
          </div>
          <v-btn icon @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p v-if="previewItem?.description" class="description">
          {{ previewItem.description }}
        </p>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Dialog Content -->
      <v-card-text class="preview-dialog-content">
        <div class="preview-container-dialog">
          <!-- Template Info Cards -->
          <div class="preview-info-cards">
            <div class="info-card-dialog">
              <v-icon color="primary" size="24">mdi-palette</v-icon>
              <div>
                <strong>Style Configuration</strong>
                <small>{{
                  previewItem?.type === "Excel" ? "Excel Spreadsheet" : "PDF Document"
                }}</small>
              </div>
            </div>

            <div class="info-card-dialog">
              <v-icon color="primary" size="24">mdi-table</v-icon>
              <div>
                <strong>Sample Preview</strong>
                <small>5 rows with styling applied</small>
              </div>
            </div>
          </div>

          <!-- Logo Preview for PDF Templates (NEW) -->
          <div v-if="previewItem?.type === 'PDF' && previewItem?.LogoUrl" class="logo-preview-section">
            <div class="logo-container-preview">
              <img :src="previewItem.LogoUrl" alt="Company Logo" class="preview-logo" />
              <div v-if="previewConfig?.document_title" class="document-title-preview">
                {{ previewConfig.document_title }}
              </div>
            </div>
          </div>

          <!-- Preview Table -->
          <div class="preview-table-container">
            <table
              v-if="previewItem"
              class="preview-table-dialog"
              :style="getPreviewTableStylesDialog()"
            >
              <thead>
                <tr>
                  <th :style="getPreviewHeaderStylesDialog()">ID</th>
                  <th :style="getPreviewHeaderStylesDialog()">Name</th>
                  <th :style="getPreviewHeaderStylesDialog()">Email</th>
                  <th :style="getPreviewHeaderStylesDialog()">Status</th>
                  <th :style="getPreviewHeaderStylesDialog()">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr :style="getRowStyleDialog(1)">
                  <td :style="getPreviewCellStylesDialog()">001</td>
                  <td :style="getPreviewCellStylesDialog()">Ahmed Abdulaziz</td>
                  <td :style="getPreviewCellStylesDialog()">ahmed@example.com</td>
                  <td :style="getPreviewCellStylesDialog()">Active</td>
                  <td :style="getPreviewCellStylesDialog()">2025-01-15</td>
                </tr>
                <tr :style="getRowStyleDialog(2)">
                  <td :style="getPreviewCellStylesDialog()">002</td>
                  <td :style="getPreviewCellStylesDialog()">Khaled Mohammed</td>
                  <td :style="getPreviewCellStylesDialog()">khaled@example.com</td>
                  <td :style="getPreviewCellStylesDialog()">Pending</td>
                  <td :style="getPreviewCellStylesDialog()">2025-01-16</td>
                </tr>
                <tr :style="getRowStyleDialog(3)">
                  <td :style="getPreviewCellStylesDialog()">003</td>
                  <td :style="getPreviewCellStylesDialog()">Sara Ali</td>
                  <td :style="getPreviewCellStylesDialog()">sara@example.com</td>
                  <td :style="getPreviewCellStylesDialog()">Active</td>
                  <td :style="getPreviewCellStylesDialog()">2025-01-17</td>
                </tr>
                <tr :style="getRowStyleDialog(4)">
                  <td :style="getPreviewCellStylesDialog()">004</td>
                  <td :style="getPreviewCellStylesDialog()">Omar Hassan</td>
                  <td :style="getPreviewCellStylesDialog()">omar@example.com</td>
                  <td :style="getPreviewCellStylesDialog()">Inactive</td>
                  <td :style="getPreviewCellStylesDialog()">2025-01-18</td>
                </tr>
                <tr :style="getRowStyleDialog(5)">
                  <td :style="getPreviewCellStylesDialog()">005</td>
                  <td :style="getPreviewCellStylesDialog()">Fatima Ibrahim</td>
                  <td :style="getPreviewCellStylesDialog()">fatima@example.com</td>
                  <td :style="getPreviewCellStylesDialog()">Active</td>
                  <td :style="getPreviewCellStylesDialog()">2025-01-19</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Preview Note -->
          <div class="preview-note-dialog">
            <v-icon size="20" color="#1e40af">mdi-information</v-icon>
            <span
              >This is a style preview with sample data. The actual export will use your
              real data with this styling.</span
            >
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Dialog Actions -->
      <v-card-actions class="preview-dialog-actions">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="previewDialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import exportTemplateAPI from "@/API/ExportTemplate/ExportTemplate";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
  },

  setup() {
    const api = new exportTemplateAPI();
    return { api };
  },

  async mounted() {
    await this.loadAvailableColumns();
  },

  data() {
    return {
      isFlipped: false,
      newItem: {},
      tableColumns: [],
      availableColumns: [],
      currentStep: 1,
      logoFile: null,
      logoFileName: "",
      logoPreview: null,
      previewDialog: false,
      previewItem: null,
      previewConfig: null,
      filterConfig: [
        {
          key: "type",
          label: "Template Type",
          type: "select",
          options: [
            { value: "Excel", label: "Excel" },
            { value: "PDF", label: "PDF" },
          ],
        },
        {
          key: "active",
          label: "Status",
          type: "select",
          options: [
            { value: true, label: "Active" },
            { value: false, label: "Inactive" },
          ],
        },
      ],
    };
  },

  created() {
    this.initializeTableColumns();
  },

  methods: {
    initializeTableColumns() {
      this.tableColumns = [
        { title: "Name", data: "name", defaultContent: "N/A" },
        { title: "Type", data: "type", defaultContent: "N/A", id: "Type" },
        { title: "Description", data: "description", defaultContent: "N/A" },
        { title: "Active", data: "active", defaultContent: "N/A", id: "Active" },
        { title: "Created", data: "created_at", defaultContent: "N/A" },
      ];
    },

    async loadAvailableColumns() {
      try {
        const response = await this.api.getAvailableColumns();
        this.availableColumns = (response.data || []).map((col) => ({
          value: col,
          label: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
      } catch (error) {
        console.error("Error loading columns:", error);
      }
    },

    openForm() {
      this.currentStep = 1;
      this.newItem = {
        name: "",
        type: "Excel",
        description: "",
        active: true,
        excel_config: {
          header_bg_color: "#6e3894",
          header_text_color: "#ffffff",
          header_font_size: 12,
          font_family: "Arial",
          font_size: 11,
          row_height: 20,
          border_style: "thin",
          border_color: "#000000",
          alternating_rows: true,
          freeze_header: true,
          auto_filter: true,
          auto_width: true,
        },
        pdf_config: {
          page_size: "A4",
          orientation: "portrait",
          margin: "normal",
          header_bg_color: "#6e3894",
          header_text_color: "#ffffff",
          show_page_numbers: true,
          show_date: true,
          font_family: "Arial",
          font_size: 10,
          border_style: "all",
          alternating_rows: true,
          repeat_header: true,
          logo_url: "",
          document_title: "",
        },
      };
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
      this.currentStep = 1;
      this.logoFile = null;
      this.logoFileName = "";
      this.logoPreview = null;
    },

    editItem(data) {
      this.newItem = JSON.parse(JSON.stringify(data));

      // Parse configs if they're JSON strings
      if (typeof this.newItem.excel_config === "string") {
        this.newItem.excel_config = JSON.parse(this.newItem.excel_config);
      }
      if (typeof this.newItem.pdf_config === "string") {
        this.newItem.pdf_config = JSON.parse(this.newItem.pdf_config);
      }

      // Handle existing logo
      if (this.newItem.logo_path) {
        this.logoPreview = this.newItem.logo_path;
        this.logoFileName = this.newItem.logo_path.split("/").pop();
      }

      this.isFlipped = true;
    },

    async toggleActive(item) {
      try {
        await this.api.changeStatus(item.id);
         this.$refs.table.refreshTable();
    
        // إشعار المستخدم
        if (item.active) {
          this.showNotification('success', `Template deactivated successfully`);
        } else {
          this.showNotification('success', `Template activated successfully. All other ${item.type} templates have been deactivated.`);
        }
      } catch (error) {
        console.error("Error toggling active:", error);
      }
    },

    async duplicateTemplate(item) {
      try {
        const duplicate = { ...item, name: `${item.name} (Copy)`, id: undefined };
        delete duplicate.created_at;
        delete duplicate.updated_at;
        await this.api.insert(duplicate);
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Error duplicating:", error);
      }
    },

    previewTemplate(item) {
      // Parse configs if they're JSON strings
      const excelConfig =
        typeof item.excel_config === "string"
          ? JSON.parse(item.excel_config)
          : item.excel_config;
      const pdfConfig =
        typeof item.pdf_config === "string"
          ? JSON.parse(item.pdf_config)
          : item.pdf_config;

      // Store the item and config for the dialog
      this.previewItem = item;
      this.previewConfig = item.type === "Excel" ? excelConfig : pdfConfig;

      // Open the dialog
      this.previewDialog = true;
    },
    getPreviewTableStylesDialog() {
      if (!this.previewConfig) return {};

      return {
        fontFamily: this.previewConfig.font_family || "Arial",
        fontSize: `${this.previewConfig.font_size || 11}px`,
        borderCollapse: "collapse",
        width: "100%",
      };
    },

    getPreviewHeaderStylesDialog() {
      if (!this.previewConfig) return {};

      return {
        backgroundColor: this.previewConfig.header_bg_color || "#6e3894",
        color: this.previewConfig.header_text_color || "#ffffff",
        padding: "12px",
        fontWeight: "bold",
        border: this.getPreviewBorderDialog(),
        textAlign: "left",
      };
    },

    getPreviewCellStylesDialog() {
      if (!this.previewConfig) return {};

      return {
        padding: "8px 12px",
        border: this.getPreviewBorderDialog(),
      };
    },

    getPreviewBorderDialog() {
      if (!this.previewConfig) return "1px solid #000";

      const widths = {
        none: "0",
        thin: "1px",
        medium: "2px",
        thick: "3px",
        all: "1px",
        horizontal: "1px 0",
      };

      const width = widths[this.previewConfig.border_style] || "1px";
      const color = this.previewConfig.border_color || "#000";

      return `${width} solid ${color}`;
    },

    getRowStyleDialog(rowIndex) {
      if (!this.previewConfig) return {};

      // Apply alternating row style for even rows
      if (this.previewConfig.alternating_rows && rowIndex % 2 === 0) {
        return { backgroundColor: "#f9fafb" };
      }

      return {};
    },

    async exportWithTemplate(item) {
      try {
        // Show confirmation dialog
        const confirmed = confirm(
          `Export data using "${item.name}" template?\n\nThis will generate a ${item.type} file with your current data.`
        );

        if (!confirmed) return;

        // Show loading state
        const loadingMessage = document.createElement("div");
        loadingMessage.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        text-align: center;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top-color: #6e3894;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        "></div>
        <p style="margin: 0; font-weight: 600; color: #111827;">Generating export...</p>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </div>
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
        z-index: 9998;
      "></div>
    `;
        document.body.appendChild(loadingMessage);

        // Call API to export with template
        const response = await this.api.export({
          template_id: item.id,
          type: item.type.toLowerCase(),
        });

        // Remove loading message
        document.body.removeChild(loadingMessage);

        // Handle the response based on your API structure
        if (response.data && response.data.download_url) {
          // If API returns a download URL
          window.open(response.data.download_url, "_blank");

          // Show success message
          this.showNotification("success", `${item.type} file generated successfully!`);
        } else if (response.data && response.data.file_path) {
          // If API returns a file path
          const downloadLink = document.createElement("a");
          downloadLink.href = `/storage/${response.data.file_path}`;
          downloadLink.download =
            response.data.filename || `export_${Date.now()}.${item.type.toLowerCase()}`;
          downloadLink.click();

          this.showNotification("success", `${item.type} file downloaded successfully!`);
        } else {
          // If export is async (email notification)
          this.showNotification(
            "info",
            "Export started. You will receive an email with the download link once ready."
          );
        }
      } catch (error) {
        console.error("Error exporting with template:", error);

        // Remove loading message if exists
        const loadingElement = document.querySelector('div[style*="position: fixed"]');
        if (loadingElement && loadingElement.parentElement) {
          document.body.removeChild(loadingElement.parentElement);
        }

        this.showNotification("error", "Failed to generate export. Please try again.");
      }
    },

    showNotification(type, message) {
      const colors = {
        success: { bg: "#d1fae5", text: "#065f46", icon: "✓" },
        error: { bg: "#fee2e2", text: "#991b1b", icon: "✕" },
        info: { bg: "#dbeafe", text: "#1e40af", icon: "ℹ" },
      };

      const color = colors[type] || colors.info;

      const notification = document.createElement("div");
      notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color.bg};
      color: ${color.text};
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      animation: slideIn 0.3s ease;
    ">
      <span style="font-size: 20px; font-weight: bold;">${color.icon}</span>
      <span style="flex: 1;">${message}</span>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;

      document.body.appendChild(notification);

      // Auto remove after 5 seconds
      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentElement) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 5000);
    },

    // Logo Upload Methods
    handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file size must be less than 2MB");
        return;
      }

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (PNG, JPG, or SVG)");
        return;
      }

      this.logoFile = file;
      this.logoFileName = file.name;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeLogo() {
      this.logoFile = null;
      this.logoFileName = "";
      this.logoPreview = null;
      if (this.$refs.logoInput) {
        this.$refs.logoInput.value = "";
      }
    },

    // Navigation with validation
    goToStep(step) {
      // Only allow navigation to previous steps or if current step is valid
      if (step < this.currentStep || this.validateStep()) {
        this.currentStep = step;
      }
    },

    nextStep() {
      if (this.validateStep()) {
        this.currentStep++;
      }
    },

    validateStep() {
      if (this.currentStep === 1) {
        if (!this.newItem.name) {
          alert("Please enter a template name");
          return false;
        }
        if (!this.newItem.type) {
          alert("Please select an export type");
          return false;
        }
      }

      return true;
    },

    async saveTemplate() {
      try {
        // Use FormData if logo file is present
        if (this.logoFile) {
          console.log("this.newItem ",this.newItem);
          const data = {
            ...this.newItem,
            excel_config: JSON.stringify(this.newItem.excel_config),
            pdf_config: JSON.stringify(this.newItem.pdf_config),
            logo:this.logoFile
          };
          if (this.newItem.id) {
             await this.api.update(data);
          } else {
             await this.api.insert(data);
          }
        } else {
          // Regular JSON request without file
          const data = {
            ...this.newItem,
            excel_config: JSON.stringify(this.newItem.excel_config),
            pdf_config: JSON.stringify(this.newItem.pdf_config),
          };

          if (this.newItem.id) {
            await this.api.update(data);
          } else {
            await this.api.insert(data);
          }
        }

        this.closeForm();
      } catch (error) {
        console.error("Error saving template:", error);
        alert("Failed to save template");
      }
    },

    // Preview Styles
    getPreviewTableStyles() {
      const config =
        this.newItem.type === "Excel"
          ? this.newItem.excel_config
          : this.newItem.pdf_config;
      return {
        fontFamily: config.font_family,
        fontSize: `${config.font_size}px`,
        borderCollapse: "collapse",
        width: "100%",
      };
    },

    getPreviewHeaderStyles() {
      const config =
        this.newItem.type === "Excel"
          ? this.newItem.excel_config
          : this.newItem.pdf_config;
      return {
        backgroundColor: config.header_bg_color,
        color: config.header_text_color,
        padding: "12px",
        fontWeight: "bold",
        border: this.getPreviewBorder(),
      };
    },

    getPreviewCellStyles() {
      return {
        padding: "8px 12px",
        border: this.getPreviewBorder(),
      };
    },

    getPreviewBorder() {
      const config =
        this.newItem.type === "Excel"
          ? this.newItem.excel_config
          : this.newItem.pdf_config;
      const widths = {
        none: "0",
        thin: "1px",
        medium: "2px",
        thick: "3px",
        all: "1px",
        horizontal: "1px 0",
      };
      return `${widths[config.border_style] || "1px"} solid ${
        config.border_color || "#000"
      }`;
    },

    hasAlternatingRows() {
      const config =
        this.newItem.type === "Excel"
          ? this.newItem.excel_config
          : this.newItem.pdf_config;
      return config.alternating_rows;
    },

    getAlternateRowStyle() {
      return { backgroundColor: "#f9fafb" };
    },
  },
};
</script>

<style scoped>
/* Badge Styles */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-excel {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.badge-pdf {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

/* Form Container */
.template-form-container {
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
}

/* Steps */
.form-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: linear-gradient(135deg, #6e3894 0%, #8b5cf6 100%);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

.step-item.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.step-item.active .step-label {
  color: #6e3894;
}

.step-divider {
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 12px;
}

/* Form Steps */
.form-step {
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

.step-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

/* Type Selector */
.type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.type-option input {
  display: none;
}

.type-card {
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-card svg {
  margin-bottom: 12px;
  color: #6b7280;
}

.type-card span {
  display: block;
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  margin-bottom: 4px;
}

.type-card small {
  color: #6b7280;
  font-size: 12px;
}

.type-option.selected .type-card {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.2);
}

.type-option.selected .type-card svg {
  color: #6e3894;
}

/* Color Picker */
.color-picker-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: monospace;
}

/* Layout Sections */
.layout-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.layout-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6e3894;
}

/* File Upload */
.file-upload-wrapper {
  margin-bottom: 12px;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #6b7280;
}

.file-upload-label:hover {
  border-color: #6e3894;
  background: #faf5ff;
  color: #6e3894;
}

.file-upload-label svg {
  color: #6e3894;
}

.logo-preview {
  position: relative;
  margin-top: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  display: inline-block;
}

.logo-preview img {
  max-width: 200px;
  max-height: 100px;
  display: block;
  object-fit: contain;
}

.remove-logo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: #fee2e2;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  transition: all 0.2s ease;
}

.remove-logo-btn:hover {
  background: #dc2626;
  color: white;
  transform: scale(1.1);
}

.help-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  display: block;
}

/* Preview Container */
.preview-container {
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
}

.preview-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.info-card svg {
  color: #6e3894;
  flex-shrink: 0;
}

.info-card strong {
  display: block;
  font-size: 14px;
  color: #111827;
}

.info-card small {
  font-size: 12px;
  color: #6b7280;
}

.preview-table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.preview-table {
  min-width: 600px;
}

.preview-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #dbeafe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 13px;
}

/* Form Footer */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
  margin-top: 32px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6e3894 0%, #8b5cf6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline {
  background: transparent;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
  .form-steps {
    overflow-x: auto;
    justify-content: flex-start;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
/* Preview Dialog Styles */
.preview-dialog-header {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 20px 24px !important;
}

.preview-dialog-header .header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 8px;
}

.preview-dialog-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.preview-dialog-header .description {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.preview-dialog-content {
  padding: 24px !important;
  background: #f9fafb;
}

.preview-container-dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.preview-info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-card-dialog {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.info-card-dialog strong {
  display: block;
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.info-card-dialog small {
  font-size: 12px;
  color: #6b7280;
}

/* NEW: Logo Preview Section */
.logo-preview-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.logo-container-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.preview-logo {
  max-width: 200px;
  max-height: 80px;
  object-fit: contain;
  border-radius: 4px;
}

.document-title-preview {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.preview-table-container {
  overflow-x: auto;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-table-dialog {
  min-width: 600px;
}

.preview-note-dialog {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #dbeafe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 13px;
}

.preview-dialog-actions {
  padding: 16px 24px !important;
  background: #f9fafb;
}

/* Badge in dialog header */
.preview-dialog-header .badge {
  margin-left: 12px;
}
</style>