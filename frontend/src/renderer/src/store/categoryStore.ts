import { writable } from "svelte/store";
import type { categorySchema } from "../util/schemas";

export const categoryStore = writable<categorySchema>([]);

export const edit = (category: string, data: { icon: string, color: string }) => {
    categoryStore.update((store) => {
        store[category] = data;
        return store;
    });
}