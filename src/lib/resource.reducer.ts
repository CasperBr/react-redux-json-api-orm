import { StateManager } from './stateManager';

export function resources(state = {}, action) {
  switch (action.type) {
    case "PATCH_RESOURCE_SUCCESS":
    case "FETCH_RESOURCES_SUCCESS":
    case "POST_RESOURCES_SUCCESS":
    case "POST_RESOURCE_SUCCESS":
      return StateManager.mergeResources(state, action.payload);
    case "PATCH_RESOURCE":
      return StateManager.patchResource(state, action.payload);
    case "DELETE_RELATIONSHIP":
      return StateManager.deleteRelationship(state, action.payload);
    case "HYDRATE_RELATIONSHIPS":
      if (action.payload) {
        return StateManager.hydrateRelationships(state, action.payload);
      }
    case "DELETE_RESOURCE":
      return StateManager.deleteResource(state, action.payload);
    default:
      return state;
  }
}