function getIntegrationIdFromMap(entityType: string, mapping: string): string | undefined {
    const types = JSON.parse(mapping);
    for (const key in types) {
        if (types[key].includes(entityType)) {
            return key;
        }
    }
    return undefined;
}