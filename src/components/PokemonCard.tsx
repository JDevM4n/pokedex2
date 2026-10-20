import { motion } from "motion/react";
import type { Pokemon } from "../types";
import { getAnimatedSprite, getArtwork } from "../lib/pokemon";
import { formatId } from "./constants";

type Props = {
  pokemon: Pokemon;
  onSelect: (pokemon: Pokemon, origin: { x: number; y: number }) => void;
};

export default function PokemonCard({ pokemon, onSelect }: Props) {
  return (
    <motion.button
      layoutId={`card-${pokemon.id}`}
      className={`pokemon-tile type-bg-${pokemon.types[0]}`}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onSelect(pokemon, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2 + window.scrollY,
        });
      }}
      whileHover={{ scale: 1.035, zIndex: 5 }}
      whileTap={{ scale: 0.96 }}
      aria-label={`Ver ficha de ${pokemon.name}`}
    >
      <span className="tile-number">{formatId(pokemon.id)}</span>
      <span className="tile-orbit" />
      <motion.img
        layoutId={`pokemon-${pokemon.id}`}
        src={getAnimatedSprite(pokemon.id)}
        onError={(event) => {
          event.currentTarget.src = getArtwork(pokemon.id);
          event.currentTarget.classList.add("artwork-fallback");
        }}
        alt={pokemon.name}
        loading="lazy"
        decoding="async"
      />
      <div className="tile-label">
        <span>{pokemon.name}</span>
        <div className="type-dots">
          {pokemon.types.map((type) => <i className={`type-${type}`} key={type} />)}
        </div>
      </div>
    </motion.button>
  );
}
