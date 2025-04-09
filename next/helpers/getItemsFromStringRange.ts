export function getItemsFromStringRange(range: string): { min: number, max: number } {
    const cleaned = range.replace(/[()\s]/g, '');

    const parts = cleaned.split(',').filter(Boolean);

    const min = parts[0] ? parseInt(parts[0], 10) : 0;
    const max = parts[1] ? parseInt(parts[1], 10) : Infinity;

    return {
        min: Math.min(min, max),
        max: Math.max(min, max)
    };
}
