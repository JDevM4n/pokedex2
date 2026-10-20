import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Minimize2, RotateCcw, Sparkles } from "lucide-react";
import type { EvolutionNode, Pokemon, PokemonSpecies } from "../types";
import { getAnimatedSprite, getArtwork, getEvolutionChain, getSpecies, getSprite } from "../lib/pokemon";
import { displayName, formatId, STAT_LABELS, TYPE_LABELS } from "./constants";

type Props = {
  pokemon: Pokemon;
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
  onSelectId: (id: number) => void;
  neighbors: { previous: Pokemon; next: Pokemon };
};

export default function PokemonDetail({ pokemon, onClose, onNavigate, onSelectId, neighbors }: Props) {
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutions, setEvolutions] = useState<EvolutionNode[]>([]);
  const [shiny, setShiny] = useState(false);
  const [view, setView] = useState<"sprite" | "artwork">("artwork");

  useEffect(() => {
    setSpecies(null);
    setEvolutions([]);
    getSpecies(pokemon.id).then(async (data) => {
      setSpecies(data);
      if (data.evolutionUrl) setEvolutions(await getEvolutionChain(data.evolutionUrl));
    }).catch(() => setSpecies({ genus: "Pokémon", description: "La información de esta especie no está disponible ahora." }));
  }, [pokemon.id]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onNavigate(-1);
      if (event.key === "ArrowRight") onNavigate(1);
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNavigate]);

  const total = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
  const sprite = view === "sprite" ? getAnimatedSprite(pokemon.id, shiny) : getArtwork(pokemon.id);

  return (
    <motion.main
      className={`detail type-bg-${pokemon.types[0]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="detail-nav">
        <button className="icon-text-button" onClick={onClose}><Minimize2 size={18} /> Volver al mural</button>
        <div className="detail-brand"><span className="brand-orb" /> POKÉDEX <b>151</b></div>
        <span className="region-label">REGIÓN KANTO</span>
      </header>

      <section className="detail-hero">
        <motion.div className="detail-copy" initial={{ x: -25, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <span className="eyebrow">{formatId(pokemon.id)} · {species?.genus ?? "Cargando especie..."}</span>
          <h1>{displayName(pokemon.name)}</h1>
          <div className="type-row large">
            {pokemon.types.map((type) => <span className={`type-pill type-${type}`} key={type}>{TYPE_LABELS[type]}</span>)}
          </div>
          <p className="description">{species?.description ?? "Consultando la entrada oficial de la Pokédex..."}</p>
          <dl className="quick-facts">
            <div><dt>Altura</dt><dd>{(pokemon.height / 10).toFixed(1)} m</dd></div>
            <div><dt>Peso</dt><dd>{(pokemon.weight / 10).toFixed(1)} kg</dd></div>
            <div><dt>Exp. base</dt><dd>{pokemon.baseExperience}</dd></div>
          </dl>
        </motion.div>

        <motion.div
          className="creature-stage"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={(_, info) => {
            if (info.offset.x < -65 || info.velocity.x < -450) onNavigate(1);
            if (info.offset.x > 65 || info.velocity.x > 450) onNavigate(-1);
          }}
        >
          <span className="detail-number">{String(pokemon.id).padStart(3, "0")}</span>
          <span className="scanner-ring ring-one" /><span className="scanner-ring ring-two" />
          <button className="carousel-preview preview-left" onClick={() => onNavigate(-1)} aria-label={`Anterior: ${neighbors.previous.name}`}>
            <img src={getArtwork(neighbors.previous.id)} alt="" /><ChevronLeft />
          </button>
          <button className="carousel-preview preview-right" onClick={() => onNavigate(1)} aria-label={`Siguiente: ${neighbors.next.name}`}>
            <img src={getArtwork(neighbors.next.id)} alt="" /><ChevronRight />
          </button>
          <AnimatePresence mode="wait">
            <motion.img
              key={`${pokemon.id}-${shiny}-${view}`}
              layoutId={`pokemon-${pokemon.id}`}
              className={view === "sprite" ? "animated-sprite" : "official-art"}
              src={sprite}
              onError={(event) => { event.currentTarget.src = getSprite(pokemon.id, shiny); }}
              alt={`${pokemon.name}${shiny ? " shiny" : ""}`}
              initial={{ x: 70, opacity: 0, scale: 0.75 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -70, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
            />
          </AnimatePresence>
          <div className="viewer-controls">
            <button className={view === "sprite" ? "active" : ""} onClick={() => setView("sprite")}>Sprite animado</button>
            <button className={view === "artwork" ? "active" : ""} onClick={() => setView("artwork")}>Arte oficial</button>
            <button className={shiny ? "shiny active" : "shiny"} onClick={() => setShiny(!shiny)}><Sparkles size={14} /> Shiny</button>
          </div>
          <p className="model-note"><RotateCcw size={13} /> Modelo 3D no disponible · Vista 2D activa</p>
          <span className="swipe-hint">DESLIZA PARA EXPLORAR</span>
        </motion.div>

        <div className="stats-panel">
          <div className="panel-title"><span>ESTADÍSTICAS BASE</span><b>{total}</b></div>
          {pokemon.stats.map((stat, index) => (
            <div className="stat" key={stat.name}>
              <div><span>{STAT_LABELS[stat.name]}</span><b>{stat.value}</b></div>
              <div className="stat-track"><motion.i initial={{ width: 0 }} animate={{ width: `${Math.min(100, stat.value / 1.6)}%` }} transition={{ delay: index * 0.06, duration: 0.7 }} /></div>
            </div>
          ))}
          <div className="abilities">
            <span>HABILIDADES</span>
            {pokemon.abilities.map((ability) => (
              <div key={ability.name}>{displayName(ability.name)} {ability.hidden && <small>OCULTA</small>}</div>
            ))}
          </div>
        </div>
      </section>

      {evolutions.length > 1 && (
        <section className="evolution-panel">
          <div><span className="eyebrow">LÍNEA EVOLUTIVA</span><h2>Un viaje de evolución</h2></div>
          <div className="evolution-chain">
            {evolutions.map((evolution, index) => (
              <div className="evolution-step" key={evolution.id}>
                {index > 0 && <span className="evo-arrow"><ChevronRight /> <small>{evolution.trigger}</small></span>}
                <button onClick={() => onSelectId(evolution.id)}>
                  <img src={getArtwork(evolution.id)} alt={evolution.name} />
                  <span>{displayName(evolution.name)}</span><small>{formatId(evolution.id)}</small>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <nav className="pokemon-navigation">
        <button onClick={() => onNavigate(-1)}><ChevronLeft /> Anterior</button>
        <span>{formatId(pokemon.id)} / #151</span>
        <button onClick={() => onNavigate(1)}>Siguiente <ChevronRight /></button>
      </nav>
    </motion.main>
  );
}
