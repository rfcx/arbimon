<template>
  <el-date-picker
    v-model="dateValues"
    type="daterange"
    unlink-panels
    :shortcuts="dateShortcuts"
  />
</template>
<script lang="ts" src="./date-range-picker.ts"></script>
