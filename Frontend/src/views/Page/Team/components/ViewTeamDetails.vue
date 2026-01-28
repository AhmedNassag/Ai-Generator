<template>
  <v-dialog :model-value="viewTeamModal" @update:model-value="$emit('update:viewTeamModal', $event)" max-width="900">
    <v-card elevation="10" class="pa-4 rounded-xl">
      <v-card-title class="d-flex justify-space-between align-center pb-2">
        <span class="text-h6 font-weight-bold">{{ $t("team.team_details") }}</span>
        <v-btn icon @click="$emit('close')" color="grey-darken-1">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="mb-4"></v-divider>

      <v-card-text>
        <v-container fluid>
          <v-row dense>

            <v-col cols="12">
              <strong class="text-grey-darken-1">{{ $t("common.name") }}:</strong>
              <div class="text-body-1">{{ teamData.name }}</div>
            </v-col>

            <v-col cols="12" class="mt-5">
              <strong class="text-grey-darken-1">{{ $t("team.members") }}:</strong>
              <div class="text-body-1">
                {{teamData.users.map(user => user.full_name).join(', ')}}
              </div>
            </v-col>

          </v-row>
        </v-container>
      </v-card-text>

      <v-divider class="my-3"></v-divider>

      <v-card-actions class="justify-end">
        <v-btn color="grey-darken-1" variant="tonal" @click="$emit('close')">
          {{ $t("common.close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    viewTeamModal: {
      type: Boolean,
      required: true
    },
    teamData: {
      type: Object,
      required: true
    }
  },

}
</script>