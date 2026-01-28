<template>
  <div>
    <!-- Filters Section -->
    <div v-if="showFilter" class="filter-section mb-4 p-3 border rounded">
      <slot name="filters"></slot>
    </div>
    <div class="table-controls">
      <div class="row g-2 justify-content-center justify-content-md-end">
        <!-- Import Button -->
        <!-- Import Button -->
        <div class="col-4 col-md-auto" v-if="!hideAddImportButton">
          <button
            class="w-100 secondary-btn d-flex align-items-center justify-content-center"
            @click="toggleModal()"
            title="Import Data"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="flex-shrink-0"
            >
              <path
                d="M9.91504 13.7236C9.91777 13.7242 9.9215 13.7248 9.92578 13.7256C9.93471 13.7271 9.94786 13.7295 9.96289 13.7305C9.99078 13.7323 10.0246 13.7288 10.0635 13.7197C10.2322 13.7054 10.3913 13.6346 10.5107 13.5137L14.1963 9.83496L14.1992 9.83203C14.3363 9.69037 14.4128 9.49989 14.4111 9.30273C14.4093 9.10572 14.3299 8.9175 14.1904 8.77832C14.0509 8.63908 13.8621 8.5603 13.665 8.55859C13.468 8.55693 13.2776 8.6318 13.1357 8.76855L13.1328 8.77246L10.7314 11.168V1.00098C10.7314 0.80167 10.6518 0.610507 10.5107 0.469727C10.3697 0.32908 10.1787 0.250082 9.97949 0.25C9.78013 0.25 9.5884 0.328896 9.44727 0.469727C9.3062 0.610506 9.22665 0.80167 9.22656 1.00098V11.1689L6.82422 8.77246L6.82129 8.76855L6.70605 8.67773C6.58359 8.599 6.43966 8.55731 6.29199 8.55859C6.09495 8.56034 5.9061 8.63911 5.7666 8.77832C5.62727 8.91748 5.5477 9.1058 5.5459 9.30273C5.54418 9.49989 5.62071 9.69037 5.75781 9.83203L5.76074 9.83496L9.44727 13.5137C9.5738 13.6416 9.7441 13.716 9.92383 13.7236C9.92039 13.7234 9.91738 13.7239 9.91504 13.7236ZM9.91504 13.7236H9.91211C9.91094 13.7235 9.90998 13.7228 9.90918 13.7227L9.91504 13.7236ZM18.46 8.53516C18.6592 8.53522 18.8501 8.61508 18.9912 8.75586C19.1323 8.89671 19.2119 9.08771 19.2119 9.28711C19.2119 11.5033 19.2975 13.7677 19.2119 16.001C19.202 16.3741 19.1179 16.7415 18.9648 17.082C18.8113 17.4236 18.5911 17.7315 18.3174 17.9873C18.0436 18.2431 17.7216 18.4428 17.3701 18.5732C17.0216 18.7026 16.6508 18.7608 16.2793 18.7471L3.51758 18.75H3.50977C3.12975 18.7393 2.75596 18.6518 2.41016 18.4941C2.06421 18.3363 1.75303 18.1111 1.49609 17.8311C1.2392 17.5511 1.04124 17.2221 0.914062 16.8643C0.788705 16.5114 0.735538 16.1374 0.755859 15.7637C0.743804 13.6045 0.754882 11.4435 0.754883 9.28711C0.754883 9.08785 0.83466 8.89668 0.975586 8.75586C1.11672 8.61502 1.30845 8.53516 1.50781 8.53516C1.70713 8.53519 1.89796 8.61506 2.03906 8.75586C2.18021 8.89672 2.25977 9.08768 2.25977 9.28711C2.25976 11.4979 2.22765 13.6969 2.25977 15.9004C2.2668 16.386 2.44968 16.7099 2.71973 16.9189C2.99826 17.1345 3.3957 17.247 3.85645 17.2471H16.3838C16.6492 17.2531 16.9101 17.1787 17.1318 17.0332C17.3505 16.8897 17.519 16.6833 17.6191 16.4424C17.7044 16.1305 17.7354 15.8066 17.708 15.4844L17.707 15.4736V9.28711C17.707 9.08782 17.7868 8.89669 17.9277 8.75586C18.0689 8.61502 18.2606 8.53516 18.46 8.53516Z"
                fill="#43235C"
                stroke="#404040"
                stroke-width="0.5"
              />
            </svg>
            <span class="ms-2">Import</span>
          </button>
        </div>

        <!-- Export Button with Dropdown -->
        <div class="col-4 col-md-auto" v-if="!hideAddExportButton">
          <div class="export-dropdown">
            <button
              class="w-100 secondary-btn d-flex align-items-center justify-content-center"
              @click="toggleExportDropdown($event)"
              title="Export Data"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="flex-shrink-0"
              >
                <path
                  d="M18.46 8.52832C18.6592 8.52839 18.8502 8.60735 18.9912 8.74805C19.1323 8.88899 19.2119 9.08081 19.2119 9.28027C19.2119 11.4981 19.2975 13.7641 19.2119 15.999C19.202 16.3725 19.118 16.7402 18.9648 17.0811C18.8112 17.4229 18.5912 17.7312 18.3174 17.9873C18.0436 18.2433 17.7216 18.4427 17.3701 18.5732C17.0216 18.7027 16.6508 18.7608 16.2793 18.7471L3.51758 18.75H3.50977C3.12977 18.7393 2.75594 18.6519 2.41016 18.4941C2.0642 18.3362 1.75302 18.1103 1.49609 17.8301C1.23928 17.5499 1.04121 17.2213 0.914062 16.8633C0.788554 16.5099 0.735404 16.1351 0.755859 15.7607L0.754883 15.7617C0.742826 13.6009 0.754881 11.4383 0.754883 9.28027C0.754883 9.08082 0.83447 8.88899 0.975586 8.74805C1.1167 8.60711 1.30839 8.52832 1.50781 8.52832C1.7072 8.52835 1.89895 8.60714 2.04004 8.74805C2.18108 8.88898 2.25977 9.08087 2.25977 9.28027C2.25976 11.4927 2.22765 13.6933 2.25977 15.8984C2.2668 16.3845 2.44966 16.7088 2.71973 16.918C2.99825 17.1337 3.39572 17.2461 3.85645 17.2461H16.3838V17.2471C16.6492 17.2531 16.9101 17.1778 17.1318 17.0322C17.3504 16.8887 17.519 16.6824 17.6191 16.4414C17.7045 16.1291 17.7354 15.8041 17.708 15.4814L17.707 15.4717V9.28027C17.707 9.08081 17.7866 8.88899 17.9277 8.74805C18.0688 8.60715 18.2606 8.52832 18.46 8.52832ZM10.0205 0.259766H10.0312C10.2121 0.266825 10.3837 0.341964 10.5107 0.470703L14.1973 4.15234L14.2012 4.15527C14.3382 4.29701 14.4138 4.48744 14.4121 4.68457C14.4103 4.8816 14.3308 5.06972 14.1914 5.20898C14.0519 5.34832 13.8632 5.42798 13.666 5.42969C13.4689 5.43134 13.2786 5.35559 13.1367 5.21875L13.1338 5.21582L10.7314 2.81641V12.9922C10.7314 13.1917 10.6519 13.3835 10.5107 13.5244C10.3697 13.6651 10.1786 13.7441 9.97949 13.7441C9.78015 13.7441 9.58837 13.6652 9.44727 13.5244C9.30614 13.3835 9.22656 13.1917 9.22656 12.9922V2.81641L6.82422 5.21582L6.82129 5.21875C6.67938 5.3556 6.48912 5.4314 6.29199 5.42969C6.09489 5.42794 5.90608 5.34828 5.7666 5.20898C5.62733 5.06973 5.54768 4.88152 5.5459 4.68457C5.54418 4.48738 5.62073 4.29702 5.75781 4.15527L5.76074 4.15234L9.44727 0.470703C9.5603 0.35635 9.70872 0.288082 9.86719 0.268555C9.87196 0.266794 9.87648 0.263347 9.88184 0.261719C9.91336 0.252143 9.94793 0.248342 9.9834 0.250977C9.99698 0.252009 10.0089 0.257313 10.0205 0.259766Z"
                  fill="#43235C"
                  stroke="#404040"
                  stroke-width="0.5"
                />
              </svg>
              <span class="ms-2">Export</span>
            </button>

            <!-- Export Dropdown Menu -->
            <div
              v-if="showExportDropdown"
              class="export-dropdown-menu"
              @click.stop
            >
              <div class="export-option" @click="handleExportAll">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M11.333 5.333L8 2 4.667 5.333M8 2v8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Export All Data</span>
              </div>
              <div class="export-option" @click="handleExportCurrent">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M11.333 5.333L8 2 4.667 5.333M8 2v8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Export Current Page</span>
              </div>
              <div class="export-option" @click="openColumnSelection">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span>Select Columns</span>
              </div>
            </div>
          </div>
          <input
            ref="importInput"
            type="file"
            accept=".xlsx, .xls, .csv"
            class="d-none"
            @change="importFromExcel"
          />
        </div>

        <!-- PDF Button with Dropdown -->
        <div class="col-4 col-md-auto" v-if="!hideAddExportButton">
          <div class="pdf-dropdown">
            <button
              class="w-100 secondary-btn d-flex align-items-center justify-content-center"
              @click="togglePdfDropdown($event)"
              title="Export to PDF"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="flex-shrink-0"
              >
                <path
                  d="M18.46 8.52832C18.6592 8.52839 18.8502 8.60735 18.9912 8.74805C19.1323 8.88899 19.2119 9.08081 19.2119 9.28027C19.2119 11.4981 19.2975 13.7641 19.2119 15.999C19.202 16.3725 19.118 16.7402 18.9648 17.0811C18.8112 17.4229 18.5912 17.7312 18.3174 17.9873C18.0436 18.2433 17.7216 18.4427 17.3701 18.5732C17.0216 18.7027 16.6508 18.7608 16.2793 18.7471L3.51758 18.75H3.50977C3.12977 18.7393 2.75594 18.6519 2.41016 18.4941C2.0642 18.3362 1.75302 18.1103 1.49609 17.8301C1.23928 17.5499 1.04121 17.2213 0.914062 16.8633C0.788554 16.5099 0.735404 16.1351 0.755859 15.7607L0.754883 15.7617C0.742826 13.6009 0.754881 11.4383 0.754883 9.28027C0.754883 9.08082 0.83447 8.88899 0.975586 8.74805C1.1167 8.60711 1.30839 8.52832 1.50781 8.52832C1.7072 8.52835 1.89895 8.60714 2.04004 8.74805C2.18108 8.88898 2.25977 9.08087 2.25977 9.28027C2.25976 11.4927 2.22765 13.6933 2.25977 15.8984C2.2668 16.3845 2.44966 16.7088 2.71973 16.918C2.99825 17.1337 3.39572 17.2461 3.85645 17.2461H16.3838V17.2471C16.6492 17.2531 16.9101 17.1778 17.1318 17.0322C17.3504 16.8887 17.519 16.6824 17.6191 16.4414C17.7045 16.1291 17.7354 15.8041 17.708 15.4814L17.707 15.4717V9.28027C17.707 9.08081 17.7866 8.88899 17.9277 8.74805C18.0688 8.60715 18.2606 8.52832 18.46 8.52832ZM10.0205 0.259766H10.0312C10.2121 0.266825 10.3837 0.341964 10.5107 0.470703L14.1973 4.15234L14.2012 4.15527C14.3382 4.29701 14.4138 4.48744 14.4121 4.68457C14.4103 4.8816 14.3308 5.06972 14.1914 5.20898C14.0519 5.34832 13.8632 5.42798 13.666 5.42969C13.4689 5.43134 13.2786 5.35559 13.1367 5.21875L13.1338 5.21582L10.7314 2.81641V12.9922C10.7314 13.1917 10.6519 13.3835 10.5107 13.5244C10.3697 13.6651 10.1786 13.7441 9.97949 13.7441C9.78015 13.7441 9.58837 13.6652 9.44727 13.5244C9.30614 13.3835 9.22656 13.1917 9.22656 12.9922V2.81641L6.82422 5.21582L6.82129 5.21875C6.67938 5.3556 6.48912 5.4314 6.29199 5.42969C6.09489 5.42794 5.90608 5.34828 5.7666 5.20898C5.62733 5.06973 5.54768 4.88152 5.5459 4.68457C5.54418 4.48738 5.62073 4.29702 5.75781 4.15527L5.76074 4.15234L9.44727 0.470703C9.5603 0.35635 9.70872 0.288082 9.86719 0.268555C9.87196 0.266794 9.87648 0.263347 9.88184 0.261719C9.91336 0.252143 9.94793 0.248342 9.9834 0.250977C9.99698 0.252009 10.0089 0.257313 10.0205 0.259766Z"
                  fill="#43235C"
                  stroke="#404040"
                  stroke-width="0.5"
                />
              </svg>
              <span class="ms-2">PDF</span>
            </button>

            <!-- PDF Dropdown Menu -->
            <div v-if="showPdfDropdown" class="pdf-dropdown-menu" @click.stop>
              <div class="pdf-option" @click="handlePdfExportAll">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M11.333 5.333L8 2 4.667 5.333M8 2v8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Export All to PDF</span>
              </div>
              <div class="pdf-option" @click="handlePdfExportCurrent">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M11.333 5.333L8 2 4.667 5.333M8 2v8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Export Current Page to PDF</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Button -->
        <div class="col-4 col-md-auto" v-if="!hideAddNewButton">
          <button
            class="w-100 main-btn d-flex align-items-center justify-content-center"
            @click="openForm"
            :title="addNewButtonTitle"
            :aria-label="addNewButtonTitle"
          >
            <v-icon left class="icon-add mr-2">{{ addNewButtonIcon }}</v-icon>
            <span class="">{{ addNewButtonTitle }}</span>
          </button>
        </div>

        <!-- Configurations Button -->
        <div class="col-4 col-md-auto" v-if="!hideConfigurationsButton">
          <button
            class="w-100 main-btn d-flex align-items-center justify-content-center"
            @click="Configurations"
            title="Configurations"
          >
            <v-icon left class="icon-add m-rtl">mdi-cog</v-icon>
            <span>Configs.</span>
          </button>
        </div>

        <!-- Link Requirement Button -->
        <div class="col-4 col-md-auto" v-if="!hideLinkRequirementButton">
          <button
            class="w-100 main-btn d-flex align-items-center justify-content-center"
            @click="linkRequirement"
            title="Link Requirement"
          >
            <v-icon size="18" class="action-icon">mdi-link-variant</v-icon>
            <span>Link Req.</span>
          </button>
        </div>
        <!-- Statistics Button -->
        <div class="col-4 col-md-auto" v-if="!hideStatisticsButton">
          <button
            class="w-100 main-btn d-flex align-items-center justify-content-center"
            @click="Statistics"
            title="Configurations"
          >
            <!-- <v-icon left class="icon-add m-rtl">mdi-chart-box</v-icon> -->
            <span>Statistics</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Search and Filter Section -->
    <div class="search-section mb-4">
      <div class="search-wrapper">
        <div class="ssearch-container row mx-0 g-2 g-md-0 rtl">
          <div class="col-md-6 col-lg-4 p-0 position-relative">
            <input
              v-model="searchQuery"
              @input="debouncedFetchData"
              type="text"
              class="search-field border-0"
              placeholder="Search..."
            />
            <span class="icon-right d-flex m-rtl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
              >
                <path
                  d="M13.5036 13.2377L11.212 10.9972L11.1583 10.9155C11.0584 10.8161 10.9219 10.7601 10.7794 10.7601C10.6368 10.7601 10.5003 10.8161 10.4004 10.9155C8.45291 12.7022 5.45202 12.7993 3.38792 11.1425C1.32383 9.4856 0.837031 6.58889 2.25038 4.37343C3.66372 2.15796 6.53863 1.31121 8.96848 2.39474C11.3983 3.47826 12.6291 6.15584 11.8446 8.65171C11.7881 8.83202 11.8343 9.0281 11.9657 9.16609C12.0972 9.30408 12.294 9.36302 12.4819 9.32071C12.6699 9.27839 12.8205 9.14125 12.877 8.96094C13.8148 5.99908 12.3984 2.81168 9.544 1.46068C6.68958 0.109687 3.25381 1.00053 1.45929 3.55692C-0.335235 6.11332 0.050038 9.56808 2.36587 11.6863C4.68171 13.8046 8.23311 13.9506 10.7227 12.0299L12.7517 14.0137C12.9612 14.2176 13.3 14.2176 13.5096 14.0137C13.7189 13.8068 13.7189 13.4737 13.5096 13.2668L13.5036 13.2377Z"
                  fill="#667085"
                />
              </svg>
            </span>
          </div>

          <div
            class="col-md-6 col-lg-8 p-0 d-flex justify-rtl align-items-center rtl"
          >
            <!-- Enhanced Column Visibility Dropdown -->
            <div class="column-visibility-dropdown me-1">
              <button
                class="visibility-toggle-btn"
                @click="toggleDropdown($event)"
                title="Column Visibility"
                type="button"
                style="position: relative; z-index: 1"
              >
                <svg
                  width="9"
                  height="8"
                  viewBox="0 0 28 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 1.5H26.5H1.5ZM1.5 11.5H26.5H1.5ZM1.5 21.5H26.5H1.5Z"
                    fill="white"
                  />
                  <path
                    d="M1.5 1.5H26.5M1.5 11.5H26.5M1.5 21.5H26.5"
                    stroke="white"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <div
                v-if="showDropdown"
                class="visibility-dropdown-menu"
                ref="dropdownMenu"
                style="display: block !important"
              >
                <div class="dropdown-header">
                  <h6 class="dropdown-title">Show/Hide & Reorder Columns</h6>
                  <div class="header-actions">
                    <button
                      class="close-btn"
                      @click="showDropdown = false"
                      title="Close"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="dropdown-content">
                  <div class="column-list">
                    <div
                      class="column-item"
                      v-for="(columnIndex, orderIndex) in orderedColumnIndexes"
                      :key="`column-${columnIndex}-${orderIndex}`"
                      :draggable="columnIndex > 1"
                      @dragstart="onDragStart($event, orderIndex, columnIndex)"
                      @dragover.prevent="onDragOver($event, orderIndex)"
                      @dragenter.prevent
                      @drop="onDrop($event, orderIndex)"
                      @dragend="onDragEnd"
                      :class="{
                        draggable: columnIndex > 1,
                        'drag-over': dragOverIndex === orderIndex,
                        dragging: draggingIndex === orderIndex,
                      }"
                    >
                      <template v-if="columnIndex > 1">
                        <label
                          class="column-checkbox"
                          :for="`col-${columnIndex}`"
                        >
                          <!-- Drag Handle -->
                          <div
                            class="drag-handle"
                            v-if="columnIndex > 1"
                            title="Drag to reorder"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <circle cx="3" cy="3" r="1" fill="currentColor" />
                              <circle cx="9" cy="3" r="1" fill="currentColor" />
                              <circle cx="3" cy="6" r="1" fill="currentColor" />
                              <circle cx="9" cy="6" r="1" fill="currentColor" />
                              <circle cx="3" cy="9" r="1" fill="currentColor" />
                              <circle cx="9" cy="9" r="1" fill="currentColor" />
                            </svg>
                          </div>

                          <input
                            class="checkbox-input"
                            type="checkbox"
                            :id="`col-${columnIndex}`"
                            :checked="visibleColumns[columnIndex]"
                            @change="toggleColumn(columnIndex)"
                          />
                          <span class="checkbox-custom">
                            <svg
                              class="check-icon"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="white"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </span>
                          <span class="column-name">{{
                            processedColumns[columnIndex].title
                          }}</span>
                          <span
                            class="column-badge"
                            v-if="!visibleColumns[columnIndex]"
                            >Hidden</span
                          >
                        </label>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="dropdown-footer">
                  <div class="footer-actions">
                    <div class="action-buttons">
                      <button
                        class="footer-action-btn"
                        @click="showAllColumns"
                        title="Show All Columns"
                      >
                        <div class="btn-icon">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        <span class="btn-text">Show All</span>
                      </button>
                      <button
                        class="footer-action-btn"
                        @click="hideAllColumns"
                        title="Hide All Columns"
                      >
                        <div class="btn-icon">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        <span class="btn-text">Hide All</span>
                      </button>
                      <button
                        class="footer-action-btn"
                        @click="resetColumnOrder"
                        title="Reset Column Order"
                      >
                        <div class="btn-icon">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 7A5 5 0 1 1 9.8 2.2L12 4.5M12 4.5V1M12 1H8.5"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        <span class="btn-text">Reset Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                class="filter-btn m-rtl-md d-flex justify-center align-items-center"
                @click="openFilterModal"
                :class="{
                  'filter-btn-disabled': !filters || filters.length === 0,
                }"
                :title="
                  !filters || filters.length === 0
                    ? 'No filters available'
                    : 'Filter'
                "
              >
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 22 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 2H20.5H1.5ZM4.89286 9.5H17.1071H4.89286ZM8.96429 17H13.0357H8.96429Z"
                    fill="white"
                  />
                  <path
                    d="M1.5 2H20.5M4.89286 9.5H17.1071M8.96429 17H13.0357"
                    stroke="white"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p class="mb-0 m-rtl">Filter</p>
                <!-- <span v-if="!filters || filters.length === 0" class="no-filters-indicator">
                  <i class="fas fa-exclamation-triangle ms-1"></i>
                </span> -->
              </button>
            </div>
            <div class="d-flex align-items-center justify-center rtl">
              <span class="mx-1">Show</span>
              <select class="form-select custom-select" v-model="perPage">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-responsive container-table">
      <table :id="id" :class="tableClass" class="table custom-table">
        <thead>
          <tr>
            <th
              v-for="columnIndex in orderedColumnIndexes"
              :key="`header-${columnIndex}`"
              :style="{
                display:
                  visibleColumns.length === 0 ||
                  visibleColumns[columnIndex] !== false
                    ? ''
                    : 'none',
              }"
            >
              <span
                v-if="
                  processedColumns[columnIndex].sortable !== false &&
                  processedColumns[columnIndex].data
                "
                @click="sortBy(processedColumns[columnIndex].data)"
                class="sortable-header"
              >
                {{ processedColumns[columnIndex].title }}
                <span
                  v-if="currentSort === processedColumns[columnIndex].data"
                  class="sort-indicator"
                >
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </span>
              <span v-else>{{ processedColumns[columnIndex].title }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="!load">
          <tr
            v-for="(row, index) in paginatedData"
            :key="`row-${row.id || index}`"
            v-memo="[row, visibleColumns, orderedColumnIndexes]"
          >
            <template
              v-for="columnIndex in orderedColumnIndexes"
              :key="`cell-${columnIndex}`"
            >
              <td
                :style="{
                  display:
                    visibleColumns.length === 0 ||
                    visibleColumns[columnIndex] !== false
                      ? ''
                      : 'none',
                }"
              >
                <div v-if="columnIndex === 0">
                  <input
                    class="form-check-input"
                    :value="row.id"
                    v-model="selected"
                    type="checkbox"
                  />
                </div>
                <div v-else-if="columnIndex === 1">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </div>

                <div
                  v-else-if="
                    processedColumns[columnIndex].title === 'Actions' ||
                    processedColumns[columnIndex].title === $t('common.actions')
                  "
                  style="display: block"
                >
                  <!-- Enhanced Vuetify Actions Menu -->
                  <div class="table-actions">
                    <v-menu
                      location="bottom end"
                      transition="scale-transition"
                      offset="8"
                      :close-on-content-click="true"
                    >
                      <template v-slot:activator="{ props }">
                        <button v-bind="props" class="actions-menu-btn">
                          <svg
                            width="44"
                            height="20"
                            viewBox="0 0 44 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22.0003 3.7037C23.023 3.7037 23.8521 2.8746 23.8521 1.85185C23.8521 0.829101 23.023 0 22.0003 0C20.9775 0 20.1484 0.829101 20.1484 1.85185C20.1484 2.8746 20.9775 3.7037 22.0003 3.7037Z"
                              fill="black"
                            />
                            <path
                              d="M22.0003 11.4068C23.023 11.4068 23.8521 10.5777 23.8521 9.55497C23.8521 8.53223 23.023 7.70312 22.0003 7.70312C20.9775 7.70312 20.1484 8.53223 20.1484 9.55497C20.1484 10.5777 20.9775 11.4068 22.0003 11.4068Z"
                              fill="black"
                            />
                            <path
                              d="M22.0003 19.1119C23.023 19.1119 23.8521 18.2828 23.8521 17.2601C23.8521 16.2373 23.023 15.4082 22.0003 15.4082C20.9775 15.4082 20.1484 16.2373 20.1484 17.2601C20.1484 18.2828 20.9775 19.1119 22.0003 19.1119Z"
                              fill="black"
                            />
                          </svg>
                        </button>
                      </template>

                      <v-list
                        class="actions-menu-list"
                        density="compact"
                        min-width="200"
                      >
                        <!-- Custom Slots -->
                        <slot name="addAction" :item="row"></slot>
                        <slot name="AddStatus" :item="row"></slot>
                        <slot name="view" :item="row"></slot>
                        <slot name="taskComment" :item="row"></slot>

                        <!-- Divider if there are custom slots -->
                        <v-divider
                          v-if="
                            $slots.addAction ||
                            $slots.AddStatus ||
                            $slots.view ||
                            $slots.taskComment
                          "
                          class="my-2"
                        >
                        </v-divider>

                        <!-- Edit Action -->
                        <slot name="edit" :item="row">
                          <v-list-item
                            v-if="!hideActionsColumn && !hideActions(row).edit"
                            v-anyPermission="['update', 'edit']"
                            @click="editItem(row)"
                            class="action-list-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="18" class="action-icon"
                                >mdi-pencil-outline</v-icon
                              >
                            </template>
                            <v-list-item-title class="action-title">
                              {{ $t("datatable.edit") }}
                            </v-list-item-title>
                          </v-list-item>
                        </slot>

                        <!-- Delete Action -->
                        <slot name="delete" :item="row">
                          <v-list-item
                            v-if="
                              !hideActionsColumn && !hideActions(row).delete
                            "
                            v-anyPermission="['destroy', 'delete']"
                            @click="deleteItem(row)"
                            class="action-list-item delete-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="18" class="action-icon"
                                >mdi-delete-outline</v-icon
                              >
                            </template>
                            <v-list-item-title class="action-title">
                              {{ $t("datatable.delete") || "Delete" }}
                            </v-list-item-title>
                          </v-list-item>
                        </slot>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
                <slot
                  v-else-if="processedColumns[columnIndex].html"
                  :name="
                    processedColumns[columnIndex].id ||
                    processedColumns[columnIndex].title
                  "
                  :item="row"
                  :rowIndex="columnIndex"
                  v-html="processedColumns[columnIndex].html"
                ></slot>
                <slot
                  v-else
                  :name="
                    processedColumns[columnIndex].id ||
                    processedColumns[columnIndex].title
                  "
                  :item="row"
                  :rowIndex="columnIndex"
                >
                  <!-- Cell content with optimized truncation functionality -->
                  <div class="table-cell-content">
                    <template
                      v-if="
                        shouldTruncate(
                          getCellValue(row, processedColumns[columnIndex])
                        )
                      "
                    >
                      <span>{{
                        getTruncatedText(
                          getCellValue(row, processedColumns[columnIndex])
                        )
                      }}</span>
                      <button
                        class="see-more-btn"
                        @click="
                          showFullContent(
                            processedColumns[columnIndex].title,
                            getCellValue(row, processedColumns[columnIndex])
                          )
                        "
                        title="Click to see full content"
                      >
                        see more
                      </button>
                    </template>
                    <template v-else>
                      {{
                        stripHtmlTags(
                          getCellValue(row, processedColumns[columnIndex])
                        )
                      }}
                    </template>
                  </div>
                </slot>
              </td>
            </template>
          </tr>
        </tbody>
        <tbody v-if="load">
          <tr>
            <td :colspan="visibleColumnCount" class="text-center py-4">
              <div class="d-flex justify-content-center align-items-center">
                <div class="loader"></div>
              </div>
              <div class="mt-2">{{ $t("datatable.loading") }}</div>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!load && paginatedData.length === 0">
          <tr>
            <td :colspan="visibleColumnCount" class="text-center py-4">
              <div class="text-muted">No data available</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      class="mt-2 d-flex justify-content-between align-items-center flex-column-reverse flex-md-row"
      :dir="isArabic ? 'rtl' : 'ltr'"
    >
      <!-- Left side: Pagination info -->
      <div style="flex: 1" class="pagination-info">
        <span class="text-muted small fw-bold">
          showing {{ startRecord }} to {{ endRecord }} of
          {{ totalRecords }} entries
        </span>
      </div>

      <!-- Center: Pagination controls -->
      <nav aria-label="Table pagination" style="flex: 0 0 auto">
        <ul class="pagination mb-0">
          <!-- Previous -->
          <div>
            <li
              class="page-item"
              :class="{
                disabled:
                  currentPage === 1 ||
                  data.length === 0 ||
                  totalRecords === 0 ||
                  load,
              }"
            >
              <a
                class="page-link pagination-button prev"
                href="#"
                @click.prevent="
                  canNavigate() ? goToPage(currentPage - 1) : null
                "
                style="text-align: center"
                :style="{
                  cursor: canNavigate() ? 'pointer' : 'not-allowed',
                  opacity: canNavigate() ? '1' : '0.5',
                }"
              >
                <i
                  :class="
                    isRtl
                      ? 'fa-solid fa-chevron-right'
                      : 'fa-solid fa-chevron-left'
                  "
                ></i>
              </a>
            </li>
          </div>

          <!-- Page numbers -->
          <div class="d-flex g-2">
            <li
              class="page-item"
              v-for="page in paginationPages"
              :key="page"
              :class="{
                active: page === currentPage,
                disabled: data.length === 0 || totalRecords === 0 || load,
              }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="canNavigate() ? goToPage(page) : null"
                :style="{
                  cursor: canNavigate() ? 'pointer' : 'not-allowed',
                  opacity: canNavigate() ? '1' : '0.5',
                }"
              >
                {{ page }}
              </a>
            </li>
          </div>

          <!-- Next -->
          <div>
            <li
              class="page-item"
              :class="{
                disabled:
                  currentPage === totalPages ||
                  data.length === 0 ||
                  totalRecords === 0 ||
                  load,
              }"
            >
              <a
                class="page-link pagination-button next"
                href="#"
                @click.prevent="
                  canNavigate() ? goToPage(currentPage + 1) : null
                "
                style="text-align: center"
                :style="{
                  cursor: canNavigate() ? 'pointer' : 'not-allowed',
                  opacity: canNavigate() ? '1' : '0.5',
                }"
              >
                <i
                  :class="
                    isRtl
                      ? 'fa-solid fa-chevron-left'
                      : 'fa-solid fa-chevron-right'
                  "
                ></i>
              </a>
            </li>
          </div>
        </ul>
      </nav>

      <!-- Right side: Go to page input -->
      <div
        class="d-flex align-items-center"
        style="flex: 1; justify-content: flex-end"
      >
        <span class="me-2 text-muted pagination-label">Go to:</span>

        <div class="pagination-go-to-wrapper">
          <input
            type="number"
            v-model.number="goToPageInput"
            @keyup.enter="handleGoToPage"
            :min="1"
            :max="totalPages"
            class="pagination-go-to-input"
            placeholder="Page"
            :disabled="!canNavigate()"
          />

          <button
            @click="handleGoToPage"
            class="pagination-go-to-btn"
            :disabled="!isValidPageNumber || !canNavigate()"
            type="button"
          >
            Go
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showColumnSelectionModal"
        class="modal-overlay"
        @click="closeColumnSelection"
      >
        <div class="modal-container export-modal" @click.stop>
          <div class="modal-header">
            <h5>Select Columns to Export</h5>
            <button @click="closeColumnSelection" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="export-options mb-3">
              <button
                @click="selectAllExportColumns"
                class="btn btn-sm btn-outline-primary mr-2"
              >
                Select All
              </button>
              <button
                @click="deselectAllExportColumns"
                class="btn btn-sm btn-outline-secondary"
              >
                Deselect All
              </button>
            </div>
            <div class="column-selection-grid">
              <div
                v-for="(column, index) in exportableColumns"
                :key="index"
                class="export-column-item"
              >
                <label class="export-column-checkbox">
                  <input
                    type="checkbox"
                    v-model="selectedExportColumns"
                    :value="column.data"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom">
                    <svg
                      class="check-icon"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span class="column-name">{{ column.title }}</span>
                </label>
              </div>
            </div>
            <div class="modal-footer mt-4">
              <button
                @click="exportSelectedColumns"
                class="btn btn-primary"
                :disabled="selectedExportColumns.length === 0 || isExporting"
              >
                {{
                  isExporting
                    ? "Exporting..."
                    : `Export Selected (${selectedExportColumns.length})`
                }}
              </button>
              <button
                @click="closeColumnSelection"
                class="btn btn-secondary ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Import Modal -->
    <div v-show="showModal" class="modal-overlay modal-lg">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-center mb-3">Import Data</h3>
          <button @click="toggleModal">X</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="form-group">
              <label for="file">Upload File</label>
              <input
                type="file"
                id="file"
                ref="file"
                class="form-control"
                required
                @change="handleFileUpload"
              />
            </div>
            <button type="button" class="btn btn-primary" @click="handleImport">
              Import
            </button>
          </div>
          <hr />
          <div v-if="file_columns.length">
            <h3 class="text-center mb-3">Match Data</h3>
            <div
              class="row"
              v-for="file_column in file_columns"
              :key="file_column"
            >
              <div class="col-6">
                <label for="file_column">File Column:</label>
                <input
                  type="text"
                  id="file_column"
                  class="form-control"
                  :value="file_column"
                  :disabled="isFileColumnDisabled"
                />
              </div>
              <div class="col-6">
                <label for="database_column">Database Column:</label>
                <select
                  id="database_column"
                  v-model="fields[file_column]"
                  class="form-select"
                >
                  <option value="">Select Column</option>
                  <option
                    v-for="database_column in database_columns"
                    :key="database_column"
                    :value="database_column"
                  >
                    {{ database_column }}
                  </option>
                </select>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-primary col-3"
              @click="saveImportedData"
            >
              Save
            </button>
            <button
              type="button"
              class="btn btn-primary col-3 m-3"
              @click="toggleModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <!-- Content Modal for Full Text Display -->
      <div
        v-if="showContentModal"
        class="content-modal-overlay"
        @click="closeContentModal"
      >
        <div class="content-modal-container" @click.stop>
          <div class="content-modal-header">
            <h4 class="content-modal-title">{{ modalContent.title }}</h4>
            <button
              @click="closeContentModal"
              class="content-modal-close-btn"
              title="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
          <div class="content-modal-body">
            <div class="content-modal-text">{{ modalContent.content }}</div>
          </div>
          <!-- <div class="content-modal-footer">
            <button @click="closeContentModal" class="content-modal-ok-btn">
              OK
            </button>
          </div> -->
        </div>
      </div>
    </Teleport>
  </div>
  <!-- Filter Component - Teleported to body -->
  <Teleport to="body">
    <Filter
      :is-open="isFilterOpen"
      :filters="filters"
      @close="closeFilterModal"
      @filter-applied="onFilterApplied"
      @filter-removed="onFilterRemoved"
      @filters-cleared="onFiltersCleared"
      @operators-changed="onOperatorsChanged"
      @filters-saved="onFiltersSaved"
      ref="filterComponent"
    />
  </Teleport>
