<!-- pages/tools/data-flow-service/ewm.vue -->
<template>
<DataFlowServiceWrapper title="DATA FLOW SERVICE EWM">
  <template #actions>
    <DataFlowServiceHeader
      :iso-last-refresh="isoLastRefresh"
      :formatted-last-refresh="formattedLastRefresh"
      :auto-refresh="autoRefresh"
      :next-in="nextIn"
      v-model:refresh-every-sec="refreshEverySec"
      @refresh="refreshData"
      @toggle-auto-refresh="toggleAutoRefresh"
    />
  </template>

  <DataFlowServiceMainArea>
  </DataFlowServiceMainArea>
</DataFlowServiceWrapper>

</template>

<script setup lang="ts">

const {
  isoLastRefresh,
  formattedLastRefresh,
  autoRefresh,
  nextIn,
  refreshEverySec,
  refreshData,
  toggleAutoRefresh
} = useDataFlow()
</script>
