<template>
  <v-dialog v-model="localShow" max-width="800px" scrollable persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-3">
        <span class="headline">{{ title }}</span>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="modal-content-wrapper">
        <div v-if="isHtml" v-html="content"></div>
        <div v-else-if="Array.isArray(content)">
          <ul>
            <li v-for="(item, index) in content" :key="index" v-html="item"></li>
          </ul>
        </div>
        <div v-else>
          {{ content }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ContentModal",
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ""
    },
    content: {
      type: [String, Array],
      default: ""
    }
  },
  data() {
    return {
      localShow: this.show
    };
  },
  computed: {
    isHtml() {
      if (!this.content) return false;
      if (Array.isArray(this.content)) {
        return this.content.some((item) => /<[a-z][\s\S]*>/i.test(item));
      }
      return /<[a-z][\s\S]*>/i.test(this.content);
    }
  },
  watch: {
    show(val) {
      this.localShow = val;
    },
    localShow(val) {
      if (!val) {
        this.$emit('update:show', false);
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:show', false);
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-content-wrapper {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-content-wrapper ul {
  list-style-type: disc;
  padding-left: 20px;
}

.modal-content-wrapper li {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>