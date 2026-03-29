export function createStore() {
  return {
    state: [],
    providersList: [],
    modelIconMappings: {},
    modelIconMappingsDraft: '{}',
    modelIconMappingsError: '',
    modelIconMappingsRows: [],
    modelIconMappingRowSeed: 0,
    selectedPlatformIndex: 0,
    selectedModelIndex: 0,
    isDirty: false,
    platformContextMenu: null,
    platformContextMenuIndex: -1,
  }
}
