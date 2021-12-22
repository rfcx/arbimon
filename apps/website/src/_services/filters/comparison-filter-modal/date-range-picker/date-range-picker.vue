<template>
  <div>
    <div class="flex items-center">
      <!-- <el-button-group class="mr-2">
        <el-button
          v-for="item in datePickerTypeOptions"
          :key="'filter-date-picker-' + item.value"
          size="small"
          :color="selectedType === item.value ? '#31984F' : '#45485D'"
          style="color:  #fff"
          @click="selectedType = item.value"
        >
          {{ item.label }}
        </el-button>
      </el-button-group> -->
      <el-date-picker
        v-model="dateValues"
        :type="selectedType"
        unlink-panels
        :shortcuts="dateShortcuts"
        range-separator="to"
      />
    </div>
  </div>
</template>
<script lang="ts" src="./date-range-picker.ts"></script>