</template>

<script>
import * as XLSX from "xlsx";

// import autoTable from "jspdf-autotable";
import Filter from "./Filter.vue";

export default {
  name: "DataTable",
  components: {
    Filter,
  },
  emits: ["add-new", "edit-item", "flip-page"],
  props: {
    id: { type: String, required: true },
    columns: { type: Array, required: true },
    api: { type: Object, required: true },
    apiParams: { type: Object, default: () => ({}) },
    hideActions: {
      type: Function,
      default: () => (row) => ({
        edit: false,
        delete: false,
      }),
    },
    editItem: Function,
    openForm: Function,
    Statistics: Function,
    Configurations: Function,
    linkRequirement: Function,
    action: { type: Boolean, default: true },
    tableClass: {
      type: String,
      default: "table",
    },
    hideAddNewButton: {
      type: Boolean,
      default: false,
    },
    hideStatisticsButton: {
      type: Boolean,
      default: true,
    },

    hideAddExportButton: {
      type: Boolean,
      default: false,
    },
    hideAddImportButton: {
      type: Boolean,
      default: false,
    },

    hideConfigurationsButton: {
      type: Boolean,
      default: true,
    },
    hideLinkRequirementButton: {
      type: Boolean,
      default: true,
    },
    addNewButtonTitle: {
      type: String,
      default: "Add New",
    },
    addNewButtonIcon: {
      type: String,
      default: "mdi-plus",
    },
    filters: {
      type: Array,
      default: () => [],
    },
    truncateLimit: {
      type: Number,
      default: 30,
      validator: (value) => value > 0,
    },
  },
  data() {
    return {
      isRtl: false,
      selected: [],
      data: [],
      load: false,
      apiParamsLocal: {},

      // Custom table functionality
      searchQuery: "",
      currentPage: 1,
      perPage: 10,
      goToPageInput: "", // Go to page input value
      currentSort: null,
      sortDirection: "asc",
      sortable: true,

      // Server-side pagination data
      totalRecords: 0,
      filteredRecords: 0,

      // Column visibility
      visibleColumns: [],
      showDropdown: false,
      showColumnModal: false,

      // Import modal
      showModal: false,
      isFileColumnDisabled: true,
      file: {},
      file_columns: [],
      database_columns: [],
      fields: [],
      page: 0,
      showFilter: false,
      // Prevent multiple API calls
      fetchTimeout: null,

      // Filter-related properties
      isFilterOpen: false,
      activeFilters: [], // Changed from {} to [] to support multiple selections
      filterOperators: [], // Array to store operators between filters

      // Drag and drop properties
      draggingIndex: null,
      dragOverIndex: null,
      columnOrder: [], // Array to store custom column order

      // Truncate functionality
      showContentModal: false,
      modalContent: {
        title: "",
        content: "",
      },

      // Performance optimization: cache for cell content processing
      cellContentCache: new Map(),
      showExportDropdown: false,
      showPdfDropdown: false,
      showColumnSelectionModal: false,
      exportableColumns: [],
      selectedExportColumns: [],
      isExporting: false,
    };
  },
  computed: {
    isArabic() {
      return this.$i18n.locale === "ar";
    },
    processedColumns() {
      // Reset internal columns when columns prop changes
      const baseColumns = [
        { title: "", data: null, defaultContent: "N/A" },
        { title: "#", data: null, defaultContent: "N/A", sort: false },
        ...this.columns,
      ];

      // Add actions column if not hidden
      if (!this.hideActionsColumn) {
        baseColumns.push({
          title: this.$t ? this.$t("common.actions") : "Actions",
          data: null,
        });
      }

      return baseColumns;
    },

    paginatedData() {
      return this.data;
    },

    totalPages() {
      return Math.ceil(this.totalRecords / this.perPage);
    },

    startRecord() {
      if (this.data.length === 0) return 0;
      return (this.currentPage - 1) * this.perPage + 1;
    },

    endRecord() {
      if (this.data.length === 0) return 0;
      const start = (this.currentPage - 1) * this.perPage;
      return Math.min(
        start + this.data.length,
        this.currentPage * this.perPage
      );
    },

    paginationPages() {
      const pages = [];
      const maxPages = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

      if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },

    visibleColumnCount() {
      if (this.visibleColumns.length === 0) {
        return this.processedColumns.length;
      }
      return this.visibleColumns.filter((visible) => visible !== false).length;
    },

    // Validate go to page input
    isValidPageNumber() {
      return (
        this.goToPageInput &&
        Number.isInteger(this.goToPageInput) &&
        this.goToPageInput >= 1 &&
        this.goToPageInput <= this.totalPages
      );
    },

    orderedColumnIndexes() {
      if (this.columnOrder.length === 0) {
        // Return default order if no custom order is set
        return Array.from(
          { length: this.processedColumns.length },
          (_, i) => i
        );
      }
      return this.columnOrder;
    },

    hideActionsColumn() {
      // Show actions column by default, hide only if action prop is explicitly set to false
      return this.action === false;
    },
  },
  watch: {
    columns: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.initializeVisibleColumns();
        });
      },
    },

    processedColumns: {
      handler(newColumns) {
        if (newColumns.length > 0) {
          // Initialize visibility columns
          if (this.visibleColumns.length !== newColumns.length) {
            this.visibleColumns = newColumns.map(() => true);
            console.log(
              "ProcessedColumns watcher - initialized visibleColumns:",
              this.visibleColumns
            );
          }

          // Load or initialize column order
          this.loadColumnOrder();
        }
      },
      immediate: true,
    },

    // Watch for column order changes and save to localStorage
    columnOrder: {
      handler(newOrder) {
        if (newOrder.length > 0) {
          this.saveColumnOrder();
        }
      },
      deep: true,
    },

    apiParams: {
      deep: true,
      handler() {
        this.currentPage = 1;
        this.debouncedFetchData();
      },
    },

    searchQuery() {
      this.currentPage = 1;
      this.debouncedFetchData();
    },

    perPage() {
      this.currentPage = 1;
      this.fetchData();
    },

    currentPage() {
      this.fetchData();
    },

    currentSort() {
      this.currentPage = 1;
      this.fetchData();
    },

    sortDirection() {
      this.fetchData();
    },
  },

  created() {
    this.initializeVisibleColumns();
    this.loadExportableColumns();
  },

  mounted() {
    this.isRtl = this.$i18n.locale === "ar";
    this.initializeVisibleColumns();
    this.fetchData();

    // Add click outside handler for dropdown
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    if (this.fetchTimeout) {
      clearTimeout(this.fetchTimeout);
    }
    // Remove click outside handler
    document.removeEventListener("click", this.handleClickOutside);

    // Clean up modal state and restore body scroll
    if (this.showContentModal) {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this.handleEscapeKey);
    }

    // Clear cache to prevent memory leaks
    this.clearCellContentCache();
  },

  methods: {
    // Method جديدة للتحقق من إمكانية التنقل
    canNavigate() {
      return this.data.length > 0 && this.totalRecords > 0 && !this.load;
    },

    // تحديث method الـ goToPage
    goToPage(page) {
      if (!this.canNavigate()) return;

      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },

    // تحديث method الـ handleGoToPage
    handleGoToPage() {
      if (!this.canNavigate()) return;

      if (this.isValidPageNumber) {
        this.goToPage(this.goToPageInput);
        this.goToPageInput = "";
      }
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(
        this.filteredData || this.tableData || []
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, "data_export.xlsx");
    },
    importFromExcel(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // ✅ تأكيد أن tableData موجودة ومصفوفة
        if (!Array.isArray(this.tableData)) {
          this.tableData = [];
        }

        // ✅ دمج البيانات بدون خطأ
        this.tableData = [...jsonData, ...this.tableData];
      };
      reader.readAsArrayBuffer(file);
      event.target.value = "";
    },
    goToPage(page) {
      this.currentPage = page;
    },

    // Methods الخاصة بالـ Export
    toggleExportDropdown(event) {
      event.stopPropagation();
      this.showExportDropdown = !this.showExportDropdown;
      this.showPdfDropdown = false;
    },

    togglePdfDropdown(event) {
      event.stopPropagation();
      this.showPdfDropdown = !this.showPdfDropdown;
      this.showExportDropdown = false;
    },

    visibleExportableColumns() {
      return this.processedColumns
        .filter((col, index) => {
          if (index <= 1) return false;
          if (
            col.title === "Actions" ||
            col.title === this.$t?.("common.actions")
          )
            return false;
          const columnKey = col.data || col.id;
          return (
            columnKey &&
            (this.visibleColumns.length === 0 ||
              this.visibleColumns[index] !== false)
          );
        })
        .map((col) => ({
          title: col.title,
          data: col.data || col.id,
          id: col.id,
        }));
    },

    async loadExportableColumns() {
      try {
        this.exportableColumns = this.columns
          .filter((col) => col.data || col.id)
          .map((col) => ({
            title: col.title,
            data: col.data || col.id,
            id: col.id,
            originalData: col.data,
          }));
      } catch (error) {
        console.error("Error loading exportable columns:", error);
        this.exportableColumns = [];
      }
    },

    async handleExportAll() {
      this.showExportDropdown = false;
      this.isExporting = true;
      try {
        const visibleColumns = this.visibleExportableColumns();
        const columnKeys = visibleColumns.map((col) => col.data || col.id);

        const exportParams = this.buildApiParams();
        delete exportParams.page;
        delete exportParams.perPage;

        if (this.api.exportToExcel) {
          await this.api.exportToExcel({
            exportAll: true,
            columns: columnKeys,
            filters: exportParams,
            async: true,
          });
        } else {
          console.warn("Export API method not available");
        }
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        this.isExporting = false;
      }
    },

    async handleExportCurrent() {
      this.showExportDropdown = false;
      this.isExporting = true;

      const visibleColumns = this.visibleExportableColumns();
      const columnKeys = visibleColumns.map((col) => col.data || col.id);

      try {
        const exportParams = this.buildApiParams();

        await this.api.exportToExcel({
          exportAll: false,
          columns: columnKeys,
          filters: exportParams,
          async: true,
        });
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        this.isExporting = false;
      }
    },

    // لدوال PDF
    async handlePdfExportAll() {
      this.showPdfDropdown = false;
      this.isExporting = true;
      try {
        const visibleColumns = this.visibleExportableColumns();
        const columnKeys = visibleColumns.map((col) => col.data || col.id);

        const exportParams = this.buildApiParams();
        delete exportParams.page;
        delete exportParams.perPage;

        if (this.api.exportToPdf) {
          await this.api.exportToPdf({
            exportAll: true,
            columns: columnKeys,
            filters: exportParams,
            async: true,
          });
        } else {
          console.warn("PDF Export API method not available");
        }
      } catch (error) {
        console.error("PDF Export failed:", error);
      } finally {
        this.isExporting = false;
      }
    },

    async handlePdfExportCurrent() {
      this.showPdfDropdown = false;
      this.isExporting = true;
      try {
        const visibleColumns = this.visibleExportableColumns();
        const columnKeys = visibleColumns.map((col) => col.data || col.id);
        const exportParams = this.buildApiParams();

        if (this.api.exportToPdf) {
          await this.api.exportToPdf({
            exportAll: false,
            columns: columnKeys,
            filters: exportParams,
            async: true,
          });
        } else {
          console.warn("PDF Export API method not available");
        }
      } catch (error) {
        console.error("PDF Export failed:", error);
      } finally {
        this.isExporting = false;
      }
    },

    // لدوال Column Selection
    openColumnSelection() {
      this.showExportDropdown = false;
      this.showColumnSelectionModal = true;

      const visibleColumns = this.visibleExportableColumns();
      const columnKeys = visibleColumns.map((col) => col.data || col.id);
      this.selectedExportColumns = columnKeys;
    },

    closeColumnSelection() {
      this.showColumnSelectionModal = false;
      this.selectedExportColumns = [];
    },

    selectAllExportColumns() {
      this.selectedExportColumns = this.exportableColumns.map(
        (col) => col.data
      );
    },

    deselectAllExportColumns() {
      this.selectedExportColumns = [];
    },

    async exportSelectedColumns() {
      if (this.selectedExportColumns.length === 0) return;

      this.isExporting = true;
      try {
        const exportParams = this.buildApiParams();
        delete exportParams.page;
        delete exportParams.perPage;

        await this.api.exportToExcel({
          exportAll: true,
          columns: this.selectedExportColumns,
          filters: exportParams,
          async: true,
        });
        this.closeColumnSelection();
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        this.isExporting = false;
      }
    },
    // Methods الخاصة بالـ Import
    toggleModal() {
      this.file_columns = [];
      this.database_columns = [];
      this.fields = [];
      this.showModal = !this.showModal;
    },

    handleFileUpload(event) {
      this.file = event.target.files[0];
    },

    async handleImport() {
      const formData = new FormData();
      formData.append("file", this.file);
      try {
        const response = await this.api.fetchFileData(formData, {}, false);
        this.file_columns = response.data.file_columns;
        this.database_columns = response.data.database_columns;
      } catch (error) {
        console.error("Error importing file:", error);
      }
    },

    async saveImportedData() {
      try {
        await this.api.importFileData(this.fields, {}, false);
        this.file_columns = [];
        this.database_columns = [];
        this.fields = [];
        this.toggleModal();
        this.fetchData();
      } catch (error) {
        console.error("Error importing file:", error);
      }
    },

    importFromExcel(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (!Array.isArray(this.tableData)) {
          this.tableData = [];
        }

        this.tableData = [...jsonData, ...this.tableData];
      };
      reader.readAsArrayBuffer(file);
      event.target.value = "";
    },

    // Handle go to page input functionality
    handleGoToPage() {
      if (this.isValidPageNumber) {
        this.goToPage(this.goToPageInput);
        this.goToPageInput = ""; // Clear input after navigation
      }
    },

    initializeVisibleColumns() {
      // Initialize visible columns after processedColumns is updated
      this.$nextTick(() => {
        if (this.processedColumns.length > 0) {
          this.visibleColumns = this.processedColumns.map(() => true);
        }
      });
    },

    debouncedFetchData() {
      if (this.fetchTimeout) {
        clearTimeout(this.fetchTimeout);
      }
      this.fetchTimeout = setTimeout(() => {
        this.fetchData();
      }, 300);
    },

    async fetchData() {
      this.load = true;
      try {
        const params = this.buildApiParams();
        const response = await this.api.getAll(params);

        if (response.data && Array.isArray(response.data)) {
          this.data = response.data;
          this.totalRecords =
            response.recordsTotal || response.total || response.data.length;
          this.filteredRecords =
            response.recordsFiltered ||
            response.filtered ||
            response.data.length;
        } else if (Array.isArray(response)) {
          this.data = response;
          this.totalRecords = response.length;
          this.filteredRecords = response.length;
        } else {
          console.error("Unexpected response format:", response);
          this.data = [];
          this.totalRecords = 0;
          this.filteredRecords = 0;
        }

        // Clear cache when data changes for performance
        this.clearCellContentCache();
      } catch (error) {
        console.error("Error fetching data:", error);
        this.data = [];
        this.totalRecords = 0;
        this.filteredRecords = 0;
      } finally {
        this.load = false;
      }
    },

    buildApiParams() {
      const params = {
        perPage: this.perPage,
        page: this.currentPage,
        search: this.searchQuery,
      };

      if (this.currentSort) {
        params.sort = `${this.currentSort}|${this.sortDirection}`;
      }

      // Add active filters to API parameters
      if (this.activeFilters && this.activeFilters.length > 0) {
        // Separate filters by filterType
        const standardFilters = []; // filters with filterType "filter" or "filterOr"
        const specialFilters = {}; // filters with other filterTypes (filterWhereRelation, filterIn, etc.)

        this.activeFilters.forEach((filter) => {
          const filterType = filter.filterType || "filter";

          if (filterType === "filter" || filterType === "filterOr") {
            // Standard filters that participate in AND/OR logic
            standardFilters.push(filter);
          } else {
            // Special filters that are always AND and sent to specific API parameters
            if (!specialFilters[filterType]) {
              specialFilters[filterType] = [];
            }
            specialFilters[filterType].push(filter);
          }
        });

        // Handle standard filters (filter/filterOr) with AND/OR logic
        if (standardFilters.length > 0) {
          const completeFilterArray = [];
          standardFilters.forEach((filter) => {
            // Build filter value with type information
            let filterValue;
            let filterOperator = "="; // Default operator

            if (filter.type === "integer" || filter.type === "boolean") {
              filterValue = `${filter.value}-${filter.type}`;
            } else if (filter.type === "null") {
              filterValue = `-${filter.type}`;
              filterOperator = "!="; // Use != for null type
            } else {
              // For string and other types, keep original format
              filterValue = filter.value;
            }

            completeFilterArray.push(
              `${filter.key}|${filterValue}|${filterOperator}`
            );
          });

          // Build the complete filter string with operators
          let completeFilterString = "";
          if (completeFilterArray.length === 1) {
            completeFilterString = completeFilterArray[0];
          } else {
            completeFilterString = completeFilterArray[0];
            for (let i = 1; i < completeFilterArray.length; i++) {
              const operator = this.filterOperators[i - 1] || "&&";
              completeFilterString += operator + completeFilterArray[i];
            }
          }

          // Determine which parameter to use based on the dominant filterType
          const hasFilterOr = standardFilters.some(
            (f) => f.filterType === "filterOr"
          );
          const parameterName = hasFilterOr ? "filterOr" : "filter";
          params[parameterName] = completeFilterString;
        }

        // Handle special filters (always AND, sent to their specific API parameters)
        Object.keys(specialFilters).forEach((filterType) => {
          const filtersForType = specialFilters[filterType];
          const filterArray = [];

          filtersForType.forEach((filter) => {
            // Build filter value with type information
            let filterValue;
            let filterOperator = "="; // Default operator

            if (filter.type === "integer" || filter.type === "boolean") {
              filterValue = `${filter.value}-${filter.type}`;
            } else if (filter.type === "null") {
              filterValue = `-${filter.type}`;
              filterOperator = "!="; // Use != for null type
            } else {
              // For string and other types, keep original format
              filterValue = filter.value;
            }

            filterArray.push(`${filter.key}|${filterValue}|${filterOperator}`);
          });

          // Special filters are always combined with AND
          if (filterArray.length === 1) {
            params[filterType] = filterArray[0];
          } else {
            let filterString = filterArray[0];
            for (let i = 1; i < filterArray.length; i++) {
              filterString += "&&" + filterArray[i];
            }
            params[filterType] = filterString;
          }
        });
      }

      // Merge with apiParams, but handle filter parameters specially
      const finalParams = { ...this.apiParams, ...params };

      // If there's a base filter from apiParams and user filters with the same key, combine them
      // Loop through all possible filter types (filter, status_filter, etc.)
      Object.keys(this.apiParams).forEach((key) => {
        // Check if this is a filter parameter (ends with 'filter' or is named 'filter')
        if (key.includes("filter") && this.apiParams[key] && params[key]) {
          // Combine base filter with user filter using AND operator
          finalParams[key] = this.apiParams[key] + "&&" + params[key];
        }
      });

      return finalParams;
    },

    sortBy(column) {
      if (this.currentSort === column) {
        // Toggle sort direction if same column
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        // Set new sort column with ascending direction
        this.currentSort = column;
        this.sortDirection = "asc";
      }
    },

    // Enhanced dropdown methods
    showAllColumns() {
      const newVisibleColumns = [...this.visibleColumns];
      for (let i = 2; i < newVisibleColumns.length; i++) {
        newVisibleColumns[i] = true;
      }
      this.visibleColumns = newVisibleColumns;
    },

    hideAllColumns() {
      const newVisibleColumns = [...this.visibleColumns];
      for (let i = 2; i < newVisibleColumns.length; i++) {
        newVisibleColumns[i] = false;
      }
      this.visibleColumns = newVisibleColumns;
    },

    toggleDropdown(event) {
      console.log(
        "toggleDropdown called, current showDropdown:",
        this.showDropdown
      );
      this.showDropdown = !this.showDropdown;
      console.log(
        "toggleDropdown after toggle, showDropdown:",
        this.showDropdown
      );

      if (this.showDropdown) {
        this.$nextTick(() => {
          const dropdown = this.$refs.dropdownMenu;
          console.log("Dropdown menu element:", dropdown);
          if (dropdown) {
            console.log(
              "Dropdown computed styles:",
              window.getComputedStyle(dropdown)
            );
          }
        });
      }
    },

    handleClickOutside(event) {
      const dropdown = this.$refs.dropdownMenu?.parentElement; // Get the dropdown container
      if (dropdown && !dropdown.contains(event.target)) {
        this.showDropdown = false;
      }
    },
    toggleFilter() {
      this.showFilter = !this.showFilter;
    },
    toggleColumn(index) {
      // Don't allow toggling the first two columns (checkbox and row number)
      if (index <= 1) {
        return;
      }
      // Toggle visibility for the column at the given index using array spread for reactivity
      const newVisibleColumns = [...this.visibleColumns];
      newVisibleColumns[index] = !newVisibleColumns[index];
      this.visibleColumns = newVisibleColumns;
    },

    openForm() {
      this.$emit("add-new");
      this.$emit("flip-page"); // Emit flip event to trigger page rotation
      if (this.openForm) {
        this.openForm({});
      }
    },

    editItem(item) {
      this.$emit("edit-item", item);
      if (this.editItem) {
        this.editItem(item);
      }
    },

    toggleModal() {
      this.file_columns = [];
      this.database_columns = [];
      this.fields = [];
      this.showModal = !this.showModal;
    },

    handleFileUpload(event) {
      this.file = event.target.files[0];
    },

    async handleImport() {
      const formData = new FormData();
      formData.append("file", this.file);
      try {
        const response = await this.api.fetchFileData(formData, {}, false);
        this.file_columns = response.data.file_columns;
        this.database_columns = response.data.database_columns;
      } catch (error) {
        console.error("Error importing file:", error);
      }
    },

    // async saveImportedData() {
    //   try {
    //     await this.api.importFileData(this.fields, {}, false);
    //     this.file_columns = [];
    //     this.database_columns = [];
    //     this.fields = [];
    //     this.toggleModal();
    //     this.fetchData();
    //   } catch (error) {
    //     console.error("Error importing file:", error);
    //   }
    // },

    async deleteItem(data) {
      try {
        await this.api.delete(0, [data.id].map(String));
        this.fetchData();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },

    async multiDelete() {
      if (this.selected.length === 0) {
        alert("Please select items to delete");
        return;
      }
      try {
        await this.api.delete(0, this.selected.map(String));
        this.selected = [];
        this.fetchData();
      } catch (error) {
        console.error("Error deleting items:", error);
      }
    },

    refreshTable() {
      this.fetchData();
    },

    // Filter-related methods
    openFilterModal() {
      // Check if filters are available
      if (!this.filters || this.filters.length === 0) {
        // Show a notification or do nothing
        console.warn("No filters available for this module");
        // Optional: Show a toast notification
        // this.$notify({
        //   type: "warning",
        //   text: "No filters are configured for this module"
        // });
        return;
      }
      this.isFilterOpen = true;
    },

    closeFilterModal() {
      this.isFilterOpen = false;
    },

    onFilterApplied(filterData) {
      // Legacy method - now works with array format
      const existingIndex = this.activeFilters.findIndex(
        (f) => f.key === filterData.key
      );
      if (existingIndex >= 0) {
        this.activeFilters[existingIndex] = filterData;
      } else {
        this.activeFilters.push(filterData);
      }

      // If we're already on page 1, we need to manually fetch data
      if (this.currentPage === 1) {
        this.fetchData();
      } else {
        this.currentPage = 1; // This will trigger fetchData via watcher
      }
    },

    onFilterRemoved(filterData) {
      // Legacy method - now works with array format
      this.activeFilters = this.activeFilters.filter(
        (f) => !(f.key === filterData.key && f.value === filterData.value)
      );

      // If we're already on page 1, we need to manually fetch data
      if (this.currentPage === 1) {
        this.fetchData();
      } else {
        this.currentPage = 1; // This will trigger fetchData via watcher
      }
    },

    onFiltersCleared() {
      this.activeFilters = [];
      this.filterOperators = []; // Reset operators array
      // If we're already on page 1, we need to manually fetch data
      if (this.currentPage === 1) {
        this.fetchData();
      } else {
        this.currentPage = 1; // This will trigger fetchData via watcher
      }
    },

    onOperatorsChanged(operators) {
      this.filterOperators = operators;
      // If we're already on page 1, we need to manually fetch data
      if (this.currentPage === 1) {
        this.fetchData();
      } else {
        this.currentPage = 1; // This will trigger fetchData via watcher
      }
    },

    onFiltersSaved(filtersData) {
      // Store active filters as array (supporting multiple selections of same type)
      this.activeFilters = filtersData.filters || [];
      this.filterOperators = filtersData.operators || [];

      // If we're already on page 1, we need to manually fetch data
      // If we're not on page 1, setting currentPage will trigger the watcher
      if (this.currentPage === 1) {
        this.fetchData();
      } else {
        this.currentPage = 1; // This will trigger fetchData via watcher
      }

      // Optional: Show success message
      console.log("Filters saved and applied:", filtersData);
    },

    // Keep for backward compatibility
    onOperatorChanged(operator) {
      // Convert single operator to array format
      this.filterOperators = [operator];
      // If we're already on page 1, we need to manually fetch data
      if (this.currentPage === 1) {
        this.fetchData();
      } else {
        this.currentPage = 1; // This will trigger fetchData via watcher
      }
    },

    // Drag and Drop Methods
    onDragStart(event, orderIndex, columnIndex) {
      this.draggingIndex = orderIndex;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", orderIndex.toString());

      // Add visual feedback
      event.target.style.opacity = "0.5";
    },

    onDragOver(event, targetIndex) {
      this.dragOverIndex = targetIndex;
    },

    onDrop(event, targetIndex) {
      event.preventDefault();
      const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"));

      if (sourceIndex !== targetIndex && sourceIndex !== null) {
        this.reorderColumns(sourceIndex, targetIndex);
      }

      // Reset drag state
      this.draggingIndex = null;
      this.dragOverIndex = null;

      // Reset visual feedback
      const draggedElement = event.target.closest(".column-item");
      if (draggedElement) {
        draggedElement.style.opacity = "1";
      }
    },

    onDragEnd(event) {
      // Reset visual feedback
      event.target.style.opacity = "1";
      this.draggingIndex = null;
      this.dragOverIndex = null;
    },

    reorderColumns(fromIndex, toIndex) {
      const newOrder = [...this.orderedColumnIndexes];
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);

      this.columnOrder = newOrder;
    },

    // Column Order Persistence Methods
    getStorageKey() {
      // Create a unique key based on the table ID and column structure
      const columnTitles = this.processedColumns
        .map((col) => col.title)
        .join("|");
      return `datatable_column_order_${this.id}_${btoa(columnTitles).slice(
        0,
        10
      )}`;
    },

    saveColumnOrder() {
      try {
        const storageKey = this.getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(this.columnOrder));
      } catch (error) {
        console.warn("Failed to save column order to localStorage:", error);
      }
    },

    loadColumnOrder() {
      try {
        const storageKey = this.getStorageKey();
        const savedOrder = localStorage.getItem(storageKey);

        if (savedOrder) {
          const parsedOrder = JSON.parse(savedOrder);

          // Validate that the saved order matches current column structure
          if (
            parsedOrder.length === this.processedColumns.length &&
            parsedOrder.every((index) => index < this.processedColumns.length)
          ) {
            this.columnOrder = parsedOrder;
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to load column order from localStorage:", error);
      }

      // Initialize with default order if loading fails or no saved order exists
      this.columnOrder = Array.from(
        { length: this.processedColumns.length },
        (_, i) => i
      );
    },

    resetColumnOrder() {
      // Reset to default order
      this.columnOrder = Array.from(
        { length: this.processedColumns.length },
        (_, i) => i
      );

      // Clear from localStorage
      try {
        const storageKey = this.getStorageKey();
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn("Failed to remove column order from localStorage:", error);
      }
    },

    // Truncate functionality methods with performance optimization
    getCellValue(row, column) {
      if (!column?.data) return "";
      return row[column.data] ?? "";
    },

    // Strip HTML tags and decode entities for display
    stripHtmlTags(content) {
      if (!content) return "";

      const stringContent =
        typeof content === "string" ? content : String(content);

      // Remove HTML tags and decode common entities
      return stringContent
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
        .replace(/&amp;/g, "&") // Replace &amp; with &
        .replace(/&lt;/g, "<") // Replace &lt; with <
        .replace(/&gt;/g, ">") // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .replace(/&#39;/g, "'") // Replace &#39; with '
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing spaces
    },

    shouldTruncate(content) {
      // Fast return for empty values
      if (!content && content !== 0) return false;

      // Strip HTML for length calculation
      const cleanContent = this.stripHtmlTags(content);
      return cleanContent.length > this.truncateLimit;
    },

    getTruncatedText(content) {
      if (!content && content !== 0) return "";

      // Strip HTML tags first for display
      const cleanContent = this.stripHtmlTags(content);

      // Create cache key for performance
      const cacheKey = `${cleanContent}_${this.truncateLimit}`;
      if (this.cellContentCache.has(cacheKey)) {
        return this.cellContentCache.get(cacheKey);
      }

      const result =
        cleanContent.length > this.truncateLimit
          ? cleanContent.substring(0, this.truncateLimit).trim()
          : cleanContent;

      // Cache the result for better performance
      this.cellContentCache.set(cacheKey, result);

      return result;
    },

    showFullContent(title, content) {
      this.modalContent.title = title || "Content Details";
      // Show cleaned content in modal for better readability
      this.modalContent.content = this.stripHtmlTags(content) || "";
      this.showContentModal = true;

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Add escape key listener
      document.addEventListener("keydown", this.handleEscapeKey);
    },

    closeContentModal() {
      this.showContentModal = false;
      this.modalContent.title = "";
      this.modalContent.content = "";

      // Restore body scroll
      document.body.style.overflow = "";

      // Remove escape key listener
      document.removeEventListener("keydown", this.handleEscapeKey);
    },

    handleEscapeKey(event) {
      if (event.key === "Escape" && this.showContentModal) {
        this.closeContentModal();
      }
    },

    // Clear cache when data changes to prevent memory leaks
    clearCellContentCache() {
      this.cellContentCache.clear();
    },
  },
};
</script>

