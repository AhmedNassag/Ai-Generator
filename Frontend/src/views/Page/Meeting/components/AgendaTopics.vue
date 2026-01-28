<template>
  <div class="topic-tab-view">
    <div
      v-if="isLoading"
      class="d-flex justify-content-center align-items-center vh-100"
    >
      <div class="dot-loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>

    <main-page
      v-else
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="'agendadetails.agendadetails'"
      :subPage="'agendadetails.agendadetails'"
      :titlePage="'agendadetails.agendadetails'"
    >
      <template #datatable>
        <v-card flat class="topics-container">
          <v-card-title class="topics-header">
            <span class="agenda-title">{{ agendaDetails.name || $t('meeting.agenda_name') }}</span>
            <v-btn
              small
              class="general-note-btn"
              depressed
              @click="addGeneralNotes"
              :hidden="!(committeeHeads && committeeHeads.includes(USER.id))"
            >
              <v-icon small left
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9.26059 0.140589C9.44804 -0.0468629 9.75196 -0.0468629 9.93941 0.140589L11.8594 2.06059C12.0469 2.24804 12.0469 2.55196 11.8594 2.73941L6.09941 8.49941C6.00939 8.58943 5.8873 8.64 5.76 8.64H3.84C3.5749 8.64 3.36 8.4251 3.36 8.16V6.24C3.36 6.1127 3.41057 5.99061 3.50059 5.90059L9.26059 0.140589ZM4.32 6.43882V7.68H5.56118L10.8412 2.4L9.6 1.15882L4.32 6.43882Z"
                    fill="white"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.82059 1.58059C8.00804 1.39314 8.31196 1.39314 8.49941 1.58059L10.4194 3.50059C10.6069 3.68804 10.6069 3.99196 10.4194 4.17941C10.232 4.36686 9.92804 4.36686 9.74059 4.17941L7.82059 2.25941C7.63314 2.07196 7.63314 1.76804 7.82059 1.58059Z"
                    fill="white"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.281178 0.761178C0.461212 0.581143 0.705392 0.48 0.96 0.48H6.24C6.5051 0.48 6.72 0.694903 6.72 0.96C6.72 1.2251 6.5051 1.44 6.24 1.44L0.96 1.44L0.96 11.04H10.56V5.76C10.56 5.4949 10.7749 5.28 11.04 5.28C11.3051 5.28 11.52 5.4949 11.52 5.76V11.04C11.52 11.2946 11.4189 11.5388 11.2388 11.7188C11.0588 11.8989 10.8146 12 10.56 12H0.96C0.705393 12 0.461213 11.8989 0.281178 11.7188C0.101143 11.5388 0 11.2946 0 11.04V1.44C0 1.18539 0.101143 0.941212 0.281178 0.761178Z"
                    fill="white"
                  />
                </svg>
              </v-icon>
              {{ $t('meeting.general_note') }}
            </v-btn>
          </v-card-title>

          <v-card-text class="topics-content">
            <div
              v-for="topic in approvedTopics"
              :key="topic.id"
              class="topic-accordion"
            >
              <!-- Main Topic Header -->
              <div
                class="topic-header"
                @click="toggleAccordion(topic.id)"
                :class="{ expanded: openAccordions.includes(topic.id) }"
              >
                <span class="topic-title">{{ topic.name }}</span>
                <v-icon class="expand-icon">
                  {{
                    openAccordions.includes(topic.id)
                      ? "mdi-chevron-down"
                      : "mdi-chevron-right"
                  }}
                </v-icon>
              </div>

              <!-- Subtopics Content -->
              <v-expand-transition>
                <div
                  v-if="openAccordions.includes(topic.id)"
                  class="subtopics-list"
                >
                  <div
                    v-for="(subtopic, subIndex) in topic.subs"
                    :key="subtopic.id"
                    class="subtopic-row"
                  >
                    <span class="subtopic-name">{{ subtopic.name }}</span>
                    <div class="subtopic-actions">
                      <v-btn
                        small
                        outlined
                        color="#6B46C1"
                        @click.stop="openSubtopicModal(subtopic)"
                        class="details-btn"
                      >
                        {{ $t('meeting.details') }}
                      </v-btn>

                      <v-menu
                        offset-y
                        :close-on-content-click="false"
                        v-if="
                          committeeHeads && committeeHeads.includes(USER.id)
                        "
                        content-class="actions-dropdown"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            icon
                            small
                            v-bind="props"
                            class="more-btn"
                            @click.stop
                          >
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list class="actions-menu-redesign">
                          <v-list-item
                            @click="takeDecision(subtopic)"
                            v-permission="'takeDecision'"
                            class="action-item"
                          >
                            <template v-slot:prepend>
                              <div class="action-icon-wrapper">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M10.7788 4.99773C11.0012 5.23084 10.9925 5.60008 10.7594 5.82246L6.47922 9.9058C6.2537 10.1209 5.89888 10.1208 5.67355 9.90545L3.53709 7.86379C3.30417 7.64121 3.29579 7.27195 3.51838 7.03904C3.74096 6.80613 4.11021 6.79775 4.34312 7.02033L6.07691 8.67719L9.95411 4.97832C10.1872 4.75594 10.5565 4.76463 10.7788 4.99773Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M0.148438 1.31706C0.148438 0.672725 0.670772 0.150391 1.3151 0.150391H12.9818C13.6261 0.150391 14.1484 0.672725 14.1484 1.31706V12.9837C14.1484 13.6281 13.6261 14.1504 12.9818 14.1504H1.3151C0.670772 14.1504 0.148438 13.6281 0.148438 12.9837V1.31706ZM12.9818 1.31706H1.3151V12.9837H12.9818V1.31706Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M10.7788 4.99773C11.0012 5.23084 10.9925 5.60008 10.7594 5.82246L6.47922 9.9058C6.2537 10.1209 5.89888 10.1208 5.67355 9.90545L3.53709 7.86379C3.30417 7.64121 3.29579 7.27195 3.51838 7.03904C3.74096 6.80613 4.11021 6.79775 4.34312 7.02033L6.07691 8.67719L9.95411 4.97832C10.1872 4.75594 10.5565 4.76463 10.7788 4.99773Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M0.148438 1.31706C0.148438 0.672725 0.670772 0.150391 1.3151 0.150391H12.9818C13.6261 0.150391 14.1484 0.672725 14.1484 1.31706V12.9837C14.1484 13.6281 13.6261 14.1504 12.9818 14.1504H1.3151C0.670772 14.1504 0.148438 13.6281 0.148438 12.9837V1.31706ZM12.9818 1.31706H1.3151V12.9837H12.9818V1.31706Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </template>
                            <v-list-item-title class="action-title"
                              >{{ $t('meeting.take_decision') }}</v-list-item-title
                            >
                          </v-list-item>

                          <v-list-item
                            @click="addNotes(subtopic)"
                            v-permission="'addNote'"
                            class="action-item"
                          >
                            <template v-slot:prepend>
                              <div class="action-icon-wrapper">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M10.9525 0.314411C11.1712 0.0957172 11.5257 0.0957172 11.7444 0.314411L13.9844 2.55441C14.2031 2.7731 14.2031 3.12768 13.9844 3.34637L7.26442 10.0664C7.1594 10.1714 7.01696 10.2304 6.86844 10.2304H4.62844C4.31916 10.2304 4.06844 9.97967 4.06844 9.67039V7.43039C4.06844 7.28187 4.12744 7.13943 4.23246 7.03441L10.9525 0.314411ZM5.18844 7.66235V9.11039H6.63648L12.7965 2.95039L11.3484 1.50235L5.18844 7.66235Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M9.27246 1.99441C9.49115 1.77572 9.84572 1.77572 10.0644 1.99441L12.3044 4.23441C12.5231 4.4531 12.5231 4.80768 12.3044 5.02637C12.0857 5.24506 11.7312 5.24506 11.5125 5.02637L9.27246 2.78637C9.05376 2.56768 9.05376 2.2131 9.27246 1.99441Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M0.476478 1.03843C0.686518 0.828391 0.971395 0.710391 1.26844 0.710391H7.42844C7.73772 0.710391 7.98844 0.961111 7.98844 1.27039C7.98844 1.57967 7.73772 1.83039 7.42844 1.83039L1.26844 1.83039L1.26844 13.0304H12.4684V6.87039C12.4684 6.56111 12.7192 6.31039 13.0284 6.31039C13.3377 6.31039 13.5884 6.56111 13.5884 6.87039V13.0304C13.5884 13.3274 13.4704 13.6123 13.2604 13.8224C13.0504 14.0324 12.7655 14.1504 12.4684 14.1504H1.26844C0.971396 14.1504 0.686519 14.0324 0.476478 13.8224C0.266437 13.6123 0.148438 13.3274 0.148438 13.0304V1.83039C0.148438 1.53335 0.266438 1.24847 0.476478 1.03843Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M10.9525 0.314411C11.1712 0.0957172 11.5257 0.0957172 11.7444 0.314411L13.9844 2.55441C14.2031 2.7731 14.2031 3.12768 13.9844 3.34637L7.26442 10.0664C7.1594 10.1714 7.01696 10.2304 6.86844 10.2304H4.62844C4.31916 10.2304 4.06844 9.97967 4.06844 9.67039V7.43039C4.06844 7.28187 4.12744 7.13943 4.23246 7.03441L10.9525 0.314411ZM5.18844 7.66235V9.11039H6.63648L12.7965 2.95039L11.3484 1.50235L5.18844 7.66235Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M9.27246 1.99441C9.49115 1.77572 9.84572 1.77572 10.0644 1.99441L12.3044 4.23441C12.5231 4.4531 12.5231 4.80768 12.3044 5.02637C12.0857 5.24506 11.7312 5.24506 11.5125 5.02637L9.27246 2.78637C9.05376 2.56768 9.05376 2.2131 9.27246 1.99441Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M0.476478 1.03843C0.686518 0.828391 0.971395 0.710391 1.26844 0.710391H7.42844C7.73772 0.710391 7.98844 0.961111 7.98844 1.27039C7.98844 1.57967 7.73772 1.83039 7.42844 1.83039L1.26844 1.83039L1.26844 13.0304H12.4684V6.87039C12.4684 6.56111 12.7192 6.31039 13.0284 6.31039C13.3377 6.31039 13.5884 6.56111 13.5884 6.87039V13.0304C13.5884 13.3274 13.4704 13.6123 13.2604 13.8224C13.0504 14.0324 12.7655 14.1504 12.4684 14.1504H1.26844C0.971396 14.1504 0.686519 14.0324 0.476478 13.8224C0.266437 13.6123 0.148438 13.3274 0.148438 13.0304V1.83039C0.148438 1.53335 0.266438 1.24847 0.476478 1.03843Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </template>
                            <v-list-item-title class="action-title"
                              >{{ $t('meeting.add_notes') }}</v-list-item-title
                            >
                          </v-list-item>

                          <v-list-item
                            @click="openFilesModal(subtopic)"
                            class="action-item"
                          >
                            <template v-slot:prepend>
                              <div class="action-icon-wrapper">
                                <svg
                                  width="13"
                                  height="15"
                                  viewBox="0 0 13 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M0.467957 2.61966C0.672542 2.4177 0.950019 2.30424 1.23935 2.30424H6.69389C6.83856 2.30424 6.97729 2.36097 7.07959 2.46195L9.80686 5.15426C9.90915 5.25524 9.96662 5.3922 9.96662 5.53501V13.0735C9.96662 13.3591 9.85169 13.633 9.6471 13.835C9.44251 14.0369 9.16504 14.1504 8.87571 14.1504H1.23935C0.95002 14.1504 0.672543 14.0369 0.467957 13.835C0.263372 13.633 0.148438 13.3591 0.148438 13.0735V3.38116C0.148438 3.09554 0.263373 2.82162 0.467957 2.61966ZM6.46796 3.38116H1.23935L1.23935 13.0735H8.87571V5.75804L6.46796 3.38116Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.64978 0.465814C2.85436 0.263852 3.13184 0.150391 3.42116 0.150391H8.87571C9.02037 0.150391 9.15911 0.207121 9.26141 0.308102L11.9887 3.00041C12.091 3.10139 12.1484 3.23835 12.1484 3.38116V10.9196C12.1484 11.2052 12.0335 11.4792 11.8289 11.6811C11.6243 11.8831 11.3469 11.9965 11.0575 11.9965H9.42117C9.11992 11.9965 8.87571 11.7555 8.87571 11.4581C8.87571 11.1607 9.11992 10.9196 9.42117 10.9196H11.0575V3.6042L8.64978 1.22731L3.42116 1.22731V2.8427C3.42116 3.14008 3.17696 3.38116 2.87571 3.38116C2.57446 3.38116 2.33026 3.14008 2.33026 2.8427V1.22731C2.33026 0.941696 2.44519 0.667776 2.64978 0.465814Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.87571 8.76578C2.87571 8.46839 3.11992 8.22731 3.42116 8.22731H6.69389C6.99514 8.22731 7.23935 8.46839 7.23935 8.76578C7.23935 9.06316 6.99514 9.30424 6.69389 9.30424H3.42116C3.11992 9.30424 2.87571 9.06316 2.87571 8.76578Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.87571 10.9196C2.87571 10.6222 3.11992 10.3812 3.42116 10.3812H6.69389C6.99514 10.3812 7.23935 10.6222 7.23935 10.9196C7.23935 11.217 6.99514 11.4581 6.69389 11.4581H3.42116C3.11992 11.4581 2.87571 11.217 2.87571 10.9196Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M0.467957 2.61966C0.672542 2.4177 0.950019 2.30424 1.23935 2.30424H6.69389C6.83856 2.30424 6.97729 2.36097 7.07959 2.46195L9.80686 5.15426C9.90915 5.25524 9.96662 5.3922 9.96662 5.53501V13.0735C9.96662 13.3591 9.85169 13.633 9.6471 13.835C9.44251 14.0369 9.16504 14.1504 8.87571 14.1504H1.23935C0.95002 14.1504 0.672543 14.0369 0.467957 13.835C0.263372 13.633 0.148438 13.3591 0.148438 13.0735V3.38116C0.148438 3.09554 0.263373 2.82162 0.467957 2.61966ZM6.46796 3.38116H1.23935L1.23935 13.0735H8.87571V5.75804L6.46796 3.38116Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.64978 0.465814C2.85436 0.263852 3.13184 0.150391 3.42116 0.150391H8.87571C9.02037 0.150391 9.15911 0.207121 9.26141 0.308102L11.9887 3.00041C12.091 3.10139 12.1484 3.23835 12.1484 3.38116V10.9196C12.1484 11.2052 12.0335 11.4792 11.8289 11.6811C11.6243 11.8831 11.3469 11.9965 11.0575 11.9965H9.42117C9.11992 11.9965 8.87571 11.7555 8.87571 11.4581C8.87571 11.1607 9.11992 10.9196 9.42117 10.9196H11.0575V3.6042L8.64978 1.22731L3.42116 1.22731V2.8427C3.42116 3.14008 3.17696 3.38116 2.87571 3.38116C2.57446 3.38116 2.33026 3.14008 2.33026 2.8427V1.22731C2.33026 0.941696 2.44519 0.667776 2.64978 0.465814Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.87571 8.76578C2.87571 8.46839 3.11992 8.22731 3.42116 8.22731H6.69389C6.99514 8.22731 7.23935 8.46839 7.23935 8.76578C7.23935 9.06316 6.99514 9.30424 6.69389 9.30424H3.42116C3.11992 9.30424 2.87571 9.06316 2.87571 8.76578Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.87571 10.9196C2.87571 10.6222 3.11992 10.3812 3.42116 10.3812H6.69389C6.99514 10.3812 7.23935 10.6222 7.23935 10.9196C7.23935 11.217 6.99514 11.4581 6.69389 11.4581H3.42116C3.11992 11.4581 2.87571 11.217 2.87571 10.9196Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </template>
                            <v-list-item-title class="action-title"
                              >{{ $t('meeting.manage_files') }}</v-list-item-title
                            >
                          </v-list-item>

                          <v-list-item
                            @click="openRecommendationModal(subtopic)"
                            class="action-item"
                          >
                            <template v-slot:prepend>
                              <div class="action-icon-wrapper">
                                <svg
                                  width="12"
                                  height="15"
                                  viewBox="0 0 12 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M2.64854 13.6504C2.64854 13.3743 2.8724 13.1505 3.14855 13.1505H8.14864C8.42478 13.1505 8.64865 13.3743 8.64865 13.6504C8.64865 13.9266 8.42478 14.1504 8.14864 14.1504H3.14855C2.8724 14.1504 2.64854 13.9266 2.64854 13.6504Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M8.19379 1.93929C7.41442 1.40477 6.48652 1.12916 5.54169 1.15155C3.10335 1.20773 1.13725 3.23874 1.1485 5.68018L1.14851 5.68085C1.15073 6.35893 1.30726 7.02761 1.60625 7.63622C1.90524 8.24484 2.33884 8.77744 2.87421 9.19367L2.56728 9.58835L2.8767 9.19562C3.11544 9.38367 3.30878 9.62304 3.44239 9.89598C3.57601 10.1689 3.64647 10.4684 3.64854 10.7723L3.64857 10.7757L3.64855 11.1507H7.64863L7.64863 10.7748C7.64922 10.468 7.71997 10.1654 7.85546 9.89009C7.99063 9.61546 8.18668 9.37529 8.42867 9.18785C9.17135 8.60436 9.71159 7.80199 9.97285 6.89441C10.2343 5.9863 10.2031 5.01894 9.88377 4.12953C9.56444 3.24012 8.97316 2.47382 8.19379 1.93929ZM2.25897 9.98194C1.60444 9.47273 1.07431 8.82135 0.708669 8.07706C0.342773 7.33225 0.15121 6.51394 0.148493 5.68413L0.6485 5.68249L0.148496 5.68479L0.148493 5.68413C0.135106 2.70145 2.53171 0.220804 5.51819 0.151928C6.67287 0.124629 7.80697 0.461479 8.75944 1.11473C9.71201 1.76803 10.4347 2.70463 10.825 3.79169C11.2153 4.87874 11.2534 6.06107 10.9339 7.17098C10.6143 8.2809 9.95346 9.26206 9.04493 9.97532L9.04195 9.97766C8.91981 10.0721 8.82087 10.1931 8.7527 10.3316C8.6846 10.47 8.64901 10.6221 8.64865 10.7763V11.1507C8.64865 11.4159 8.54329 11.6702 8.35575 11.8577C8.16821 12.0452 7.91385 12.1506 7.64863 12.1506H3.64855C3.38333 12.1506 3.12898 12.0452 2.94144 11.8577C2.7539 11.6702 2.64854 11.4159 2.64854 11.1507V10.7776C2.64726 10.6243 2.61161 10.4733 2.5442 10.3356C2.47678 10.1978 2.3793 10.077 2.25897 9.98194Z"
                                    fill="black"
                                  />
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M5.66187 2.61798C5.70803 2.34575 5.96616 2.16247 6.23842 2.20862C6.9516 2.3295 7.60968 2.66874 8.12183 3.17952C8.63398 3.6903 8.97494 4.34743 9.09766 5.06023C9.1445 5.33234 8.96187 5.5909 8.68972 5.63775C8.41758 5.68459 8.15898 5.50197 8.11213 5.22986C8.02454 4.72109 7.78117 4.25204 7.41561 3.88746C7.05006 3.52288 6.58034 3.28074 6.07128 3.19445C5.79902 3.14831 5.61572 2.89021 5.66187 2.61798Z"
                                    fill="black"
                                  />
                                  <path
                                    d="M0.148493 5.68413C0.15121 6.51394 0.342773 7.33225 0.708669 8.07706C1.07431 8.82135 1.60444 9.47273 2.25897 9.98194C2.3793 10.077 2.47678 10.1978 2.5442 10.3356C2.61161 10.4733 2.64726 10.6243 2.64854 10.7776V11.1507C2.64854 11.4159 2.7539 11.6702 2.94144 11.8577C3.12898 12.0452 3.38333 12.1506 3.64855 12.1506H7.64863C7.91385 12.1506 8.16821 12.0452 8.35575 11.8577C8.54329 11.6702 8.64865 11.4159 8.64865 11.1507V10.7763M0.148493 5.68413L0.6485 5.68249L0.148496 5.68479L0.148493 5.68413ZM0.148493 5.68413C0.135106 2.70145 2.53171 0.220804 5.51819 0.151928M5.51819 0.151928V0.151928ZM5.51819 0.151928L5.52984 0.651742M5.51819 0.151928C6.67287 0.124629 7.80697 0.461479 8.75944 1.11473C9.71201 1.76803 10.4347 2.70463 10.825 3.79168C11.2153 4.87874 11.2534 6.06107 10.9339 7.17098C10.6143 8.2809 9.95346 9.26207 9.04493 9.97532L9.04195 9.97766C8.91981 10.0721 8.82087 10.1931 8.7527 10.3316C8.6846 10.47 8.64901 10.6221 8.64865 10.7763M8.64865 10.7763V10.7763ZM3.14855 13.1505C2.8724 13.1505 2.64854 13.3743 2.64854 13.6504C2.64854 13.9266 2.8724 14.1504 3.14855 14.1504H8.14864C8.42478 14.1504 8.64865 13.9266 8.64865 13.6504C8.64865 13.3743 8.42478 13.1505 8.14864 13.1505H3.14855ZM5.54169 1.15155C6.48652 1.12916 7.41442 1.40477 8.19379 1.93929C8.97316 2.47382 9.56444 3.24012 9.88377 4.12953C10.2031 5.01894 10.2343 5.9863 9.97285 6.89441C9.71159 7.80199 9.17135 8.60436 8.42867 9.18785C8.18668 9.37529 7.99063 9.61546 7.85546 9.89009C7.71997 10.1654 7.64922 10.468 7.64863 10.7748L7.64863 11.1507H3.64855L3.64857 10.7757L3.64854 10.7723C3.64646 10.4684 3.57601 10.1689 3.44239 9.89598C3.30878 9.62304 3.11544 9.38368 2.8767 9.19562L2.56728 9.58835L2.87421 9.19367C2.33884 8.77744 1.90524 8.24484 1.60625 7.63622C1.30726 7.0276 1.15073 6.35893 1.14851 5.68085L1.1485 5.68018C1.13725 3.23874 3.10335 1.20773 5.54169 1.15155ZM6.23842 2.20862C5.96615 2.16247 5.70803 2.34575 5.66187 2.61798C5.61572 2.89021 5.79902 3.14831 6.07128 3.19445C6.58034 3.28074 7.05006 3.52288 7.41561 3.88746C7.78117 4.25204 8.02454 4.72109 8.11213 5.22986C8.15898 5.50197 8.41758 5.68459 8.68972 5.63775C8.96187 5.5909 9.1445 5.33234 9.09766 5.06023C8.97494 4.34744 8.63398 3.6903 8.12183 3.17952C7.60968 2.66874 6.9516 2.3295 6.23842 2.20862Z"
                                    stroke="black"
                                    stroke-width="0.3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </template>
                            <v-list-item-title class="action-title"
                              >{{ $t('meeting.recommendations') }}</v-list-item-title
                            >
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </main-page>

    <!-- Subtopic Details Modal -->
    <subtopic-details-modal
      v-model="showSubtopicModal"
      :subtopic="selectedSubtopic"
      :departments="departments"
      :users="users"
      @close="showSubtopicModal = false"
      :meetingData="meetingData"
      @update:showSubtopicModal="showSubtopicModal = $event"
    />

    <FileActionsModal
      :visible="showFileModal"
      :files="selectedFiles"
      :loading="isFileActionLoading"
      :loadingFileId="loadingFileId"
      @close="showFileModal = false"
      @edit="handleFileEdit"
      @delete="handleFileDelete"
      @upload="handleFileUpload"
      @edit-start="loadingFileId = $event"
      @edit-cancel="loadingFileId = null"
      @delete-start="loadingFileId = $event"
    />

    <!-- Notes Modal -->
    <v-dialog v-model="showNotesModal" max-width="560" persistent>
      <v-card class="notes-modal-card">
        <v-card-title class="notes-modal-header">
          <span class="notes-modal-title">{{ $t('meeting.add_note') }}</span>
          <v-btn icon small @click="showNotesModal = false" class="close-btn">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="notes-modal-content">
          <v-textarea
            v-model="notesText"
            outlined
            hide-details
            rows="5"
            auto-grow
            class="notes-textarea"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="notes-modal-actions">
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color="#44225c"
            @click="showNotesModal = false"
            class="cancel-btn"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="#44225c"
            @click="saveNotes"
            :loading="isNotesSubmitting"
            :disabled="isNotesSubmitting"
            class="save-btn"
            depressed
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Decision Modal -->
    <v-dialog v-model="showDecisionModal" max-width="560" persistent>
      <v-card class="decision-modal-card">
        <v-card-title class="decision-modal-header">
          <span class="decision-modal-title">{{ $t('meeting.take_decision') }}</span>
          <v-btn
            icon
            small
            @click="showDecisionModal = false"
            class="close-btn"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="decision-modal-content">
          <div class="decision-editor-wrapper">
            <ckeditor
              :editor="editor"
              v-model="decisionComment"
              :config="editorConfig"
            ></ckeditor>
          </div>
        </v-card-text>
        <v-card-actions class="decision-modal-actions">
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color="#44225c"
            @click="showDecisionModal = false"
            class="cancel-btn"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="#44225c"
            @click="submitDecision"
            :loading="isDecisionSubmitting"
            :disabled="isDecisionSubmitting"
            class="submit-btn"
            depressed
          >
            {{ $t('common.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- General Notes Modal -->
    <v-dialog v-model="showGeneralNotesModal" max-width="560" persistent>
      <v-card class="general-notes-modal">
        <v-card-title class="general-notes-header">
          <span class="general-notes-title">{{ $t('meeting.general_note') }}</span>
          <v-btn
            icon
            small
            @click="showGeneralNotesModal = false"
            class="close-btn"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="general-notes-content">
          <div class="general-notes-editor-wrapper">
            <ckeditor
              :editor="editor"
              v-model="generalNotesText"
              :config="editorConfig"
            ></ckeditor>
          </div>
        </v-card-text>
        <v-card-actions class="general-notes-actions">
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color="#44225c"
            @click="showGeneralNotesModal = false"
            class="cancel-btn"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="#44225c"
            @click="saveGeneralNotes"
            :loading="isGeneralNotesSubmitting"
            :disabled="isGeneralNotesSubmitting"
            class="save-btn"
            depressed
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Recommendations Modal -->
    <!-- <UpdateRecommendationModal
      :visible="showRecommendationModal"
      @update:visible="showRecommendationModal = $event"
      :meetingId="meetingId"
      :subTopic="selectedSubtopicForRecommendation"
      @close="showRecommendationModal = false"
      :users="users"
    /> -->
    <UpdateRecommendationModal
      :visible="showRecommendationModal"
      @update:visible="showRecommendationModal = $event"
      :meetingId="meetingId"
      :subTopic="selectedSubtopicForRecommendation"
      @close="showRecommendationModal = false"
      @saved="handleRecommendationSaved"
      @deleted="handleRecommendationDeleted"
      :users="users"
    />
  </div>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import SubtopicDetailsModal from "./SubtopicDetailsModal.vue";
import Agenda from "@/API/Agenda/Agenda";
import Auth from "@/API/Auth";
import Topic from "@/API/Topic/Topic";
import Vue from "vue";
import FileActionsModal from "@/components/commen/FileActionsModal.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Meeting from "@/API/Meeting/Meeting";
import UpdateRecommendationModal from "@/views/Page/TopicRecommendation/components/UpdateRecommendationModal.vue";

export default {
  name: "TopicTabView",
  components: {
    MainPage,
    SubtopicDetailsModal,
    FileActionsModal,
    ckeditor: Ckeditor,
    UpdateRecommendationModal,
  },
  props: {
    meetingId: {
      type: String,
      required: true,
    },
    meetingData: {
      type: Object,
      default: () => ({}),
    },
    topics: {
      type: Array,
      default: () => [],
    },
    agendaTopics: {
      type: Array,
      default: () => [],
    },
    users: {
      type: Array,
      default: () => [],
    },
    departments: {
      type: Array,
      default: () => [],
    },
    committeeHeads: {
      type: Array,
      default: () => [],
    },
  },
  setup: () => {
    const USER = Auth.USER;
    const api = new Meeting();
    const topicApi = new Topic();
    return { api, topicApi, USER };
  },
  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "outdent",
            "indent",
            "|",
            "blockQuote",
            "insertTable",
            "undo",
            "redo",
          ],
          shouldNotGroupWhenFull: true,
        },
        ui: {
          viewportOffset: { top: 30 },
        },
        height: "800px",
      },
      openAccordions: [],
      selectedSubtopics: [],
      selectedAgendaTopics: [],
      newItem: {},
      isFlipped: false,
      isLoading: false,
      topicsList: [],
      newAgendaTopics: [],
      newAgendaDetails: {},
      forceRender: 0,
      showSubtopicModal: false,
      selectedSubtopic: {},
      subtopicStatusData: {},
      rejectionComment: "",
      approvalComment: "",
      agendaDetails: this.meetingData?.agenda || {},
      selectedFiles: [],
      isFileActionLoading: false,
      showFileModal: false,
      selectedTopic: {},
      showDecisionModal: false,
      decisionOptions: [],
      selectedDecision: null,
      decisionComment: "",
      currentSubtopicForDecision: null,
      isDecisionSubmitting: false,
      showNotesModal: false,
      showGeneralNotesModal: false,
      notesText: "",
      generalNotesText: "",
      currentSubtopicForNotes: null,
      isNotesSubmitting: false,
      isGeneralNotesSubmitting: false,
      showUpdateRecommendationModal: false,
      showRecommendationModal: false,
      selectedSubtopicForRecommendation: null,
      loadingFileId: null,
    };
  },
  async mounted() {
    if (this.meetingData) {
      this.agendaDetails = this.meetingData?.agenda || {};
      console.log("Agenda Details:", this.agendaDetails);
    }
  },

  created() {
    // initialize translated decision options here because `this` is not available in data()
    this.decisionOptions = [
      { title: this.$t('meeting.approved'), value: 'approved' },
      { title: this.$t('meeting.rejected'), value: 'rejected' },
      { title: this.$t('meeting.deferred'), value: 'deferred' },
    ];
  },
  watch: {
    showFileModal(newVal) {
      if (newVal && this.selectedTopic.id) {
        console.log(
          "File modal opened, refreshing data for:",
          this.selectedTopic.id
        );
        // When modal opens, refresh the selected topic data from agendaDetails
        for (const topic of this.agendaDetails.topics || []) {
          const foundSub = topic.subs?.find(
            (s) => s.id === this.selectedTopic.id
          );
          if (foundSub) {
            console.log("Found subtopic in agenda:", foundSub.name);
            console.log("Files in agenda:", foundSub.topic_files);
            this.selectedTopic = { ...foundSub };
            this.selectedFiles =
              !this.selectedTopic.topic_files ||
              (this.selectedTopic.topic_files.length === 1 &&
                this.getFileNameFromPath(this.selectedTopic.topic_files[0]) ===
                  "topic_files")
                ? []
                : [...this.selectedTopic.topic_files];
            console.log("Refreshed selectedFiles:", this.selectedFiles);
            break;
          }
        }
      } else if (!newVal) {
        console.log("File modal closed");
      }
    },
    meetingData: {
      handler(newVal) {
        if (newVal) {
          this.agendaDetails = newVal?.agenda || {};
        }
      },
      deep: true,
    },
  },
  computed: {
    approvedTopics() {
      const topics = this.agendaDetails?.topics || [];
      console.log("/-*--*-* approvedTopics -/-*-*-*", topics);
      return topics
        .map((topic) => ({
          ...topic,
          subs:
            topic.subs?.filter((sub) => sub.agenda_status === "approved") || [],
        }))
        .filter((topic) => (topic.subs || []).length > 0);
    },
  },
  methods: {
    handleRecommendationSaved(savedRecommendation) {
      console.log("Recommendation saved:", savedRecommendation);

      // Create a deep copy of agendaDetails
      const agendaDetails = JSON.parse(JSON.stringify(this.agendaDetails));

      // Find and update the subtopic
      for (const topic of agendaDetails.topics) {
        const subtopicIndex = topic.subs.findIndex(
          (s) => s.id === this.selectedSubtopicForRecommendation.id
        );

        if (subtopicIndex !== -1) {
          const subtopic = topic.subs[subtopicIndex];

          // Initialize recommendations array if it doesn't exist
          if (!subtopic.recommendations) {
            subtopic.recommendations = [];
          }

          // Check if this recommendation already exists (update case)
          const existingRecIndex = subtopic.recommendations.findIndex(
            (rec) => rec.id === savedRecommendation.id
          );

          if (existingRecIndex !== -1) {
            // Update existing recommendation
            subtopic.recommendations[existingRecIndex] = {
              ...subtopic.recommendations[existingRecIndex],
              ...savedRecommendation,
            };
          } else {
            // Add new recommendation
            subtopic.recommendations.push(savedRecommendation);
          }

          // Update the agendaDetails
          this.agendaDetails = agendaDetails;

          // Also update selectedSubtopicForRecommendation to keep modal data in sync
          this.selectedSubtopicForRecommendation = {
            ...this.selectedSubtopicForRecommendation,
            recommendations: [...subtopic.recommendations],
          };

          break;
        }
      }
    },

    handleRecommendationDeleted(deletedRecommendationId) {
      console.log("Recommendation deleted:", deletedRecommendationId);

      // Create a deep copy of agendaDetails
      const agendaDetails = JSON.parse(JSON.stringify(this.agendaDetails));

      // Find and update the subtopic
      for (const topic of agendaDetails.topics) {
        const subtopicIndex = topic.subs.findIndex(
          (s) => s.id === this.selectedSubtopicForRecommendation.id
        );

        if (subtopicIndex !== -1) {
          const subtopic = topic.subs[subtopicIndex];

          if (subtopic.recommendations) {
            // Remove the deleted recommendation
            subtopic.recommendations = subtopic.recommendations.filter(
              (rec) => rec.id !== deletedRecommendationId
            );

            // Update the agendaDetails
            this.agendaDetails = agendaDetails;

            // Also update selectedSubtopicForRecommendation to keep modal data in sync
            this.selectedSubtopicForRecommendation = {
              ...this.selectedSubtopicForRecommendation,
              recommendations: [...subtopic.recommendations],
            };
          }

          break;
        }
      }
    },
    toggleAccordion(topicId) {
      const index = this.openAccordions.indexOf(topicId);
      if (index > -1) {
        this.openAccordions.splice(index, 1);
      } else {
        this.openAccordions.push(topicId);
      }
    },

    openSubtopicModal(subtopic) {
      this.selectedSubtopic = { ...subtopic };
      this.showSubtopicModal = true;
    },

    takeDecision(subtopic) {
      this.currentSubtopicForDecision = { ...subtopic };
      // this.selectedDecision = subtopic.meeting_status || null;
      this.decisionComment = subtopic?.decision || "";
      this.showDecisionModal = true;
    },

    async submitDecision() {
      try {
        this.isDecisionSubmitting = true;

        if (!this.decisionComment) {
          this.topicApi.poup("error", this.$t('meeting.comment_required'));
          return;
        }

        const updatedData = {
          ...this.currentSubtopicForDecision,
          // meeting_status_comment: this.decisionComment,
          decision: this.decisionComment,
        };

        const response = await this.topicApi.takeDecision(updatedData.id , updatedData);

        if (response.data.status === "success") {
          this.updateSubtopicDecision(response.data.data);
          this.topicApi.poup(response, this.$t('meeting.decision_submitted'));
          this.showDecisionModal = false;
        } else {
          throw new Error(response.message || "Failed to submit decision");
        }
      } catch (error) {
        console.error("Error submitting decision:", error);
        this.topicApi.poup("error", this.$t('meeting.decision_submit_failed'));
      } finally {
        this.isDecisionSubmitting = false;
      }
    },

    updateSubtopicDecision(updatedSubtopic) {
      const agendaDetails = JSON.parse(JSON.stringify(this.agendaDetails));

      for (const topic of agendaDetails.topics) {
        const subtopicIndex = topic.subs.findIndex(
          (s) => s.id === updatedSubtopic.id
        );
        if (subtopicIndex !== -1) {
          topic.subs[subtopicIndex] = {
            ...topic.subs[subtopicIndex],
            meeting_status: updatedSubtopic.meeting_status,
            // meeting_status_comment: updatedSubtopic.meeting_status_comment,
            decision: updatedSubtopic.decision,
          };
          break;
        }
      }

      this.agendaDetails = agendaDetails;
    },

    addNotes(subtopic) {
      this.currentSubtopicForNotes = { ...subtopic };
      this.notesText = subtopic.meeting_note || "";
      this.showNotesModal = true;
    },

    async saveNotes() {
      try {
        this.isNotesSubmitting = true;

        if (!this.currentSubtopicForNotes) return;

        const updatedData = {
          ...this.currentSubtopicForNotes,
          meeting_note: this.notesText,
        };

        // const response = await this.topicApi.update(updatedData);
        const response = await this.topicApi.addNote(updatedData.id,updatedData);
        if (response.data.status == "success") {
          this.updateSubtopicNotes(response.data.data);
          this.topicApi.poup(response, this.$t('meeting.notes_saved'));
          this.showNotesModal = false;
        } else {
          throw new Error(response.message || "Failed to save notes");
        }
      } catch (error) {
        console.error("Error saving notes:", error);
        this.topicApi.poup("error", this.$t('meeting.notes_save_failed'));
      } finally {
        this.isNotesSubmitting = false;
      }
    },

    updateSubtopicNotes(updatedSubtopic) {
      const agendaDetails = JSON.parse(JSON.stringify(this.agendaDetails));

      for (const topic of agendaDetails.topics) {
        const subtopicIndex = topic.subs.findIndex(
          (s) => s.id === updatedSubtopic.id
        );
        if (subtopicIndex !== -1) {
          topic.subs[subtopicIndex] = {
            ...topic.subs[subtopicIndex],
            meeting_note: updatedSubtopic.meeting_note,
          };
          break;
        }
      }

      this.agendaDetails = agendaDetails;
    },

    openFilesModal(item) {
      // Find the latest version of the subtopic from agendaDetails
      let latestSubtopic = null;

      for (const topic of this.agendaDetails.topics || []) {
        const foundSub = topic.subs?.find((s) => s.id === item.id);
        if (foundSub) {
          latestSubtopic = { ...foundSub };
          break;
        }
      }

      // Use latest subtopic if found, otherwise use the item passed
      this.selectedTopic = latestSubtopic || { ...item };

      console.log("Opening files modal for:", this.selectedTopic.name);
      console.log("Topic files:", this.selectedTopic.topic_files);

      this.selectedFiles =
        !this.selectedTopic.topic_files ||
        (this.selectedTopic.topic_files.length === 1 &&
          this.getFileNameFromPath(this.selectedTopic.topic_files[0]) ===
            "topic_files")
          ? []
          : [...this.selectedTopic.topic_files];

      console.log("Selected files:", this.selectedFiles);

      this.showFileModal = true;
    },

    async handleFileUpload(file) {
      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedTopic };
        const updatedFiles = [...this.selectedFiles, file];

        this.selectedFiles = updatedFiles;
        updatedData.topic_files = updatedFiles;

        const response = await this.topicApi.update(updatedData);

        if (response.status == "success") {
          this.selectedTopic = { ...response.data };
          this.selectedFiles =
            !this.selectedTopic.topic_files ||
            (this.selectedTopic.topic_files.length === 1 &&
              this.getFileNameFromPath(this.selectedTopic.topic_files[0]) ===
                "topic_files")
              ? []
              : [...this.selectedTopic.topic_files];

          // Update the agenda details
          this.updateSubtopicFiles(response.data);

          this.topicApi.poup(response, this.$t('meeting.file_uploaded_success'));
        } else {
          throw new Error(response.message || "Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
        this.topicApi.poup(null, this.$t('meeting.file_upload_failed'));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    async handleFileEdit(file) {
      const oldFileName = this.getFileName(file.oldFile);
      const newFile = file.newFile;

      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedTopic };

        // Convert all files to proper format before filtering
        const currentFiles = this.selectedFiles.map((f) => {
          if (typeof f === "string") return f;
          return f;
        });

        // Remove old file and add new file
        const updatedFiles = currentFiles.filter((f) => {
          const fName =
            typeof f === "string" ? this.getFileNameFromPath(f) : f.name;
          const oldName =
            typeof file.oldFile === "string"
              ? this.getFileNameFromPath(file.oldFile)
              : file.oldFile.name;
          return fName !== oldName;
        });

        updatedFiles.push(newFile);

        updatedData.topic_files = updatedFiles;

        console.log("Editing file - sending to API:", updatedData.topic_files);

        const response = await this.topicApi.update(updatedData);

        if (response.status == "success") {
          console.log("File edit response:", response.data.topic_files);

          // Update selectedTopic with response data
          this.selectedTopic = { ...response.data };

          // Update selectedFiles with proper handling
          this.selectedFiles =
            !response.data.topic_files ||
            (response.data.topic_files.length === 1 &&
              this.getFileNameFromPath(response.data.topic_files[0]) ===
                "topic_files")
              ? []
              : [...response.data.topic_files];

          console.log("Updated selectedFiles after edit:", this.selectedFiles);

          // Update the agenda details to reflect the changes
          this.updateSubtopicFiles(response.data);

          this.topicApi.poup(response, this.$t('meeting.file_updated'));
        } else {
          throw new Error(response.message || "Failed to update file");
        }
      } catch (error) {
        console.error("Error updating file:", error);
        this.topicApi.poup(null, this.$t('meeting.file_update_failed'));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    getFileNameFromPath(url) {
      return url.split("/").pop();
    },

    async handleFileDelete(fileData) {
      const fileToDelete = fileData.file;
      const fileName = this.getFileName(fileToDelete);
      let response = null;

      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedTopic };
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== fileToDelete
        );

        const finalFiles = updatedFiles.map((file) => {
          if (typeof file === "string") return this.getFileNameFromPath(file);
          return file;
        });

        updatedData.topic_files =
          finalFiles.length === 1 && finalFiles[0] == null ? [] : finalFiles;

        this.selectedFiles = updatedData.topic_files;

        response = await this.topicApi.update(updatedData);

        if (response.status === "success") {
          this.selectedTopic = { ...response.data };
          this.selectedFiles =
            !this.selectedTopic.topic_files ||
            (this.selectedTopic.topic_files.length === 1 &&
              this.getFileNameFromPath(this.selectedTopic.topic_files[0]) ===
                "topic_files")
              ? []
              : [...this.selectedTopic.topic_files];

          // Update the agenda details
          this.updateSubtopicFiles(response.data);

          this.topicApi.poup(response, this.$t('meeting.file_deleted'));
        } else {
          throw new Error(response.message || "Failed to delete file");
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        this.selectedFiles = [...this.selectedFiles, fileToDelete];
        this.topicApi.poup(null, this.$t('meeting.file_delete_failed'));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    getFileName(file) {
      if (!file) return "";
      if (file.name) return file.name;
      if (file.filePath) return file.filePath.split("/").pop();
      if (typeof file === "string") return file.split("/").pop();
      return "Unknown";
    },

    updateSubtopicFiles(updatedSubtopic) {
      const agendaDetails = JSON.parse(JSON.stringify(this.agendaDetails));

      console.log(
        "Updating subtopic files in agenda for ID:",
        updatedSubtopic.id
      );
      console.log("New files:", updatedSubtopic.topic_files);

      for (const topic of agendaDetails.topics) {
        const subtopicIndex = topic.subs.findIndex(
          (s) => s.id === updatedSubtopic.id
        );
        if (subtopicIndex !== -1) {
          topic.subs[subtopicIndex] = {
            ...topic.subs[subtopicIndex],
            topic_files: updatedSubtopic.topic_files
              ? [...updatedSubtopic.topic_files]
              : [],
          };
          console.log("Updated subtopic in agenda:", topic.subs[subtopicIndex]);
          break;
        }
      }

      this.agendaDetails = agendaDetails;
      console.log("Agenda details updated");
    },

    addGeneralNotes() {
      this.generalNotesText = this.meetingData?.decision_note || "";
      this.showGeneralNotesModal = true;
    },

    async saveGeneralNotes() {
      try {
        this.isGeneralNotesSubmitting = true;

        const updatedData = {
          ...this.meetingData,
          decision_note: this.generalNotesText,
        };

        const response = await this.api.update(updatedData);
        console.log("Save general notes response********:", response);
        if (response.data.status === "success") {
            this.meetingData.decision_note = updatedData.decision_note;
            this.api.poup(response, this.$t('meeting.notes_saved'));
            this.showGeneralNotesModal = false;
          } else {
          throw new Error(response.message || "Failed to save notes");
        }
      } catch (error) {
        console.error("Error saving notes:", error);
        this.api.poup("error", this.$t('meeting.notes_save_failed'));
      } finally {
        this.isGeneralNotesSubmitting = false;
      }
    },

    openRecommendationModal(subtopic) {
      this.selectedSubtopicForRecommendation = { ...subtopic };
      this.showRecommendationModal = true;
    },

    handleUpdateRecommendation(updatedSubtopic) {
      const agendaDetails = JSON.parse(JSON.stringify(this.agendaDetails));

      for (const topic of agendaDetails.topics) {
        const subtopicIndex = topic.subs.findIndex(
          (s) => s.id === updatedSubtopic.id
        );
        if (subtopicIndex !== -1) {
          topic.subs[subtopicIndex] = {
            ...topic.subs[subtopicIndex],
            ...updatedSubtopic,
          };
          break;
        }
      }

      this.agendaDetails = agendaDetails;
    },
  },
};
</script>

<style scoped>
/* Container */
.topic-tab-view {
  height: 100%;
  /* background: #FAFAFA; */
}

.topics-container {
  background: white;
  box-shadow: none;
}

/* Header */
.topics-header {
  padding: 16px 24px;
  background: white;
  /* border-bottom: 1px solid #E5E7EB; */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agenda-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.2;
}

.general-note-btn {
  background: #6e3894 !important;
  color: white !important;
  text-transform: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
  border-radius: 10px;
  padding: 0 12px !important;
  height: 36px;
  box-shadow: none !important;
}

.general-note-btn .v-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* Content */
.topics-content {
  padding: 0 !important;
}

/* Accordion */
.topic-accordion {
  /* border-bottom: 1px solid #E5E7EB; */
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
}

/* .topic-accordion:last-child {
  border-bottom: none;
} */

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: #d9d9d9;
  transition: background-color 0.2s;
  border-radius: 10px;
  /* border: 1px solid #D9D9D9; */
  margin-bottom: 12px;
}

