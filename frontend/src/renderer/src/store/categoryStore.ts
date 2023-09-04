import { writable } from "svelte/store";
import { type categoryMapSchema, type categorySchema } from "../util/schemas";

export const categoryStore = writable<categorySchema>({});
export const categoryMapStore = writable<categoryMapSchema>({});