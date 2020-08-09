import 'reflect-metadata';
var pluralize = require('pluralize');
export const PROPERTY_METADATA_KEY = Symbol('propertyMetadata');

export function Model() {
  return function(ctor: Function) {
    let string = pluralize(ctor.name);
    ctor.prototype.type = string.charAt(0).toLowerCase() + string.slice(1);
  };
}

function setMetaData(target, key, reflectType) {
  const fields = Reflect.getOwnMetadata(reflectType, target) || [];
  if (!fields.includes(key)) {
    fields.push(key);
  }
  Reflect.defineMetadata(reflectType, fields, target);
}

export function ToOne(args): PropertyDecorator {
  return (target, key) => {
    setMetaData(target, key, 'toOne');
  };
}

export function ToMany(args): PropertyDecorator {
  return (target, key) => {
    if (args['nested']) {
      let s;
      args['nested'].forEach(n => {
        s += `${key.toString()}.${n},`;
      });
      setMetaData(target, s.slice(0, -1).replace('undefined', ''), 'nested');
    }
    setMetaData(target, key, 'toMany');
  };
}

export function Field(args): PropertyDecorator {
  return (target, key) => {
    setMetaData(target, key, 'field');
    if (args['searchable']) setMetaData(target, key, 'searchable');
  };
}