/* .topic-header:hover {
  background: #f9fafb;
} */

/* .topic-header.expanded {
  background: #f3f4f6;
} */

.topic-title {
  font-size: 18px;
  font-weight: 400;
  color: #404040;
  letter-spacing: 0;
}

.expand-icon {
  color: #6b7280;
  font-size: 20px;
  transition: transform 0.2s;
}

/* Subtopics */
.subtopics-list {
  background: white;
  /* border-top: 1px solid #E5E7EB; */
}

.subtopic-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  /* border-bottom: 1px solid #F3F4F6; */
  transition: background-color 0.2s;
  border-radius: 10px;
  border: 1px solid #d9d9d9;
  margin: 8px 12px 12px 12px;
}

/* .subtopic-row:hover {
  background: #f9fafb;
} */

/* .subtopic-row:last-child {
  border-bottom: none;
} */

.subtopic-name {
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  letter-spacing: 0;
}

/* Actions */
.subtopic-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-btn {
  width: 28px !important;
  height: 28px !important;
  color: #6b7280 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.more-btn .v-icon {
  font-size: 18px;
}

.details-btn {
  text-transform: none;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  border-radius: 6px;
  padding: 0 12px !important;
  height: 28px;
  /* border: 1px solid #6B46C1; */
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  box-shadow: none !important;
}

