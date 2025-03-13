export function isValidUrl(url: string, invalidDomains: string): boolean {
    try {
        const parsedDomains = JSON.parse(invalidDomains) as string[];

        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        return !parsedDomains.some(invalidDomain => domain.endsWith(invalidDomain));
    } catch (e) {
        return false;
    }
}
