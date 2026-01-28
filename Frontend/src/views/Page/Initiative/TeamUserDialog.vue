<template>
    <v-dialog v-model="dialog" max-width="600px" max-height="500px" persistent>
        <v-card>
            <v-card-title>
                <v-tabs v-model="currentTab" background-color="transparent" grow>
                    <v-tab value="teams">{{ $t("initiative.Teams") }}</v-tab>
                    <v-tab value="users">{{ $t("initiative.Users") }}</v-tab>
                </v-tabs>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text>
                <!-- Teams Tab Content -->
                <div v-show="currentTab === 'teams'">
                    <div class="mb-3 text-caption text-grey-600 text-danger">
                        {{ $t("initiative.Select") }}
                    </div>
                    <div v-if="teams.length === 0" class="text-center py-4">{{ $t("initiative.No teams available") }}</div>
                    <v-list v-else>
                        <v-list-item v-for="team in teams" :key="team.id" @click="selectTeam(team)"
                            :class="{ 'selected-team': currentSelectedTeam?.id === team.id }" style="cursor: pointer;">
                            <v-list-item-content>
                                <v-list-item-title>{{ team.name }}</v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-icon v-if="currentSelectedTeam?.id === team.id">mdi-check-circle</v-icon>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </div>

                <!-- Users Tab Content -->
                <div v-show="currentTab === 'users'">
                    <div class="mb-3 text-caption text-grey-600 text-danger">
                        {{ $t("initiative.Select") }}
                    </div>

                    <!-- Show current selection summary -->
                    <div v-if="currentSelectedTeam || currentSelectedUsers.length > 0" class="mb-3">
                        <div v-if="currentSelectedTeam" class="mb-2">
                            <v-chip color="primary" close @click:close="clearTeamSelection">
                                {{ $t("initiative.Team") }}: {{ currentSelectedTeam.name }}
                            </v-chip>
                        </div>
                        <div v-if="currentSelectedUsers.length > 0" class="mb-2">
                            <v-chip v-for="user in currentSelectedUsers" :key="user.id" color="success" close
                                @click:close="removeUser(user)" class="mr-1 mb-1">
                                {{ user.full_name }}
                            </v-chip>
                        </div>
                    </div>

                    <v-text-field v-model="searchUser" label="Search users..." dense clearable class="mb-2" />
                    <div v-if="displayedUsers.length === 0" class="text-center py-4">
                        {{ $t("initiative.No users found") }}
                    </div>
                    <v-list v-else>
                        <v-list-item v-for="user in displayedUsers" :key="user.id" @click="toggleUserSelection(user)"
                            :class="{ 'selected-user': isUserSelected(user) }" style="cursor: pointer;">
                            <v-list-item-content>
                                <v-list-item-title>{{ user.full_name }}</v-list-item-title>
                                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-icon v-if="isUserSelected(user)">mdi-check-circle</v-icon>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-btn text @click="cancel" variant="flat">{{ $t("initiative.Cancel") }}</v-btn>
                <v-btn text @click="forceClearSelection" variant="flat">{{ $t("initiative.Clear All") }}</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="updateSelection" variant="flat" :disabled="!currentSelectedTeam && currentSelectedUsers.length === 0">
                    {{ $t("initiative.Update") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Team from "@/API/Team/Team";
import User from "@/API/User/User";

export default {
    name: "TeamUserDialog",
    setup() {
        const teamApi = new Team();
        const userApi = new User();
        return {
            teamApi,
            userApi,
        };
    },
    props: {
        type_of_dialog: String,
        value: Boolean,
        selected: Object,
        context: {
            type: String,
            default: 'default'
        },
        teams: {
            type: Array,
            required: true,
            default: () => []
        },

        users: {
            type: Array,
            required: true,
            default: () => []
        },
    },

    watch: {
        selected: {
            handler(val) {
                this.loadDataFromSelected();
            },
            immediate: true,
            deep: true
        },
        type_of_dialog: {
            handler(val) {
                if (val) {
                    this.ensureDialogState();
                    this.loadDataFromSelected();
                }
            },
            immediate: true,
            deep: true
        },
        context: {
            handler(val) {
                if (val) {
                    this.ensureDialogState();
                    this.loadDataFromSelected();
                }
            },
            immediate: true,
            deep: true
        },
        value(val) {
            this.dialog = val;
            if (val) {
                this.ensureDialogState();
                this.loadDataFromSelected();
            }
        },

        teams(val) {
            if (val) {
                this.ensureDialogState();
                this.loadDataFromSelected();
            }
        },
        users(val) {
            if (val) {
                this.ensureDialogState();
                this.loadDataFromSelected();
            }
        }
    },

    data() {
        return {
            dialog: false,
            searchUser: "",
            // teams: [],
            // users: [],
            dialogStates: {}
        };
    },

    computed: {
        // Create unique dialog state key based on type and context
        dialogStateKey() {
            return `${this.type_of_dialog}_${this.context}`;
        },

        // Get current dialog state based on type and context
        currentDialogState() {
            this.ensureDialogState();
            return this.dialogStates[this.dialogStateKey];
        },

        // Current tab for this dialog type
        currentTab: {
            get() {
                return this.currentDialogState.tab;
            },
            set(value) {
                if (this.dialogStates[this.dialogStateKey]) {
                    this.dialogStates[this.dialogStateKey].tab = value;
                }
            }
        },

        // Current selected team for this dialog type
        currentSelectedTeam: {
            get() {
                return this.currentDialogState.selectedTeam;
            },
            set(value) {
                if (this.dialogStates[this.dialogStateKey]) {
                    this.dialogStates[this.dialogStateKey].selectedTeam = value;
                }
            }
        },

        // Current selected users for this dialog type
        currentSelectedUsers: {
            get() {
                return this.currentDialogState.selectedUsers;
            },
            set(value) {
                if (this.dialogStates[this.dialogStateKey]) {
                    this.dialogStates[this.dialogStateKey].selectedUsers = value;
                }
            }
        },

        // Users to display based on search filter only
        displayedUsers() {
            let filtered = this.users;

            if (this.searchUser.trim() !== "") {
                const searchLower = this.searchUser.toLowerCase();
                filtered = filtered.filter(
                    (user) =>
                        user.full_name.toLowerCase().includes(searchLower) ||
                        user.email.toLowerCase().includes(searchLower)
                );
            }
            return filtered;
        },
    },

    methods: {
        ensureDialogState() {
            if (!this.dialogStates[this.dialogStateKey]) {
                this.dialogStates[this.dialogStateKey] = {
                    tab: 'users',
                    selectedTeam: null,
                    selectedUsers: []
                };
            }
        },

        loadDataFromSelected() {
            if (!this.selected || !this.teams.length || !this.users.length) {
                return;
            }

            this.ensureDialogState();
            const typeConfig = this.getTypeConfig();
            this.currentSelectedTeam = null;
            this.currentSelectedUsers = [];

            if (typeConfig.teamField && this.selected[typeConfig.teamField]) {
                const foundTeam = this.teams.find(t => t.id === this.selected[typeConfig.teamField]);
                if (foundTeam) {
                    this.currentSelectedTeam = foundTeam;
                    this.currentTab = 'teams';
                }
            } else if (typeConfig.usersField && Array.isArray(this.selected[typeConfig.usersField]) && this.selected[typeConfig.usersField].length > 0) {
                const foundUsers = this.users.filter(u => this.selected[typeConfig.usersField].includes(u.id));
                if (foundUsers.length > 0) {
                    this.currentSelectedUsers = foundUsers;
                    this.currentTab = 'users';
                }
            } else {
                this.currentTab = 'users';
            }
        },

        getTypeConfig() {
            const configs = {
                owner: {
                    teamField: 'owner_team_id',
                    usersField: 'owner_ids',
                    teamEvent: 'selectedOwnersUpdated',
                    usersEvent: 'selectedOwnersUpdated'
                },
                reviewer: {
                    teamField: 'reviewer_team_id',
                    usersField: 'review_ids',
                    teamEvent: 'selectedReviewersUpdated',
                    usersEvent: 'selectedReviewersUpdated'
                },
                experts: {
                    teamField: 'experts_team_id',
                    usersField: 'expert_ids',
                    teamEvent: 'selectedExpertsUpdated',
                    usersEvent: 'selectedExpertsUpdated'
                },

                // To add any type else
                // newType: {
                //     teamField: 'field_name_team_id',      // اسم الحقل للفريق في الـ selected prop
                //     usersField: 'field_name_user_ids',    // اسم الحقل للمستخدمين في الـ selected prop  
                //     teamEvent: 'selectedNewTypeUpdated',  // اسم الـ event للفريق
                //     usersEvent: 'selectedNewTypeUpdated' // اسم الـ event للمستخدمين
                // }
            };

            return configs[this.type_of_dialog] || configs.owner;
        },

        async fetchData() {
            // this.teams = await this.teamApi.getAll({
            //     with: 'users',
            //     select: "id|name",
            // });

            // this.users = await this.userApi.getAll({
            //     select: "id|full_name|email|team_ids",
            // });
            this.loadDataFromSelected();
        },

        open() {
            this.dialog = true;
            this.ensureDialogState();
            this.loadDataFromSelected();
        },

        selectTeam(team) {
            // If clicking the same team, unselect it
            if (this.currentSelectedTeam?.id === team.id) {
                this.currentSelectedTeam = null;
            } else {
                // Clear users when selecting a team
                this.currentSelectedUsers = [];
                this.currentSelectedTeam = team;
            }
        },

        clearTeamSelection() {
            this.currentSelectedTeam = null;
        },

        toggleUserSelection(user) {
            // Clear team selection when selecting users
            if (this.currentSelectedTeam) {
                this.currentSelectedTeam = null;
            }

            const index = this.currentSelectedUsers.findIndex((u) => u.id === user.id);
            if (index === -1) {
                this.currentSelectedUsers = [...this.currentSelectedUsers, user];
            } else {
                this.currentSelectedUsers = this.currentSelectedUsers.filter((u, i) => i !== index);
            }
        },

        removeUser(user) {
            this.currentSelectedUsers = this.currentSelectedUsers.filter((u) => u.id !== user.id);
        },

        isUserSelected(user) {
            return this.currentSelectedUsers.some((u) => u.id === user.id);
        },

        clearSelection() {
            if (!this.selected || Object.keys(this.selected).length === 0) {
                this.currentSelectedUsers = [];
                this.currentSelectedTeam = null;
            }
        },

        forceClearSelection() {
            this.currentSelectedUsers = [];
            this.currentSelectedTeam = null;
            this.currentTab = 'users';
        },

        updateSelection() {
            const typeConfig = this.getTypeConfig();
            if (this.currentSelectedTeam) {
                // If team is selected, emit team selection
                this.$emit(typeConfig.teamEvent, { type: 'team', id: this.currentSelectedTeam.id });
            } else if (this.currentSelectedUsers.length > 0) {
                // If users are selected, emit user selection
                const selectedUsers = this.currentSelectedUsers.map(user => ({
                    id: user.id,
                }));
                this.$emit(typeConfig.usersEvent, { type: 'users', data: selectedUsers });
            }

            this.$emit("close");
            this.dialog = false;
        },

        cancel() {
            this.dialog = false;
            this.$emit("close");
        },
    },

    async mounted() {
        this.dialog = this.value;
        await this.fetchData();
    },
};
</script>

<style scoped>
.selected-team {
    background-color: #256c9f;
}

.selected-user {
    background-color: #12c020;
}
</style>