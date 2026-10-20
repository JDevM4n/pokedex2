import type { PokemonType } from "../types";

export const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export const TYPE_LABELS: Record<PokemonType, string> = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta",
  ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador",
  psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Dragón",
  dark: "Siniestro", steel: "Acero", fairy: "Hada",
};

export const STAT_LABELS: Record<string, string> = {
  hp: "PS", attack: "Ataque", defense: "Defensa", "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.", speed: "Velocidad",
};

export const formatId = (id: number) => `#${String(id).padStart(3, "0")}`;
export const displayName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
