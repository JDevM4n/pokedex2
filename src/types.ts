export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export type Pokemon = {
  id: number;
  name: string;
  types: PokemonType[];
  height: number;
  weight: number;
  baseExperience: number;
  abilities: { name: string; hidden: boolean }[];
  stats: { name: string; value: number }[];
};

export type PokemonSpecies = {
  genus: string;
  description: string;
  evolutionUrl?: string;
};

export type EvolutionNode = {
  id: number;
  name: string;
  trigger?: string;
};
