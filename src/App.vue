<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

userStore.init()
if (userStore.token) {
  userStore.fetchUserInfo()
}
</script>