<style scoped>
/* Table cell styling to fit content width */
.table-cell-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

.main-btn {
  background-color: #6e3894;
  color: #ffffff;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 14px;
  text-transform: capitalize !important;
  border: 1px solid #6e3894;
  height: 30px;
  font-weight: 500;
}

.secondary-btn {
  color: #43235c;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 14px;
  text-transform: capitalize !important;
  border: 1px solid #6e3894;
  height: 30px;
  font-weight: 500;
}

/* Pagination info styling */
.pagination-info {
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
}

.pagination-info span {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.icon-add {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
}

.search-section {
  margin-bottom: 2rem;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 10px;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-field {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  height: 38px;
  background: var(--white) !important;
}

.icon-right {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.filter-btn {
  background-color: #6e3894;
  color: #ffffff;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize !important;
  border: 1px solid #6e3894;
  height: 25px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #5a2d76;
  transform: translateY(-1px);
}

.filter-btn-disabled {
  background-color: #6e3894 !important;
  border-color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.7;
  display: none !important;
}

.filter-btn-disabled:hover {
  background-color: #6e3894 !important;
  transform: none !important;
}

.no-filters-indicator {
  color: #fbbf24;
  font-size: 10px;
}

.input-actions .d-flex {
  align-items: center;
  height: 35px;
  background: #f8f9fa;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.custom-select {
  background: transparent;
  font-size: 14px;
  font-weight: 500 !important;
  padding: 4px;
  color: #43235c !important;
  border-radius: 5px !important;
  cursor: pointer;
  width: auto;
  border: 1px solid #6e3894 !important;
}

.form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0 transparent;
}

.page-link:focus {
  z-index: 3;
  color: var(--bs-pagination-focus-color);
  background-color: var(--bs-pagination-focus-bg);
  outline: 0;
  box-shadow: var(--bs-pagination-focus-box-shadow);
}

.page-link {
  border: 1px solid transparent !important;
}

.page-link:focus {
  box-shadow: unset !important;
}

.pagination-button.prev {
  border: 1px solid #eff1f4 !important;
}

.pagination-button.next {
  border: 1px solid #eff1f4 !important;
}

.table-bordered > :not(caption) > * {
  border-width: 1px !important;
}

.table-bordered > :not(caption) > * > * {
  border-width: 0px !important;
}

.table > :not(caption) > * > * {
  color: #121212 !important;
  font-weight: 500;
}

/* Custom Table Styles */
.container-table {
  border-radius: 10px;
  border: 1px solid #d9d9d9;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  margin-bottom: 0px;
}

.custom-table thead {
  padding: 0px 16px;
  position: relative;
}

.custom-table thead th {
  background: #fafbfb;
  padding: 8px;
  width: auto;
  columns: #000000;
  text-align: start;
  vertical-align: middle;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.8px;
  text-transform: capitalize;
  user-select: none;
  position: relative;
  transition: all 0.3s ease;
  border: none;
}

.custom-table tbody tr:first-child {
  border-top: 0px !important;
}

.custom-table tbody tr {
  border-top: 1px solid #00000033 !important;
}

.custom-table tbody td {
  padding-bottom: 0px;
  text-align: start;
  vertical-align: middle;
  transition: all 0.3s ease;
  background: #fff;
  border-left: none;
  border-right: none;
  border-top: none;
}

.custom-table tbody tr:hover {
  background: linear-gradient(
    135deg,
    rgba(68, 34, 92, 0.08) 0%,
    rgba(90, 45, 115, 0.08) 100%
  );
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.15);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  z-index: 1;
}

.custom-table tbody tr:hover td {
  position: relative;
  z-index: 1;
}

/* Ensure visibility styles are not overridden by hover effects */
.custom-table tbody tr:hover td[style*="display: none"] {
  display: none !important;
}

.custom-table tbody tr:hover th[style*="display: none"] {
  display: none !important;
}

/* Table Controls */
.table-controls {
  padding-bottom: 1rem;
}

/* Pagination */
.pagination {
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.pagination .page-link {
  background: #fff;
  color: #919191;
  padding: 0.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 44px;
  justify-content: center;
}

.pagination .pagination-button {
  display: flex;
  background: #6e3894;
  width: 35px;
  height: 35%;
  border-radius: 50%;
  color: #fff;
}

.pagination .page-link:hover {
  transform: translateY(-2px);
  background: #eff1f4;
  font-weight: 700;
}

.pagination .page-item.active .page-link {
  font-weight: 700;
  color: #43235c;
  border-color: #6e3894;
  transform: translateY(-1px);
}

.pagination .page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.loader {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  box-sizing: border-box;
  border-top: 4px solid #444;
  border-left: 4px solid #444;
  border-right: 4px solid transparent;
  animation: loader 0.7s infinite linear;
}

@keyframes loader {
  to {
    transform: rotate(360deg);
  }
}

.text-primary {
  color: #44225c !important;
}

/* Action Dropdown */
.table-actions .dropdown-toggle {
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
}

.table-actions .dropdown-toggle::after {
  display: none;
}

.table-actions .dropdown-menu {
  min-width: 150px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  z-index: 1000 !important;
}

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

/* Modal Styles */
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
  padding: 2rem;
  border-radius: 8px;
  min-width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h5 {
  margin: 0;
  color: #44225c;
  font-weight: 600;
}

.modal-body .form-group {
  margin-bottom: 1rem;
}

.modal-body .form-check {
  margin-bottom: 0.5rem;
}

.modal-body .btn-primary {
  background-color: #44225c;
  border-color: #44225c;
}

.modal-body .btn-primary:hover {
  background-color: #331845;
  border-color: #331845;
}

/* Enhanced Column Visibility Dropdown Styles */
.column-visibility-dropdown {
  position: relative;
  display: inline-block;
  z-index: 999;
}

.visibility-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6e3894 !important;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  height: 25px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.visibility-toggle-btn:focus {
  outline: none;
  border-color: #44225c;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-text {
  font-weight: 500;
  color: inherit;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: #9ca3af;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.column-visibility-dropdown {
  position: relative;
  display: inline-block;
}

.visibility-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 999999;
  min-width: 260px;
  max-width: 90vw;
  margin: 10px;
  background: #f5f5f5;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: dropdownSlideIn 0.15s ease-out;
  backdrop-filter: blur(8px);
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
  background: #f5f5f5;
  border-radius: 12px 12px 0 0;
}

.dropdown-title {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #6b7280;
}

.action-btn:hover {
  background: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
  transform: scale(1.05);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #6b7280;
}

.close-btn:hover {
  background: #f87171;
  border-color: #f87171;
  color: #ffffff;
  transform: scale(1.05);
}

.dropdown-content {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.column-list {
  padding: 0 8px;
}

.column-item {
  margin-bottom: 4px;
}

.column-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.15s ease;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  background-color: #ffffff;
}

.column-checkbox:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateX(2px);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: #6366f1;
  transform: scale(1.05);
}

