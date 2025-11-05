<template>
  <EwmWrapper title="DATA FLOW SERVICE EWM">
    <template #actions>
      <EwmHeader
        :iso-last-refresh="isoLastRefresh"
        :formatted-last-refresh="formattedLastRefresh"
        :auto-refresh="autoRefresh"
        :next-in="nextIn"
        v-model:refresh-every-sec="refreshEverySec"
        @refresh="refreshData"
        @toggle-auto-refresh="toggleAutoRefresh"
      />
    </template>

    <EwmMainArea>
      <EwmMainNav />
      <!-- sem tvoje ďalšie EWM bloky -->
    </EwmMainArea>
  </EwmWrapper>
</template>

<script setup lang="ts">
import { useEwmDataFlow } from '~/modules/tools/data-flow-service/ewm/composables/useEwmDataFlow'
// alebo by fungovalo aj auto-import: const {...} = useEwmDataFlow()

const {
  isoLastRefresh,
  formattedLastRefresh,
  autoRefresh,
  nextIn,
  refreshEverySec,
  refreshData,
  toggleAutoRefresh
} = useEwmDataFlow()
</script>

