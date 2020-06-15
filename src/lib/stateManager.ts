import produce from "immer";
import _ from 'lodash';

export class StateManager {
  public static patchResource(resources, payload) {
    let { id, type } = payload;
    return produce(resources, (draft: any) => {
      draft[type][id] = payload;
    });
  }

  public static hydrateRelationships(resources, payload) {
    let { id, type, rType, relationships } = payload;
    return produce(resources, (draft: any) => {
      draft[type][id].relationships[rType].data = relationships
    });
  }
  
  public static mergeResources(resources, payload) {
    return _.mergeWith(
      {}, resources, payload,
      (a, b) => b === null ? a : undefined
    );
  }

  public static deleteResource(resources, payload) {
    return produce(resources, draft => {
      delete draft[payload.type][payload.id];
    });
    // return _.mergeWith(
    //   {}, resources, payload,
    //   (a, b) => b === null ? a : undefined
    // );
  }

  public static deleteRelationship(resources, payload) {
    let { id, type, relationshipType, relationshipId } = payload;
    const filteredResources = produce(resources, draft => {
      // // Remove source relation
      // let sourceData = draft[type][id].relationships[relationshipType].data;
      // sourceData.filter(s => s.id !== relationshipId);

      // // Remove target relation if exists
      // try {
      //   let targetData = draft[relationshipType][relationshipId].relationships[type].data;
      //   targetData.filter(t => t !== id);
      // } catch (e) {
      //   console.log('no need to update relation');
      // }
    });
    return filteredResources;
  }
}