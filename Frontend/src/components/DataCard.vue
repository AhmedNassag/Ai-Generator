<template>
  <div class="row justify-content-between">
    <!-- Container for main actions on cards -->
    <div class="col-12 col-md-6 col-lg-3">
      <div
        aria-label="Basic example"
        class="btn-group mb-3 mw-100"
        role="group"
      >
        <!-- This buton is used to select all items -->
        <button class="btn ripple btn-outline-danger pd-x-25" type="button">
          <label class="ckbox wd-16 mg-b-0">
            <input
              class="mg-0"
              type="checkbox"
              value="1"
              v-model="select"
              @change="selectItemAll(select)"
            /><span></span>
          </label>
        </button>

        <!-- This button is used to delete items -->
        <button
          class="btn ripple btn-outline-danger pd-x-25"
          type="button"
          @click="multiDelete()"
        >
          <i class="si si-trash" data-bs-toggle="tooltip" title="si-trash"></i>
        </button>

        <!-- This button is used export data as csv -->
        <button
          class="btn ripple btn-outline-dark pd-x-25"
          type="button"
          @click="ExportExcel('csv')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-filetype-csv"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.102-.633a.868.868 0 0 1 .302-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.441 1.441 0 0 0-.489-.272 1.838 1.838 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879l-1.327 4Z"
            />
          </svg>
        </button>

        <!-- This button is used export data as xls -->
        <button
          class="btn ripple btn-outline-dark pd-x-25"
          type="button"
          @click="ExportExcel('xls')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-filetype-xls"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM6.472 15.29a1.176 1.176 0 0 1-.111-.449h.765a.578.578 0 0 0 .254.384c.07.049.154.087.25.114.095.028.202.041.319.041.164 0 .302-.023.413-.07a.559.559 0 0 0 .255-.193.507.507 0 0 0 .085-.29.387.387 0 0 0-.153-.326c-.101-.08-.255-.144-.462-.193l-.619-.143a1.72 1.72 0 0 1-.539-.214 1.001 1.001 0 0 1-.351-.367 1.068 1.068 0 0 1-.123-.524c0-.244.063-.457.19-.639.127-.181.303-.322.527-.422.225-.1.484-.149.777-.149.305 0 .564.05.78.152.216.102.383.239.5.41.12.17.186.359.2.566h-.75a.56.56 0 0 0-.12-.258.625.625 0 0 0-.247-.181.923.923 0 0 0-.369-.068c-.217 0-.388.05-.513.152a.472.472 0 0 0-.184.384c0 .121.048.22.143.3a.97.97 0 0 0 .405.175l.62.143c.217.05.406.12.566.211a1 1 0 0 1 .375.358c.09.148.135.335.135.56 0 .247-.063.466-.188.656a1.216 1.216 0 0 1-.539.439c-.234.105-.52.158-.858.158-.254 0-.476-.03-.665-.09a1.404 1.404 0 0 1-.478-.252 1.13 1.13 0 0 1-.29-.375Zm-2.945-3.358h-.893L1.81 13.37h-.036l-.832-1.438h-.93l1.227 1.983L0 15.931h.861l.853-1.415h.035l.85 1.415h.908L2.253 13.94l1.274-2.007Zm2.727 3.325H4.557v-3.325h-.79v4h2.487v-.675Z"
            />
          </svg>
        </button>

        <!-- This button is used export data as xlsx -->
        <button
          class="btn ripple btn-outline-dark pd-x-25"
          type="button"
          @click="ExportExcel('xlsx')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-filetype-xlsx"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM7.86 14.841a1.13 1.13 0 0 0 .401.823c.13.108.29.192.479.252.19.061.411.091.665.091.338 0 .624-.053.858-.158.237-.105.416-.252.54-.44a1.17 1.17 0 0 0 .187-.656c0-.224-.045-.41-.135-.56a1.002 1.002 0 0 0-.375-.357 2.028 2.028 0 0 0-.565-.21l-.621-.144a.97.97 0 0 1-.405-.176.37.37 0 0 1-.143-.299c0-.156.061-.284.184-.384.125-.101.296-.152.513-.152.143 0 .266.023.37.068a.624.624 0 0 1 .245.181.56.56 0 0 1 .12.258h.75a1.093 1.093 0 0 0-.199-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.552.05-.777.15-.224.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.123.524.082.149.199.27.351.367.153.095.332.167.54.213l.618.144c.207.049.36.113.462.193a.387.387 0 0 1 .153.326.512.512 0 0 1-.085.29.558.558 0 0 1-.255.193c-.111.047-.25.07-.413.07-.117 0-.224-.013-.32-.04a.837.837 0 0 1-.249-.115.578.578 0 0 1-.255-.384h-.764Zm-3.726-2.909h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415H1.5l1.24-2.016-1.228-1.983h.931l.832 1.438h.036l.823-1.438Zm1.923 3.325h1.697v.674H5.266v-3.999h.791v3.325Zm7.636-3.325h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415h-.861l1.24-2.016-1.228-1.983h.931l.832 1.438h.036l.823-1.438Z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="col-lg-6 col-md-6 col-sm-12">
      <div class="input-group mb-3" v-if="searchShow">
        <input
          class="form-control"
          :placeholder="$t('site.search_holder')"
          @input="searchChange()"
          v-model="search"
          type="text"
        /><span class="input-group-btn"
          ><button class="btn ripple btn-primary" type="button">
            <i class="fa fa-search"></i></button
        ></span>
      </div>
    </div>

    <!-- Page Size & Total Count -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="row mb-3">
        <div class="col-6">
          <select
            name="country"
            @change="changePageSize(num)"
            v-model="perPage"
            class="form-control select2"
          >
            <option
              :value="num"
              @click="changePageSize(num)"
              v-for="num in [10, 20, 50, 100]"
              :key="num"
            >
              {{ num }}
            </option>
          </select>
        </div>
        <div class="col-6">
          <h5 class="float-md-end mt-1">{{ total }}:{{ $t("site.total") }}</h5>
        </div>
      </div>
    </div>
  </div>

  <!-- Cards Section -->
  <div class="row">
    <div
      class="col-lg-3 col-md-4 mb-3 student-card-wrapper"
      v-for="(tr, indextr) in data"
      :key="indextr"
     >
    <div class="card h-100  shadow-lg student-card animated-card">
     <div class="card-body">
          <!-- Select Checkbox -->
          <label class="ckbox wd-16 mg-b-0">
            <input
              class="mg-0"
              :value="tr._id"
              v-model="selected"
              type="checkbox" /><span></span
          ></label>

          <!-- Display Data Fields -->
          <div v-for="(field, indexField) in fields" :key="indexField">
            <slot :name="field.key" :item="tr" :rowIndex="indextr">
              <strong>{{ field.label }}:</strong> {{ getText(tr, field) }}
            </slot>
          </div>
        </div>

        <!-- Card Footer with Actions -->
        <div class="card-footer text-center btn-list"  v-if="action">
          <div class="row p-1">
            <div class="col-6">
              <button
                class="btn ripple btn-warning btn-block"
                @click="editItem(tr)"
              >
                <i class="si si-pencil"></i>
              </button>
            </div>
            <div class="col-6">
              <button
                class="btn ripple btn-danger btn-block"
                @click="deleteItem(tr)"
              >
                <i class="si si-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loader -->
  <div class="text-center mg-b-20" v-if="load">
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
  </div>

  <!-- Pagination -->
  <div class="row">
    <paginate
      v-model="page"
      :page-count="getPages()"
      :page-range="3"
      :margin-pages="2"
      :click-handler="onChangePage"
      :prev-text="$t('site.previous')"
      :next-text="$t('site.next')"
      :container-class="'pagination justify-content-end mt-1'"
      :page-class="'page-item'"
    ></paginate>
  </div>