.check-icon {
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s ease;
}

.checkbox-input:checked + .checkbox-custom .check-icon {
  opacity: 1;
  transform: scale(1);
}

.column-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.column-badge {
  background: #fee2e2;
  color: #dc2626;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-footer {
  padding: 8px 4px;
  background: #f5f5f5;
  border-radius: 10px;
}

.footer-actions {
  margin-bottom: 6px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
  flex-wrap: nowrap;
}

.footer-action-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 6px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  min-width: 100px;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
}

.footer-action-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s;
}

.footer-action-btn:hover::before {
  left: 100%;
}

.footer-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: transparent;
}

.reset-order {
  width: 120px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

.btn-icon svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.footer-action-btn:hover .btn-icon svg {
  transform: scale(1.1);
}

.btn-text {
  font-weight: 600;
  letter-spacing: 0.025em;
}

.footer-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 50%;
  color: #ffffff;
  flex-shrink: 0;
}

.info-icon svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
}

.visible-count {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  letter-spacing: 0.025em;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .visibility-toggle-btn {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .visibility-toggle-btn:hover {
    background: #374151;
    border-color: #6366f1;
  }

  .dropdown-header {
    background: #f5f5f5;
  }

  .action-btn {
    background: #374151;
    border-color: #4b5563;
    color: #9ca3af;
  }

  .column-name {
    color: #f9fafb;
  }

  .checkbox-custom {
    background: #374151;
    border-color: #4b5563;
  }

  .visible-count {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
}

/* Animation for checkbox */
@keyframes checkboxCheck {
  0% {
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* Button hover animations */
@keyframes buttonPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

.footer-action-btn:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

.info-icon {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
  }

  to {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.8),
      0 0 15px rgba(99, 102, 241, 0.6);
  }
}

.checkbox-input:checked + .checkbox-custom {
  animation: checkboxCheck 0.2s ease;
}

/* Focus styles for accessibility */
.checkbox-input:focus + .checkbox-custom {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.column-checkbox:focus-within {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .column-visibility-dropdown {
    position: static;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .footer-action-btn {
    min-width: 120px;
    padding: 8px 12px;
  }

  .btn-text {
    font-size: 12px;
  }

  .info-container {
    padding: 6px 12px;
  }

  .visible-count {
    font-size: 12px;
  }

  .table-controls .btn-group {
    margin-top: 1rem;
  }

  .table-controls .btn-group .btn {
    margin: 0.25rem;
  }

  .custom-table {
    font-size: 0.8rem;
  }

  .custom-table thead th,
  .custom-table tbody td {
    padding: 10px 12px;
  }

  .modal-container {
    min-width: 90vw;
    margin: 1rem;
  }

  .search-wrapper {
    position: relative;
  }

  .input-actions {
    position: static;
    transform: none;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .input-actions > div {
    flex: 1;
    min-width: 120px;
  }

  .dropdown-title {
    font-size: 13px;
  }

  .column-name {
    font-size: 13px;
  }
}

.text-muted {
  color: #6c757d;
}

.text-danger {
  color: #dc3545;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Table Responsive */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive .custom-table {
  min-width: 800px;
}

.form-select {
  padding: 1px !important;
  text-align: center;
}

.table-striped > tbody > tr:nth-of-type(odd) > * {
  --bs-table-color-type: transparent;
  --bs-table-bg-type: transparent;
}

.column-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  padding: 12px;
}

.column-item {
  margin-bottom: 0;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: #43235c;
  border-color: #43235c;
}

.check-icon {
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s ease;
}

.checkbox-input:checked + .checkbox-custom .check-icon {
  opacity: 1;
  transform: scale(1);
}

.column-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #2d3748;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-badge {
  background: #fee2e2;
  color: #dc2626;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .column-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 6px;
    padding: 8px;
  }

  .column-checkbox {
    padding: 6px 8px;
  }

  .column-name {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .column-grid {
    grid-template-columns: 1fr;
  }

  .visibility-dropdown-menu {
    width: 90vw;
    max-width: 300px;
  }
}

.search-container {
  padding: 10px 16px;
  border-radius: 10px;
  background: #f8f8f8;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.custom-table tbody tr:nth-child(even) {
  background-color: rgba(68, 34, 92, 0.02);
}

.custom-table tbody tr:hover {
  background: linear-gradient(
    135deg,
    rgba(68, 34, 92, 0.08) 0%,
    rgba(90, 45, 115, 0.08) 100%
  );
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.15);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  z-index: 1;
}

.custom-table tbody tr:hover td {
  position: relative;
  z-index: 1;
}

.table-bordered > :not(caption) > * {
  border-width: 0 !important;
}

.table-bordered > :not(caption) > * > * {
  border-width: 0 !important;
}

.custom-table tbody tr:hover td[style*="display: none"] {
  display: none !important;
}

.custom-table tbody tr:hover th[style*="display: none"] {
  display: none !important;
}

.form-control {
  border-radius: 10px !important;
}

:root {
  --ck-border-radius: 10px !important;
}

.custom-table tbody td {
  text-align: start;
  vertical-align: middle;
  min-width: 120px;
  max-width: 300px;
}

.custom-table tbody td:first-child {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  text-align: start;
}

.custom-table tbody td:nth-child(2) {
  width: 60px;
  min-width: 60px;
  max-width: 60px;
  text-align: start;
  font-weight: 600;
  color: #6e3894;
}

.custom-table tbody td:last-child {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  text-align: center;
}

.custom-table tbody td.compact {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}

/* Drag and Drop Styles */
.column-item.draggable {
  cursor: grab;
  transition: all 0.2s ease;
}

.column-item.draggable:active {
  cursor: grabbing;
}

.column-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  z-index: 1000;
}

.column-item.drag-over {
  border-top: 2px solid #6366f1;
  margin-top: 2px;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: grab;
  color: #9ca3af;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.drag-handle:hover {
  color: #6b7280;
}

.drag-handle:active {
  cursor: grabbing;
}

.column-item.draggable .column-checkbox:hover .drag-handle {
  color: #374151;
}

/* Drag feedback animations */
@keyframes dragPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }
}

