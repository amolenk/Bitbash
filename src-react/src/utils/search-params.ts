// URL query params only ever appear as a single string or, when the same
// key was appended more than once, as a string array. Normalize both shapes
// to a plain array so callers can render itemized lists uniformly.
export function toStringList(value?: string | string[]): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}
