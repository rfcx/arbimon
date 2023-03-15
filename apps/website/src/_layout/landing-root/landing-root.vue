<template>
  <navbar-component />
  <router-view />
  <footer-component />
</template>
<script setup lang="ts">
import FooterComponent from '../components/footer-bar.vue'
import NavbarComponent from '../components/navbar/nav-bar.vue'
</script>
