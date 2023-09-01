export function djb2Hash(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure a positive integer
}

export function mapStringToIndex(str: string, range: number): number {
    const hash = djb2Hash(str);
    return hash % range;
}

export function normalizeValue(value: number, minValue: number, maxValue: number) {
    return (value - minValue) / (maxValue - minValue);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove the hash character, if present
    hex = hex.replace(/^#/, '');

    // Check if the input is a valid hex color code
    if (!/^[0-9A-Fa-f]{6}$/i.test(hex)) {
        return null; // Invalid input
    }

    // Parse the hexadecimal color value into individual RGB components
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Return an object with r, g, and b properties
    return { r, g, b };
}

export function interpolateColor(value: number, colorStops: { position: number; color: string }[]) {
    if (value <= colorStops[0].position) return colorStops[0].color;
    if (value >= colorStops[colorStops.length - 1].position)
        return colorStops[colorStops.length - 1].color;

    for (let i = 0; i < colorStops.length - 1; i++) {
        const start = colorStops[i];
        const startRGB = hexToRgb(start.color);
        const end = colorStops[i + 1];
        const endRGB = hexToRgb(end.color);

        if (value >= start.position && value <= end.position) {
            const t = (value - start.position) / (end.position - start.position);
            const r = Math.round(
                startRGB.r + t * (endRGB.r - startRGB.r)
            );
            const g = Math.round(
                startRGB.g + t * (endRGB.g - startRGB.g)
            );
            const b = Math.round(
                startRGB.b + t * (endRGB.b - startRGB.b)
            );
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    return '#000000';
}