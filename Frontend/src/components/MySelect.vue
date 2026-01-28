<template>
  <div class="dropdown">
    <input
      class="form-control"
      v-model="text"
      @input="search(text)"
      @focus="show = true"
      type="text"
    />

    <ul
      class="dropdown-menu w-100"
      :class="{ show: show }"
      style="max-height: 150px; overflow: auto"
    >
      <li v-for="(item, index) in items" :key="index" @click="setSelect(item)">
        <button class="dropdown-item" :class="{ active: selected == item[id] }">
          {{ item[label]?.[loacl] ? item[label][loacl] : item[label] }}
        </button>
      </li>
      <li v-if="items.length == 0"><span class="text-center"> Not Found</span></li>
      <li @click="setSelect(item)">
        <button class="btn btn-primary btn-block" @click.prevent="add(text)">
          {{ $t("site.add") }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      required: true,
    },
    search: {
      type: Function,
      default() {
        //    this.text = this.text.replace(
        //      new RegExp(
        //        String.fromCharCode(
        //          1617,
        //          124,
        //          1614,
        //          124,
        //          1611,
        //          124,
        //          1615,
        //          124,
        //          1612,
        //          124,
        //          1616,
        //          124,
        //          1613,
        //          124,
        //          1618
        //        ),
        //        "g"
        //      ),
        //      ""
        //    );
        //    var regExp = new RegExp(this.text, "i");
        //    this.items = $.grep(this.list, (e, i) => {
        //      let text = this.translate ? e[this.label][this.loacl] : e[this.label];
        //      let match = regExp.test(
        //        text.replace(
        //          new RegExp(
        //            String.fromCharCode(
        //              1617,
        //              124,
        //              1614,
        //              124,
        //              1611,
        //              124,
        //              1615,
        //              124,
        //              1612,
        //              124,
        //              1616,
        //              124,
        //              1613,
        //              124,
        //              1618
        //            ),
        //            "g"
        //          ),
        //          ""
        //        )
        //      );
        //      return match;
        //    });
      },
    },
    select: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    translate: {
      type: Boolean,
      required: true,
    },
    add: {
      type: Function,
      default() {},
    },
  },
  data() {
    return {
      show: false,
      text: "",
      items: this.list,
      selected: this.select,
      loacl: localStorage.getItem("locale") ?? "ar",
    };
  },
  created() {
    console.log(this.translate);
    this.text="";
  },
  methods: {
    setSelect(item) {
      if (!item) {
        this.text="";
        return;
      }
      //  console.log(item);
      this.selected = item[this.id];
      //  this.select = this.selected;
      this.text = item[this.label]?.[this.loacl]
        ? item[this.label][this.loacl]
        : item[this.label];
      this.show = false;
    },
    getSelected() {
      return this.selected;
    },
    //     search() {
    //       this.show = true;

    //       this.text = this.text.replace(
    //         new RegExp(
    //           String.fromCharCode(
    //             1617,
    //             124,
    //             1614,
    //             124,
    //             1611,
    //             124,
    //             1615,
    //             124,
    //             1612,
    //             124,
    //             1616,
    //             124,
    //             1613,
    //             124,
    //             1618
    //           ),
    //           "g"
    //         ),
    //         ""
    //       );

    //       var regExp = new RegExp(this.text, "i");
    //     this.items= $.grep(this.list, (e, i) => {
    //       let text=  this.translate ?  e[this.label][this.loacl] :  e[this.label];
    //         let match = regExp.test(
    //           text.replace(
    //             new RegExp(
    //               String.fromCharCode(
    //                 1617,
    //                 124,
    //                 1614,
    //                 124,
    //                 1611,
    //                 124,
    //                 1615,
    //                 124,
    //                 1612,
    //                 124,
    //                 1616,
    //                 124,
    //                 1613,
    //                 124,
    //                 1618
    //               ),
    //               "g"
    //             ),
    //             ""
    //           )
    //         );
    //         return match;
    //       });
    //      //  console.log(tt);
    //      //  return list;
    //     },
  },
  watch: {
    list() {
      const find = this.list.find((a) => a[this.id] == this.select);
      console.log(this.list);
      this.items = this.list;
      
      if (find)
        this.text = find[this.label]?.[this.loacl]
          ? find[this.label][this.loacl]
          : find[this.label];
    },
  },
};
</script>

<style>
</style>