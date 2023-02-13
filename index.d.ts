export function puny_encoded(x: string|number[]): string;
export function puny_encoded_bytes(x: string|number[]): number[];

export function puny_decoded(x: string|number[]|ArrayBufferView, force?: boolean): number[];

export function is_surrogate(x: number): boolean;