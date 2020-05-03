const convertFieldsToJsonApi = (fields) => {
    /**
     * Prepare json API structure
     */
    let data = {
        attributes: {},
        relationships: {}
    };

    /**
     * Iterate through fields and set to relationship if the field was used via an
     * Endpoint.
     */
    Object.keys(fields).forEach((key) => {
        let field = fields[key];
        if (field.skipForSubmit) return;

        if (field.relationship === 'toMany') {
            data.relationships[field.name] = {
                data: [{type:field.jsonApiType, id: "1" }]
            }
        } else if (field.relationship === 'toOne') {
            data.relationships[field.name] = {
                data: {
                    "type": field.jsonApiType,
                    "id": field.value
                }
            }
        } else {
            data.attributes[fields[key].name] = fields[key].value;
        }
    });
    return data;
}

function entitiesToRelationships(relationshipArray, relationshipType) {
    if (relationshipArray && relationshipArray.length) {
        let relationships: any[] = [];
        relationshipArray.forEach((relationship) => {
            let field: any = {};
            field['id'] = relationship.id;
            field['type'] = relationshipType;
            relationships.push(field);
        });
        return relationships;
    }
    return [];

}

export { convertFieldsToJsonApi, entitiesToRelationships };
