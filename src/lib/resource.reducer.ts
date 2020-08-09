import { StateManager } from './stateManager';

const initialState: any = {
  fetching: []
};

export function resources(state = initialState, action) {
  switch (action.type) {
    case 'FETCHING_STARTED':
      return {
        ...state,
        fetching: [...state.fetching, action.payload]
      };
    case 'FETCHING_SUCCESS':
      return {
        ...state,
        fetching: state.fetching.filter(e => e !== action.payload)
      };
    case 'FILTER_RESOURCES_SUCCESS':
      let newState = StateManager.mergeResources(state, action.payload);
      return {
        ...newState,
        [action.resourceType]: action.payload[action.resourceType] // Overwrite fetches resourcetype for filtering
      };
    case 'FETCH_RESOURCES_SUCCESS':
    case 'PATCH_RESOURCE_SUCCESS':
    case 'POST_RESOURCES_SUCCESS':
    case 'POST_RESOURCE_SUCCESS':
      return StateManager.mergeResources(state, action.payload);
    case 'PATCH_RESOURCE':
      return StateManager.mergeResources(state, action.payload);
    // return StateManager.patchResource(state, action.payload);
    case 'DELETE_RELATIONSHIP':
      return StateManager.deleteRelationship(state, action.payload);
    case 'HYDRATE_RELATIONSHIPS':
      if (action.payload) {
        return StateManager.hydrateRelationships(state, action.payload);
      }
      break;
    case 'DELETE_RESOURCE':
      return StateManager.deleteResource(state, action.payload);
    default:
      return state;
  }
}
