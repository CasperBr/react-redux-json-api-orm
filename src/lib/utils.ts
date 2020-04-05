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
        if (field.endpoint && !field.skipForSubmit) {
            data.relationships[field.name] = {
                data: {
                    "type": field.endpoint,
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
