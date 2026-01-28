<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('campaign.awareness')"
    :mainSubPage="$t('campaign.campaign management')"
    :subPage="$t('campaign.campaign')"
    :titlePage="$t('campaign.campaign management')"
    :showInsightsTab="true"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>

    <!-- start statistics -->
    <template #statistics>
      <div class="statistics-wrapper">
        <div class="status-cards-container">
          <!-- Total Campaigns -->
          <div class="status-card">
            <div>
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="45" height="45" rx="22.5" fill="#D0B5E3" />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.5 12.9808C17.2427 12.9808 12.9808 17.2426 12.9808 22.4999C12.9808 27.7572 17.2427 32.0191 22.5 32.0191C27.7573 32.0191 32.0192 27.7572 32.0192 22.4999C32.0192 17.2426 27.7573 12.9808 22.5 12.9808ZM11.25 22.4999C11.25 16.2868 16.2868 11.25 22.5 11.25C28.7132 11.25 33.75 16.2868 33.75 22.4999C33.75 28.7131 28.7132 33.7498 22.5 33.7498C16.2868 33.7498 11.25 28.7131 11.25 22.4999Z"
                  fill="#43235C"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M23.2572 22.162L25.7231 22.4958C25.9675 22.5248 26.2023 22.6082 26.4101 22.7401L32.2779 26.3493C32.685 26.5997 32.812 27.1327 32.5616 27.5398C32.3112 27.9469 31.7782 28.0739 31.3711 27.8235L25.4998 24.2121L23.0316 23.878L23.0307 23.8802L21.5487 27.2011L21.5473 27.2042L23.5836 29.403C23.7652 29.6026 23.8983 29.8415 23.9724 30.101C24.0465 30.3605 24.0598 30.6336 24.011 30.899L24.009 30.9099L23.5871 33.0517C23.4947 33.5206 23.0397 33.8259 22.5707 33.7335C22.1018 33.6412 21.7965 33.1861 21.8889 32.7172L22.3089 30.5848C22.3092 30.582 22.309 30.5792 22.3082 30.5765C22.3074 30.5736 22.306 30.5709 22.3041 30.5686L20.2724 28.3749C20.0432 28.1252 19.8923 27.8138 19.8385 27.4792C19.7847 27.1453 19.83 26.8029 19.9687 26.4945L21.4469 23.1821C21.5941 22.838 21.8503 22.5516 22.1761 22.3671C22.504 22.1814 22.8841 22.1093 23.2572 22.162Z"
                  fill="#43235C"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.0233 13.8717C16.4632 14.0584 16.6684 14.5665 16.4817 15.0064L15.5104 17.2943L15.5108 17.2953L16.7548 20.6054L16.7588 20.6165L19.0646 21.1121C19.3226 21.1652 19.5649 21.2773 19.7725 21.4396C19.9809 21.6026 20.1487 21.8118 20.2626 22.0507C20.263 22.0515 20.2634 22.0523 20.2637 22.0531L20.6665 22.8904C20.6682 22.893 20.6705 22.8953 20.6732 22.897C20.6761 22.8988 20.6793 22.8998 20.6827 22.9002H22.1322C22.6102 22.9002 22.9976 23.2876 22.9976 23.7655C22.9976 24.2435 22.6102 24.6309 22.1322 24.6309H20.6719L20.6594 24.6308C20.3396 24.6262 20.0271 24.5342 19.7559 24.3646C19.4847 24.1951 19.265 23.9546 19.1207 23.6691L19.1132 23.6539L18.7049 22.805L16.3913 22.3077C16.3911 22.3077 16.3914 22.3078 16.3913 22.3077C16.1035 22.2462 15.8359 22.1117 15.615 21.9174C15.3965 21.7253 15.2304 21.481 15.132 21.2073L13.891 17.9052C13.891 17.905 13.8911 17.9054 13.891 17.9052C13.7356 17.4927 13.7432 17.0357 13.9127 16.6288L13.9149 16.6233L14.8885 14.3301C15.0753 13.8901 15.5833 13.6849 16.0233 13.8717Z"
                  fill="#43235C"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M24.7311 11.6936C25.1493 11.4621 25.6759 11.6135 25.9074 12.0316L26.9166 13.8547C27.1012 14.1943 27.1676 14.5856 27.1053 14.9671C27.043 15.3486 26.8556 15.6985 26.5725 15.9618L26.5633 15.9703L23.6607 18.5923C23.5607 18.6861 23.4493 18.7671 23.3292 18.8333C23.3289 18.8335 23.3286 18.8336 23.3284 18.8338L21.9992 19.5686L21.9861 19.5757C21.7413 19.7056 21.4697 19.777 21.1927 19.7845C21.185 19.7847 21.1772 19.7848 21.1695 19.7848H18.8585C18.8566 19.7849 18.8547 19.7855 18.853 19.7866C18.8515 19.7876 18.8502 19.7891 18.8494 19.7907L17.9537 21.9165C17.7682 22.3569 17.2607 22.5635 16.8203 22.3779C16.3798 22.1924 16.1732 21.6849 16.3588 21.2445L17.2591 19.1076C17.393 18.7962 17.6149 18.5307 17.8975 18.3435C18.1801 18.1564 18.5112 18.0558 18.8502 18.054L18.8546 18.054L21.1511 18.054C21.1584 18.0533 21.1655 18.0513 21.1721 18.0482L22.4841 17.3229C22.4871 17.3201 22.4901 17.3173 22.4932 17.3145L25.3947 14.6935C25.396 14.692 25.3968 14.6902 25.3971 14.6882C25.3975 14.6861 25.3972 14.6839 25.3963 14.6819L24.3931 12.8698C24.1616 12.4517 24.313 11.9251 24.7311 11.6936Z"
                  fill="#43235C"
                />
                <path
                  d="M16.3913 22.3077L18.7049 22.805L19.1132 23.6539L19.1207 23.6691C19.265 23.9546 19.4847 24.1951 19.7559 24.3646C20.0271 24.5342 20.3396 24.6262 20.6594 24.6308L20.6719 24.6309H22.1322C22.6102 24.6309 22.9976 24.2435 22.9976 23.7655C22.9976 23.2876 22.6102 22.9002 22.1322 22.9002H20.6827C20.6793 22.8998 20.6761 22.8988 20.6732 22.897C20.6705 22.8953 20.6682 22.893 20.6665 22.8904L20.2637 22.0531C20.2634 22.0523 20.263 22.0515 20.2626 22.0507C20.1487 21.8118 19.9809 21.6026 19.7725 21.4396C19.5649 21.2773 19.3226 21.1652 19.0646 21.1121L16.7588 20.6165L16.7548 20.6054L15.5108 17.2953L15.5104 17.2943L16.4817 15.0064C16.6684 14.5665 16.4632 14.0584 16.0233 13.8717C15.5833 13.6849 15.0753 13.8901 14.8885 14.3301L13.9149 16.6233L13.9127 16.6288C13.7432 17.0357 13.7356 17.4927 13.891 17.9052M16.3913 22.3077C16.3914 22.3078 16.3911 22.3077 16.3913 22.3077ZM16.3913 22.3077C16.1035 22.2462 15.8359 22.1117 15.615 21.9174C15.3965 21.7253 15.2304 21.481 15.132 21.2073L13.891 17.9052M13.891 17.9052C13.8911 17.9054 13.891 17.905 13.891 17.9052ZM12.9808 22.4999C12.9808 17.2426 17.2427 12.9808 22.5 12.9808C27.7573 12.9808 32.0192 17.2426 32.0192 22.4999C32.0192 27.7572 27.7573 32.0191 22.5 32.0191C17.2427 32.0191 12.9808 27.7572 12.9808 22.4999ZM22.5 11.25C16.2868 11.25 11.25 16.2868 11.25 22.4999C11.25 28.7131 16.2868 33.7498 22.5 33.7498C28.7132 33.7498 33.75 28.7131 33.75 22.4999C33.75 16.2868 28.7132 11.25 22.5 11.25ZM25.7231 22.4958L23.2572 22.162C22.8841 22.1093 22.504 22.1814 22.1761 22.3671C21.8503 22.5516 21.5941 22.838 21.4469 23.1821L19.9687 26.4945C19.83 26.8029 19.7848 27.1453 19.8385 27.4792C19.8923 27.8138 20.0432 28.1252 20.2724 28.3749L22.3041 30.5686C22.306 30.5709 22.3074 30.5736 22.3082 30.5765C22.309 30.5792 22.3092 30.582 22.3089 30.5848L21.8889 32.7172C21.7965 33.1861 22.1018 33.6412 22.5707 33.7335C23.0397 33.8259 23.4947 33.5206 23.5871 33.0517L24.009 30.9099L24.011 30.899C24.0598 30.6336 24.0465 30.3605 23.9724 30.101C23.8983 29.8415 23.7652 29.6026 23.5836 29.403L21.5473 27.2042L21.5487 27.2011L23.0307 23.8802L23.0316 23.878L25.4998 24.2121L31.3711 27.8235C31.7782 28.0739 32.3112 27.9469 32.5616 27.5398C32.812 27.1327 32.685 26.5997 32.2779 26.3493L26.4101 22.7401C26.2023 22.6082 25.9675 22.5248 25.7231 22.4958ZM25.9074 12.0316C25.6759 11.6135 25.1493 11.4621 24.7311 11.6936C24.313 11.9251 24.1616 12.4517 24.3931 12.8698L25.3963 14.6819C25.3972 14.6839 25.3975 14.6861 25.3971 14.6882C25.3968 14.6902 25.396 14.692 25.3947 14.6935L22.4932 17.3145C22.4901 17.3173 22.4871 17.3201 22.4841 17.3229L21.1721 18.0482C21.1655 18.0513 21.1584 18.0533 21.1511 18.054L18.8546 18.054L18.8502 18.054C18.5112 18.0558 18.1801 18.1564 17.8975 18.3435C17.6149 18.5307 17.393 18.7962 17.2591 19.1076L16.3588 21.2445C16.1732 21.6849 16.3798 22.1924 16.8203 22.3779C17.2607 22.5635 17.7682 22.3569 17.9537 21.9165L18.8494 19.7907C18.8502 19.7891 18.8515 19.7876 18.853 19.7866C18.8547 19.7855 18.8566 19.7849 18.8585 19.7848H21.1695C21.1772 19.7848 21.185 19.7847 21.1927 19.7845C21.4697 19.777 21.7413 19.7056 21.9861 19.5757L21.9992 19.5686L23.3284 18.8338C23.3286 18.8336 23.3289 18.8335 23.3292 18.8333C23.4493 18.7671 23.5607 18.6861 23.6607 18.5923L26.5633 15.9703L26.5725 15.9618C26.8556 15.6985 27.043 15.3486 27.1053 14.9671C27.1676 14.5856 27.1012 14.1943 26.9166 13.8547L25.9074 12.0316Z"
                  stroke="#43235C"
                  stroke-width="0.5625"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="card-details">
              <p class="card-label">{{ $t("campaign.Total Campaigns") }}</p>
              <h2 class="card-value">{{ totalCampaigns }}</h2>
            </div>
          </div>

          <!-- Pending Campaigns -->
          <div class="status-card">
            <div>
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="45" height="45" rx="22.5" fill="#F3EAD1" />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.5 12.9808C17.2427 12.9808 12.9808 17.2427 12.9808 22.5C12.9808 27.7573 17.2427 32.0192 22.5 32.0192C27.7573 32.0192 32.0192 27.7573 32.0192 22.5C32.0192 17.2427 27.7573 12.9808 22.5 12.9808ZM11.25 22.5C11.25 16.2868 16.2868 11.25 22.5 11.25C28.7132 11.25 33.75 16.2868 33.75 22.5C33.75 28.7132 28.7132 33.75 22.5 33.75C16.2868 33.75 11.25 28.7132 11.25 22.5Z"
                  fill="#C4951B"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.9038 18.1731C20.3818 18.1731 20.7692 18.5605 20.7692 19.0385V25.9615C20.7692 26.4395 20.3818 26.8269 19.9038 26.8269C19.4259 26.8269 19.0385 26.4395 19.0385 25.9615V19.0385C19.0385 18.5605 19.4259 18.1731 19.9038 18.1731Z"
                  fill="#C4951B"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M25.0962 18.1731C25.5741 18.1731 25.9615 18.5605 25.9615 19.0385V25.9615C25.9615 26.4395 25.5741 26.8269 25.0962 26.8269C24.6182 26.8269 24.2308 26.4395 24.2308 25.9615V19.0385C24.2308 18.5605 24.6182 18.1731 25.0962 18.1731Z"
                  fill="#C4951B"
                />
                <path
                  d="M12.9808 22.5H13.262C13.262 17.398 17.398 13.262 22.5 13.262V12.9808V12.6995C17.0873 12.6995 12.6995 17.0873 12.6995 22.5H12.9808ZM22.5 32.0192V31.738C17.398 31.738 13.262 27.602 13.262 22.5H12.9808H12.6995C12.6995 27.9127 17.0873 32.3005 22.5 32.3005V32.0192ZM32.0192 22.5H31.738C31.738 27.602 27.602 31.738 22.5 31.738V32.0192V32.3005C27.9127 32.3005 32.3005 27.9127 32.3005 22.5H32.0192ZM22.5 12.9808V13.262C27.602 13.262 31.738 17.398 31.738 22.5H32.0192H32.3005C32.3005 17.0873 27.9127 12.6995 22.5 12.6995V12.9808ZM22.5 11.25V10.9688C16.1315 10.9688 10.9688 16.1315 10.9688 22.5H11.25H11.5312C11.5312 16.4421 16.4421 11.5312 22.5 11.5312V11.25ZM33.75 22.5H34.0312C34.0312 16.1315 28.8685 10.9688 22.5 10.9688V11.25V11.5312C28.5579 11.5312 33.4688 16.4421 33.4688 22.5H33.75ZM22.5 33.75V34.0312C28.8685 34.0312 34.0312 28.8685 34.0312 22.5H33.75H33.4688C33.4688 28.5579 28.5579 33.4688 22.5 33.4688V33.75ZM11.25 22.5H10.9688C10.9688 28.8685 16.1315 34.0312 22.5 34.0312V33.75V33.4688C16.4421 33.4688 11.5312 28.5579 11.5312 22.5H11.25ZM20.7692 19.0385H21.0505C21.0505 18.4052 20.5371 17.8918 19.9038 17.8918V18.1731V18.4543C20.2265 18.4543 20.488 18.7159 20.488 19.0385H20.7692ZM20.7692 25.9615H21.0505V19.0385H20.7692H20.488V25.9615H20.7692ZM19.9038 26.8269V27.1082C20.5371 27.1082 21.0505 26.5948 21.0505 25.9615H20.7692H20.488C20.488 26.2841 20.2265 26.5457 19.9038 26.5457V26.8269ZM19.0385 25.9615H18.7572C18.7572 26.5948 19.2706 27.1082 19.9038 27.1082V26.8269V26.5457C19.5812 26.5457 19.3197 26.2841 19.3197 25.9615H19.0385ZM19.0385 19.0385H18.7572V25.9615H19.0385H19.3197V19.0385H19.0385ZM19.9038 18.1731V17.8918C19.2706 17.8918 18.7572 18.4052 18.7572 19.0385H19.0385H19.3197C19.3197 18.7159 19.5812 18.4543 19.9038 18.4543V18.1731ZM25.9615 19.0385H26.2428C26.2428 18.4052 25.7294 17.8918 25.0962 17.8918V18.1731V18.4543C25.4188 18.4543 25.6803 18.7159 25.6803 19.0385H25.9615ZM25.9615 25.9615H26.2428V19.0385H25.9615H25.6803V25.9615H25.9615ZM25.0962 26.8269V27.1082C25.7294 27.1082 26.2428 26.5948 26.2428 25.9615H25.9615H25.6803C25.6803 26.2841 25.4188 26.5457 25.0962 26.5457V26.8269ZM24.2308 25.9615H23.9495C23.9495 26.5948 24.4629 27.1082 25.0962 27.1082V26.8269V26.5457C24.7735 26.5457 24.512 26.2841 24.512 25.9615H24.2308ZM24.2308 19.0385H23.9495V25.9615H24.2308H24.512V19.0385H24.2308ZM25.0962 18.1731V17.8918C24.4629 17.8918 23.9495 18.4052 23.9495 19.0385H24.2308H24.512C24.512 18.7159 24.7735 18.4543 25.0962 18.4543V18.1731Z"
                  fill="#C4951B"
                />
              </svg>
            </div>
            <div class="card-details">
              <p class="card-label">{{ $t("campaign.Pending Campaigns") }}</p>
              <h2 class="card-value">{{ pendingCampaigns }}</h2>
            </div>
          </div>

          <!-- Completed Campaigns -->
          <div class="status-card">
            <div>
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="45" height="45" rx="22.5" fill="#CEDFD4" />
                <path
                  d="M32.625 21.5743V22.5058C32.6238 24.6892 31.9168 26.8136 30.6094 28.5624C29.3021 30.3111 27.4646 31.5904 25.3708 32.2095C23.277 32.8286 21.0392 32.7542 18.9911 31.9976C16.9431 31.2409 15.1945 29.8425 14.0061 28.0108C12.8177 26.1792 12.2533 24.0125 12.3969 21.8338C12.5406 19.6552 13.3847 17.5813 14.8033 15.9216C16.2218 14.2618 18.1389 13.1051 20.2686 12.6239C22.3983 12.1428 24.6265 12.3629 26.6209 13.2515M32.625 14.4058L22.5 24.5409L19.4625 21.5034"
                  stroke="#0B5F1A"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="card-details">
              <p class="card-label">{{ $t("campaign.Completed Campaigns") }}</p>
              <h2 class="card-value">{{ completedCampaigns }}</h2>
            </div>
          </div>

          <!-- Scheduled Campaigns -->
          <div class="status-card">
            <div>
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="45" height="45" rx="22.5" fill="#CED0DF" />
                <path
                  d="M22.5 15.75V22.5L27 24.75M33.75 22.5C33.75 28.7132 28.7132 33.75 22.5 33.75C16.2868 33.75 11.25 28.7132 11.25 22.5C11.25 16.2868 16.2868 11.25 22.5 11.25C28.7132 11.25 33.75 16.2868 33.75 22.5Z"
                  stroke="#433894"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="card-details">
              <p class="card-label">
                {{ $t("campaign.Schedualed Campaigns") }}
              </p>
              <h2 class="card-value">{{ schedualedCampaigns }}</h2>
            </div>
          </div>

          <!-- OnDemand Campaigns -->
          <div class="status-card">
            <div>
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="45" height="45" rx="22.5" fill="#F0F3D1" />
                <path
                  d="M23.625 11.25L12.375 24.75H22.5L21.375 33.75L32.625 20.25H22.5L23.625 11.25Z"
                  stroke="#C4C11B"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="card-details">
              <p class="card-label">{{ $t("campaign.Ondemand Campaigns") }}</p>
              <h2 class="card-value">{{ ondemandCampaigns }}</h2>
            </div>
          </div>

          <!-- Approved Campaigns -->
          <div class="status-card">
            <div>
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="45" height="45" rx="22.5" fill="#D3DFCE" />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M27.8858 19.3065C28.2157 19.6523 28.2028 20.2001 27.857 20.53L21.5072 26.5877C21.1726 26.9069 20.6463 26.9066 20.312 26.5872L17.1425 23.5583C16.797 23.2281 16.7845 22.6803 17.1147 22.3348C17.4449 21.9893 17.9927 21.9768 18.3383 22.3071L20.9104 24.765L26.6623 19.2777C27.0081 18.9478 27.5559 18.9607 27.8858 19.3065Z"
                  fill="#255F0B"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.5 12.9808C17.2427 12.9808 12.9808 17.2427 12.9808 22.5C12.9808 27.7573 17.2427 32.0192 22.5 32.0192C27.7573 32.0192 32.0192 27.7573 32.0192 22.5C32.0192 17.2427 27.7573 12.9808 22.5 12.9808ZM11.25 22.5C11.25 16.2868 16.2868 11.25 22.5 11.25C28.7132 11.25 33.75 16.2868 33.75 22.5C33.75 28.7132 28.7132 33.75 22.5 33.75C16.2868 33.75 11.25 28.7132 11.25 22.5Z"
                  fill="#255F0B"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M27.8858 19.3065C28.2157 19.6523 28.2028 20.2001 27.857 20.53L21.5072 26.5877C21.1726 26.9069 20.6463 26.9066 20.312 26.5872L17.1425 23.5583C16.797 23.2281 16.7845 22.6803 17.1147 22.3348C17.4449 21.9893 17.9927 21.9768 18.3383 22.3071L20.9104 24.765L26.6623 19.2777C27.0081 18.9478 27.5559 18.9607 27.8858 19.3065Z"
                  stroke="#255F0B"
                  stroke-width="0.5625"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.5 12.9808C17.2427 12.9808 12.9808 17.2427 12.9808 22.5C12.9808 27.7573 17.2427 32.0192 22.5 32.0192C27.7573 32.0192 32.0192 27.7573 32.0192 22.5C32.0192 17.2427 27.7573 12.9808 22.5 12.9808ZM11.25 22.5C11.25 16.2868 16.2868 11.25 22.5 11.25C28.7132 11.25 33.75 16.2868 33.75 22.5C33.75 28.7132 28.7132 33.75 22.5 33.75C16.2868 33.75 11.25 28.7132 11.25 22.5Z"
                  stroke="#255F0B"
                  stroke-width="0.5625"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="card-details">
              <p class="card-label">{{ $t("campaign.Approved Campaigns") }}</p>
              <h2 class="card-value">{{ approvedCampaigns }}</h2>
            </div>
          </div>
        </div>

        <!-- Detailed Statistics Charts Section -->
        <div class="row mt-4">
          <!-- Campaign Status Distribution -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("campaign.Status_Distribution") ||
                  "Campaign Status Distribution"
                }}
              </h6>
              <highcharts :options="campaignStatusChart"></highcharts>
            </div>
          </div>

          <!-- Campaign Type Distribution -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("campaign.Type Distribution") ||
                  "Campaign Type Distribution"
                }}
              </h6>
              <highcharts :options="campaignTypeChart"></highcharts>
            </div>
          </div>

          <!-- Delivery Schedule Distribution -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Delivery Schedule") ||
                  "Delivery Schedule Distribution"
                }}
              </h6>
              <highcharts :options="deliveryScheduleChart"></highcharts>
            </div>
          </div>

          <!-- Campaign Completion Rate -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Completion Rate") || "Campaign Completion Rate"
                }}
              </h6>
              <highcharts :options="campaignCompletionChart"></highcharts>
            </div>
          </div>

          <!-- Campaign Timeline Distribution -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Timeline Distribution") ||
                  "Campaign Duration Distribution"
                }}
              </h6>
              <highcharts :options="campaignTimelineChart"></highcharts>
            </div>
          </div>

          <!-- User Engagement -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.User Engagement") ||
                  "Top 10 Campaigns by User Engagement"
                }}
              </h6>
              <highcharts :options="userEngagementChart"></highcharts>
            </div>
          </div>

          <!-- Campaign Type Breakdown Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("campaign.Campaign Type Breakdown") ||
                  "Campaign Type Breakdown"
                }}
              </h6>
              <highcharts :options="campaignPhishingTypeChart"></highcharts>
            </div>
          </div>

          <!-- Campaign Status Overview Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("campaign.Campaign Status Overview") ||
                  "Campaign Status Overview"
                }}
              </h6>
              <highcharts :options="campaignStatusOverviewChart"></highcharts>
            </div>
          </div>

          <!-- Phishing vs Awareness Comparison Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Phishing vs Awareness") ||
                  "Phishing vs Security Awareness"
                }}
              </h6>
              <highcharts :options="phishingVsAwarenessChart"></highcharts>
            </div>
          </div>

          <!-- Delivery Schedule Analysis Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Delivery Schedule Analysis") ||
                  "Delivery Schedule Analysis"
                }}
              </h6>
              <highcharts :options="deliveryScheduleAnalysisChart"></highcharts>
            </div>
          </div>

          <!-- Complete Campaign Metrics Chart -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Complete Campaign Metrics") ||
                  "Complete Campaign Metrics Comparison"
                }}
              </h6>
              <highcharts :options="completeCampaignMetricsChart"></highcharts>
            </div>
          </div>

          <!-- Mail Delivery Status Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("campaign.Mail Delivery Status") ||
                  "Mail Delivery Status"
                }}
              </h6>
              <highcharts :options="mailDeliveryStatusChart"></highcharts>
            </div>
          </div>

          <!-- Phishing Campaign Success Rate Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("campaign.Phishing Success Rate") ||
                  "Phishing Campaign Success Rate"
                }}
              </h6>
              <highcharts :options="phishingSuccessRateChart"></highcharts>
            </div>
          </div>

          <!-- User Engagement in Phishing Campaigns Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.User Engagement") ||
                  "User Engagement in Phishing Campaigns"
                }}
              </h6>
              <highcharts :options="phishingUserEngagementChart"></highcharts>
            </div>
          </div>

          <!-- Phishing Email Timeline Chart -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Email Timeline") ||
                  "Phishing Email Delivery Timeline"
                }}
              </h6>
              <highcharts :options="phishingEmailTimelineChart"></highcharts>
            </div>
          </div>

          <!-- Phishing Template Performance Chart -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Template Performance") ||
                  "Phishing Template Performance Comparison"
                }}
              </h6>
              <highcharts :options="phishingTemplatePerformanceChart"></highcharts>
            </div>
          </div>

          <!-- Campaign & Phishing Statistics Table -->
          <div class="col-12 mb-4">
            <div class="statistics-table-container">
              <!-- Title and Export Buttons Row -->
              <div class="table-header-row">
                <h6 class="table-title">
                  {{
                    $t("campaign.Campaign & Phishing Statistics") ||
                    "Campaign & Phishing Statistics Overview"
                  }}
                </h6>
                <div class="export-buttons-top">
                  <button @click="exportStatisticsToPDF" class="export-icon-btn export-pdf-btn" :title="$t('campaign.Export to PDF') || 'Export to PDF'">
                    <i class="mdi mdi-file-pdf-box"></i>
                  </button>
                  <button @click="exportStatisticsToExcel" class="export-icon-btn export-excel-btn" :title="$t('campaign.Export to Excel') || 'Export to Excel'">
                    <i class="mdi mdi-file-excel"></i>
                  </button>
                </div>
              </div>

              <!-- Statistics Filters -->
              <div class="statistics-filters">
                <div class="filter-row">
                  <!-- Date Range Filter -->
                  <div class="filter-group">
                    <label class="filter-label">{{ $t("campaign.Date Range") || "Date Range" }}</label>
                    <select v-model="statisticsFilters.dateRange" @change="applyStatisticsFilters" class="filter-select">
                      <option value="all">{{ $t("campaign.All Time") || "All Time" }}</option>
                      <option value="today">{{ $t("campaign.Today") || "Today" }}</option>
                      <option value="week">{{ $t("campaign.Last 7 Days") || "Last 7 Days" }}</option>
                      <option value="month">{{ $t("campaign.Last 30 Days") || "Last 30 Days" }}</option>
                      <option value="quarter">{{ $t("campaign.Last 3 Months") || "Last 3 Months" }}</option>
                      <option value="year">{{ $t("campaign.Last Year") || "Last Year" }}</option>
                    </select>
                  </div>

                  <!-- Campaign Type Filter -->
                  <div class="filter-group">
                    <label class="filter-label">{{ $t("campaign.Campaign Type") || "Campaign Type" }}</label>
                    <select v-model="statisticsFilters.campaignType" @change="applyStatisticsFilters" class="filter-select">
                      <option value="all">{{ $t("campaign.All Types") || "All Types" }}</option>
                      <option value="simulatedPhishing">{{ $t("campaign.Simulated Phishing") || "Simulated Phishing" }}</option>
                      <option value="securityAwareness">{{ $t("campaign.Security Awareness") || "Security Awareness" }}</option>
                      <option value="both">{{ $t("campaign.Both") || "Both" }}</option>
                    </select>
                  </div>

                  <!-- Status Filter -->
                  <div class="filter-group">
                    <label class="filter-label">{{ $t("campaign.Status") || "Status" }}</label>
                    <select v-model="statisticsFilters.status" @change="applyStatisticsFilters" class="filter-select">
                      <option value="all">{{ $t("campaign.All Statuses") || "All Statuses" }}</option>
                      <option value="pending">{{ $t("campaign.Pending") || "Pending" }}</option>
                      <option value="approved">{{ $t("campaign.Approved") || "Approved" }}</option>
                      <option value="rejected">{{ $t("campaign.Rejected") || "Rejected" }}</option>
                    </select>
                  </div>

                  <!-- Delivery Schedule Filter -->
                  <div class="filter-group">
                    <label class="filter-label">{{ $t("campaign.Delivery Schedule") || "Delivery Schedule" }}</label>
                    <select v-model="statisticsFilters.deliverySchedule" @change="applyStatisticsFilters" class="filter-select">
                      <option value="all">{{ $t("campaign.All Schedules") || "All Schedules" }}</option>
                      <option value="onDemand">{{ $t("campaign.On-Demand") || "On-Demand" }}</option>
                      <option value="scheduled">{{ $t("campaign.Scheduled") || "Scheduled" }}</option>
                    </select>
                  </div>

                  <!-- Reset Button -->
                  <div class="filter-group">
                    <button @click="resetStatisticsFilters" class="filter-reset-btn" :title="$t('campaign.Reset Filters') || 'Reset Filters'">
                      <i class="mdi mdi-refresh"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table class="statistics-table">
                  <thead>
                    <tr>
                      <th>{{ $t("campaign.Metric") || "Metric" }}</th>
                      <th>{{ $t("campaign.Count") || "Count" }}</th>
                      <th>{{ $t("campaign.Percentage") || "Percentage" }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Campaign Type Statistics -->
                    <tr class="category-header">
                      <td colspan="3">
                        <strong>{{
                          $t("campaign.Campaign Types") || "Campaign Types"
                        }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Simulated Phishing") || "Simulated Phishing Campaigns" }}</td>
                      <td>{{ simulatedPhishingCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill phishing-fill"
                              :style="{ width: phishingPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ phishingPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Security Awareness") || "Security Awareness Campaigns" }}</td>
                      <td>{{ securityAwarenessCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill awareness-fill"
                              :style="{ width: awarenessPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ awarenessPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Both Types") || "Combined (Phishing & Awareness)" }}</td>
                      <td>{{ bothCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill both-fill"
                              :style="{ width: bothPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ bothPercentage }}%</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Campaign Status Statistics -->
                    <tr class="category-header">
                      <td colspan="3">
                        <strong>{{
                          $t("campaign.Campaign Status") || "Campaign Status"
                        }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Pending Campaigns") || "Pending Campaigns" }}</td>
                      <td>{{ pendingCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill pending-fill"
                              :style="{ width: pendingPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ pendingPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Approved Campaigns") || "Approved Campaigns" }}</td>
                      <td>{{ approvedCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill approved-fill"
                              :style="{ width: approvedPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ approvedPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Rejected Campaigns") || "Rejected Campaigns" }}</td>
                      <td>{{ rejectedCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill rejected-fill"
                              :style="{ width: rejectedPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ rejectedPercentage }}%</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Delivery Schedule Statistics -->
                    <tr class="category-header">
                      <td colspan="3">
                        <strong>{{
                          $t("campaign.Delivery Schedule") || "Delivery Schedule"
                        }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.On-Demand Campaigns") || "On-Demand Campaigns" }}</td>
                      <td>{{ ondemandCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill ondemand-fill"
                              :style="{ width: ondemandPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ ondemandPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>{{ $t("campaign.Scheduled Campaigns") || "Scheduled Campaigns" }}</td>
                      <td>{{ schedualedCampaigns }}</td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill scheduled-fill"
                              :style="{ width: scheduledPercentage + '%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">{{ scheduledPercentage }}%</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Overall Summary -->
                    <tr class="category-header">
                      <td colspan="3">
                        <strong>{{
                          $t("campaign.Overall Summary") || "Overall Summary"
                        }}</strong>
                      </td>
                    </tr>
                    <tr class="summary-row">
                      <td><strong>{{ $t("campaign.Total Campaigns") || "Total Campaigns" }}</strong></td>
                      <td><strong>{{ totalCampaigns }}</strong></td>
                      <td>
                        <div class="percentage-container">
                          <div class="percentage-bar">
                            <div
                              class="percentage-fill total-fill"
                              :style="{ width: '100%' }"
                            ></div>
                          </div>
                          <span class="percentage-text">100%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Phishing Emails Delivered (Past Year) Chart -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Phishing Emails Delivered (Past Year)") ||
                  "Phishing Emails Delivered (Past Year)"
                }}
              </h6>
              <highcharts :options="phishingEmailsDeliveredChart"></highcharts>
            </div>
          </div>

          <!-- Phishing Campaigns Statistics Chart -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Phishing Campaigns Statistics") ||
                  "Phishing Campaign Mails And Employee Statistics"
                }}
              </h6>
              <highcharts :options="phishingCampaignsStatisticsChart"></highcharts>
            </div>
          </div>

          <!-- Phishing Employees Statistics Chart -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("campaign.Phishing Employees Statistics") ||
                  "Phishing Employees Statistics"
                }}
              </h6>
              <highcharts :options="phishingEmployeesStatisticsChart"></highcharts>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- end statistics -->

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <!-- start tabs -->
      <TabsComponent
        :tabs="campaignTabs"
        v-model="activeTab"
        @update:modelValue="handleTabChange"
      />
      <!-- end tabs -->

      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :hideActions="hideActions"
        :filters="filterData"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #name="{ item }">
          <a
            class="badge badge-purple text-decoration-none"
            href="#"
            @click.prevent="openViewModal(item)"
            >{{ item.name }}</a
          >
        </template>
        <template #type="{ item }">
          {{
            item.type == "simulatedPhishing"
              ? $t("campaign.Simulated Phishing")
              : item.type == "securityAwareness"
              ? $t("campaign.Security Awareness")
              : $t("campaign.Simulated Phishing & Security Awareness")
          }}
        </template>

        <template #deliveryStatus="{ item }">
          <!-- <span
            :class="['badge text-white m-1',
              item?.isMailSent == '1' ? 'bg-success' :
              !item?.isMailSent ? 'bg-danger' : 'bg-secondary'
            ]"
          >
            {{ item?.isMailSent ? 'Yes' : 'No' }}
          </span> -->
          <div v-if="item.phishingTemplate_ids && item.lmsModule_ids == null">
            <h6
              v-if="item.isMailSent"
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              {{ item.user_ids.length }} of {{ item.user_ids.length }}
              {{ $t("campaign.users") }} (100%)
            </h6>
            <h6
              v-else
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              0 of {{ item.user_ids.length }} {{ $t("campaign.users") }} (100%)
            </h6>
            <div
              class="progress"
              style="width: 100%; height: 10px; margin-top: 9px"
            >
              <div
                v-if="item.isMailSent"
                class="progress-bar"
                role="progressbar"
                style="width: 100%"
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                100%
              </div>
              <div
                v-else
                class="progress-bar"
                role="progressbar"
                style="width: 0%"
                aria-valuenow="0"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                0%
              </div>
            </div>
          </div>

          <div v-if="item.lmsModule_ids && item.phishingTemplate_ids == null">
            <h6
              v-if="item.isMailSent"
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              {{ item.user_ids.length }} of {{ item.user_ids.length }}
              {{ $t("campaign.users") }} (100%)
            </h6>
            <h6
              v-else
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              0 of {{ item.user_ids.length }} {{ $t("campaign.users") }} (100%)
            </h6>
            <div
              class="progress"
              style="width: 100%; height: 10px; margin-top: 9px"
            >
              <div
                v-if="item.isMailSent"
                class="progress-bar"
                role="progressbar"
                style="width: 100%"
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                100%
              </div>
              <div
                v-else
                class="progress-bar"
                role="progressbar"
                style="width: 0%"
                aria-valuenow="0"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                0%
              </div>
            </div>
          </div>

          <div v-if="item.phishingTemplate_ids && item.lmsModule_ids">
            <h6
              v-if="item.isMailSent"
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              {{ item.user_ids.length }} of {{ item.user_ids.length }}
              {{ $t("campaign.users") }} (100%)
            </h6>
            <h6
              v-else
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              0 of {{ item.user_ids.length }} {{ $t("campaign.users") }} (100%)
            </h6>
            <div
              class="progress"
              style="width: 100%; height: 10px; margin-top: 9px"
            >
              <div
                v-if="item.isMailSent"
                class="progress-bar"
                role="progressbar"
                style="width: 100%"
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                100%
              </div>
              <div
                v-else
                class="progress-bar"
                role="progressbar"
                style="width: 0%"
                aria-valuenow="0"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                0%
              </div>
            </div>
            <hr />
            <h6
              v-if="item.isMailSent"
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              {{ item.lmsModule_ids.length }} of
              {{ item.lmsModule_ids.length }}
              {{ $t("campaign.modules") }} (100%)
            </h6>
            <h6
              v-else
              class="card-subtitle"
              style="color: dimgray; text-align: center; line-height: 17px"
            >
              0 of {{ item.lmsModule_ids.length }} modules (100%)
            </h6>
            <div
              class="progress"
              style="width: 100%; height: 10px; margin-top: 9px"
            >
              <div
                v-if="item.isMailSent"
                class="progress-bar"
                role="progressbar"
                style="width: 100%"
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                100%
              </div>
              <div
                v-else
                class="progress-bar"
                role="progressbar"
                style="width: 0%"
                aria-valuenow="0"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                0%
              </div>
            </div>
          </div>
        </template>

        <template #status="{ item }">
          <span
            :class="[
              'badge text-white m-1',
              item?.status === 'approved'
                ? 'bg-success'
                : item?.status === 'pending'
                ? 'bg-info'
                : item?.status === 'rejected'
                ? 'bg-danger'
                : 'bg-secondary',
            ]"
          >
            {{
              item.status == "pending"
                ? $t("campaign.pending")
                : item.status == "approved"
                ? $t("campaign.approved")
                : item.status == "rejected"
                ? $t("campaign.rejected")
                : $t("campaign.Unknown")
            }}
          </span>
        </template>
        <template #addAction="{ item }">
          <a
            href="javascript:void(0)"
            class="dropdown-item"
            title="Send"
            v-if="
              !item.isMailSent &&
              item.status === 'approved' &&
              item.deliveryScheduleType === 'later'
            "
            @click="sendMail(item)"
            v-permission:sendMail
          >
            <i class="mdi-mail-outline mdi v-icon notranslate v-theme--light text-success action-icon"></i>
            {{ $t("campaign.Send") }}
          </a>
          <a
            href="javascript:void(0)"
            class="dropdown-item"
            title="Approve"
            v-if="item.status === 'pending'"
            @click="changeStatusToApproved(item)"
            v-permission:changeStatusToApproved
          >
            <i class="mdi-check-outline mdi v-icon notranslate v-theme--light text-success"></i>
            {{ $t("campaign.Approve") }}
          </a>
          <a
            href="javascript:void(0)"
            class="dropdown-item"
            title="Reject"
            v-if="item.status === 'pending'"
            @click="openCommentModal(item)"
            v-permission:changeStatusToReject
          >
            <i class="mdi-close-outline mdi v-icon notranslate v-theme--light text-danger"></i>
            {{ $t("campaign.Reject") }}
          </a>
          <a
            href="javascript:void(0)"
            @click="openViewModal(item)"
            class="dropdown-item"
            v-permission:update
          >
            <i class="mdi-eye-outline mdi v-icon notranslate v-theme--light text-info"></i>
            {{ $t("campaign.View") }}
          </a>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
      </Form>
    </template>
  </main-page>

  <!-- Create campaign modal -->
  <v-dialog v-model="opencreateModal" max-width="1500px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t("campaign.Create Campaign") }}</span>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="saveCampaign" class="mb-3">
          <div v-if="newItem.type == 'simulatedPhishing'">
            <v-stepper v-model="currentStep">
              <v-stepper-header>
                <v-stepper-item
                  class="stepper-item"
                  :value="1"
                  :title="$t('campaign.Employee Selection')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="2"
                  :title="$t('campaign.Select Material')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="3"
                  :title="$t('campaign.Delivery Schedule')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="4"
                  :title="$t('campaign.Review & Submit')"
                />
              </v-stepper-header>

              <v-stepper-window>
                <v-stepper-window-item :value="1">
                  <v-row>
                    <v-col cols="6">
                      <v-label
                        >{{ $t("campaign.Name") }}
                        <span class="text-danger">*</span></v-label
                      >
                      <!-- <v-input
                        v-model="newItem.name"
                        :name="name"
                        id="campaign-name-input"
                        required
                        :rules="[v => !!v || $t('campaign.Name is required')]"
                        class="input-name vv-input"
                        variant="outlined"
                      > -->
                      <!-- <input class="form-control input-name" type="text" v-model="newItem.name" required>
                          <template #default="{ field }">
                            <input
                              v-bind="field"
                              type="text"
                              class="input-field"
                            />
                          </template>
                        </v-input> -->
                      <input
                        class="form-control input-name"
                        type="text"
                        v-model="newItem.name"
                        required
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-label
                        >{{ $t("campaign.type") }}
                        <span class="text-danger">*</span></v-label
                      >
                      <LazySelectField
                        name="type"
                        rules="required"
                        v-model="newItem.type"
                        :options="[
                          {
                            id: 'simulatedPhishing',
                            name: $t('campaign.Simulated Phishing'),
                          },
                          {
                            id: 'securityAwareness',
                            name: $t('campaign.Security Awareness'),
                          },
                          { id: 'both', name: $t('campaign.Both') },
                        ]"
                        option-label="name"
                        option-value="id"
                        :placeholder="$t('campaign.Select Type')"
                        clearable
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="5">
                          <v-label>{{
                            $t("campaign.Available Groups")
                          }}</v-label>
                          <select
                            class="form-select multiple-select"
                            aria-label="multiple select Groups"
                            multiple
                            v-model="selectedAvailableGroups"
                          >
                            <option
                              v-if="phishingGroups"
                              v-for="group in phishingGroups.filter(
                                (g) =>
                                  !newItem.phishingGroups_id?.includes(g.id)
                              )"
                              :value="group.id"
                              :key="group.id"
                              :selectable="isAvailableGroupSelectable"
                            >
                              {{ group.name }}
                            </option>
                          </select>
                        </v-col>

                        <v-col
                          cols="2"
                          class="d-flex flex-column justify-center align-center btns-section"
                        >
                          <v-btn
                            color="success"
                            class="mb-2 right-btn"
                            @click="moveToSelected(true)"
                            :disabled="!selectedAvailableGroups.length"
                          >
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-btn>
                          <v-btn
                            color="danger"
                            class="mb-2 left-btn"
                            @click="moveToSelected(false)"
                            :disabled="!selectedSelectedGroups.length"
                          >
                            <v-icon>mdi-chevron-left</v-icon>
                          </v-btn>
                          <v-btn
                            color="info"
                            class="mb-2 info-btn"
                            @click="showUsersModal(selectedSelectedGroups)"
                            :disabled="!selectedSelectedGroups.length"
                          >
                            <v-icon>mdi-account-details</v-icon>
                          </v-btn>
                        </v-col>

                        <v-col cols="5">
                          <v-label>{{
                            $t("campaign.Selected Groups")
                          }}</v-label>
                          <v-btn
                            color="warning"
                            class="mb-2 float-right"
                            @click="showUsersModal(newItem.phishingGroups_id)"
                            :disabled="!newItem.phishingGroups_id"
                          >
                            <v-icon>mdi-account-group</v-icon>
                            {{ $t("campaign.Filter Employees") }}
                          </v-btn>
                          <select
                            class="form-select multiple-select"
                            aria-label="multiple select Groups"
                            multiple
                            v-model="selectedSelectedGroups"
                          >
                            <option
                              v-if="phishingGroups"
                              v-for="group in phishingGroups.filter((g) =>
                                newItem.phishingGroups_id?.includes(g.id)
                              )"
                              :value="group.id"
                              :key="group.id"
                              :selectable="isSelectGroupSelectable"
                            >
                              {{ group.name }}
                            </option>
                          </select>
                        </v-col>
                      </v-row>

                      <!-- Users Modal -->
                      <v-dialog v-model="showUsersList" max-width="700px">
                        <v-card class="users-modal-card">
                          <v-card-title
                            class="d-flex justify-space-between align-center pa-4"
                          >
                            <span class="modal-title">{{
                              $t("campaign.Filter Selected Employees")
                            }}</span>
                            <v-btn
                              icon
                              size="small"
                              @click="showUsersList = false"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-card-title>
                          <v-card-text class="pa-0">
                            <div
                              v-if="selectedGroupUsers.length"
                              class="users-table-container"
                            >
                              <table class="users-table">
                                <thead>
                                  <tr class="table-header">
                                    <th class="text-center">#</th>
                                    <th class="text-center">
                                      {{ $t("campaign.Name") }}
                                    </th>
                                    <th class="text-center">
                                      {{ $t("campaign.Email") }}
                                    </th>
                                    <th class="text-center">
                                      {{ $t("campaign.Select") }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr
                                    v-for="(user, index) in selectedGroupUsers"
                                    :key="user.id"
                                    class="table-row"
                                  >
                                    <td class="text-center">{{ index + 1 }}</td>
                                    <td class="text-center">
                                      {{ user.full_name }}
                                    </td>
                                    <td class="text-center">
                                      {{ user.email }}
                                    </td>
                                    <td class="text-center">
                                      <v-checkbox
                                        v-model="selectedUsers"
                                        :value="user.id"
                                        color="#6E3894"
                                        hide-details
                                        class="user-checkbox"
                                      ></v-checkbox>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div v-else class="text-center pa-4">
                              {{
                                $t("campaign.No users found in these groups")
                              }}
                            </div>
                          </v-card-text>
                          <v-card-actions class="d-flex justify-end pa-4">
                            <v-btn
                              class="confirm-btn"
                              variant="flat"
                              @click="confirmUserSelection"
                            >
                              {{ $t("campaign.Confirm") }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                </v-stepper-window-item>

                <v-stepper-window-item :value="2">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12" class="mb-4">
                        <h3 class="text-h6">
                          {{ $t("campaign.Select Phishing Templates") }}
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        v-for="phishingTemplate in phishingTemplates"
                        :key="phishingTemplate.id"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                        style="border-radius: 14px"
                      >
                        <v-card
                          class="mx-auto"
                          :class="{
                            selected: newItem.phishingTemplate_ids?.includes(
                              phishingTemplate.id
                            ),
                          }"
                          style="background: #8c8c8c; border-radius: 14px"
                        >
                          <v-img
                            :src="phishingTemplate?.fullAttachmentPath"
                            height="200"
                            cover
                          ></v-img>
                          <v-card-title class="text-subtitle-1">{{
                            phishingTemplate.name
                          }}</v-card-title>
                          <v-card-actions class="d-flex align-center pa-4">
                            <v-btn
                              @click="
                                toggleTemplateSelection(phishingTemplate.id)
                              "
                              class="ma-0"
                              block
                              :class="
                                newItem.phishingTemplate_ids?.includes(
                                  phishingTemplate.id
                                )
                                  ? 'selected-btn'
                                  : 'non-selected-btn'
                              "
                            >
                              {{
                                newItem.phishingTemplate_ids?.includes(
                                  phishingTemplate.id
                                )
                                  ? $t("campaign.Selected")
                                  : $t("campaign.Select")
                              }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>

                <v-stepper-window-item :value="3">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12">
                        <h3 class="text-h6">
                          {{ $t("campaign.Phishing Delivery Schedule") }}
                          <span class="text-danger">*</span>
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="9">
                        <v-row>
                          <v-col cols="4">
                            <label
                              :class="[
                                'btn',
                                'form-check-label',
                                newItem.deliveryScheduleType === 'immediately'
                                  ? 'selected-btn selected-schedule'
                                  : 'non-selected-btn non-selected-schedule',
                              ]"
                            >
                              <input
                                class="form-check-input"
                                type="radio"
                                :name="deliveryScheduleType"
                                value="immediately"
                                v-model="newItem.deliveryScheduleType"
                                :id="immediately"
                                :hidden="true"
                              />
                              {{ $t("campaign.Deliver Immediately") }}
                            </label>
                          </v-col>
                          <v-col cols="4">
                            <label
                              :class="[
                                'btn',
                                'form-check-label',
                                newItem.deliveryScheduleType === 'setup'
                                  ? 'selected-btn selected-schedule'
                                  : 'non-selected-btn non-selected-schedule',
                              ]"
                            >
                              <input
                                class="form-check-input"
                                type="radio"
                                :name="deliveryScheduleType"
                                value="setup"
                                v-model="newItem.deliveryScheduleType"
                                :id="setup"
                                :hidden="true"
                              />
                              {{ $t("campaign.Setup Schedule") }}
                            </label>
                          </v-col>
                          <v-col cols="4">
                            <label
                              :class="[
                                'btn',
                                'form-check-label',
                                newItem.deliveryScheduleType === 'later'
                                  ? 'selected-btn selected-schedule'
                                  : 'non-selected-btn non-selected-schedule',
                              ]"
                            >
                              <input
                                class="form-check-input"
                                type="radio"
                                :name="deliveryScheduleType"
                                value="later"
                                v-model="newItem.deliveryScheduleType"
                                :id="later"
                                :hidden="true"
                              />
                              {{ $t("campaign.Schedule Later") }}
                            </label>
                          </v-col>
                        </v-row>
                        <v-row v-if="newItem.deliveryScheduleType === 'setup'">
                          <v-col cols="12">
                            <strong>{{ $t("campaign.Note") }}:</strong>
                            {{
                              $t(
                                "campaign.This schedule is used only for email delivery We will capture employee interactions and assign trainings as long as a campaign remains active isnt updated or deleted"
                              )
                            }}
                          </v-col>
                          <v-col cols="6">
                            <label
                              >{{ $t("campaign.Schedule Date From") }}:
                              <span class="text-danger">*</span></label
                            >
                            <input
                              class="form-control"
                              type="date"
                              :name="dateFrom"
                              v-model="newItem.dateFrom"
                              :id="dateFrom"
                            />
                          </v-col>
                          <v-col cols="6">
                            <label
                              >{{ $t("campaign.Schedule Date To") }}:
                              <span class="text-danger">*</span></label
                            >
                            <input
                              class="form-control"
                              type="date"
                              :name="dateTo"
                              v-model="newItem.dateTo"
                              :id="dateTo"
                            />
                          </v-col>
                          <!-- <v-col cols="6">
                            <label>Schedule Time From: <span class="text-danger">*</span></label>
                            <input class="form-control" type="time" :name="TimeFrom" v-model="newItem.timeFrom" :id="timeFrom">
                          </v-col>
                          <v-col cols="6">
                            <label>Schedule Time To: <span class="text-danger">*</span></label>
                            <input class="form-control" type="time" :name="TimeTo" v-model="newItem.timeTo" :id="timeTo">
                          </v-col> -->
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>

                <v-stepper-window-item :value="4">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12">
                        <h2 class="summary-title mb-6">
                          {{ $t("campaign.Campaign Summary") }}
                        </h2>

                        <!-- Basic Information Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Basic Information") }}
                          </h3>
                          <v-row>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Campaign Name") }}:
                                </div>
                                <div class="summary-value">
                                  {{ newItem.name }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Campaign Type") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.type === "simulatedPhishing"
                                      ? $t("campaign.Simulated Phishing")
                                      : newItem.type === "securityAwareness"
                                      ? $t("campaign.Security Awareness")
                                      : $t(
                                          "campaign.Simulated Phishing & Security Awareness"
                                        )
                                  }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Delivery Schedule Type") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.deliveryScheduleType ===
                                    "immediately"
                                      ? $t("campaign.Immediate Delivery")
                                      : newItem.deliveryScheduleType === "setup"
                                      ? $t("campaign.Setup Scheduled")
                                      : $t("campaign.Schedule Later")
                                  }}
                                </div>
                              </div>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- Selected Phishing Templates Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Selected Phishing Templates") }}
                          </h3>
                          <div class="template-chips-container">
                            <span
                              v-for="id in newItem.phishingTemplate_ids"
                              :key="id"
                              class="template-chip"
                            >
                              {{
                                phishingTemplates.find((t) => t.id === id)
                                  ?.name ||
                                $t("campaign.Phishing Templates Name")
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- Selected Training Modules Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Selected Training Modules") }}
                          </h3>
                          <div class="module-chips-container">
                            <span
                              v-for="id in newItem.lmsModule_ids"
                              :key="id"
                              class="module-chip"
                            >
                              <v-icon size="16" class="mr-1"
                                >mdi-book-open-variant</v-icon
                              >
                              {{
                                lmsModules.find((m) => m.id === id)?.name ||
                                $t("campaign.Training Module Name")
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- Target Audience Section -->
                        <div class="summary-section">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Target Audience") }}
                          </h3>
                          <v-row>
                            <v-col cols="12" md="6">
                              <div class="summary-field">
                                <div class="summary-label mb-2">
                                  {{ $t("campaign.Selected Groups") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.phishingGroups_id?.length > 0
                                      ? phishingGroups
                                          .filter((g) =>
                                            newItem.phishingGroups_id.includes(
                                              g.id
                                            )
                                          )
                                          .map((g) => g.name)
                                          .join(", ")
                                      : $t("campaign.Group1")
                                  }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="6">
                              <div class="summary-field">
                                <div class="summary-label mb-2">
                                  {{ $t("campaign.Selected Users") }}:
                                </div>
                                <AvatarGroup
                                  :users="getSelectedUsers()"
                                  :maxVisible="4"
                                  :spacing="20"
                                  :empty-text="$t('campaign.No users selected')"
                                  :clickable="true"
                                  @user-click="openUserDetailsModal"
                                />
                              </div>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>

            <v-card-actions class="d-flex justify-end">
              <v-btn
                class="back-btn"
                rounded
                :disabled="currentStep === 1"
                @click="backStep"
              >
                <v-icon left>mdi-arrow-left</v-icon> {{ $t("campaign.Back") }}
              </v-btn>

              <v-btn
                class="next-btn"
                v-if="currentStep < 4"
                rounded
                @click="nextStep"
              >
                {{ $t("campaign.Next") }} <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>

              <v-btn v-if="currentStep === 4" type="submit" class="next-btn">
                <v-icon left>mdi-check</v-icon> {{ $t("campaign.Submit") }}
              </v-btn>
            </v-card-actions>
          </div>

          <div v-else-if="newItem.type == 'securityAwareness'">
            <v-stepper v-model="currentStep">
              <v-stepper-header>
                <v-stepper-item
                  class="stepper-item"
                  :value="1"
                  :title="$t('campaign.Employee Selection')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="2"
                  :title="$t('campaign.Select Training Module')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="3"
                  :title="$t('campaign.Review & Submit')"
                />
              </v-stepper-header>

              <v-stepper-window>
                <v-stepper-window-item :value="1">
                  <v-row>
                    <v-col cols="6">
                      <v-label
                        >{{ $t("campaign.name") }}
                        <span class="text-danger">*</span></v-label
                      >
                      <input
                        class="form-control input-name"
                        type="text"
                        v-model="newItem.name"
                        required
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-label
                        >{{ $t("campaign.Type") }}
                        <span class="text-danger">*</span></v-label
                      >
                      <LazySelectField
                        name="type_2"
                        rules="required"
                        v-model="newItem.type"
                        :options="[
                          {
                            id: 'simulatedPhishing',
                            name: $t('campaign.Simulated Phishing'),
                          },
                          {
                            id: 'securityAwareness',
                            name: $t('campaign.Security Awareness'),
                          },
                          { id: 'both', name: $t('campaign.Both') },
                        ]"
                        option-label="name"
                        option-value="id"
                        :placeholder="$t('campaign.Select Type')"
                        clearable
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="5">
                          <v-label>{{
                            $t("campaign.Available Groups")
                          }}</v-label>
                          <select
                            class="form-select multiple-select"
                            aria-label="multiple select Groups"
                            multiple
                            v-model="selectedAvailableGroups"
                          >
                            <option
                              v-if="phishingGroups"
                              v-for="group in phishingGroups.filter(
                                (g) =>
                                  !newItem.phishingGroups_id?.includes(g.id)
                              )"
                              :value="group.id"
                              :key="group.id"
                              :selectable="isAvailableGroupSelectable"
                            >
                              {{ group.name }}
                            </option>
                          </select>
                        </v-col>

                        <v-col
                          cols="2"
                          class="d-flex flex-column justify-center align-center btns-section"
                        >
                          <v-btn
                            color="success"
                            class="mb-2 right-btn"
                            @click="moveToSelected(true)"
                            :disabled="!selectedAvailableGroups.length"
                          >
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-btn>
                          <v-btn
                            color="danger"
                            class="mb-2 left-btn"
                            @click="moveToSelected(false)"
                            :disabled="!selectedSelectedGroups.length"
                          >
                            <v-icon>mdi-chevron-left</v-icon>
                          </v-btn>
                          <v-btn
                            color="info"
                            class="mb-2 info-btn"
                            @click="showUsersModal(selectedSelectedGroups)"
                            :disabled="!selectedSelectedGroups.length"
                          >
                            <v-icon>mdi-account-details</v-icon>
                          </v-btn>
                        </v-col>

                        <v-col cols="5">
                          <v-label>{{
                            $t("campaign.Selected Groups")
                          }}</v-label>
                          <v-btn
                            color="warning"
                            class="mb-2 float-right"
                            @click="showUsersModal(newItem.phishingGroups_id)"
                            :disabled="!newItem.phishingGroups_id"
                          >
                            <v-icon>mdi-account-group</v-icon>
                            {{ $t("campaign.Filter Employees") }}
                          </v-btn>
                          <select
                            class="form-select multiple-select"
                            aria-label="multiple select Groups"
                            multiple
                            v-model="selectedSelectedGroups"
                          >
                            <option
                              v-if="phishingGroups"
                              v-for="group in phishingGroups.filter((g) =>
                                newItem.phishingGroups_id?.includes(g.id)
                              )"
                              :value="group.id"
                              :key="group.id"
                              :selectable="isSelectGroupSelectable"
                            >
                              {{ group.name }}
                            </option>
                          </select>
                        </v-col>
                      </v-row>

                      <!-- Users Modal -->
                      <v-dialog v-model="showUsersList" max-width="700px">
                        <v-card class="users-modal-card">
                          <v-card-title
                            class="d-flex justify-space-between align-center pa-4"
                          >
                            <span class="modal-title">{{
                              $t("campaign.Filter Selected Employees")
                            }}</span>
                            <v-btn
                              icon
                              size="small"
                              @click="showUsersList = false"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-card-title>
                          <v-card-text class="pa-0">
                            <div
                              v-if="selectedGroupUsers.length"
                              class="users-table-container"
                            >
                              <table class="users-table">
                                <thead>
                                  <tr class="table-header">
                                    <th class="text-center">#</th>
                                    <th class="text-center">
                                      {{ $t("campaign.Name") }}
                                    </th>
                                    <th class="text-center">
                                      {{ $t("campaign.Email") }}
                                    </th>
                                    <th class="text-center">
                                      {{ $t("campaign.Select") }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr
                                    v-for="(user, index) in selectedGroupUsers"
                                    :key="user.id"
                                    class="table-row"
                                  >
                                    <td class="text-center">{{ index + 1 }}</td>
                                    <td class="text-center">
                                      {{ user.full_name }}
                                    </td>
                                    <td class="text-center">
                                      {{ user.email }}
                                    </td>
                                    <td class="text-center">
                                      <v-checkbox
                                        v-model="selectedUsers"
                                        :value="user.id"
                                        color="#6E3894"
                                        hide-details
                                        class="user-checkbox"
                                      ></v-checkbox>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div v-else class="text-center pa-4">
                              {{
                                $t("campaign.No users found in these groups")
                              }}
                            </div>
                          </v-card-text>
                          <v-card-actions class="d-flex justify-end pa-4">
                            <v-btn
                              class="confirm-btn"
                              variant="flat"
                              @click="confirmUserSelection"
                            >
                              {{ $t("campaign.Confirm") }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                </v-stepper-window-item>

                <v-stepper-window-item :value="2">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="4">
                        <v-label>{{ $t("campaign.Filter By Course") }}</v-label>
                        <LazySelectField
                          name="course_id"
                          v-model="selectedCourse"
                          :placeholder="$t('campaign.Select course')"
                          :options="[{ id: null, name: 'All' }, ...courses]"
                          :on-update="getLmsLevels"
                          option-label="name"
                          option-value="id"
                          clearable
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-label>{{ $t("campaign.Filter By Level") }}</v-label>
                        <LazySelectField
                          name="lmsLevel_id"
                          v-model="selectedLevel"
                          :placeholder="$t('campaign.Select level')"
                          :options="[
                            { id: null, title: $t('campaign.All') },
                            ...lmsLevels,
                          ]"
                          :on-update="getLmsModules"
                          option-label="title"
                          option-value="id"
                          clearable
                        />
                      </v-col>
                      <v-col cols="4">
                        <label
                          >{{ $t("campaign.Day Until Due") }}:
                          <span class="text-danger">*</span></label
                        >
                        <input
                          class="form-control"
                          type="number"
                          :name="daysUntilDue"
                          v-model="newItem.daysUntilDue"
                          :id="daysUntilDue"
                        />
                      </v-col>
                      <v-divider></v-divider>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="mb-4">
                        <h3 class="text-h6">
                          {{ $t("campaign.Select Training Modules") }}
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        v-for="module in lmsModules"
                        :key="module.id"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                      >
                        <v-card
                          class="mx-auto"
                          :class="{
                            selected: newItem.lmsModule_ids?.includes(
                              module.id
                            ),
                          }"
                        >
                          <v-img
                            :src="module.fullCoverImagePath"
                            height="200"
                            cover
                          ></v-img>
                          <v-card-title class="text-subtitle-1">{{
                            module.name
                          }}</v-card-title>
                          <v-card-actions class="d-flex align-center pa-4">
                            <v-btn
                              @click="toggleModuleSelection(module.id)"
                              class="ma-0"
                              block
                              :class="
                                newItem.lmsModule_ids?.includes(module.id)
                                  ? 'selected-btn'
                                  : 'non-selected-btn'
                              "
                            >
                              {{
                                newItem.lmsModule_ids?.includes(module.id)
                                  ? $t("campaign.Selected")
                                  : $t("campaign.Select")
                              }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>

                <v-stepper-window-item :value="3">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12">
                        <h2 class="summary-title mb-6">
                          {{ $t("campaign.Campaign Summary") }}
                        </h2>

                        <!-- Basic Information Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Basic Information") }}
                          </h3>
                          <v-row>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Campaign Name") }}:
                                </div>
                                <div class="summary-value">
                                  {{ newItem.name }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Campaign Type") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.type === "simulatedPhishing"
                                      ? $t("campaign.Simulated Phishing")
                                      : newItem.type === "securityAwareness"
                                      ? $t("campaign.Security Awareness")
                                      : $t(
                                          "campaign.Simulated Phishing & Security Awareness"
                                        )
                                  }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Delivery Schedule Type") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.deliveryScheduleType ===
                                    "immediately"
                                      ? $t("campaign.Immediate Delivery")
                                      : newItem.deliveryScheduleType === "setup"
                                      ? $t("campaign.Setup Scheduled")
                                      : $t("campaign.Schedule Later")
                                  }}
                                </div>
                              </div>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- Selected Phishing Templates Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Selected Phishing Templates") }}
                          </h3>
                          <div class="template-chips-container">
                            <span
                              v-for="id in newItem.phishingTemplate_ids"
                              :key="id"
                              class="template-chip"
                            >
                              {{
                                phishingTemplates.find((t) => t.id === id)
                                  ?.name ||
                                $t("campaign.Phishing Templates Name")
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- Selected Training Modules Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Selected Training Modules") }}
                          </h3>
                          <div class="module-chips-container">
                            <span
                              v-for="id in newItem.lmsModule_ids"
                              :key="id"
                              class="module-chip"
                            >
                              <v-icon size="16" class="mr-1"
                                >mdi-book-open-variant</v-icon
                              >
                              {{
                                lmsModules.find((m) => m.id === id)?.name ||
                                $t("campaign.Training Module Name")
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- Target Audience Section -->
                        <div class="summary-section">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Target Audience") }}
                          </h3>
                          <v-row>
                            <v-col cols="12" md="6">
                              <div class="summary-field">
                                <div class="summary-label mb-2">
                                  {{ $t("campaign.Selected Groups") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.phishingGroups_id?.length > 0
                                      ? phishingGroups
                                          .filter((g) =>
                                            newItem.phishingGroups_id.includes(
                                              g.id
                                            )
                                          )
                                          .map((g) => g.name)
                                          .join(", ")
                                      : $t("campaign.Group1")
                                  }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="6">
                              <div class="summary-field">
                                <div class="summary-label mb-2">
                                  {{ $t("campaign.Selected Users") }}:
                                </div>
                                <AvatarGroup
                                  :users="getSelectedUsers()"
                                  :maxVisible="4"
                                  :spacing="20"
                                  :empty-text="$t('campaign.No users selected')"
                                  :clickable="true"
                                  @user-click="openUserDetailsModal"
                                />
                              </div>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>

            <v-card-actions class="d-flex justify-end">
              <v-btn
                class="back-btn"
                rounded
                :disabled="currentStep === 1"
                @click="backStep"
              >
                <v-icon left>mdi-arrow-left</v-icon> {{ $t("campaign.Back") }}
              </v-btn>

              <v-btn
                class="next-btn"
                v-if="currentStep < 3"
                rounded
                @click="nextStep"
              >
                {{ $t("campaign.Next") }} <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>

              <v-btn v-if="currentStep === 3" type="submit" class="next-btn">
                <v-icon left>mdi-check</v-icon> {{ $t("campaign.Submit") }}
              </v-btn>
            </v-card-actions>
          </div>

          <div v-else>
            <v-stepper v-model="currentStep">
              <v-stepper-header>
                <v-stepper-item
                  class="stepper-item"
                  :value="1"
                  :title="$t('campaign.Employee Selection')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="2"
                  :title="$t('campaign.Select Material')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="3"
                  :title="$t('campaign.Delivery Schedule')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="4"
                  :title="$t('campaign.Select Training Module')"
                />
                <v-divider></v-divider>
                <v-stepper-item
                  class="stepper-item"
                  :value="5"
                  :title="$t('campaign.Review & Submit')"
                />
              </v-stepper-header>

              <v-stepper-window>
                <v-stepper-window-item :value="1">
                  <v-row>
                    <v-col cols="6">
                      <v-label
                        >{{ $t("campaign.Name") }}
                        <span class="text-danger">*</span></v-label
                      >
                      <input
                        class="form-control input-name"
                        type="text"
                        v-model="newItem.name"
                        required
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-label
                        >{{ $t("campaign.Type") }}
                        <span class="text-danger">*</span></v-label
                      >
                      <LazySelectField
                        name="type_3"
                        rules="required"
                        v-model="newItem.type"
                        :options="[
                          {
                            id: 'simulatedPhishing',
                            name: $t('campaign.Simulated Phishing'),
                          },
                          {
                            id: 'securityAwareness',
                            name: $t('campaign.Security Awareness'),
                          },
                          { id: 'both', name: $t('campaign.Both') },
                        ]"
                        option-label="name"
                        option-value="id"
                        :placeholder="$t('campaign.Select Type')"
                        clearable
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="5">
                          <v-label>{{
                            $t("campaign.Available Groups")
                          }}</v-label>
                          <select
                            class="form-select multiple-select"
                            aria-label="multiple select Groups"
                            multiple
                            v-model="selectedAvailableGroups"
                          >
                            <option
                              v-if="phishingGroups"
                              v-for="group in phishingGroups.filter(
                                (g) =>
                                  !newItem.phishingGroups_id?.includes(g.id)
                              )"
                              :value="group.id"
                              :key="group.id"
                              :selectable="isAvailableGroupSelectable"
                            >
                              {{ group.name }}
                            </option>
                          </select>
                        </v-col>

                        <v-col
                          cols="2"
                          class="d-flex flex-column justify-center align-center btns-section"
                        >
                          <v-btn
                            color="success"
                            class="mb-2 right-btn"
                            @click="moveToSelected(true)"
                            :disabled="!selectedAvailableGroups.length"
                          >
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-btn>
                          <v-btn
                            color="danger"
                            class="mb-2 left-btn"
                            @click="moveToSelected(false)"
                            :disabled="!selectedSelectedGroups.length"
                          >
                            <v-icon>mdi-chevron-left</v-icon>
                          </v-btn>
                          <v-btn
                            color="info"
                            class="mb-2 info-btn"
                            @click="showUsersModal(selectedSelectedGroups)"
                            :disabled="!selectedSelectedGroups.length"
                          >
                            <v-icon>mdi-account-details</v-icon>
                          </v-btn>
                        </v-col>

                        <v-col cols="5">
                          <v-label>{{
                            $t("campaign.Selected Groups")
                          }}</v-label>
                          <v-btn
                            color="warning"
                            class="mb-2 float-right"
                            @click="showUsersModal(newItem.phishingGroups_id)"
                            :disabled="!newItem.phishingGroups_id"
                          >
                            <v-icon>mdi-account-group</v-icon>
                            {{ $t("campaign.Filter Employees") }}
                          </v-btn>
                          <select
                            class="form-select multiple-select"
                            aria-label="multiple select Groups"
                            multiple
                            v-model="selectedSelectedGroups"
                          >
                            <option
                              v-if="phishingGroups"
                              v-for="group in phishingGroups.filter((g) =>
                                newItem.phishingGroups_id?.includes(g.id)
                              )"
                              :value="group.id"
                              :key="group.id"
                              :selectable="isSelectGroupSelectable"
                            >
                              {{ group.name }}
                            </option>
                          </select>
                        </v-col>
                      </v-row>

                      <!-- Users Modal -->
                      <v-dialog v-model="showUsersList" max-width="700px">
                        <v-card class="users-modal-card">
                          <v-card-title
                            class="d-flex justify-space-between align-center pa-4"
                          >
                            <span class="modal-title">{{
                              $t("campaign.Filter Selected Employees")
                            }}</span>
                            <v-btn
                              icon
                              size="small"
                              @click="showUsersList = false"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-card-title>
                          <v-card-text class="pa-0">
                            <div
                              v-if="selectedGroupUsers.length"
                              class="users-table-container"
                            >
                              <table class="users-table">
                                <thead>
                                  <tr class="table-header">
                                    <th class="text-center">#</th>
                                    <th class="text-center">
                                      {{ $t("campaign.Name") }}
                                    </th>
                                    <th class="text-center">
                                      {{ $t("campaign.Email") }}
                                    </th>
                                    <th class="text-center">
                                      {{ $t("campaign.Select") }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr
                                    v-for="(user, index) in selectedGroupUsers"
                                    :key="user.id"
                                    class="table-row"
                                  >
                                    <td class="text-center">{{ index + 1 }}</td>
                                    <td class="text-center">
                                      {{ user.full_name }}
                                    </td>
                                    <td class="text-center">
                                      {{ user.email }}
                                    </td>
                                    <td class="text-center">
                                      <v-checkbox
                                        v-model="selectedUsers"
                                        :value="user.id"
                                        color="#6E3894"
                                        hide-details
                                        class="user-checkbox"
                                      ></v-checkbox>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div v-else class="text-center pa-4">
                              {{
                                $t("campaign.No users found in these groups")
                              }}
                            </div>
                          </v-card-text>
                          <v-card-actions class="d-flex justify-end pa-4">
                            <v-btn
                              class="confirm-btn"
                              variant="flat"
                              @click="confirmUserSelection"
                            >
                              {{ $t("campaign.Confirm") }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                </v-stepper-window-item>

                <v-stepper-window-item :value="2">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12" class="mb-4">
                        <h3 class="text-h6">
                          {{ $t("campaign.Select Phishing Templates") }}
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        v-for="phishingTemplate in phishingTemplates"
                        :key="phishingTemplate.id"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                        style="border-radius: 14px"
                      >
                        <v-card
                          class="mx-auto"
                          :class="{
                            selected: newItem.phishingTemplate_ids?.includes(
                              phishingTemplate.id
                            ),
                          }"
                        >
                          <v-img
                            :src="phishingTemplate?.fullAttachmentPath"
                            height="200"
                            cover
                          ></v-img>
                          <v-card-title class="text-subtitle-1">{{
                            phishingTemplate.name
                          }}</v-card-title>
                          <v-card-actions class="d-flex align-center pa-4">
                            <v-btn
                              @click="
                                toggleTemplateSelection(phishingTemplate.id)
                              "
                              class="ma-0"
                              block
                              :class="
                                newItem.phishingTemplate_ids?.includes(
                                  phishingTemplate.id
                                )
                                  ? 'selected-btn'
                                  : 'non-selected-btn'
                              "
                            >
                              {{
                                newItem.phishingTemplate_ids?.includes(
                                  phishingTemplate.id
                                )
                                  ? $t("campaign.Selected")
                                  : $t("campaign.Select")
                              }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>

                <v-stepper-window-item :value="3">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12">
                        <h3 class="text-h6">
                          {{ $t("campaign.Phishing Delivery Schedule") }}
                          <span class="text-danger">*</span>
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="9">
                        <v-row>
                          <v-col cols="4">
                            <label
                              :class="[
                                'btn',
                                'form-check-label',
                                newItem.deliveryScheduleType === 'immediately'
                                  ? 'selected-btn selected-schedule'
                                  : 'non-selected-btn non-selected-schedule',
                              ]"
                            >
                              <input
                                class="form-check-input"
                                type="radio"
                                :name="deliveryScheduleType"
                                value="immediately"
                                v-model="newItem.deliveryScheduleType"
                                :id="immediately"
                                :hidden="true"
                              />
                              {{ $t("campaign.Deliver Immediately") }}
                            </label>
                          </v-col>
                          <v-col cols="4">
                            <label
                              :class="[
                                'btn',
                                'form-check-label',
                                newItem.deliveryScheduleType === 'setup'
                                  ? 'selected-btn selected-schedule'
                                  : 'non-selected-btn non-selected-schedule',
                              ]"
                            >
                              <input
                                class="form-check-input"
                                type="radio"
                                :name="deliveryScheduleType"
                                value="setup"
                                v-model="newItem.deliveryScheduleType"
                                :id="setup"
                                :hidden="true"
                              />
                              {{ $t("campaign.Setup Schedule") }}
                            </label>
                          </v-col>
                          <v-col cols="4">
                            <label
                              :class="[
                                'btn',
                                'form-check-label',
                                newItem.deliveryScheduleType === 'later'
                                  ? 'selected-btn selected-schedule'
                                  : 'non-selected-btn non-selected-schedule',
                              ]"
                            >
                              <input
                                class="form-check-input"
                                type="radio"
                                :name="deliveryScheduleType"
                                value="later"
                                v-model="newItem.deliveryScheduleType"
                                :id="later"
                                :hidden="true"
                              />
                              {{ $t("campaign.Schedule Later") }}
                            </label>
                          </v-col>
                        </v-row>
                        <v-row v-if="newItem.deliveryScheduleType === 'setup'">
                          <v-col cols="12">
                            <strong>{{ $t("campaign.Note") }}:</strong>
                            {{
                              $t(
                                "campaign.This schedule is used only for email delivery We will capture employee interactions and assign trainings as long as a campaign remains active isnt updated or deleted"
                              )
                            }}.
                          </v-col>
                          <v-col cols="6">
                            <label
                              >{{ $t("campaign.Schedule Date From") }}:
                              <span class="text-danger">*</span></label
                            >
                            <input
                              class="form-control"
                              type="date"
                              :name="dateFrom"
                              v-model="newItem.dateFrom"
                              :id="dateFrom"
                            />
                          </v-col>
                          <v-col cols="6">
                            <label
                              >{{ $t("campaign.Schedule Date To") }}:
                              <span class="text-danger">*</span></label
                            >
                            <input
                              class="form-control"
                              type="date"
                              :name="dateTo"
                              v-model="newItem.dateTo"
                              :id="dateTo"
                            />
                          </v-col>
                          <!-- <v-col cols="6">
                            <label>Schedule Time From: <span class="text-danger">*</span></label>
                            <input class="form-control" type="time" :name="TimeFrom" v-model="newItem.timeFrom" :id="timeFrom">
                          </v-col>
                          <v-col cols="6">
                            <label>Schedule Time To: <span class="text-danger">*</span></label>
                            <input class="form-control" type="time" :name="TimeTo" v-model="newItem.timeTo" :id="timeTo">
                          </v-col> -->
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>

                <v-stepper-window-item :value="4">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="4">
                        <v-label>{{ $t("campaign.Filter By Course") }}</v-label>
                        <LazySelectField
                          name="course_id_2"
                          v-model="selectedCourse"
                          :placeholder="$t('campaign.Select course')"
                          :options="[{ id: null, name: 'All' }, ...courses]"
                          :on-update="getLmsLevels"
                          option-label="name"
                          option-value="id"
                          clearable
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-label>{{ $t("campaign.Filter By Level") }}</v-label>
                        <LazySelectField
                          name="lmsLevel_id_2"
                          v-model="selectedLevel"
                          :placeholder="$t('campaign.Select level')"
                          :options="[{ id: null, title: 'All' }, ...lmsLevels]"
                          :on-update="getLmsModules"
                          option-label="title"
                          option-value="id"
                          clearable
                        />
                      </v-col>
                      <v-col cols="4">
                        <label
                          >{{ $t("campaign.Day Until Due") }}:
                          <span class="text-danger">*</span></label
                        >
                        <input
                          class="form-control"
                          type="number"
                          :name="daysUntilDue"
                          v-model="newItem.daysUntilDue"
                          :id="daysUntilDue"
                        />
                      </v-col>
                      <v-divider></v-divider>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="mb-4">
                        <h3 class="text-h6">
                          {{ $t("campaign.Select Training Modules") }}
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        v-for="module in lmsModules"
                        :key="module.id"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                      >
                        <v-card
                          class="mx-auto"
                          :class="{
                            selected: newItem.lmsModule_ids?.includes(
                              module.id
                            ),
                          }"
                        >
                          <v-img
                            :src="module.fullCoverImagePath"
                            height="200"
                            cover
                          ></v-img>
                          <v-card-title class="text-subtitle-1">{{
                            module.name
                          }}</v-card-title>
                          <v-card-actions class="d-flex align-center pa-4">
                            <v-btn
                              @click="toggleModuleSelection(module.id)"
                              class="ma-0"
                              block
                              :class="
                                newItem.lmsModule_ids?.includes(module.id)
                                  ? 'selected-btn'
                                  : 'non-selected-btn'
                              "
                            >
                              {{
                                newItem.lmsModule_ids?.includes(module.id)
                                  ? $t("campaign.Selected")
                                  : $t("campaign.Select")
                              }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>

                <v-stepper-window-item :value="5">
                  <v-container fluid>
                    <v-row>
                      <v-col cols="12">
                        <h2 class="summary-title mb-6">
                          {{ $t("campaign.Campaign Summary") }}
                        </h2>

                        <!-- Basic Information Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Basic Information") }}
                          </h3>
                          <v-row>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Campaign Name") }}:
                                </div>
                                <div class="summary-value">
                                  {{ newItem.name }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Campaign Type") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.type === "simulatedPhishing"
                                      ? $t("campaign.Simulated Phishing")
                                      : newItem.type === "securityAwareness"
                                      ? $t("campaign.Security Awareness")
                                      : $t(
                                          "campaign.Simulated Phishing & Security Awareness"
                                        )
                                  }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="4">
                              <div class="summary-field">
                                <div class="summary-label">
                                  {{ $t("campaign.Delivery Schedule Type") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.deliveryScheduleType ===
                                    "immediately"
                                      ? $t("campaign.Immediate Delivery")
                                      : newItem.deliveryScheduleType === "setup"
                                      ? $t("campaign.Setup Scheduled")
                                      : $t("campaign.Schedule Later")
                                  }}
                                </div>
                              </div>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- Selected Phishing Templates Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Selected Phishing Templates") }}
                          </h3>
                          <div class="template-chips-container">
                            <span
                              v-for="id in newItem.phishingTemplate_ids"
                              :key="id"
                              class="template-chip"
                            >
                              {{
                                phishingTemplates.find((t) => t.id === id)
                                  ?.name ||
                                $t("campaign.Phishing Templates Name")
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- Selected Training Modules Section -->
                        <div class="summary-section mb-5">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Selected Training Modules") }}
                          </h3>
                          <div class="module-chips-container">
                            <span
                              v-for="id in newItem.lmsModule_ids"
                              :key="id"
                              class="module-chip"
                            >
                              <v-icon size="16" class="mr-1"
                                >mdi-book-open-variant</v-icon
                              >
                              {{
                                lmsModules.find((m) => m.id === id)?.name ||
                                $t("campaign.Training Module Name")
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- Target Audience Section -->
                        <div class="summary-section">
                          <h3 class="summary-section-title mb-4">
                            {{ $t("campaign.Target Audience") }}
                          </h3>
                          <v-row>
                            <v-col cols="12" md="6">
                              <div class="summary-field">
                                <div class="summary-label mb-2">
                                  {{ $t("campaign.Selected Groups") }}:
                                </div>
                                <div class="summary-value">
                                  {{
                                    newItem.phishingGroups_id?.length > 0
                                      ? phishingGroups
                                          .filter((g) =>
                                            newItem.phishingGroups_id.includes(
                                              g.id
                                            )
                                          )
                                          .map((g) => g.name)
                                          .join(", ")
                                      : $t("campaign.Group1")
                                  }}
                                </div>
                              </div>
                            </v-col>
                            <v-col cols="12" md="6">
                              <div class="summary-field">
                                <div class="summary-label mb-2">
                                  {{ $t("campaign.Selected Users") }}:
                                </div>
                                <AvatarGroup
                                  :users="getSelectedUsers()"
                                  :maxVisible="4"
                                  :spacing="20"
                                  :empty-text="$t('campaign.No users selected')"
                                  :clickable="true"
                                  @user-click="openUserDetailsModal"
                                />
                              </div>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>

            <v-card-actions class="d-flex justify-end">
              <v-btn
                class="back-btn"
                rounded
                :disabled="currentStep === 1"
                @click="backStep"
              >
                <v-icon left>mdi-arrow-left</v-icon> {{ $t("campaign.Back") }}
              </v-btn>

              <v-btn
                class="next-btn"
                v-if="currentStep < 5"
                rounded
                @click="nextStep"
              >
                {{ $t("campaign.Next") }} <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>

              <v-btn v-if="currentStep === 5" type="submit" class="next-btn">
                <v-icon left>mdi-check</v-icon> {{ $t("campaign.Submit") }}
              </v-btn>
            </v-card-actions>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- View campaign modal -->
  <v-dialog v-model="viewModal" max-width="1000px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4 rtl">
        <span class="modal-title">{{ $t("campaign.Campaign Details") }}</span>
        <v-btn icon size="small" @click="closeViewModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <!-- Basic Information Section -->
              <div class="summary-section mb-5">
                <h3 class="summary-section-title mb-4 rtl">
                  {{ $t("campaign.Basic Information") }}
                </h3>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="summary-field">
                      <div class="summary-label">
                        {{ $t("campaign.Campaign Name") }}:
                      </div>
                      <div class="summary-value">{{ newItem.name }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="summary-field">
                      <div class="summary-label">
                        {{ $t("campaign.Campaign Type") }}:
                      </div>
                      <div class="summary-value">
                        {{
                          newItem.type === "simulatedPhishing"
                            ? $t("campaign.Simulated Phishing")
                            : newItem.type === "securityAwareness"
                            ? $t("campaign.Security Awareness")
                            : $t(
                                "campaign.Simulated Phishing & Security Awareness"
                              )
                        }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="summary-field">
                      <div class="summary-label">
                        {{ $t("campaign.Delivery Schedule Type") }}:
                      </div>
                      <div class="summary-value">
                        {{
                          newItem.deliveryScheduleType === "immediately"
                            ? $t("campaign.Immediate Delivery")
                            : newItem.deliveryScheduleType === "setup"
                            ? $t("campaign.Setup Scheduled")
                            : $t("campaign.Schedule Later")
                        }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" v-if="newItem.comment">
                    <div class="summary-field">
                      <div class="summary-label">
                        {{ $t("campaign.Rejected Comment") }}:
                      </div>
                      <div class="summary-value">{{ newItem.comment }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Schedule Details Section -->
              <div
                class="summary-section mb-5"
                v-if="newItem.deliveryScheduleType === 'setup'"
              >
                <h3 class="summary-section-title mb-4 rtl">
                  {{ $t("campaign.Schedule Details") }}
                </h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="summary-field">
                      <div class="summary-label">
                        {{ $t("campaign.Start Date") }}:
                      </div>
                      <div class="summary-value">{{ newItem.dateFrom }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="summary-field">
                      <div class="summary-label">
                        {{ $t("campaign.End Date") }}:
                      </div>
                      <div class="summary-value">{{ newItem.dateTo }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Selected Phishing Templates Section -->
              <div
                class="summary-section mb-5"
                v-if="
                  newItem.phishingTemplate_ids &&
                  newItem.phishingTemplate_ids.length > 0
                "
              >
                <h3 class="summary-section-title mb-4 rtl">
                  {{ $t("campaign.Selected Phishing Templates") }}
                </h3>
                <div class="template-chips-container">
                  <span
                    v-for="id in newItem.phishingTemplate_ids"
                    :key="id"
                    class="template-chip"
                  >
                    {{
                      phishingTemplates.find((t) => t.id === id)?.name ||
                      $t("campaign.Phishing Templates Name")
                    }}
                  </span>
                </div>
              </div>

              <!-- Selected Training Modules Section -->
              <div
                class="summary-section mb-5"
                v-if="newItem.lmsModule_ids && newItem.lmsModule_ids.length > 0"
              >
                <h3 class="summary-section-title mb-4 rtl">
                  {{ $t("campaign.Selected Training Modules") }}
                </h3>
                <div class="module-chips-container">
                  <span
                    v-for="id in newItem.lmsModule_ids"
                    :key="id"
                    class="module-chip"
                  >
                    <v-icon size="16" class="mr-1"
                      >mdi-book-open-variant</v-icon
                    >
                    {{
                      lmsModules.find((m) => m.id === id)?.name ||
                      $t("campaign.Training Module Name")
                    }}
                  </span>
                </div>
              </div>

              <!-- Target Audience Section -->
              <div
                class="summary-section"
                v-if="
                  newItem.phishingGroups_id &&
                  newItem.phishingGroups_id.length > 0
                "
              >
                <h3 class="summary-section-title mb-4 rtl">
                  {{ $t("campaign.Target Audience") }}
                </h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="summary-field">
                      <div class="summary-label mb-2">
                        {{ $t("campaign.Selected Groups") }}:
                      </div>
                      <div class="summary-value">
                        {{
                          newItem.phishingGroups_id?.length > 0
                            ? phishingGroups
                                .filter((g) =>
                                  newItem.phishingGroups_id.includes(g.id)
                                )
                                .map((g) => g.name)
                                .join(", ")
                            : $t("campaign.Group1")
                        }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="summary-field">
                      <div class="summary-label mb-2">
                        {{ $t("campaign.Selected Users") }}:
                      </div>
                      <AvatarGroup
                        :users="getSelectedUsers()"
                        :maxVisible="4"
                        :spacing="20"
                        :empty-text="$t('campaign.No users selected')"
                        :clickable="true"
                        @user-click="openUserDetailsModal"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- comment campaign modal -->
  <v-dialog v-model="commentModal" max-width="460px" persistent>
    <v-card rounded="lg" elevation="3">
      <v-card-title class="d-flex justify-space-between align-center pa-4 rtl">
        <span class="title-dialog">{{ $t("campaign.Reject Comment") }}</span>
        <buttom @click="closeCommentModal">
          <v-icon>mdi-close</v-icon>
        </buttom>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form @submit.prevent="changeStatusToReject">
          <v-textarea
            v-model="newItem.comment"
            rows="5"
            variant="outlined"
            hide-details="auto"
            required
            :rules="[(v) => !!v || $t('campaign.Comment is required')]"
            :placeholder="$t('campaign.Enter your comment...')"
            class="mb-4"
          ></v-textarea>

          <v-card-actions class="d-flex justify-end pa-0 ga-3">
            <buttom
              @click="closeCommentModal"
              class="btn-cancel text-capitalize"
            >
              {{ $t("campaign.Cancel") }}
            </buttom>
            <buttom
              @click="changeStatusToReject"
              type="submit"
              class="btn-submit text-capitalize"
            >
              {{ $t("campaign.Submit") }}
            </buttom>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- View user details modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />
</template>

<script>
// Importing necessary components and API modules
import campaign from "@/API/Campaign/Campaign";
import campaignStatistics from "@/API/CampaignStatistics/CampaignStatistics";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import Auth from "@/API/Auth";
import phishingGroup from "@/API/PhishingGroup/PhishingGroup";
import phishingTemplate from "@/API/PhishingTemplate/PhishingTemplate";
import lmsModule from "@/API/LmsModule/LmsModule";
import course from "@/API/Course/Course";
import lmsLevel from "@/API/LmsLevel/LmsLevel";
import user from "@/API/User/User";
import department from "@/API/Department/Department";
import Swal from "sweetalert2";
import AvatarGroup from "@/components/AvatarGroup.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import { notify } from "@kyvg/vue3-notification";
import VueSelect from "vue-select";
import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";

// Configure Highcharts global options
Highcharts.setOptions({
  lang: {
    decimalPoint: ".",
    thousandsSep: ",",
  },
  credits: {
    enabled: false,
  },
  chart: {
    style: {
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
  },
});

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    TabsComponent, // Tabs component for campaign filtering
    vSelect,
    "vue-select": VueSelect,
    highcharts: Chart, // Highcharts component for charts
    AvatarGroup,
    ViewUserDetails,
    LazySelectField,
  },

  setup() {
    // Initialize API and other required properties
    const api = new campaign();
    const campaignStatisticsApi = new campaignStatistics();
    const phishingGroupApi = new phishingGroup();
    const phishingTemplateApi = new phishingTemplate();
    const lmsModuleApi = new lmsModule();
    const courseApi = new course();
    const lmsLevelApi = new lmsLevel();
    const userApi = new user();
    const departmentApi = new department();
    // const relations = ["phishingTemplates", "lmsModules", "users"];
    const apiParams = { filter: "" /*, with: relations*/ };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      campaignStatisticsApi,
      apiParams,
      tableColumns,
      fromFields,
      phishingGroupApi,
      phishingTemplateApi,
      lmsModuleApi,
      courseApi,
      lmsLevelApi,
      userApi,
      departmentApi,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: row.status === "approved" || row.status === "rejected", // hide for both approved and rejected
          delete: row.status === "approved" || row.status === "rejected", // hide for both approved and rejected
        };
      };
    },

    campaignTabs() {
      return [
        {
          id: "all",
          label: `${this.$t("campaign.All Campaigns")} (${
            this.totalCampaigns
          })`,
        },
        {
          id: "simulatedPhishing",
          label: `${this.$t("campaign.Simulated Phishing")} (${
            this.simulatedPhishingCampaigns
          })`,
        },
        {
          id: "securityAwareness",
          label: `${this.$t("campaign.Security Awareness")} (${
            this.securityAwarenessCampaigns
          })`,
        },
        {
          id: "both",
          label: `${this.$t(
            "campaign.Simulated Phishing & Security Awareness"
          )} (${this.bothCampaigns})`,
        },
      ];
    },

    // Percentage calculations for statistics table
    phishingPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.simulatedPhishingCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    awarenessPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.securityAwarenessCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    bothPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.bothCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    pendingPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.pendingCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    approvedPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.approvedCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    rejectedPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.rejectedCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    ondemandPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.ondemandCampaigns / this.totalCampaigns) * 100)
        : 0;
    },

    scheduledPercentage() {
      return this.totalCampaigns > 0
        ? Math.round((this.schedualedCampaigns / this.totalCampaigns) * 100)
        : 0;
    },
  },

  async mounted() {
    await this.fetchStatistics();
    await this.fetchUserBasedStatistics();
    // Fetch select
    // Fetch phishing groups
    this.phishingGroups = await this.phishingGroupApi.getAll({ select: "id|name|user_ids" });
    // Fetch all users from external service
    this.allUsers = await this.userApi.getAll({ select: "id|full_name|type|email|phone|username|department_id" });
    // Fetch phishing templates
    this.phishingTemplates = await this.phishingTemplateApi.getAll({ select: "id|name|attachment|fullAttachmentPath" });
    // Fetch LMS modules
    this.lmsModules = await this.lmsModuleApi.getAll({
      select: "id|name|level_id|coverImage|fullCoverImagePath",
      with: ["level.course"],
    });
    this.lmsModules = this.lmsModules.filter((module) => {
      // First condition: level.levelType.campaign is true
      if (module.level?.levelType?.campaign == "true") {
        return true;
      }
      // Second condition: level has all flags false AND course campaign is true
      if (
        module.level?.levelType?.campaign == "false" &&
        module.level?.levelType?.mandatory == "false" &&
        module.level?.levelType?.optional == "false" &&
        module.level?.course?.courseType?.campaign == "true"
      ) {
        return true;
      }
      // Otherwise exclude
      return false;
    });
    // Fetch courses
    this.courses = await this.courseApi.getAll({ 
      select: "id|name|name|courseType",
      with: ["levels"]
    });
    this.courses = this.courses.filter(
      (course) =>
        course.courseType?.campaign === "true" ||
        (course.levels && course.levels.some((level) => level?.levelType?.campaign === "true"))
    );
    // Fetch LMS levels
    this.lmsLevels = await this.lmsLevelApi.getAll({ select: "id|title|levelType" });
    this.lmsLevels = this.lmsLevels.filter(
      (level) => level?.levelType?.campaign == "true"
    );
    // Fetch departments for user details modal
    this.departmentsData = await this.departmentApi.getAll({ select: "id|name" });
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      opencreateModal: false,
      commentModal: false,
      currentStep: 1,
      totalSteps: 5,
      showUsersList: false,
      selectedGroupUsers: [],
      selectedUsers: [],
      selectedAvailableGroups: [],
      selectedSelectedGroups: [],
      form: {
        name: "",
        status: "",
        type: "",
        user_ids: [],
        phishingGroup_ids: [],
        phishingTemplate_ids: [],
        lmsModule_ids: [],
        daysUntilDue: "",
        deliveryScheduleType: "",
        dateFrom: "",
        dateTo: "",
        // timeFrom: "",
        // timeTo: "",
      },
      phishingGroups: [],
      allUsers: [],
      phishingTemplates: [],
      lmsModules: [],
      courses: [],
      lmsLevels: [],
      viewModal: false,
      viewUserModal: false,
      userData: {},
      departmentsData: [],
      selectedCourse: null,
      selectedLevel: null,
      activeTab: "all",
      filter: {
        type: "",
      },
      campaignsData: [],
      // Statistics filters
      statisticsFilters: {
        dateRange: "all",
        campaignType: "all",
        status: "all",
        deliverySchedule: "all",
      },
      filteredCampaignsData: [],
      totalCampaigns: 0,
      simulatedPhishingCampaigns: 0,
      securityAwarenessCampaigns: 0,
      bothCampaigns: 0,
      pendingCampaigns: 0,
      approvedCampaigns: 0,
      completedCampaigns: 0,
      ondemandCampaigns: 0,
      schedualedCampaigns: 0,
      rejectedCampaigns: 0,
      // Chart configurations
      campaignStatusChart: {},
      campaignTypeChart: {},
      deliveryScheduleChart: {},
      campaignTimelineChart: {},
      campaignCompletionChart: {},
      userEngagementChart: {},
      // New Campaign & Phishing Analytics Charts
      campaignPhishingTypeChart: {},
      campaignStatusOverviewChart: {},
      phishingVsAwarenessChart: {},
      deliveryScheduleAnalysisChart: {},
      completeCampaignMetricsChart: {},
      // Phishing Mail Analytics Charts
      mailDeliveryStatusChart: {},
      phishingSuccessRateChart: {},
      phishingUserEngagementChart: {},
      phishingEmailTimelineChart: {},
      phishingTemplatePerformanceChart: {},
      // User-Based Phishing Statistics Charts
      phishingEmailsDeliveredChart: {},
      phishingCampaignsStatisticsChart: {},
      phishingEmployeesStatisticsChart: {},
      // Employee statistics data
      employeeStatistics: [],
      // User-based statistics raw data from API
      trackingMailData: [],
      monthlyMailStatistics: [],
      campaignMailStatistics: [],
      employeeMailStatistics: [],
      // Phishing mail statistics
      mailsSent: 0,
      mailsPending: 0,
      phishingCampaignsWithMails: 0,
      totalPhishingUsers: 0,
      // Color schema for all statistics charts
      colors: [
        { name: "Crimson Earth", background: "#EED3D380", avatar: "#A92525", text: "#541212" },
        { name: "Golden Olive", background: "#F3EAD180", avatar: "#C4951B", text: "#A37C16" },
        { name: "Forest Deep", background: "#B6CAAE80", avatar: "#255F0B", text: "#122F05" },
        { name: "Steel Grey", background: "#D9D9D9", avatar: "#999999", text: "#404040" }
      ],
      filterData: [
        {
          title: this.$t("campaign.Type"),
          key: "type",
          type: "string",
          data: [
            { id: "simulatedPhishing", name: this.$t("campaign.simulatedPhishing") },
            { id: "securityAwareness", name: this.$t("campaign.securityAwareness") },
            { id: "both", name: this.$t("campaign.both") },
          ],
          filterType: "filter",
        },
        {
          title: this.$t("campaign.Status"),
          key: "status",
          type: "string",
          data: [
            { id: "pending", name: this.$t("campaign.pending") },
            { id: "rejected", name: this.$t("campaign.rejected") },
            { id: "approved", name: this.$t("campaign.approved") },
            { id: "sent", name: this.$t("campaign.sent") },
          ],
          filterType: "filter",
        },
        {
          title: this.$t("campaign.Delivery Schedule Type"),
          key: "deliveryScheduleType",
          type: "string",
          data: [
            { id: "immediately", name: this.$t("campaign.immediately") },
            { id: "later", name: this.$t("campaign.later") },
            { id: "setup", name: this.$t("campaign.setup") },
          ],
          filterType: "filter",
        },
        {
          title: this.$t("campaign.Users"),
          key: "user_ids",
          type: "string",
          data: "User",
          filterType: "filterIn",
        },
        {
          title: this.$t("campaign.Phishing Groups"),
          key: "phishingGroups_id",
          type: "string",
          data: "PhishingGroup",
          filterType: "filterIn",
        },
        {
          title: this.$t("campaign.Phishing Templates"),
          key: "phishingTemplate_ids",
          type: "string",
          data: "PhishingTemplate",
          filterType: "filterIn",
        },
        {
          title: this.$t("campaign.Lms Modules"),
          key: "lmsModule_ids",
          type: "string",
          data: "LmsModule",
          filterType: "filterIn",
        },
      ],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "name", title: this.$t("campaign.name"), data: "name", defaultContent: "N/A" },
      { id: "type", title: this.$t("campaign.type"), data: "type", defaultContent: "N/A" },
      { id: "deliveryStatus", title: this.$t("campaign.deliveryStatus"), data: "", defaultContent: "N/A" },
      { id: "dateFrom", title: this.$t("campaign.dateFrom"), data: "dateFrom", defaultContent: "N/A" },
      { id: "dateTo", title: this.$t("campaign.dateTo"), data: "dateTo", defaultContent: "N/A" },
      { id: "status", title: this.$t("campaign.status"), data: "status", defaultContent: "N/A" },
    ];
  },

  methods: {
    // Helper method to get avatar color based on index
    getAvatarColor(index) {
      const colors = ["#6E3894", "#4CAF50", "#FF9800", "#2196F3"];
      return colors[index % colors.length];
    },

    // Helper method to get initials from name
    getInitials(name) {
      if (!name) return "?";
      const words = name.trim().split(" ");
      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    },

    // Get selected users as user objects for AvatarGroup
    getSelectedUsers() {
      if (!this.selectedUsers || !Array.isArray(this.selectedUsers)) return [];
      // First try selectedGroupUsers, then fall back to allUsers
      const userSource = this.selectedGroupUsers.length > 0 ? this.selectedGroupUsers : this.allUsers;
      return this.selectedUsers
        .map(userId => userSource.find(user => user.id === userId))
        .filter(user => user);
    },

    // Open user details modal
    openUserDetailsModal(selectedUserData) {
      if (!selectedUserData) return;
      this.userData = { ...selectedUserData };
      try {
        const userDepartment = this.departmentsData.find(dept => dept.id === this.userData.department_id) || {};
        this.userData.department = userDepartment.name || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    async fetchStatistics() {
      try {
        this.campaignsData = await this.api.getAll({
          select: "id|name|type|status|isMailSent|deliveryScheduleType|created_at|dateFrom|dateTo|user_ids|phishingTemplate_ids|created_at",
        });

        // Apply filters initially
        this.applyStatisticsFilters();
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    },

    async fetchUserBasedStatistics() {
      try {
        // Fetch tracking mail data with user and campaign information
        this.trackingMailData = await this.campaignStatisticsApi.getAll({
          select: "id|template_id|user_id|campaign_id|received_at|opend_at|downloadFile_at|clickLink_at|submitForm_at|rate|created_at",
          with: ["campaign"],
        });

        // Process the data for monthly statistics
        this.processMonthlyStatistics();

        // Process the data for campaign-based statistics
        this.processCampaignStatistics();

        // Process the data for employee-based statistics
        this.processEmployeeStatistics();

        // Build the charts with the processed data
        this.buildUserBasedStatisticsCharts();
      } catch (error) {
        console.error("Error fetching user-based statistics:", error);
      }
    },

    processMonthlyStatistics() {
      // Group tracking data by month
      const monthlyData = {};
      this.trackingMailData.forEach((item) => {
        if (!item.created_at) return;
        const date = new Date(item.created_at);
        const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} '${date.getFullYear().toString().slice(-2)}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            opened: 0,
            clicked: 0,
            submitted: 0,
            downloaded: 0,
          };
        }
        if (item.opened_count > 0) monthlyData[monthKey].opened++;
        if (item.clicked_link_count > 0) monthlyData[monthKey].clicked++;
        if (item.form_submitted_count > 0) monthlyData[monthKey].submitted++;
        if (item.file_downloaded_count > 0) monthlyData[monthKey].downloaded++;
      });
      this.monthlyMailStatistics = Object.values(monthlyData);
    },

    processCampaignStatistics() {
      // Group tracking data by campaign
      const campaignData = {};
      this.trackingMailData.forEach((item) => {
        if (!item.campaign) return;
        const campaignName = item.campaign.name || 'Unknown Campaign';
        if (!campaignData[campaignName]) {
          campaignData[campaignName] = {
            name: campaignName,
            emails: 0,
            employees: new Set(),
            opened: 0,
            clicked: 0,
            submitted: 0,
            downloaded: 0,
          };
        }
        campaignData[campaignName].emails++;
        if (item.user_id) {
          campaignData[campaignName].employees.add(item.user_id);
        }
        campaignData[campaignName].opened += item.opened_count || 0;
        campaignData[campaignName].clicked += item.clicked_link_count || 0;
        campaignData[campaignName].submitted += item.form_submitted_count || 0;
        campaignData[campaignName].downloaded += item.file_downloaded_count || 0;
      });
      this.campaignMailStatistics = Object.values(campaignData).map(campaign => ({
        ...campaign,
        employees: campaign.employees.size,
      }));
    },

    processEmployeeStatistics() {
      // Group tracking data by employee
      const employeeData = {};
      this.trackingMailData.forEach((item) => {
        if (!item.user) return;
        const userName = item.user.name || 'Unknown User';
        const userId = item.user.id;
        const userEmail = item.user.email || '';
        if (!employeeData[userId]) {
          employeeData[userId] = {
            id: userId,
            name: userName,
            email: userEmail,
            campaigns: new Set(),
            opened: 0,
            submitted: 0,
            downloaded: 0,
            clicked: 0,
          };
        }
        if (item.campaign_id) {
          employeeData[userId].campaigns.add(item.campaign_id);
        }
        employeeData[userId].opened += item.opened_count || 0;
        employeeData[userId].clicked += item.clicked_link_count || 0;
        employeeData[userId].submitted += item.form_submitted_count || 0;
        employeeData[userId].downloaded += item.file_downloaded_count || 0;
      });
      // Calculate risk scores and prepare table data
      this.employeeMailStatistics = Object.values(employeeData).map(employee => ({
        ...employee,
        campaigns: employee.campaigns.size,
      }));
      // Calculate risk scores for the table
      this.employeeStatistics = this.employeeMailStatistics.map(employee => {
        // Risk score calculation: weighted sum of actions
        const riskScore = (
          (employee.clicked * 25) +
          (employee.submitted * 35) +
          (employee.downloaded * 40)
        ) / (employee.campaigns || 1);
        return {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          riskScore: Math.min(100, riskScore).toFixed(2),
        };
      }).sort((a, b) => b.riskScore - a.riskScore);
    },

    applyStatisticsFilters() {
      // Start with all campaigns
      let filtered = [...this.campaignsData];
      // Apply date range filter
      if (this.statisticsFilters.dateRange !== "all") {
        const now = new Date();
        let startDate;
        switch (this.statisticsFilters.dateRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
          case "quarter":
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
        if (startDate) {
          filtered = filtered.filter((campaign) => {
            const campaignDate = new Date(campaign.created_at);
            return campaignDate >= startDate;
          });
        }
      }
      // Apply campaign type filter
      if (this.statisticsFilters.campaignType !== "all") {
        filtered = filtered.filter(
          (campaign) => campaign.type === this.statisticsFilters.campaignType
        );
      }
      // Apply status filter
      if (this.statisticsFilters.status !== "all") {
        filtered = filtered.filter(
          (campaign) => campaign.status === this.statisticsFilters.status
        );
      }
      // Apply delivery schedule filter
      if (this.statisticsFilters.deliverySchedule !== "all") {
        if (this.statisticsFilters.deliverySchedule === "onDemand") {
          filtered = filtered.filter(
            (campaign) => campaign.deliveryScheduleType === "later"
          );
        } else if (this.statisticsFilters.deliverySchedule === "scheduled") {
          filtered = filtered.filter(
            (campaign) => campaign.deliveryScheduleType === "setup"
          );
        }
      }
      // Update filtered data
      this.filteredCampaignsData = filtered;
      // Recalculate statistics based on filtered data
      this.calculateStatistics();
    },

    calculateStatistics() {
      const data                      = this.filteredCampaignsData;
      this.totalCampaigns             = data.length;
      this.simulatedPhishingCampaigns = data.filter((g) => g.type == "simulatedPhishing").length || 0;
      this.securityAwarenessCampaigns = data.filter((g) => g.type == "securityAwareness").length || 0;
      this.bothCampaigns              = data.filter((g) => g.type == "both").length || 0;
      this.pendingCampaigns           = data.filter((g) => g.status == "pending").length || 0;
      this.approvedCampaigns          = data.filter((g) => g.status == "approved").length || 0;
      this.rejectedCampaigns          = data.filter((g) => g.status == "rejected").length || 0;
      this.completedCampaigns         = data.filter((g) => g.isMailSent == 1).length || 0;
      this.ondemandCampaigns          = data.filter((g) => g.deliveryScheduleType == "later" && !g.isMailSent).length || 0;
      this.schedualedCampaigns        = data.filter((g) => g.deliveryScheduleType == "setup" && !g.isMailSent).length || 0;
      // Calculate phishing mail statistics
      const phishingCampaigns = data.filter(
        (g) => g.type == "simulatedPhishing" || g.type == "both"
      );
      this.phishingCampaignsWithMails = phishingCampaigns.length;
      this.mailsSent                  = phishingCampaigns.filter((g) => g.isMailSent == 1).length || 0;
      this.mailsPending               = phishingCampaigns.filter((g) => !g.isMailSent).length || 0;
      // Calculate total users in phishing campaigns
      this.totalPhishingUsers = phishingCampaigns.reduce((total, campaign) => {
        const userCount = Array.isArray(campaign.user_ids)
          ? campaign.user_ids.length
          : 0;
        return total + userCount;
      }, 0);
      // Rebuild charts with filtered data
      this.buildCampaignCharts();
      this.buildCampaignPhishingCharts();
      this.buildPhishingMailCharts();
      this.buildUserBasedStatisticsCharts();
    },

    resetStatisticsFilters() {
      this.statisticsFilters = {
        dateRange: "all",
        campaignType: "all",
        status: "all",
        deliverySchedule: "all",
      };
      this.applyStatisticsFilters();
    },

    exportStatisticsToExcel() {
      try {
        // Prepare comprehensive data for Excel export
        const data = [
          // Main Header
          ["CAMPAIGN & PHISHING COMPLETE STATISTICS REPORT", "", "", "", "", ""],
          [`Generated on: ${new Date().toLocaleDateString()}`, "", "", "", "", ""],
          [],
          // Applied Filters Section
          ["APPLIED FILTERS", "", "", "", "", ""],
          ["Date Range", this.getFilterLabel('dateRange'), "", "", "", ""],
          ["Campaign Type", this.getFilterLabel('campaignType'), "", "", "", ""],
          ["Status", this.getFilterLabel('status'), "", "", "", ""],
          ["Delivery Schedule", this.getFilterLabel('deliverySchedule'), "", "", "", ""],
          [],
          // ============ SUMMARY STATISTICS ============
          ["========== SUMMARY STATISTICS ==========", "", "", "", "", ""],
          ["Metric", "Count", "Percentage", "", "", ""],
          [],
          // Campaign Types
          ["CAMPAIGN TYPES", "", "", "", "", ""],
          ["Simulated Phishing Campaigns", this.simulatedPhishingCampaigns, `${this.phishingPercentage}%`, "", "", ""],
          ["Security Awareness Campaigns", this.securityAwarenessCampaigns, `${this.awarenessPercentage}%`, "", "", ""],
          ["Both Types Campaigns", this.bothCampaigns, `${this.bothPercentage}%`, "", "", ""],
          [],
          // Campaign Status
          ["CAMPAIGN STATUS", "", "", "", "", ""],
          ["Pending Campaigns", this.pendingCampaigns, `${this.pendingPercentage}%`, "", "", ""],
          ["Approved Campaigns", this.approvedCampaigns, `${this.approvedPercentage}%`, "", "", ""],
          ["Rejected Campaigns", this.rejectedCampaigns, `${this.rejectedPercentage}%`, "", "", ""],
          [],
          // Delivery Schedule
          ["DELIVERY SCHEDULE", "", "", "", "", ""],
          ["On-Demand Campaigns", this.ondemandCampaigns, `${this.ondemandPercentage}%`, "", "", ""],
          ["Scheduled Campaigns", this.schedualedCampaigns, `${this.scheduledPercentage}%`, "", "", ""],
          [],
          // Overall Summary
          ["OVERALL SUMMARY", "", "", "", "", ""],
          ["Total Campaigns", this.totalCampaigns, "100%", "", "", ""],
          [],
          [],
          // ============ PHISHING MAIL ANALYTICS ============
          ["========== PHISHING MAIL ANALYTICS ==========", "", "", "", "", ""],
          ["Metric", "Count", "", "", "", ""],
          [],
          ["Mail Delivery Status", "", "", "", "", ""],
          ["Mails Sent", this.mailsSent, "", "", "", ""],
          ["Mails Pending", this.mailsPending, "", "", "", ""],
          ["Total Phishing Campaigns", this.phishingCampaignsWithMails, "", "", "", ""],
          [],
          ["User Engagement", "", "", "", "", ""],
          ["Total Users Targeted", this.totalPhishingUsers, "", "", "", ""],
          ["Average Users per Campaign", this.phishingCampaignsWithMails > 0 ? Math.round(this.totalPhishingUsers / this.phishingCampaignsWithMails) : 0, "", "", "", ""],
          [],
          [],
          // ============ DETAILED CAMPAIGN LIST ============
          ["========== DETAILED CAMPAIGN LIST ==========", "", "", "", "", ""],
          ["Campaign Name", "Type", "Status", "Delivery", "Created Date", "Users"],
          [],
        ];
        // Add detailed campaign data
        this.filteredCampaignsData.forEach(campaign => {
          const userCount   = Array.isArray(campaign.user_ids) ? campaign.user_ids.length : 0;
          const createdDate = campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : "N/A";
          data.push([
            campaign.name || "Unnamed Campaign",
            this.formatCampaignType(campaign.type),
            campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : "N/A",
            this.formatDeliveryType(campaign.deliveryScheduleType),
            createdDate,
            userCount
          ]);
        });
        // Create CSV content with proper escaping
        let csvContent = "";
        data.forEach(row => {
          const escapedRow = row.map(cell => {
            // Convert to string and escape quotes
            const cellStr = String(cell || "");
            // If cell contains comma, quotes, or newline, wrap in quotes
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          });
          csvContent += escapedRow.join(",") + "\n";
        });
        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url  = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Campaign_Complete_Statistics_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify({
          title: this.$t("campaign.Success") || "Success",
          text: this.$t("campaign.Complete statistics exported to Excel successfully") || "Complete statistics exported to Excel successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        notify({
          title: this.$t("campaign.Error") || "Error",
          text: this.$t("campaign.Failed to export statistics") || "Failed to export statistics",
          type: "error",
        });
      }
    },

    formatCampaignType(type) {
      const types = {
        simulatedPhishing: "Simulated Phishing",
        securityAwareness: "Security Awareness",
        both: "Both"
      };
      return types[type] || type;
    },

    formatDeliveryType(type) {
      const types = {
        later: "On-Demand",
        setup: "Scheduled"
      };
      return types[type] || type;
    },

    getFilterLabel(filterType) {
      const filter = this.statisticsFilters[filterType];
      if (filter === "all") return "All";
      const labels = {
        dateRange: {
          today: "Today",
          week: "Last 7 Days",
          month: "Last 30 Days",
          quarter: "Last 3 Months",
          year: "Last Year"
        },
        campaignType: {
          simulatedPhishing: "Simulated Phishing",
          securityAwareness: "Security Awareness",
          both: "Both"
        },
        status: {
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected"
        },
        deliverySchedule: {
          onDemand: "On-Demand",
          scheduled: "Scheduled"
        }
      };
      return labels[filterType]?.[filter] || filter;
    },

    exportStatisticsToPDF() {
      try {
        // Create a printable version of the statistics
        const printWindow = window.open("", "_blank");
        const currentDate = new Date().toLocaleDateString();
        const filterInfo  = this.getActiveFiltersInfo();
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Campaign & Phishing Statistics</title>
            <style>
              @media print {
                @page { margin: 1cm; }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #000;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
              }
              .header .date {
                margin-top: 5px;
                font-size: 12px;
                color: #555;
              }
              .filters {
                margin-bottom: 20px;
                padding: 10px;
                background: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              .filters h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
              }
              .filters p {
                margin: 5px 0;
                font-size: 12px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
                font-size: 12px;
              }
              th {
                background-color: #000;
                color: #fff;
                font-weight: bold;
              }
              .category-header {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .summary-row {
                background-color: #e5e5e5;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                font-size: 10px;
                color: #777;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Campaign & Phishing Statistics</h1>
              <div class="date">Generated on: ${currentDate}</div>
            </div>
            ${filterInfo ? `
            <div class="filters">
              <h3>Applied Filters:</h3>
              ${filterInfo}
            </div>
            ` : ''}
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr class="category-header">
                  <td colspan="3"><strong>CAMPAIGN TYPES</strong></td>
                </tr>
                <tr>
                  <td>Simulated Phishing Campaigns</td>
                  <td>${this.simulatedPhishingCampaigns}</td>
                  <td>${this.phishingPercentage}%</td>
                </tr>
                <tr>
                  <td>Security Awareness Campaigns</td>
                  <td>${this.securityAwarenessCampaigns}</td>
                  <td>${this.awarenessPercentage}%</td>
                </tr>
                <tr>
                  <td>Both Types Campaigns</td>
                  <td>${this.bothCampaigns}</td>
                  <td>${this.bothPercentage}%</td>
                </tr>
                <tr class="category-header">
                  <td colspan="3"><strong>CAMPAIGN STATUS</strong></td>
                </tr>
                <tr>
                  <td>Pending Campaigns</td>
                  <td>${this.pendingCampaigns}</td>
                  <td>${this.pendingPercentage}%</td>
                </tr>
                <tr>
                  <td>Approved Campaigns</td>
                  <td>${this.approvedCampaigns}</td>
                  <td>${this.approvedPercentage}%</td>
                </tr>
                <tr>
                  <td>Rejected Campaigns</td>
                  <td>${this.rejectedCampaigns}</td>
                  <td>${this.rejectedPercentage}%</td>
                </tr>
                <tr class="category-header">
                  <td colspan="3"><strong>DELIVERY SCHEDULE</strong></td>
                </tr>
                <tr>
                  <td>On-Demand Campaigns</td>
                  <td>${this.ondemandCampaigns}</td>
                  <td>${this.ondemandPercentage}%</td>
                </tr>
                <tr>
                  <td>Scheduled Campaigns</td>
                  <td>${this.schedualedCampaigns}</td>
                  <td>${this.scheduledPercentage}%</td>
                </tr>
                <tr class="summary-row">
                  <td><strong>TOTAL CAMPAIGNS</strong></td>
                  <td><strong>${this.totalCampaigns}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tbody>
            </table>
            <h2 style="margin-top: 40px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 10px;">Phishing Mail Analytics</h2>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr class="category-header">
                  <td colspan="2"><strong>MAIL DELIVERY STATUS</strong></td>
                </tr>
                <tr>
                  <td>Mails Sent</td>
                  <td>${this.mailsSent}</td>
                </tr>
                <tr>
                  <td>Mails Pending</td>
                  <td>${this.mailsPending}</td>
                </tr>
                <tr>
                  <td>Total Phishing Campaigns</td>
                  <td>${this.phishingCampaignsWithMails}</td>
                </tr>
                <tr class="category-header">
                  <td colspan="2"><strong>USER ENGAGEMENT</strong></td>
                </tr>
                <tr>
                  <td>Total Users Targeted</td>
                  <td>${this.totalPhishingUsers}</td>
                </tr>
                <tr>
                  <td>Average Users per Campaign</td>
                  <td>${this.phishingCampaignsWithMails > 0 ? Math.round(this.totalPhishingUsers / this.phishingCampaignsWithMails) : 0}</td>
                </tr>
              </tbody>
            </table>
            <h2 style="margin-top: 40px; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 10px;">Detailed Campaign List</h2>
            <table>
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Created Date</th>
                  <th>Users</th>
                </tr>
              </thead>
              <tbody>
                ${this.filteredCampaignsData.map(campaign => {
                  const userCount = Array.isArray(campaign.user_ids) ? campaign.user_ids.length : 0;
                  const createdDate = campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : "N/A";
                  return `
                    <tr>
                      <td style="text-align: left;">${campaign.name || "Unnamed Campaign"}</td>
                      <td>${this.formatCampaignType(campaign.type)}</td>
                      <td>${campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : "N/A"}</td>
                      <td>${this.formatDeliveryType(campaign.deliveryScheduleType)}</td>
                      <td>${createdDate}</td>
                      <td>${userCount}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div style="margin-top: 40px; padding: 15px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px;">Charts Summary</h3>
              <p style="margin: 5px 0; font-size: 11px;">This report includes data from the following chart analytics:</p>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 11px;">
                <li>Campaign Status Distribution</li>
                <li>Campaign Type Breakdown</li>
                <li>Delivery Schedule Analysis</li>
                <li>Campaign Timeline Distribution</li>
                <li>Campaign Completion Rate</li>
                <li>User Engagement Analytics</li>
                <li>Campaign & Phishing Type Breakdown</li>
                <li>Phishing vs Awareness Comparison</li>
                <li>Mail Delivery Status</li>
                <li>Phishing Success Rate</li>
                <li>User Engagement in Phishing Campaigns</li>
                <li>Phishing Email Timeline</li>
                <li>Phishing Template Performance</li>
              </ul>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #666;">Note: Visual charts are represented in the data tables above. For interactive chart visualization, please use the web interface.</p>
            </div>
            <div class="footer">
              Generated by Cyber Mode
            </div>
          </body>
          </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // Wait for content to load then print
        printWindow.onload = function() {
          printWindow.focus();
          printWindow.print();
        };
        notify({
          title: this.$t("campaign.Success") || "Success",
          text: this.$t("campaign.Statistics exported to PDF successfully") || "Statistics exported to PDF successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error exporting to PDF:", error);
        notify({
          title: this.$t("campaign.Error") || "Error",
          text: this.$t("campaign.Failed to export statistics") || "Failed to export statistics",
          type: "error",
        });
      }
    },

    getActiveFiltersInfo() {
      const filters = [];
      if (this.statisticsFilters.dateRange !== "all") {
        const rangeLabels = {
          today: "Today",
          week: "Last 7 Days",
          month: "Last 30 Days",
          quarter: "Last 3 Months",
          year: "Last Year"
        };
        filters.push(`<p><strong>Date Range:</strong> ${rangeLabels[this.statisticsFilters.dateRange]}</p>`);
      }
      if (this.statisticsFilters.campaignType !== "all") {
        const typeLabels = {
          simulatedPhishing: "Simulated Phishing",
          securityAwareness: "Security Awareness",
          both: "Both"
        };
        filters.push(`<p><strong>Campaign Type:</strong> ${typeLabels[this.statisticsFilters.campaignType]}</p>`);
      }
      if (this.statisticsFilters.status !== "all") {
        filters.push(`<p><strong>Status:</strong> ${this.statisticsFilters.status.charAt(0).toUpperCase() + this.statisticsFilters.status.slice(1)}</p>`);
      }
      if (this.statisticsFilters.deliverySchedule !== "all") {
        const scheduleLabels = {
          onDemand: "On-Demand",
          scheduled: "Scheduled"
        };
        filters.push(`<p><strong>Delivery Schedule:</strong> ${scheduleLabels[this.statisticsFilters.deliverySchedule]}</p>`);
      }
      return filters.length > 0 ? filters.join("") : null;
    },

    buildCampaignCharts() {
      // 1. Campaign Status Distribution Chart (Donut)
      const statusCounts = {
        pending: this.pendingCampaigns,
        approved: this.approvedCampaigns,
        rejected: this.rejectedCampaigns,
      };
      this.campaignStatusChart = {
        chart: {
          type: "pie",
          height: 275,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: "Campaigns",
            colorByPoint: true,
            data: [
              {
                name: this.$t("campaign.pending") || "Pending",
                y: statusCounts.pending,
                color: this.colors[1].avatar,
              },
              {
                name: this.$t("campaign.approved") || "Approved",
                y: statusCounts.approved,
                color: this.colors[2].avatar,
              },
              {
                name: this.$t("campaign.rejected") || "Rejected",
                y: statusCounts.rejected,
                color: this.colors[0].avatar,
              },
            ],
          },
        ],
      };
      // 2. Campaign Type Distribution Chart (Donut)
      this.campaignTypeChart = {
        chart: {
          type: "pie",
          height: 300,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: "Campaigns",
            colorByPoint: true,
            data: [
              {
                name:
                  this.$t("campaign.Simulated Phishing") ||
                  "Simulated Phishing",
                y: this.simulatedPhishingCampaigns,
                color: this.colors[0].avatar,
              },
              {
                name:
                  this.$t("campaign.Security Awareness") ||
                  "Security Awareness",
                y: this.securityAwarenessCampaigns,
                color: this.colors[2].avatar,
              },
              {
                name: this.$t("campaign.Both") || "Both",
                y: this.bothCampaigns,
                color: this.colors[3].avatar,
              },
            ],
          },
        ],
      };
      // 3. Delivery Schedule Distribution Chart (Column)
      this.deliveryScheduleChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: [
            this.$t("campaign.Completed") || "Completed",
            this.$t("campaign.Schedualed") || "Scheduled",
            this.$t("campaign.Ondemand") || "On Demand",
          ],
          labels: {
            style: { fontSize: "12px" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text:
              this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " campaigns",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Campaigns",
            data: [
              this.completedCampaigns,
              this.schedualedCampaigns,
              this.ondemandCampaigns,
            ],
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[2].avatar],
                [1, this.colors[2].text],
              ],
            },
          },
        ],
      };
      // 4. Campaign Timeline Distribution (3D Column Chart by Duration)
      const durationRanges = {
        "0-7 Days": 0,
        "1-2 Weeks": 0,
        "2-4 Weeks": 0,
        "1-3 Months": 0,
        "3-6 Months": 0,
        "6+ Months": 0,
      };
      this.campaignsData.forEach((campaign) => {
        if (campaign.dateFrom && campaign.dateTo) {
          const start    = new Date(campaign.dateFrom);
          const end      = new Date(campaign.dateTo);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) durationRanges["0-7 Days"]++;
          else if (diffDays <= 14) durationRanges["1-2 Weeks"]++;
          else if (diffDays <= 28) durationRanges["2-4 Weeks"]++;
          else if (diffDays <= 90) durationRanges["1-3 Months"]++;
          else if (diffDays <= 180) durationRanges["3-6 Months"]++;
          else durationRanges["6+ Months"]++;
        }
      });
      this.campaignTimelineChart = {
        chart: {
          type: "areaspline",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: Object.keys(durationRanges),
          title: {
            text: this.$t("campaign.Duration Range") || "Duration Range",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text:
              this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " campaigns",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            data: Object.values(durationRanges),
            color: this.colors[1].avatar,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[1].background],
                [1, this.colors[1].text + "20"],
              ],
            },
          },
        ],
      };
      // 5. Campaign Completion Rate Chart (Areaspline)
      this.campaignCompletionChart = {
        chart: {
          type: "areaspline",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: [
            this.$t("campaign.Pending") || "Pending",
            this.$t("campaign.Approved") || "Approved",
            this.$t("campaign.Completed") || "Completed",
          ],
          title: {
            text: this.$t("campaign.Status") || "Status",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text:
              this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " campaigns",
          style: { fontSize: "14px" },
          shared: true,
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "13px" },
        },
        series: [
          {
            name: this.$t("campaign.Campaign Progress") || "Campaign Progress",
            data: [
              this.pendingCampaigns,
              this.approvedCampaigns,
              this.completedCampaigns,
            ],
            color: this.colors[2].avatar,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[2].background],
                [1, this.colors[2].text + "20"],
              ],
            },
          },
        ],
      };
      // 6. User Engagement Chart (Column)
      const userEngagementData = this.campaignsData
        .map((campaign) => ({
          name: campaign.name,
          users: Array.isArray(campaign.user_ids)
            ? campaign.user_ids.length
            : 0,
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 10);
      this.userEngagementChart = {
        chart: {
          type: "column",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: userEngagementData.map((item) => item.name),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Number of Users") || "Number of Users",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " users",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Users",
            data: userEngagementData.map((item) => item.users),
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[3].avatar],
                [1, this.colors[3].text],
              ],
            },
          },
        ],
      };
    },

    buildCampaignPhishingCharts() {
      // 1. Campaign & Phishing Type Chart (3D Donut)
      this.campaignPhishingTypeChart = {
        chart: {
          type: "pie",
          height: 300,
          options3d: {
            enabled: true,
            alpha: 45,
            beta: 0,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "60%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b><br>{point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: "Campaigns",
            colorByPoint: true,
            data: [
              {
                name: this.$t("campaign.Simulated Phishing") || "Simulated Phishing",
                y: this.simulatedPhishingCampaigns,
                color: this.colors[0].avatar,
              },
              {
                name: this.$t("campaign.Security Awareness") || "Security Awareness",
                y: this.securityAwarenessCampaigns,
                color: this.colors[2].avatar,
              },
              {
                name: this.$t("campaign.Both Types") || "Both Types",
                y: this.bothCampaigns,
                color: this.colors[3].avatar,
              },
            ],
          },
        ],
      };
      // 2. Campaign Status Overview Chart (Bar Chart)
      this.campaignStatusOverviewChart = {
        chart: {
          type: "column",
          height: 300,
        },
        title: { text: null },
        xAxis: {
          categories: [
            this.$t("campaign.Pending") || "Pending",
            this.$t("campaign.Approved") || "Approved",
            this.$t("campaign.Rejected") || "Rejected",
          ],
          labels: {
            style: { fontSize: "13px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " campaigns",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "13px", fontWeight: "bold", color: "#fff" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Campaigns",
            data: [
              {
                y: this.pendingCampaigns,
                color: {
                  linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
                  stops: [
                    [0, this.colors[1].avatar],
                    [1, this.colors[1].text],
                  ],
                },
              },
              {
                y: this.approvedCampaigns,
                color: {
                  linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
                  stops: [
                    [0, this.colors[2].avatar],
                    [1, this.colors[2].text],
                  ],
                },
              },
              {
                y: this.rejectedCampaigns,
                color: {
                  linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
                  stops: [
                    [0, this.colors[0].avatar],
                    [1, this.colors[0].text],
                  ],
                },
              },
            ],
          },
        ],
      };
      // 3. Phishing vs Awareness Comparison Chart (Column)
      this.phishingVsAwarenessChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: [
            this.$t("campaign.Simulated Phishing") || "Phishing",
            this.$t("campaign.Security Awareness") || "Awareness",
            this.$t("campaign.Combined") || "Combined",
          ],
          labels: {
            style: { fontSize: "13px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Campaign Count") || "Campaign Count",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size:14px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="padding:0"><b>{point.y}</b> campaigns</td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              style: { fontSize: "14px", fontWeight: "bold" },
            },
            borderRadius: 8,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Campaigns",
            data: [
              {
                y: this.simulatedPhishingCampaigns,
                color: {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [
                    [0, this.colors[0].avatar],
                    [1, this.colors[0].text],
                  ],
                },
              },
              {
                y: this.securityAwarenessCampaigns,
                color: {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [
                    [0, this.colors[2].avatar],
                    [1, this.colors[2].text],
                  ],
                },
              },
              {
                y: this.bothCampaigns,
                color: {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [
                    [0, this.colors[3].avatar],
                    [1, this.colors[3].text],
                  ],
                },
              },
            ],
          },
        ],
      };
      // 4. Delivery Schedule Analysis Chart (Semi-Circle Pie)
      this.deliveryScheduleAnalysisChart = {
        chart: {
          type: "pie",
          height: 350,
        },
        title: { text: null },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 90,
            center: ["50%", "75%"],
            size: "110%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b><br>{point.y} ({point.percentage:.1f}%)",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "top",
          layout: "horizontal",
        },
        series: [
          {
            name: "Campaigns",
            colorByPoint: true,
            data: [
              {
                name: this.$t("campaign.On-Demand") || "On-Demand",
                y: this.ondemandCampaigns,
                color: this.colors[1].avatar,
              },
              {
                name: this.$t("campaign.Scheduled") || "Scheduled",
                y: this.schedualedCampaigns,
                color: this.colors[3].avatar,
              },
            ],
          },
        ],
      };
      // 5. Complete Campaign Metrics Chart (Grouped Bar)
      this.completeCampaignMetricsChart = {
        chart: {
          type: "column",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: [
            this.$t("campaign.Campaign Types") || "Campaign Types",
            this.$t("campaign.Campaign Status") || "Campaign Status",
            this.$t("campaign.Delivery Schedule") || "Delivery Schedule",
          ],
          labels: {
            style: { fontSize: "13px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Count") || "Count",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          allowDecimals: false,
        },
        tooltip: {
          headerFormat: '<span style="font-size:14px"><b>{point.key}</b></span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.1,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              style: { fontSize: "11px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "12px" },
        },
        series: [
          {
            name: this.$t("campaign.Simulated Phishing") || "Phishing",
            data: [this.simulatedPhishingCampaigns, 0, 0],
            color: this.colors[0].avatar,
          },
          {
            name: this.$t("campaign.Security Awareness") || "Awareness",
            data: [this.securityAwarenessCampaigns, 0, 0],
            color: this.colors[2].avatar,
          },
          {
            name: this.$t("campaign.Both Types") || "Both",
            data: [this.bothCampaigns, 0, 0],
            color: this.colors[3].avatar,
          },
          {
            name: this.$t("campaign.Pending") || "Pending",
            data: [0, this.pendingCampaigns, 0],
            color: this.colors[1].avatar,
          },
          {
            name: this.$t("campaign.Approved") || "Approved",
            data: [0, this.approvedCampaigns, 0],
            color: this.colors[2].avatar,
          },
          {
            name: this.$t("campaign.Rejected") || "Rejected",
            data: [0, this.rejectedCampaigns, 0],
            color: this.colors[0].avatar,
          },
          {
            name: this.$t("campaign.On-Demand") || "On-Demand",
            data: [0, 0, this.ondemandCampaigns],
            color: this.colors[1].avatar,
          },
          {
            name: this.$t("campaign.Scheduled") || "Scheduled",
            data: [0, 0, this.schedualedCampaigns],
            color: this.colors[3].avatar,
          },
        ],
      };
    },

    buildPhishingMailCharts() {
      const phishingCampaigns = this.campaignsData.filter(
        (g) => g.type == "simulatedPhishing" || g.type == "both"
      );
      // 1. Mail Delivery Status Chart (3D Pie)
      this.mailDeliveryStatusChart = {
        chart: {
          type: "pie",
          height: 300,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b><br>{point.y} ({point.percentage:.1f}%)",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: "Phishing Mails",
            colorByPoint: true,
            data: [
              {
                name: this.$t("campaign.Mails Sent") || "Mails Sent",
                y: this.mailsSent,
                color: this.colors[2].avatar,
              },
              {
                name: this.$t("campaign.Mails Pending") || "Mails Pending",
                y: this.mailsPending,
                color: this.colors[1].avatar,
              },
            ],
          },
        ],
      };
      // 2. Phishing Success Rate Chart (Semi-Circle Gauge)
      const successRate = this.phishingCampaignsWithMails > 0 ? Math.round((this.mailsSent / this.phishingCampaignsWithMails) * 100) : 0;
      this.phishingSuccessRateChart = {
        chart: {
          type: "pie",
          height: 300,
        },
        title: { text: null },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
        },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 90,
            center: ["50%", "75%"],
            size: "110%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b><br>{point.percentage:.0f}%",
              style: {
                fontSize: "14px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
          },
        },
        series: [
          {
            name: "Success Rate",
            colorByPoint: true,
            data: [
              {
                name: this.$t("campaign.Delivered") || "Delivered",
                y: successRate,
                color: {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [
                    [0, this.colors[2].avatar],
                    [1, this.colors[2].text],
                  ],
                },
              },
              {
                name: this.$t("campaign.Pending") || "Pending",
                y: 100 - successRate,
                color: this.colors[3].background,
              },
            ],
          },
        ],
      };
      // 3. Phishing User Engagement Chart (Column)
      const topPhishingCampaigns = phishingCampaigns
        .map((campaign) => ({
          name: campaign.name || "Unnamed Campaign",
          users: Array.isArray(campaign.user_ids) ? campaign.user_ids.length : 0,
          sent: campaign.isMailSent == 1,
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 10);

      this.phishingUserEngagementChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: topPhishingCampaigns.map((item) => item.name),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Number of Users") || "Number of Users",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          headerFormat: '<span style="font-size:14px"><b>{point.key}</b></span><table>',
          pointFormat:
            '<tr><td>Users: </td><td style="padding:0"><b>{point.y}</b></td></tr>' +
            '<tr><td>Status: </td><td style="padding:0"><b>{point.status}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Users",
            data: topPhishingCampaigns.map((item) => ({
              y: item.users,
              status: item.sent ? "Sent" : "Pending",
              color: item.sent
                ? 
                {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [
                    [0, this.colors[2].avatar],
                    [1, this.colors[2].text],
                  ],
                }
                : 
                {
                  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                  stops: [
                    [0, this.colors[1].avatar],
                    [1, this.colors[1].text],
                  ],
                },
              })
            ),
          },
        ],
      };
      // 4. Phishing Email Timeline Chart (Area Spline)
      // Group campaigns by month
      const monthlyData = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      phishingCampaigns.forEach((campaign) => {
        if (campaign.created_at) {
          const date      = new Date(campaign.created_at);
          const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { sent: 0, pending: 0 };
          }
          if (campaign.isMailSent == 1) {
            monthlyData[monthYear].sent++;
          } else {
            monthlyData[monthYear].pending++;
          }
        }
      });
      const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
      });
      this.phishingEmailTimelineChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: sortedMonths.length > 0 ? sortedMonths : ["No Data"],
          title: {
            text: this.$t("campaign.Timeline") || "Timeline",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: {
            style: { fontSize: "12px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          allowDecimals: false,
        },
        tooltip: {
          shared: true,
          valueSuffix: " campaigns",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "13px" },
        },
        series: [
          {
            name: this.$t("campaign.Mails Sent") || "Mails Sent",
            data: sortedMonths.length > 0 ? sortedMonths.map((month) => monthlyData[month].sent) : [0],
            color: this.colors[2].avatar,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[2].background],
                [1, this.colors[2].text + "20"],
              ],
            },
          },
          {
            name: this.$t("campaign.Mails Pending") || "Mails Pending",
            data: sortedMonths.length > 0 ? sortedMonths.map((month) => monthlyData[month].pending) : [0],
            color: this.colors[1].avatar,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[1].background],
                [1, this.colors[1].text + "20"],
              ],
            },
          },
        ],
      };
      // 5. Phishing Template Performance Chart (Bar)
      // Count campaigns by template usage
      const templateUsage = {};
      phishingCampaigns.forEach((campaign) => {
        const templateCount = Array.isArray(campaign.phishingTemplate_ids) ? campaign.phishingTemplate_ids.length : 0;
        const key = templateCount === 0
          ? "No Template"
          : templateCount === 1
          ? "Single Template"
          : `${templateCount} Templates`;
        if (!templateUsage[key]) {
          templateUsage[key] = { total: 0, sent: 0, pending: 0 };
        }
        templateUsage[key].total++;
        if (campaign.isMailSent == 1) {
          templateUsage[key].sent++;
        } else {
          templateUsage[key].pending++;
        }
      });
      const categories = Object.keys(templateUsage);
      this.phishingTemplatePerformanceChart = {
        chart: {
          type: "column",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: categories.length > 0 ? categories : ["No Data"],
          title: {
            text: this.$t("campaign.Template Usage") || "Template Usage",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: {
            style: { fontSize: "12px" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.Number of Campaigns") || "Number of Campaigns",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          allowDecimals: false,
        },
        tooltip: {
          shared: true,
          valueSuffix: " campaigns",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "13px" },
        },
        series: [
          {
            name: this.$t("campaign.Mails Sent") || "Mails Sent",
            data: categories.length > 0
              ? categories.map((cat) => templateUsage[cat].sent)
              : [0],
            color: this.colors[2].avatar,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[2].background],
                [1, this.colors[2].text + "20"],
              ],
            },
          },
          {
            name: this.$t("campaign.Mails Pending") || "Mails Pending",
            data: categories.length > 0 ? categories.map((cat) => templateUsage[cat].pending) : [0],
            color: this.colors[1].avatar,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, this.colors[1].background],
                [1, this.colors[1].text + "20"],
              ],
            },
          },
        ],
      };
    },

    buildUserBasedStatisticsCharts() {
      // 1. Phishing Emails Delivered (Past Year) Chart
      // Use real data from API
      const monthlyData = this.monthlyMailStatistics.length > 0
        ? this.monthlyMailStatistics
        : [{ month: "No Data", opened: 0, clicked: 0, submitted: 0, downloaded: 0 }];
      this.phishingEmailsDeliveredChart = {
        chart: {
          type: "column",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: monthlyData.map((d) => d.month),
          title: {
            text: this.$t("campaign.Month") || "Month",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.phishing Mail Statistic") || "phishing Mail Statistic",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "top",
          layout: "horizontal",
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "11px", fontWeight: "bold" },
            },
          },
        },
        series: [
          {
            name: this.$t("campaign.opened count") || "opened count",
            data: monthlyData.map((d) => d.opened),
            color: this.colors[2].avatar,
          },
          {
            name: this.$t("campaign.phishing.clicked_link_count") || "phishing.clicked_link_count",
            data: monthlyData.map((d) => d.clicked),
            color: this.colors[1].avatar,
          },
          {
            name: this.$t("campaign.phishing.form_submitted_count") || "phishing.form_submitted_count",
            data: monthlyData.map((d) => d.submitted),
            color: this.colors[0].avatar,
          },
          {
            name: this.$t("campaign.phishing.file_downloaded_count") || "phishing.file_downloaded_count",
            data: monthlyData.map((d) => d.downloaded),
            color: this.colors[3].avatar,
          },
        ],
      };
      // 2. Phishing Campaigns Statistics Chart
      // Use real data from API
      const campaignsData = this.campaignMailStatistics.length > 0
        ? this.campaignMailStatistics
        : [{ name: "No Data", emails: 0, employees: 0, opened: 0, clicked: 0, submitted: 0, downloaded: 0 }];
      this.phishingCampaignsStatisticsChart = {
        chart: {
          type: "column",
          height: 450,
        },
        title: { text: null },
        xAxis: {
          categories: campaignsData.map((d) => d.name),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.phishing Campaign Mails And Employee Statistic") || "phishing Campaign Mails And Employee Statistic",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "top",
          layout: "horizontal",
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "11px", fontWeight: "bold" },
            },
          },
        },
        series: [
          {
            name: this.$t("campaign.phishing.Deliverd_email") || "phishing.Deliverd_email",
            data: campaignsData.map((d) => d.emails),
            color: this.colors[2].avatar,
          },
          {
            name: this.$t("campaign.phishing.Deliverd_employees") || "phishing.Deliverd_employees",
            data: campaignsData.map((d) => d.employees),
            color: this.colors[3].avatar,
          },
          {
            name: this.$t("campaign.opened count") || "opened count",
            data: campaignsData.map((d) => d.opened),
            color: this.colors[1].avatar,
          },
          {
            name: this.$t("campaign.phishing.clicked_link_count") || "phishing.clicked_link_count",
            data: campaignsData.map((d) => d.clicked),
            color: this.colors[0].avatar,
          },
          {
            name: this.$t("campaign.phishing.file_downloaded_count") || "phishing.file_downloaded_count",
            data: campaignsData.map((d) => d.downloaded),
            color: this.colors[1].text,
          },
          {
            name: this.$t("campaign.phishing.form_submitted_count") || "phishing.form_submitted_count",
            data: campaignsData.map((d) => d.submitted),
            color: this.colors[0].text,
          },
        ],
      };
      // 3. Phishing Employees Statistics Chart
      // Use real data from API
      const employeesData = this.employeeMailStatistics.length > 0
        ? this.employeeMailStatistics
        : [{ name: "No Data", campaigns: 0, opened: 0, submitted: 0, downloaded: 0, clicked: 0 }];
      this.phishingEmployeesStatisticsChart = {
        chart: {
          type: "column",
          height: 450,
        },
        title: { text: null },
        xAxis: {
          categories: employeesData.map((d) => d.name),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("campaign.phishing Employees Statistic") || "phishing Employees Statistic",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "top",
          layout: "horizontal",
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "11px", fontWeight: "bold" },
            },
          },
        },
        series: [
          {
            name: this.$t("campaign.phishing.Campaigns") || "phishing.Campaigns",
            data: employeesData.map((d) => d.campaigns),
            color: this.colors[3].avatar,
          },
          {
            name: this.$t("campaign.phishing.Mail_opened") || "phishing.Mail_opened",
            data: employeesData.map((d) => d.opened),
            color: this.colors[2].avatar,
          },
          {
            name: this.$t("campaign.phishing.Form_submited") || "phishing.Form_submited",
            data: employeesData.map((d) => d.submitted),
            color: this.colors[0].avatar,
          },
          {
            name: this.$t("campaign.phishing.File_download") || "phishing.File_download",
            data: employeesData.map((d) => d.downloaded),
            color: this.colors[0].text,
          },
          {
            name: this.$t("campaign.phishing.clicked_link_count") || "phishing.clicked_link_count",
            data: employeesData.map((d) => d.clicked),
            color: this.colors[1].avatar,
          },
        ],
      };
      // 4. Employee Statistics Table Data
      // The employeeStatistics is already populated by processEmployeeStatistics() method
      // No need to set it here as it's already processed from the API data
    },

    handleTabChange(tabType) {
      this.activeTab = tabType;
      // Update filter based on tab
      switch (this.activeTab) {
        case "all":
          this.filter = {};
          break;
        case "simulatedPhishing":
          this.filter = {
            type: "simulatedPhishing",
          };
          break;
        case "securityAwareness":
          this.filter = {
            type: "securityAwareness",
          };
          break;
        case "both":
          this.filter = {
            type: "both",
          };
          break;
      }
    },

    isAvailableGroupSelectable(option) {
      return !this.selectedAvailableGroups.includes(option.id);
    },

    isSelectGroupSelectable(option) {
      return !this.selectedSelectedGroups.includes(option.id);
    },

    async getLmsLevels(courseId) {
      this.lmsLevels = [];
      if (courseId === null) {
        // If 'All' is selected, get all levels
        this.lmsLevels = await this.lmsLevelApi.getAll({ select: "id|title|levelType" });
        this.lmsLevels = this.lmsLevels.filter(
          (level) => level?.levelType?.campaign == "true"
        );
        this.lmsModules = await this.lmsModuleApi.getAll({
          select: "id|name|level_id|coverImage|fullCoverImagePath",
          with: ["level.course"],
        });
        this.lmsModules = this.lmsModules.filter((module) => {
          // First condition: level.levelType.campaign is true
          if (module.level?.levelType?.campaign == "true") {
            return true;
          }
          // Second condition: level has all flags false AND course campaign is true
          if (
            module.level?.levelType?.campaign == "false" &&
            module.level?.levelType?.mandatory == "false" &&
            module.level?.levelType?.optional == "false" &&
            module.level?.course?.courseType?.campaign == "true"
          ) {
            return true;
          }
          // Otherwise exclude
          return false;
        });
        this.selectedCourse = null;
      } else if (courseId) {
        this.lmsLevels = await this.lmsLevelApi.getAll({ select: "id|title|levelType|course_id" });
        this.lmsLevels = this.lmsLevels.filter(
          (level) =>
            (level.course_id == courseId && level?.levelType?.campaign == "true") ||
            (
              level.course_id == courseId &&
              level?.levelType?.campaign == "false" &&
              level?.levelType?.optional == "false" &&
              level?.levelType?.mandatory == "false"
            )
        );
        this.lmsModules = await this.lmsModuleApi.getAll({
          select: "id|name|level_id|coverImage|fullCoverImagePath",
          with: ["level.course"],
        });
        this.lmsModules = this.lmsModules.filter(
          (module) =>
            (module.level.course?.id == courseId && module.level?.levelType?.campaign == "true") ||
            (
              module.level.course?.id == courseId &&
              module.level?.levelType?.campaign == "false" &&
              module.level?.levelType?.optional == "false" &&
              module.level?.levelType?.mandatory == "false"
            )
        );
        this.selectedCourse = courseId;
      }
    },

    async getLmsModules(lmsLevelId) {
      if (lmsLevelId === null) {
        // If 'All' is selected, get all modules
        this.lmsModules = await this.lmsModuleApi.getAll({
          select: "id|name|level_id|coverImage|fullCoverImagePath",
          with: ["level.course"],
        });
        if (this.selectedCourse) {
          this.lmsModules = this.lmsModules.filter(
            (module) =>
              (module.level.course?.id == this.selectedCourse && module.level?.levelType?.campaign == "true") ||
              (
                module.level.course?.id == this.selectedCourse &&
                module.level?.levelType?.campaign == "false" &&
                module.level?.levelType?.optional == "false" &&
                module.level?.levelType?.mandatory == "false"
              )
          );
        }
      } else if (lmsLevelId) {
        this.lmsModules = await this.lmsModuleApi.getAll({
          select: "id|name|level_id|coverImage|fullCoverImagePath",
          with: ["level.course"],
        });
        this.lmsModules = this.lmsModules.filter(
          (module) =>
            (module.level_id == lmsLevelId && module.level?.levelType?.campaign == "true") ||
            (
              module.level_id == lmsLevelId &&
              module.level?.levelType?.campaign == "false" &&
              module.level?.levelType?.optional == "false" &&
              module.level?.levelType?.mandatory == "false"
            )
        );
      }
    },

    closeUserModal() {
      this.showUsersList = false;
    },

    confirmUserSelection() {
      this.newItem.user_ids = [...this.selectedUsers];
      this.showUsersList = false;
    },

    showUsersModal(selectedGroups) {
      this.selectedGroupUsers = [];
      if (selectedGroups && selectedGroups.length > 0) {
        const uniqueUsers = new Set();
        const uniqueUserIds = new Set();
        // Get user_ids from selected phishing groups
        const selectedGroupsData = this.phishingGroups.filter((g) =>
          selectedGroups.includes(g.id)
        );
        const allUserIdsFromGroups = selectedGroupsData.flatMap(
          (group) => group.user_ids || []
        );
        // Find users from external service
        const usersFromGroups = this.allUsers.filter((user) =>
          allUserIdsFromGroups.includes(user.id)
        );
        // Add unique users
        usersFromGroups.forEach((user) => {
          if (!uniqueUserIds.has(user.id)) {
            uniqueUsers.add(user);
            uniqueUserIds.add(user.id);
          }
        });
        this.selectedGroupUsers = Array.from(uniqueUsers);
        if (!this.newItem.user_ids) {
          this.selectedUsers = Array.from(uniqueUserIds);
        } else {
          this.selectedUsers = [...this.newItem.user_ids];
        }
      }
      this.showUsersList = selectedGroups && selectedGroups.length > 0;
    },

    moveToSelected(toSelected) {
      if (toSelected) {
        // Store current selected users before adding new groups
        const currentSelectedUsers = [...(this.selectedUsers || [])];
        // Get user_ids from newly added groups
        const newlyAddedGroups = this.phishingGroups.filter((g) =>
          this.selectedAvailableGroups.includes(g.id)
        );
        const newUserIds = newlyAddedGroups.flatMap(
          (group) => group.user_ids || []
        );
        if (!this.newItem.phishingGroups_id)
          this.newItem.phishingGroups_id = [];
        this.newItem.phishingGroups_id = [
          ...new Set([
            ...this.newItem.phishingGroups_id,
            ...this.selectedAvailableGroups,
          ]),
        ];
        this.selectedAvailableGroups = [];
        // Combine current selected users with new users from added groups
        const combinedUsers = [
          ...new Set([...currentSelectedUsers, ...newUserIds]),
        ];
        // Update the newItem.user_ids to preserve previous selections
        this.newItem.user_ids = combinedUsers;
        this.showUsersModal(this.newItem.phishingGroups_id);
      } else {
        // Get user_ids from groups being removed
        const removedGroups = this.phishingGroups.filter((g) =>
          this.selectedSelectedGroups.includes(g.id)
        );
        const userIdsToRemove = removedGroups.flatMap(
          (group) => group.user_ids || []
        );
        // Remove the groups
        this.newItem.phishingGroups_id = this.newItem.phishingGroups_id.filter(
          (id) => !this.selectedSelectedGroups.includes(id)
        );
        this.selectedSelectedGroups = [];
        // Update user selections
        if (this.newItem.user_ids) {
          this.newItem.user_ids = this.newItem.user_ids.filter(
            (id) => !userIdsToRemove.includes(id)
          );
          this.selectedUsers = [...this.newItem.user_ids];
        }
        // Refresh users modal with remaining groups
        if (this.newItem.phishingGroups_id.length > 0) {
          this.showUsersModal(this.newItem.phishingGroups_id);
        } else {
          this.selectedGroupUsers = [];
          this.selectedUsers = [];
          this.newItem.user_ids = [];
        }
      }
    },
    // Open the form for adding or editing an item
    openForm() {
      // this.isFlipped = true;  // Show the form
      this.currentStep = 1;
      this.opencreateModal = true;
    },

    // Close the form after submitting or canceling
    async closeForm() {
      this.isFlipped = false; // Hide the form
      await this.fetchStatistics();
      await this.fetchUserBasedStatistics();
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      // Deep clone the data to avoid reference issues
      this.newItem = JSON.parse(JSON.stringify(data));
      // Initialize selected groups based on phishingGroups_id
      if (this.newItem.phishingGroups_id) {
        this.selectedSelectedGroups = this.newItem.phishingGroups_id;
      }
      // Initialize selected users if present
      if (this.newItem.user_ids) {
        this.selectedUsers = this.newItem.user_ids;
      }
      this.currentStep = 1;
      this.opencreateModal = true;
    },

    async deleteItem(data) {
      await this.api.delete(0, [data.id].map(String)); // API call to delete the item
      await this.fetchStatistics();
      this.$refs.table.refreshTable(); // Refresh the table after deletion
    },

    validateStep1() {
      let isValid = true;
      if (!this.newItem.name) {
        this.api.poup(
          { status: false, message: this.$t("campaign.Name is required") },
          "Error"
        );
        isValid = false;
      }
      if (!this.newItem.type) {
        this.api.poup(
          { status: false, message: this.$t("campaign.Type is required") },
          "Error"
        );
        isValid = false;
      }
      if (!this.newItem.user_ids || !this.newItem.user_ids.length > 0) {
        this.api.poup(
          { status: false, message: this.$t("campaign.Users is required") },
          "Error"
        );
        isValid = false;
      }
      return isValid;
    },

    validateStep2() {
      if (this.newItem.type != "securityAwareness") {
        let isValid = true;
        if (!this.newItem.phishingTemplate_ids) {
          this.api.poup(
            {
              status: false,
              message: this.$t("campaign.Phishing Template is required"),
            },
            "Error"
          );
          isValid = false;
        }
        return isValid;
      } else {
        let isValid = true;
        if (!this.newItem.lmsModule_ids) {
          this.api.poup(
            {
              status: false,
              message: this.$t("campaign.Lms Module is required"),
            },
            "Error"
          );
          isValid = false;
        }
        if (!this.newItem.daysUntilDue) {
          this.api.poup(
            {
              status: false,
              message: this.$t("campaign.Days Unti Due is required"),
            },
            "Error"
          );
          isValid = false;
        }
        return isValid;
      }
    },

    validateStep3() {
      if (this.newItem.type != "securityAwareness") {
        let isValid = true;
        if (!this.newItem.deliveryScheduleType) {
          this.api.poup(
            {
              status: false,
              message: this.$t("campaign.Delivery Schedule Type is required"),
            },
            "Error"
          );
          isValid = false;
        }
        if (this.newItem.deliveryScheduleType === "setup") {
          if (!this.newItem.dateFrom) {
            this.api.poup(
              {
                status: false,
                message: this.$t("campaign.Date From is required"),
              },
              "Error"
            );
            isValid = false;
          } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dateFrom = new Date(this.newItem.dateFrom);
            if (dateFrom < today) {
              this.api.poup(
                {
                  status: false,
                  message: this.$t(
                    "campaign.Date From must be equal to or after today"
                  ),
                },
                "Error"
              );
              isValid = false;
            }
          }
          if (!this.newItem.dateTo) {
            this.api.poup(
              {
                status: false,
                message: this.$t("campaign.Date To is required"),
              },
              "Error"
            );
            isValid = false;
          } else if (this.newItem.dateFrom) {
            const dateFrom = new Date(this.newItem.dateFrom);
            const dateTo = new Date(this.newItem.dateTo);
            if (dateTo < dateFrom) {
              this.api.poup(
                {
                  status: false,
                  message: this.$t(
                    "campaign.Date To must be equal to or after Date From"
                  ),
                },
                "Error"
              );
              isValid = false;
            }
          }
          /*
          if (!this.newItem.timeFrom) {
            this.api.poup({ status: false, message: "Time From is required" }, "Error");
            isValid = false;
          }
          if (!this.newItem.timeTo) {
            this.api.poup({ status: false, message: "Time To is required" }, "Error");
            isValid = false;
          } else if (this.newItem.timeFrom && this.newItem.timeTo) {
            const dateFrom = new Time(this.newItem.timeFrom);
            const dateTo = new Time(this.newItem.timeTo);
            if (timeTo < timeeFrom) {
              this.api.poup({ status: false, message: "Time To must be equal to or after Time From" }, "Error");
              isValid = false;
            }
          }
          */
        } else {
          this.newItem.dateFrom = null;
          this.newItem.dateTo = null;
          // this.newItem.timeFrom = null;
          // this.newItem.timeTo   = null;
        }
        return isValid;
      } else {
        return isValid;
      }
    },

    validateStep4() {
      let isValid = true;
      if (!this.newItem.lmsModule_ids) {
        this.api.poup(
          {
            status: false,
            message: this.$t("campaign.Lms Module is required"),
          },
          "Error"
        );
        isValid = false;
      }
      if (!this.newItem.daysUntilDue) {
        this.api.poup(
          {
            status: false,
            message: this.$t("campaign.Days Unti Due is required"),
          },
          "Error"
        );
        isValid = false;
      }
      return isValid;
    },

    toggleModuleSelection(moduleId) {
      if (!this.newItem.lmsModule_ids) {
        this.newItem.lmsModule_ids = [];
      }
      const index = this.newItem.lmsModule_ids.indexOf(moduleId);
      if (index === -1) {
        this.newItem.lmsModule_ids.push(moduleId);
      } else {
        this.newItem.lmsModule_ids.splice(index, 1);
      }
    },

    toggleTemplateSelection(templateId) {
      if (!this.newItem.phishingTemplate_ids) {
        this.newItem.phishingTemplate_ids = [];
      }
      const index = this.newItem.phishingTemplate_ids.indexOf(templateId);
      if (index === -1) {
        this.newItem.phishingTemplate_ids.push(templateId);
      } else {
        this.newItem.phishingTemplate_ids.splice(index, 1);
      }
    },

    async nextStep() {
      if (this.currentStep === 1) {
        this.lmsModules = await this.lmsModuleApi.getAll({
          select: "id|name|level_id|coverImage|fullCoverImagePath",
          with: ["level.course"],
        });
        this.lmsModules = this.lmsModules.filter((module) => {
          // First condition: level.levelType.campaign is true
          if (module.level?.levelType?.campaign == "true") {
            return true;
          }
          // Second condition: level has all flags false AND course campaign is true
          if (
            module.level?.levelType?.campaign == "false" &&
            module.level?.levelType?.mandatory == "false" &&
            module.level?.levelType?.optional == "false" &&
            module.level?.course?.courseType?.campaign == "true"
          ) {
            return true;
          }
          // Otherwise exclude
          return false;
        });
      }
      if (!this.validateStep1()) return;
      if (this.newItem.type === "simulatedPhishing") {
        if (this.currentStep === 2 && !this.validateStep2()) return;
        if (this.currentStep === 3 && !this.validateStep3()) return;
        this.currentStep++;
      } else if (this.newItem.type === "securityAwareness") {
        if (this.currentStep === 2 && !this.validateStep2()) return;
        this.currentStep++;
      } else {
        if (this.currentStep === 2 && !this.validateStep2()) return;
        if (this.currentStep === 3 && !this.validateStep3()) return;
        if (this.currentStep === 4 && !this.validateStep4()) return;
        this.currentStep++;
      }
      // if (this.newItem.type === 'simulatedPhishing') {
      //   if (this.currentStep === 2 && !this.validateStep2()) return;
      //   if (this.currentStep === 3 && !this.validateStep3()) return;
      //   if (this.currentStep === 3) {
      //     this.currentStep = 5;
      //   } else {
      //     this.currentStep++;
      //   }
      // } else if (this.newItem.type === 'securityAwareness') {
      //   if (this.currentStep === 1) {
      //     this.currentStep = 4;
      //   } else if (this.currentStep === 4 && !this.validateStep4()) {
      //     return;
      //   } else {
      //     this.currentStep++;
      //   }
      // } else {
      //   if (this.currentStep === 2 && !this.validateStep2()) return;
      //   if (this.currentStep === 3 && !this.validateStep3()) return;
      //   if (this.currentStep === 4 && !this.validateStep4()) return;
      //   this.currentStep++;
      // }
    },

    backStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
      // if (this.newItem.type === 'simulatedPhishing') {
      //   if (this.currentStep === 5) {
      //     this.currentStep = 3;
      //   }
      //   else {
      //     this.currentStep--;
      //   }
      // } else if (this.newItem.type === 'securityAwareness') {
      //   if (this.currentStep === 4) {
      //     this.currentStep = 1;
      //   }
      //   if (this.currentStep === 5) {
      //     this.currentStep = 4;
      //   }
      // } else if (this.currentStep > 1) {
      //   this.currentStep--;
      // }
    },

    closeModal() {
      this.newItem                 = {};
      this.selectedSelectedGroups  = [];
      this.selectedUsers           = [];
      this.opencreateModal         = false; // Show the form
      this.selectedGroupUsers      = [];
      this.selectedUsers           = [];
      this.selectedAvailableGroups = [];
      this.selectedSelectedGroups  = [];
    },

    async saveCampaign() {
      this.newItem.status = "pending";
      this.newItem.phishingGroup_ids = this.newItem.phishingGroups_id;
      let response;
      if (this.newItem.type === "simulatedPhishing") {
        this.newItem.lmsModule_ids = null;
        this.newItem.daysUntilDue = null;
      }
      if (this.newItem.type === "securityAwareness") {
        this.newItem.phishingTemplate_ids = null;
        this.newItem.deliveryScheduleType = null;
        this.newItem.dateFrom = null;
        this.newItem.dateTo = null;
        // this.newItem.timeFrom = null;
        // this.newItem.timeTo = null;
      }
      if (this.newItem.id) {
        response = await this.api.update(this.newItem);
      } else {
        response = await this.api.insert(this.newItem);
      }
      if (response.status === "success") {
        this.closeModal();
      }
      this.api.poup(response, "Validation Error !");
      await this.fetchStatistics();
      this.$refs.table.refreshTable(); // Refresh the table data
    },

    openViewModal(selectedRow) {
      this.newItem = JSON.parse(JSON.stringify(selectedRow));
      // Initialize selected groups based on phishingGroups_id
      if (this.newItem.phishingGroups_id) {
        this.selectedSelectedGroups = this.newItem.phishingGroups_id;
      }
      // Initialize selected users if present
      if (this.newItem.user_ids) {
        this.selectedUsers = this.newItem.user_ids;
        // Populate selectedGroupUsers for the view modal
        this.selectedGroupUsers = this.allUsers.filter((user) =>
          this.newItem.user_ids.includes(user.id)
        );
      }
      this.currentStep = 1;
      this.viewModal   = true;
    },

    closeViewModal() {
      this.newItem   = {};
      this.viewModal = false;
    },

    openCommentModal(selectedRow) {
      this.newItem      = JSON.parse(JSON.stringify(selectedRow));
      this.commentModal = true;
    },

    closeCommentModal() {
      this.newItem = {};
      this.commentModal = false;
    },

    // Handle the "Initiate" button click
    async changeStatusToApproved(item) {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: this.$t("campaign.Are you sure?"),
        text: this.$t(
          "campaign.You are about to change status to approved for this campaign!"
        ),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: this.$t("campaign.Yes, approved it!"),
        cancelButtonText: this.$t("campaign.No, cancel!"),
      });
      if (result.isConfirmed) {
        item.status = "approved";
        const data = {
          status: item.status,
        };
        const response = await this.api
          .changeStatusToApproved(item.id, data)
          .then((response) => {
            this.fetchStatistics();
            this.$refs.table.refreshTable(); // Refresh the table
            Swal.fire(
              this.$t("campaign.Success"),
              this.$t("campaign.Campaign Status Approved Successfully"),
              "success"
            ); // Success message
          })
          .catch((error) => {
            Swal.fire(
              this.$t("campaign.Error"),
              this.$t("campaign.There was an error approving the Campaign"),
              "error"
            ); // Error message
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // If user cancels, show a message
        Swal.fire(
          this.$t("campaign.Cancelled"),
          this.$t("campaign.The operation was cancelled"),
          "info"
        );
      }
    },

    // Handle the "Initiate" button click
    async changeStatusToReject(item) {
      try {
        if (this.newItem.comment == null || this.newItem.comment == "") {
          this.api.poup(
            { status: false, message: this.$t("campaign.Comment is required") },
            "Error"
          );
          return;
        }
        const formData = {
          id: this.newItem.id,
          comment: this.newItem.comment,
          status: "rejected",
        };
        const response = await this.api.changeStatusToReject(
          this.newItem.id,
          formData
        );
        if (response.status === 200) {
          notify({
            type: "success",
            title: this.$t("campaign.Success"),
            text: this.$t("campaign.Status Updated Successfully"),
            duration: 3000,
            speed: 500,
            data: {
              icon: "check-circle",
              style: {
                background: "#f0f9f0",
                color: "#155724",
                borderLeft: "4px solid #28a745",
              },
            },
          });
          this.closeCommentModal();
          await this.fetchStatistics();
          this.$refs.table.refreshTable(); // Refresh the table
          this.newItem = {};
          this.newItem.comment = "";
        }
      } catch (error) {
        notify({
          type: "error", // Type of notification
          title: this.$t("campaign.Error"), // Notification title
          text:
            error.response?.data?.message ||
            this.$t("campaign.An error occurred, Please try again"), // Notification message
          duration: 3000, // Duration in milliseconds
          speed: 500, // Animation speed
          data: {
            icon: "exclamation-circle", // Custom icon (if supported by your library)
            style: {
              background: "#f8d7da", // Light red background
              color: "#721c24", // Dark red text
              borderLeft: "4px solid #dc3545", // Red accent border
            },
          },
        });
      }
    },

    async sendMail(item) {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: this.$t("campaign.Are you sure?"),
        text: this.$t("campaign.You are about to send mail for this campaign!"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, send it!",
        cancelButtonText: "No, cancel!",
      });

      if (result.isConfirmed) {
        const response = await this.api
          .sendMail(item.id)
          .then((response) => {
            this.fetchStatistics();
            this.$refs.table.refreshTable(); // Refresh the table
            Swal.fire(
              this.$t("campaign.Success"),
              this.$t("campaign.Campaign Status Approved Successfully"),
              "success"
            ); // Success message
          })
          .catch((error) => {
            Swal.fire(
              this.$t("campaign.Error"),
              this.$t("campaign.There was an error send mail for the Campaign"),
              "error"
            ); // Error message
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // If user cancels, show a message
        Swal.fire(
          this.$t("campaign.Cancelled"),
          this.$t("campaign.The operation was cancelled"),
          "info"
        );
      }
    },
  },

  watch: {
    filter: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        this.apiParams.filter = "";
        // Construct the filter string for apiParams
        const filters = [];
        if (newFilter.type) {
          filters.push(`type|${newFilter.type}|=`);
        }
        // Update apiParams with the new filter
        this.apiParams.filter = filters.join(",");
        this.fetchStatistics();
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.v-card.selected {
  border: 2px solid var(--v-primary-base);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.statistics-container {
  display: flex;
  gap: 1.5rem;
  padding: 16px;
}

.status-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card-icon {
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 1rem;
}

.card-content {
  flex: 1;
  overflow: hidden;
}

.card-icon.total {
  background: #44235c;
  color: white;
}

.card-icon.simulated {
  background: #3b82f6;
  color: white;
}

.card-icon.security {
  background: #e11d48;
  color: white;
}

.card-icon.both {
  background: #2427fb;
  color: white;
}

.card-icon.pending {
  background: #fbbf24;
  color: white;
}

.card-icon.approved {
  background: #22c55e;
  color: white;
}

.card-icon.completed {
  /* background: #03230f; */
  background: #14b8a6;
  color: white;
}

.card-icon.ondemand {
  background: #ff7b00;
  color: white;
}

.card-icon.schedualed {
  background: #3b82f6;
  color: white;
}

.card-title {
  font-size: 0.95rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-number {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0.2rem;
}

.icofont-fountain-pen {
  display: none;
}

.stepper-item {
  font-size: 17px;
}
.statistics-wrapper {
  width: 100%;
  padding: 0;
  margin-bottom: 24px;
}

.status-cards-container {
  display: flex;
  border-radius: 10px;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
}
.status-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-wrapper i {
  font-size: 20px;
  color: #ffffff;
}

/* Icon Colors based on the design */
.total-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.completed-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.scheduled-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.ondemand-icon {
  background: linear-gradient(135deg, #eab308 0%, #fde047 100%);
}

.approved-icon {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 10px;
  font-weight: 500;
  color: #8c8c8c;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .status-cards-container {
    flex-wrap: wrap;
  }

  .status-card {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .status-card {
    flex: 1 1 calc(50% - 6px);
    min-width: 150px;
  }
}

@media (max-width: 576px) {
  .status-cards-container {
    flex-direction: column;
  }

  .status-card {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .card-value {
    font-size: 24px;
  }

  .card-label {
    font-size: 12px;
  }
}

/* RTL Support */
[dir="rtl"] .status-card {
  direction: rtl;
}

[dir="rtl"] .card-details {
  text-align: right;
}

div:where(.swal2-container) h2:where(.swal2-title) {
  padding: 0;
  color: #000;
  font-size: 14px;
}

.v-dialog > .v-overlay__content > .v-card > .v-card-text,
.v-dialog > .v-overlay__content > form > .v-card > .v-card-text {
  padding: 0px 12px !important;
}

.title-dialog {
  font-weight: 600;
  font-size: 1rem;
  color: #000;
}

.btn-submit {
  background: #6e3894;
  color: #fff;
  border-radius: 10px;
  padding: 0px 12px;
}

.btn-cancel {
  border: 1px solid #6e3894;
  color: #6e3894;
  border-radius: 10px;
  padding: 0px 12px;
}

.dropdown-item {
  padding: 0 1rem;
  height: 30px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000;
  margin-bottom: 12px;
  border-top: 1px solid #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.badge-purple {
  background: #d0b5e3;
  color: #6e3894;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.progress-bar {
  background-color: #6e3894;
}

.bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
  border-radius: 10px;
  padding: 4px 8px 4px 8px;
  font-weight: 500;
}
.bg-danger {
  background-color: #e2b6b6 !important;
  color: #a92525 !important;
  border-radius: 10px;
  padding: 4px 8px 4px 8px;
  font-weight: 500;
}

.bg-warning {
  background-color: rgb(var(--v-theme-warning)) !important;
  color: #ffffff !important;
  border-radius: 10px;
  padding: 4px 8px 4px 8px;
  font-weight: 500;
}

.bg-info {
  background-color: #dbeafe !important;
  color: #1e40af !important;
}

.bg-secondary {
  background-color: #e5e7eb !important;
  color: #374151 !important;
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

.right-btn {
  border-radius: 50%;
  background-color: #8c8c8c !important;
  color: #fff !important;
  padding: 9px;
}

.left-btn {
  border-radius: 50%;
  background-color: #8c8c8c !important;
  color: #fff !important;
  padding: 9px;
}

.info-btn {
  border-radius: 50%;
  background-color: #6e3894 !important;
  color: #fff !important;
  padding: 9px;
}

.btns-section {
  margin-top: 50px;
}

.multiple-select {
  min-height: 150px;
}

.next-btn {
  background-color: #6e3894 !important;
  color: #fff !important;
  border: 1px solid #6e3894;
  border-radius: 10px;
  height: 25px !important;
  padding: 1px 16px 1px 16px;
  gap: 4px;
}

.back-btn {
  background-color: #fff !important;
  color: #6e3894 !important;
  border: 1px solid #6e3894;
  border-radius: 10px;
  height: 25px !important;
  padding: 1px 16px 1px 16px;
  gap: 4px;
}

/* Reset and override any previous styles for input-name */
.input-name {
  border-radius: 10px !important;
  border: 1px solid #d9d9d9 !important;
  padding: 7px !important;
  font-size: 12px !important;
}

/* Users Modal Styling */
.users-modal-card {
  border-radius: 12px !important;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 100%;
  letter-spacing: 0%;
  color: #000000;
}

.users-table-container {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 16px;
  padding-left: 16px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  border: 1px solid #d9d9d9;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.users-table thead {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.users-table .table-header {
  background: #fafbfb;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.users-table th {
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
  color: #000000;
}

.users-table th:last-child {
  border-right: none;
}

.users-table .table-row {
  transition: background-color 0.2s;
}

.users-table .table-row:hover {
  background-color: #d9d9d9;
}

.users-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #121212;
}

.users-table td:last-child {
  border-right: none;
}

.user-checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.user-checkbox :deep(.v-input__control) {
  justify-content: center;
}

.user-checkbox :deep(.v-selection-control) {
  min-height: auto;
}

.confirm-btn {
  background-color: #6e3894 !important;
  color: #fff !important;
  border-radius: 14px !important;
  padding-right: 16px !important;
  padding-left: 16px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  font-size: 14px !important;
}

.confirm-btn:hover {
  background-color: #5a2d7a !important;
}

.selected-btn {
  background-color: #6e3894 !important;
  color: #fff !important;
  border-radius: 10px !important;
  height: 25px !important;
  gap: 8px !important;
}

.non-selected-btn {
  background-color: #8c8c8c !important;
  color: #fff !important;
  border-radius: 10px !important;
  height: 25px !important;
  gap: 8px !important;
}

.selected-schedule {
  width: 100% !important;
  padding-bottom: 24px !important;
}

.non-selected-schedule {
  width: 100% !important;
  padding-bottom: 24px !important;
}

/* Campaign Summary Styling */
.summary-title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
}

.summary-section {
  background: #f0f0f0;
  border-radius: 12px;
  padding: 20px;
}

.summary-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #d9d9d9;
}

.summary-field {
  margin-bottom: 8px;
}

.summary-label {
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 14px;
  color: #000;
  font-weight: 400;
}

.template-chips-container,
.module-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.template-chip {
  background-color: #e8e8e8;
  color: #000;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.module-chip {
  background-color: #fff;
  color: #000;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  border: 1px solid #e0e0e0;
}

.avatar-group {
  display: flex;
  align-items: center;
}

.avatar-text {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.avatar-text-more {
  font-size: 11px;
  font-weight: 600;
  color: #666;
}
.modal-header {
  justify-content: space-between;
}
.summary-section-title {
  display: flex;
}
[dir="rtl"] .template-chips-container,
[dir="rtl"] .module-chips-container {
  justify-content: flex-end;
}
[dir="rtl"] .summary-field {
  text-align: end;
}
[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row {
  text-align: end;
}
[dir="rtl"] .rtl {
  flex-direction: row-reverse;
}
[dir="rtl"] .v-textarea textarea:focus,
[dir="rtl"] .v-textarea textarea:active {
  text-align: end;
}

/* Chart Styles */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.chart-container-equal-height {
  min-height: 400px;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  padding-bottom: 0.5rem;
}

/* Statistics Wrapper */
.statistics-wrapper {
  padding: 1rem 0;
}

.status-cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

/* Responsive Design for Charts */
@media (max-width: 992px) {
  .status-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
  }

  .chart-title {
    font-size: 1rem;
  }

  .status-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .chart-container {
    padding: 0.75rem;
  }

  .chart-title {
    font-size: 0.95rem;
  }

  .status-cards-container {
    grid-template-columns: 1fr;
  }
}

/* Analytics Section Header */
.analytics-section-header {
  width: 100%;
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-image-slice: 1;
}

.analytics-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Table Header Row with Export Buttons */
.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.export-buttons-top {
  display: flex;
  gap: 0.5rem;
}

.export-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
}

.export-icon-btn i {
  font-size: 18px;
}

.export-icon-btn.export-pdf-btn {
  background: #d32f2f;
  border-color: #d32f2f;
}

.export-icon-btn.export-pdf-btn:hover {
  background: #b71c1c;
  border-color: #b71c1c;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(211, 47, 47, 0.4);
}

.export-icon-btn.export-excel-btn {
  background: #2e7d32;
  border-color: #2e7d32;
}

.export-icon-btn.export-excel-btn:hover {
  background: #1b5e20;
  border-color: #1b5e20;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(46, 125, 50, 0.4);
}

/* Statistics Filters Styles */
.statistics-filters {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;
  flex: 1;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.3px;
  margin-bottom: 0.15rem;
}

.filter-select {
  padding: 0.4rem 0.5rem;
  font-size: 0.75rem;
  border: 1px solid #000;
  border-radius: 4px;
  background: #fff;
  color: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.filter-select:hover {
  background: #f5f5f5;
  border-color: #333;
}

.filter-select:focus {
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.filter-reset-btn {
  padding: 0.31rem 0.75rem;
  font-size: 0.75rem;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  cursor: pointer;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
  font-weight: 600;
  white-space: nowrap;
}

.filter-reset-btn:hover {
  background: #333;
  border-color: #333;
  transform: translateY(-1px);
}

.filter-reset-btn i {
  font-size: 0.85rem;
}

/* Export Buttons */
.export-group {
  min-width: auto;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  color: #fff;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  font-weight: 600;
  white-space: nowrap;
}

.export-btn i {
  font-size: 0.9rem;
}

.export-pdf-btn {
  background: #d32f2f;
  border-color: #d32f2f;
}

.export-pdf-btn:hover {
  background: #b71c1c;
  border-color: #b71c1c;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(211, 47, 47, 0.3);
}

.export-excel-btn {
  background: #2e7d32;
  border-color: #2e7d32;
}

.export-excel-btn:hover {
  background: #1b5e20;
  border-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.3);
}

/* Responsive Filters */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group {
    min-width: 100%;
    width: 100%;
  }

  .filter-reset-btn {
    width: 100%;
    justify-content: center;
  }

  .export-buttons {
    width: 100%;
  }

  .export-btn {
    flex: 1;
    justify-content: center;
  }
}

/* Statistics Table Styles - Black & White Theme */
.statistics-table-container {
  background: #fff;
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid #000;
  margin-top: 1rem;
}

.table-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.statistics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.statistics-table thead {
  background: #000;
  color: #fff;
}

.statistics-table th {
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid #000;
}

.statistics-table tbody tr {
  border-bottom: 1px solid #ddd;
  transition: background-color 0.2s ease;
}

.statistics-table tbody tr:hover:not(.category-header) {
  background-color: #f5f5f5;
}

.statistics-table td {
  padding: 0.5rem;
  color: #000;
  border: 1px solid #ddd;
  text-align: center;
}

.statistics-table .category-header {
  background: #f0f0f0;
  font-weight: 600;
}

.statistics-table .category-header td {
  padding: 0.5rem;
  color: #000;
  border-top: 1px solid #000;
}

.statistics-table .summary-row {
  background: #e5e5e5;
  font-weight: 600;
  border-top: 1px solid #000;
}

.statistics-table .summary-row td {
  padding: 0.5rem;
  font-size: 0.75rem;
}

.percentage-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.percentage-bar {
  flex: 1;
  height: 18px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.percentage-fill {
  height: 100%;
  transition: width 0.6s ease;
  border-radius: 3px;
}

.percentage-text {
  min-width: 40px;
  font-weight: 600;
  color: #000;
  text-align: right;
  font-size: 0.7rem;
}

/* Black & White gradient fills for different metrics */
.phishing-fill {
  background: linear-gradient(90deg, #000 0%, #2a2a2a 100%);
}

.awareness-fill {
  background: linear-gradient(90deg, #4a4a4a 0%, #5a5a5a 100%);
}

.both-fill {
  background: linear-gradient(90deg, #6a6a6a 0%, #7a7a7a 100%);
}

.pending-fill {
  background: linear-gradient(90deg, #8a8a8a 0%, #9a9a9a 100%);
}

.approved-fill {
  background: linear-gradient(90deg, #333 0%, #444 100%);
}

.rejected-fill {
  background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%);
}

.ondemand-fill {
  background: linear-gradient(90deg, #555 0%, #666 100%);
}

.scheduled-fill {
  background: linear-gradient(90deg, #777 0%, #888 100%);
}

.total-fill {
  background: linear-gradient(90deg, #000 0%, #333 100%);
}

/* Responsive Design for Statistics Table */
@media (max-width: 768px) {
  .statistics-table-container {
    padding: 0.5rem;
  }

  .table-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .export-buttons-top {
    align-self: flex-end;
  }

  .table-title {
    font-size: 0.8rem;
  }

  .statistics-table {
    font-size: 0.7rem;
  }

  .statistics-table th,
  .statistics-table td {
    padding: 0.4rem 0.3rem;
  }

  .percentage-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .percentage-bar {
    width: 100%;
  }

  .percentage-text {
    min-width: auto;
    text-align: left;
    font-size: 0.65rem;
  }
}

@media (max-width: 576px) {
  .statistics-table thead {
    display: none;
  }

  .statistics-table,
  .statistics-table tbody,
  .statistics-table tr,
  .statistics-table td {
    display: block;
    width: 100%;
  }

  .statistics-table tr {
    margin-bottom: 0.5rem;
    border: 1px solid #000;
    border-radius: 4px;
    overflow: hidden;
  }

  .statistics-table tr:not(.category-header) {
    background: white;
  }

  .statistics-table td {
    text-align: left;
    padding: 0.75rem 1rem;
    position: relative;
    padding-left: 50%;
  }

  .statistics-table td:before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    width: 45%;
    font-weight: 600;
    color: #495057;
  }

  .statistics-table .category-header td {
    padding-left: 1rem;
    text-align: center;
  }

  .statistics-table .category-header td:before {
    display: none;
  }

  .percentage-container {
    flex-direction: row;
  }
}

/* Action Dropdown */
.dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  border-top: 1px solid #efefef;
}

.dropdown-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
  color: #000000 !important;
}

.dropdown-item:first-child {
  border-top: none;
}

.dropdown-item i {
  width: 1rem;
  text-align: center;
  padding-left: 14px;
  padding-right: 44px;
}
</style>