/* .details-btn:hover {
  background: #f5f3ff !important;
} */

/* Actions Menu */
.actions-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
}

.actions-menu .v-list-item {
  min-height: 36px;
  padding: 0 12px;
}

.actions-menu .v-list-item-title {
  font-size: 13px;
  font-weight: 400;
  color: #374151;
}

.actions-menu .v-icon {
  font-size: 18px;
  color: #6b7280;
  margin-right: 8px;
}

.actions-menu .v-list-item:hover {
  background: #f9fafb;
}

/* Loading */
.dot-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
}

.dot-loader div {
  width: 10px;
  height: 10px;
  background-color: #6b46c1;
  border-radius: 50%;
  animation: bounce 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.dot-loader div:nth-child(1) {
  animation-delay: -0.32s;
}

.dot-loader div:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Modal Styles */
.notes-modal-card,
.decision-modal-card,
.general-notes-modal {
  border-radius: 10px;
  overflow: hidden;
}

.notes-modal-header,
.decision-modal-header,
.general-notes-header {
  background: white;
  color: #1a1a1a;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notes-modal-title,
.decision-modal-title,
.general-notes-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
}

.close-btn {
  color: #1a1a1a !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

.close-btn:hover {
  background-color: #f5f5f5 !important;
}

.close-btn .v-icon {
  font-size: 20px;
}

.notes-modal-content,
.decision-modal-content,
.general-notes-content {
  padding: 24px 20px !important;
}

.notes-textarea >>> .v-input__control {
  border-radius: 10px;
}

.notes-textarea >>> .v-input__slot {
  border-radius: 10px;
  border: 1px solid #d0d0d0;
  min-height: 120px;
}

.notes-textarea >>> textarea {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1a1a1a;
}

.decision-editor-wrapper,
.general-notes-editor-wrapper {
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  overflow: hidden;
}

.decision-editor-wrapper .ck.ck-editor__main > .ck-editor__editable,
.general-notes-editor-wrapper .ck.ck-editor__main > .ck-editor__editable {
  border: none;
  min-height: 150px;
  max-height: 300px;
  padding: 12px;
}

.decision-editor-wrapper .ck.ck-toolbar,
.general-notes-editor-wrapper .ck.ck-toolbar {
  border: none;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  background: #fafafa;
}

.decision-editor-wrapper .ck.ck-editor__editable.ck-focused,
.general-notes-editor-wrapper .ck.ck-editor__editable.ck-focused {
  border: none !important;
  box-shadow: none;
  outline: none;
}

.notes-modal-actions,
.decision-modal-actions,
.general-notes-actions {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  gap: 12px;
}

.cancel-btn {
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 10px;
  padding: 0 20px !important;
  height: 36px;
  border: 1px solid #d0d0d0;
  color: #43235c !important;
  letter-spacing: 0;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

.save-btn,
.submit-btn {
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 10px;
  padding: 0 28px !important;
  height: 36px;
  background-color: #6e3894 !important;
  color: white !important;
  letter-spacing: 0;
  box-shadow: none !important;
}

.save-btn:hover,
.submit-btn:hover {
  background-color: #5a2d74 !important;
}

.save-btn.v-btn--disabled,
.submit-btn.v-btn--disabled {
  background-color: #e0e0e0 !important;
  color: #9e9e9e !important;
}
</style>
<style>
.topic-tab-view .page-title {
  display: none;
}

.topic-tab-view .flipper {
  min-height: 1000px !important;
}

/* Updated Actions Menu Styles */
.actions-dropdown {
  margin: 8px !important;
  padding: 12px 12px !important;
}

.actions-menu-redesign {
  background: white;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1);
  padding: 8px 10px !important;
  min-width: 225px !important;
  /* min-height: 220px !important; */
  border: 1px solid #e5e7eb;
}

.action-item {
  min-height: 44px !important;
  padding: 10px 12px !important;
  border-radius: 8px !important;
  margin: 10px !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-item:last-child {
  margin-bottom: 0;
}

.action-item:hover {
  background-color: #f9fafb !important;
  border: 1px solid #6e3894 !important;
}

.action-icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #374151;
}

.action-item:hover .action-icon-wrapper {
  color: #6e3894;
}

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1f2937 !important;
  letter-spacing: -0.01em;
  line-height: 20px;
}

.action-item:hover .action-title {
  color: #6e3894 !important;
}

/* Remove default Vuetify list item padding */
.actions-menu-redesign .v-list-item__prepend {
  margin-right: 0 !important;
}

/* .actions-menu-redesign .v-list-item__content {
  padding: 0 !important;
} */

/* More button styling update */
.more-btn {
  width: 32px !important;
  height: 32px !important;
  color: #6b7280 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

.more-btn:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.more-btn .v-icon {
  font-size: 20px;
}
</style>