.column-item.drag-over {
  animation: dragPulse 0.3s ease-in-out;
}

/* Enhanced action button styles */
.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #6b7280;
}

.action-btn:hover {
  background: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
  transform: scale(1.05);
}

/* Responsive adjustments for drag handle */
@media (max-width: 768px) {
  .drag-handle {
    width: 14px;
    height: 14px;
  }

  .column-checkbox {
    gap: 6px;
    padding: 6px 8px;
  }
}

/* Enhanced Vuetify Actions Menu Styles */
.actions-menu-btn {
  background: none !important;
  border: none !important;
  padding: 8px !important;
  cursor: pointer !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.actions-menu-btn:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  transform: scale(1.05);
}

.actions-menu-btn svg {
  display: block;
}

.actions-menu-list {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
  overflow: hidden !important;
  background: white !important;
  padding: 5px 0 0 !important;
  width: 15px !important;
}

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

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

/* Icon styling within menu items */
.action-list-item .action-icon {
  color: #6e3894 !important;
  margin-right: 12px !important;
}

.action-list-item.delete-item .action-icon {
  color: #d32f2f !important;
}

/* Custom styling to match the image design */
.v-list-item--density-compact .v-list-item__prepend {
  margin-inline-end: 5px !important;
}

/* Ensure proper spacing and alignment */
.v-list-item__prepend .v-icon {
  margin-right: 5px !important;
}