</template>
  <script>
import Auth from "../API/Auth";
import Paginate from "vuejs-paginate-next";
import { utils, writeFile } from "xlsx";
export default {
  props: {
    fields: Array,
    api: Object,
    editItem: Function,
    apiParams: Object,
    action: Boolean,
    searchShow: {
      type: Boolean,
      default: true,
    },
    stopLoad: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    paginate: Paginate,
  },
  computed: {},
  data: () => ({
    selected: [],
    data: [],
    perPage: 10,
    from: 0,
    to: 5,
    search: "",
    total: 0,
    currentx: 10,
    sortBy: "",
    page: 1,
    params: {},
    selectAll: [],
    load: false,
    select: false,
    locale: localStorage.getItem("locale") ?? "ar", // to get current active language
    sortDesc: "asc",
    sortField: "",
    changeSource: false,
    source: "",
  }),
  watch: {
    apiParams: function () {
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
  },
  created() {
    if (!window.location.search.includes("show")) {
      this.$parent.tab = 0;
    } else if (window.location.search.includes("show")) {
      this.$parent.tab = 1;
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    }
    if (!this.stopLoad) {
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    }
  },
  methods: {
    permission(type) {
      if (Auth.USER.admin == 1) return true;
      const permission = Auth.ROLE.permissions.find(
        (a) => a.name == this.$route.name
      );

      if (permission[type] == "true") return true;
      return false;
    },
    getText(tr, field) {
      if (field.translate) return tr[field.key][this.locale];

      if (field.key.includes(".")) {
        const textST = field.key.split(".");
        return tr[textST[0]]?.[textST[1]];
      }

      if (field.type === "datetime") {
        console.log("tr", tr[field.key]);
        return this.$moment(tr[field.key]).format("Y-MM-DD LT");
      }

      if (field.type === "date")
        return this.$moment(tr[field.key]).format("Y-MM-DD");

      return tr[field.key];
    },
    onChangePage(page) {
      this.page = page;
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
    async getData() {
      this.load = true;
      const data = await this.api.getAll(this.apiParamsConverter());
      this.total = data.total;
      this.data = data.data;
      this.load = false;
    },
    async anotherGetData(method) {
      this.source = method;
      this.load = true;
      console.log(this.source);
      console.log(this.changeSource);
      const data = await this.api[method](this.apiParamsConverter());
      this.total = data.total;
      this.data = data.data;
      this.load = false;
    },
    sort(field, sortable) {
      if (!sortable) return;

      if (this.sortField == field)
        this.sortDesc == "asc"
          ? (this.sortDesc = "desc")
          : (this.sortDesc = "asc");
      this.apiParams.sort = `${field}|${this.sortDesc}`;

      this.sortField = field;

      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
    getPages() {
      const lastpage = Math.ceil(this.total / this.perPage);
      let pages = [];
      // for (let index = 1; index <= lastpage; index++) {
      //   pages.push(index);
      // }
      // console.log(lastpage);
      return lastpage;
    },
    apiParamsConverter() {
      this.apiParams.perPage = this.perPage;
      this.apiParams.page = this.page;

      if (this.sortBy !== "") {
        this.apiParams.sort = `${this.sortBy}|${
          this.params.sortDesc ? "desc" : "asc"
        }`;
      }
      if (this.search !== "") {
        this.apiParams.search = this.search;
      }
      return this.apiParams;
    },
    changePageSize(perPage) {
      this.page = 1;

      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
    searchChange() {
      if (this.search.length < 1) {
        this.apiParams.search = "";
        this.page = 1;
        if (this.changeSource) {
          this.anotherGetData(this.source);
        } else {
          this.getData();
        }
      }
      if (this.search.length < 2) return;
      this.page = 1;
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
    selectItemAll(select) {
      this.selected = [];
      console.log(select);
      if (select == 1)
        this.selected = this.data.map((a) => {
          return a._id;
        });
    },
    async deleteItem(data) {
      await this.api.delete(0, [data._id].map(String));
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
    async multiDelete() {
      console.log(this.selected);
      await this.api.delete(0, Object.values(this.selected).map(String));
      if (this.changeSource) {
        this.anotherGetData(this.source);
      } else {
        this.getData();
      }
    },
    ExportExcel(type = "xlsx") {
      // Assuming you have already loaded the sheetjs library and have an HTML table element
      const table = this.$refs.exportable_table;

      // Convert the HTML table to a worksheet object
      let worksheet = utils.table_to_sheet(table);

      // Define regular expressions for matching specific patterns in cell column names
      const regexs = {
        // Match cell column names that start with the letter "A" followed by one or more digits
        firstColumn: /^A\d+$/,
        // Match cell column names that end with a colon followed by a letter and a number
        lastColumn: /.*:([A-Z]+)(\d+)/,
      };

      // Initialize a counter variable
      let counter = 1;

      // Get the name of the last column in the worksheet
      const lastColumnName = regexs.lastColumn.exec(worksheet["!ref"])[1];

      // Loop through each key in the worksheet object
      for (const key in worksheet) {
        // Check if the key matches the first column pattern and the value is not "#"
        if (regexs.firstColumn.test(key) && worksheet[key]["v"] !== "#") {
          // Set the value of the cell to the current counter value and set the type to "s"
          worksheet[key]["v"] = counter++;
          worksheet[key]["t"] = "s";
        }

        // Check if the key starts with the name of the last column (Delete last column "Action column")
        if (key.startsWith(lastColumnName)) {
          // Delete the key (i.e., the last column) from the worksheet object
          delete worksheet[key];
        }
      }

      // Create a new workbook object and add the worksheet to it
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Package and Release Data (`writeFile` tries to write and save an `type` file)
      return writeFile(workbook, `${this.$route.name}.${type}`, {
        bookType: type,
      });
    },
  },
};
</script>
  
<style scoped>
/* Animation on initial load */
@keyframes slideIn {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Apply animation when the card is loaded */
  .animated-card {
    animation: slideIn 0.6s ease-out;
  }

  /* Optional hover effect */
  .student-card-wrapper {
    display: inline-block;
    transition: transform 0.4s ease;
  }

  .student-card-wrapper:hover {
    transform: translateY(-10px); /* Moves the card up on hover */
  }

  /* Adding shadow on hover */
  .student-card-wrapper:hover .student-card {
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
  }

</style>