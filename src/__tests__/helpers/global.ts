import { Action } from "redux";

/**
 * Finds an action by type in the Redux store
 * @param store 
 * @param type 
 */
export function findAction (store: any, type: string): Action {
  return store.getActions().find(action => action.type === type);
}

/**
 * Returns an action as a Promise
 * @param store 
 * @param type 
 */
export function getAction (store: any, type: string): Promise<Action> {
  const action = findAction(store, type);
  if (action) return Promise.resolve(action);

  return new Promise(resolve => {
    store.subscribe(() => {
      const action = findAction(store, type);
      if (action) resolve(action);
    });
  });
}