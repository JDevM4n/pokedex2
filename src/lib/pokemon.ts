import type { EvolutionNode, Pokemon, PokemonSpecies, PokemonType } from "../types";

const API = "https://pokeapi.co/api/v2";
const CACHE_KEY = "pokedex-151-v1";

const clean = (value: string) => value.replaceAll("-", " ");

export const getArtwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const getAnimatedSprite = (id: number, shiny = false) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${shiny ? "shiny/" : ""}${id}.gif`;

export const getSprite = (id: number, shiny = false) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? "shiny/" : ""}${id}.png`;

function normalizePokemon(data: any): Pokemon {
  return {
    id: data.id,
    name: data.name,
    types: data.types.sort((a: any, b: any) => a.slot - b.slot).map((item: any) => item.type.name as PokemonType),
    height: data.height,
    weight: data.weight,
    baseExperience: data.base_experience,
    abilities: data.abilities.map((item: any) => ({ name: clean(item.ability.name), hidden: item.is_hidden })),
    stats: data.stats.map((item: any) => ({ name: item.stat.name, value: item.base_stat })),
  };
}

export async function getKantoPokemon(): Promise<Pokemon[]> {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.savedAt < 1000 * 60 * 60 * 24) return parsed.data;
  }

  const results: Pokemon[] = [];
  for (let start = 1; start <= 151; start += 30) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(30, 152 - start) }, (_, index) =>
        fetch(`${API}/pokemon/${start + index}`).then((response) => {
          if (!response.ok) throw new Error("No se pudo consultar PokéAPI");
          return response.json();
        }).then(normalizePokemon),
      ),
    );
    results.push(...batch);
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: results }));
  return results;
}

export async function getSpecies(id: number): Promise<PokemonSpecies> {
  const response = await fetch(`${API}/pokemon-species/${id}`);
  if (!response.ok) throw new Error("No se pudo cargar la especie");
  const data = await response.json();
  const spanish = data.flavor_text_entries.find((entry: any) => entry.language.name === "es");
  const genus = data.genera.find((entry: any) => entry.language.name === "es");
  return {
    genus: genus?.genus ?? "Pokémon",
    description: (spanish?.flavor_text ?? "No hay una descripción disponible en español.").replace(/[\n\f]/g, " "),
    evolutionUrl: data.evolution_chain?.url,
  };
}

export async function getEvolutionChain(url: string): Promise<EvolutionNode[]> {
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  const result: EvolutionNode[] = [];
  const visit = (node: any, detail?: any) => {
    const id = Number(node.species.url.split("/").filter(Boolean).pop());
    if (id <= 151) {
      const level = detail?.min_level;
      const item = detail?.item?.name;
      result.push({
        id,
        name: node.species.name,
        trigger: level ? `Nivel ${level}` : item ? clean(item) : detail ? clean(detail.trigger?.name ?? "") : undefined,
      });
    }
    node.evolves_to.forEach((next: any) => visit(next, next.evolution_details[0]));
  };
  visit(data.chain);
  return result;
}