/* Custom divider styling */
.actions-menu-list .v-divider {
  margin: 0px 0 !important;
  border-color: #f0f0f0 !important;
}

/* Ensure menu appears above other elements */
.v-overlay__content {
  z-index: 9999 !important;
}

/* Truncate Content Styles */
.table-cell-content {
  display: inline-flex;
  align-items: baseline;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  line-height: 1.4;
}

.see-more-btn {
  background: none;
  border: none;
  color: #6e3894;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 1px;
  padding: 2px 4px;
  text-decoration: underline;
  transition: color 0.2s ease;
  white-space: nowrap;
  display: inline-block;
  vertical-align: baseline;
  text-decoration: none;
}

.see-more-btn:hover {
  color: #000000 !important;
  text-decoration: none;
  border-radius: 3px;
}

.see-more-btn:focus {
  outline: none;
  border-radius: 2px;
}

/* Content Modal Styles */
.content-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.content-modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px 5px;
  /* border-bottom: 1px solid #e5e7eb; */
  background: #f5f5f5;
}

.content-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.content-modal-close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-modal-close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.content-modal-body {
  padding: 15px 24px;
  overflow-y: auto;
  flex: 1;
}

.content-modal-text {
  line-height: 1.6;
  color: #374151;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}

.content-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
}

