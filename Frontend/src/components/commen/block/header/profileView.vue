<template>
    <div class="d-flex align-items-center profile-media">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="feather feather-user me-50" style="width: 16px; height: 16px;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <!-- <img class="b-r-25" src="@/assets/images/dashboard/profile.png" alt=""> -->
        <div class="flex-grow-1 user">
            <span>{{ Auth.USER.full_name }}</span>
            <p class="mb-0 font-nunito">{{ $t('profile.Admin') }}
                <svg>
                    <use href="@/assets/svg/icon-sprite.svg#header-arrow-down"></use>
                </svg>
            </p>
        </div>
    </div>
    <ul class="profile-dropdown onhover-show-div">
        <li v-for="(item, index) in data" :key="index">
            <a href="javascript:void(0)">
                <vue-feather :type="item.icon"></vue-feather>
                <span>{{ item.title }}</span>
            </a>
        </li>
        <li>
            <a href="/my-certificate">
                <vue-feather :type="data[0].icon"></vue-feather>
                <span>{{ $t('profile.MyCertificate') }}</span>
            </a>
        </li>
        <li>
            <a @click="getProfile">
                <vue-feather :type="data[0].icon"></vue-feather>
                <span>{{ $t('profile.Profile') }}</span>
            </a>
        </li>
        <li>
            <a @click="handleLogout">
                <vue-feather type="log-in"></vue-feather>
                <span>{{ $t('profile.LogOut') }}</span>
            </a>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import Auth from "@/API/Auth";
import { useHeaderStore } from "@/store/header";
import { useRouter } from 'vue-router'
const store = useHeaderStore()
const data = store.profileItem
const router = useRouter()


function handleLogout() {
    Auth.logOut();
    Auth.USER;
}

function getProfile() {
    router.push({ name: 'Profile' });
}



</script>