// src/types/new-and-loved-slots.types.ts

import type { GameData } from "@/types/strapi.types";
import type { TranslationData } from "@/types/strapi.types";

export interface NewAndLovedSlotsBlock {
  __component: "games.new-and-loved-slots";
  id: number;
  newSlots: boolean;
  slot_categories: number[]; // Array of category IDs
  slot_providers: number[]; // Array of provider IDs
}

export interface NewAndLovedSlotsProps {
  blockData: NewAndLovedSlotsBlock;
  translations: TranslationData;
}

export interface GamesData {
  newGames: GameData[];
  popularGames: GameData[];
}

export interface GamesFetchVariables {
  limit: number;
  sort: string;
  page: number;
  providers: string[];
  categories: string[];
}

export interface SlotProvider {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
}

export interface SlotCategory {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
} 