.content-modal-ok-btn {
  background-color: #6e3894;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.content-modal-ok-btn:hover {
  background-color: #5a2d76;
}

.content-modal-ok-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.2);
}

/* Responsive Design for Modal */
@media (max-width: 768px) {
  .content-modal-container {
    max-width: 95%;
    max-height: 90vh;
    margin: 10px;
  }

  .content-modal-header,
  .content-modal-body,
  .content-modal-footer {
    padding: 16px;
  }

  .content-modal-title {
    font-size: 16px;
  }
}

/* Animation for modal */
.content-modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.content-modal-container {
  animation: slideIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Go to page input styling - Enhanced to match pagination */
.pagination-label {
  color: #919191;
  font-weight: 600;
  font-size: 0.9rem;
  margin-right: 0.75rem;
}

.pagination-go-to-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border-radius: 10px;
  padding: 0.25rem;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.pagination-go-to-wrapper:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.15);
  border-color: #6e3894;
}

.pagination-go-to-input {
  border: none;
  outline: none;
  background: transparent;
  width: 60px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #43235c;
  padding: 0.375rem 0.25rem;
}

.pagination-go-to-input::placeholder {
  color: #adb5bd;
  font-weight: 500;
}

.pagination-go-to-input:focus {
  color: #6e3894;
}

