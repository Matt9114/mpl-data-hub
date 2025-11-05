// composables/useAppState.ts
export const useIsAppLoading = () => useState<boolean>('is-app-loading', () => true);