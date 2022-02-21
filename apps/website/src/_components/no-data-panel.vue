<template>
  <div class="flex justify-center items-center text-subtle border-2 border-faded">
    {{ emptyText }}
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class NoDataPanel extends Vue {
  @Prop({ default: 'no data' }) emptyText!: string
}
</script>
