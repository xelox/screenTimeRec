import { writable } from "svelte/store";

export const activeSortStore = writable<(a: any, b: any)=>number>((a: any, b: any) => {return a - b});