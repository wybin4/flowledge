export function getIntegrationIdFromMap(entityType: string, mapping: string): string | undefined {
    const types = JSON.parse(mapping);
    for (const key in types) {
        if (key.includes(entityType)) {
            return types[key];
        }
    }
    return undefined;
}