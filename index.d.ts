export function puny_encode(cps: number[], prefixed?: boolean): number[];
export function puny_decode(cps: number[]|ArrayBufferView): number[];

export function puny_encoded(x: string|number[]): string;
export function puny_decoded(x: string|number[]|ArrayBufferView): string;