.pagination-go-to-btn {
  background: #6e3894;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 50px;
}

.pagination-go-to-btn:hover:not(:disabled) {
  background: #5a2d76;
  transform: translateY(-1px);
}

.pagination-go-to-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.v-list-item__prepend > .v-badge ~ .v-list-item__spacer,
.v-list-item__prepend > .v-icon ~ .v-list-item__spacer,
.v-list-item__prepend > .v-tooltip ~ .v-list-item__spacer {
  width: 7px;
}

.form-switch .form-check-input:checked {
  background-color: #255f0b !important;
  border-color: #255f0b !important;
}

.m-rtl {
  margin-left: 4px;
  margin-right: 0;
}

[dir="rtl"] .m-rtl {
  margin-left: 0px;
  margin-right: 4px;
}

.m-rtl-md {
  margin-left: 0px;
  margin-right: 8px;
}

[dir="rtl"] .m-rtl-md {
  margin-left: 8px;
  margin-right: 0px;
}

[dir="rtl"] .v-list-item__prepend .v-icon {
  margin-left: 5px !important;
  margin-right: 0px !important;
}

.v-list-item__prepend .v-icon {
  margin-left: 0px !important;
  margin-right: 5px !important;
}

/* RTL Support for Table */
[dir="rtl"] .custom-table {
  direction: rtl;
}

[dir="rtl"] .custom-table thead th,
[dir="rtl"] .custom-table tbody td {
  text-align: center;
}

/* Ensure checkbox column stays on the right in RTL */
[dir="rtl"] .custom-table tbody td:first-child,
[dir="rtl"] .custom-table thead th:first-child {
  text-align: center;
}

/* Ensure row number stays properly aligned */
[dir="rtl"] .custom-table tbody td:nth-child(2),
[dir="rtl"] .custom-table thead th:nth-child(2) {
  text-align: center;
}

/* Actions column alignment in RTL */
[dir="rtl"] .custom-table tbody td:last-child,
[dir="rtl"] .custom-table thead th:last-child {
  text-align: center;
}

/* RTL Support for table container */
[dir="rtl"] .table-responsive {
  direction: rtl;
}

/* Fix icon positions in RTL */
[dir="rtl"] .icon-right {
  right: auto;
  left: 18px;
}

/* Sort indicator position in RTL */
[dir="rtl"] .sort-indicator {
  margin-left: 0;
  margin-right: 0.25rem;
}

/* Dropdown menu position in RTL */
[dir="rtl"] .visibility-dropdown-menu {
  right: auto;
  left: 0;
}

/* Action buttons alignment in RTL */
[dir="rtl"] .table-controls .row {
  direction: rtl;
}

/* Pagination RTL */
[dir="rtl"] .pagination {
  direction: rtl;
}

/* Cell content RTL */
[dir="rtl"] .table-cell-content {
  direction: rtl;
  text-align: center;
}

/* See more button in RTL */
[dir="rtl"] .see-more-btn {
  margin-left: 0;
  margin-right: 4px;
}

[dir="rtl"] .search-field {
  text-align: end;
}
.justify-rtl {
  justify-content: end;
}
[dir="rtl"] .justify-rtl {
  justify-content: start;
}
[dir="rtl"] .table-controls .row {
  display: flex;
  flex-wrap: wrap;
}

[dir="rtl"] .table-controls .col-4:nth-child(1) {
  order: 5; /* Import */
}

[dir="rtl"] .table-controls .col-4:nth-child(2) {
  order: 4; /* Export */
}

[dir="rtl"] .table-controls .col-4:nth-child(3) {
  order: 3; /* Add */
}

[dir="rtl"] .table-controls .col-4:nth-child(4) {
  order: 2; /* Configurations */
}

[dir="rtl"] .table-controls .col-4:nth-child(5) {
  order: 1; /* Link Requirement */
}

[dir="rtl"] .table-controls .col-4:nth-child(6) {
  order: 6; /* Statistics */
}
[dir="rtl"] .v-field__input {
  text-align: end;
}
[dir="rtl"] .form-select {
  text-align: end;
}
/* Export Dropdown Styles */
.export-dropdown {
  position: relative;
  display: inline-block;
}

.export-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.export-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.export-option:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #6e3894;
}

.export-option svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.export-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Export Modal Styles */
.export-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.column-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.column-selection-grid::-webkit-scrollbar {
  width: 6px;
}

.column-selection-grid::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.column-selection-grid::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.column-selection-grid::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.export-column-item {
  background: #ffffff;
  border-radius: 6px;
  padding: 8px;
  transition: all 0.2s ease;
}

.export-column-item:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.export-column-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.export-options {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

/* Button Styles for Export Modal */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #6e3894;
  color: white;
  border: 1px solid #6e3894;
}

.btn-primary:hover:not(:disabled) {
  background: #5a2d76;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline-primary {
  background: transparent;
  color: #6e3894;
  border: 1px solid #6e3894;
}

.btn-outline-primary:hover {
  background: #6e3894;
  color: white;
}

.btn-outline-secondary {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline-secondary:hover {
  background: #f3f4f6;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Modal Footer Styles */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

/* Utility Classes */
.mr-2 {
  margin-right: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* Export specific responsive styles */
@media (max-width: 768px) {
  .column-selection-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 6px;
    padding: 8px;
  }

  .export-column-checkbox {
    padding: 6px 8px;
  }

  .export-option {
    padding: 10px 14px;
    font-size: 13px;
  }

  .export-dropdown-menu {
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .column-selection-grid {
    grid-template-columns: 1fr;
  }

  .export-modal {
    max-width: 95vw;
  }
}

/* PDF Dropdown Container */
.pdf-dropdown {
  position: relative;
  display: inline-block;
}

/* PDF Dropdown Menu */
.pdf-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.pdf-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

/* Hover Effect - Red Theme */
.pdf-option:hover {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
  color: #dc2626; /* Red color for PDF */
}

/* SVG Icon Styling */
.pdf-option svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #dc2626; /* Red color for PDF icon */
}

/* Border between options */
.pdf-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}
</style>