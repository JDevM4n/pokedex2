import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, WifiOff, X } from "lucide-react";
import PokemonCard from "./components/PokemonCard";
import PokemonDetail from "./components/PokemonDetail";
import PokemonFilters from "./components/PokemonFilters";
import { displayName, formatId, TYPE_LABELS } from "./components/constants";
import { getArtwork, getKantoPokemon } from "./lib/pokemon";
import type { Pokemon, PokemonType } from "./types";

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [sort, setSort] = useState("id");
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [searchFocused, setSearchFocused] = useState(false);
  const [cameraOrigin, setCameraOrigin] = useState({ x: 0, y: 0 });
  const [catalogScroll, setCatalogScroll] = useState(0);

  useEffect(() => {
    getKantoPokemon().then((data) => { setPokemon(data); setStatus("ready"); }).catch(() => setStatus("error"));
  }, []);

  const results = useMemo(() => {
    const normalized = query.toLowerCase().replace("#", "").trim();
    return pokemon
      .filter((item) => (!normalized || item.name.includes(normalized) || String(item.id).startsWith(normalized)))
      .filter((item) => types.every((type) => item.types.includes(type)))
      .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "height" ? b.height - a.height : sort === "weight" ? b.weight - a.weight : a.id - b.id);
  }, [pokemon, query, types, sort]);

  const navigate = (direction: -1 | 1) => {
    if (!selected) return;
    const nextId = ((selected.id - 1 + direction + 151) % 151) + 1;
    setSelected(pokemon.find((item) => item.id === nextId) ?? selected);
  };

  const selectId = (id: number) => {
    const found = pokemon.find((item) => item.id === id);
    if (found) setSelected(found);
  };

  const openPokemon = (item: Pokemon, origin?: { x: number; y: number }) => {
    setCatalogScroll(window.scrollY);
    setCameraOrigin(origin ?? { x: window.innerWidth / 2, y: window.scrollY + window.innerHeight / 2 });
    setSelected(item);
  };

  const closePokemon = () => {
    setSelected(null);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: catalogScroll, behavior: "instant" })));
  };

  const previous = selected ? pokemon[((selected.id - 2 + 151) % 151)] : pokemon[0];
  const next = selected ? pokemon[(selected.id % 151)] : pokemon[0];

  return (
    <div className="app-shell">
      <AnimatePresence initial={false}>
        {selected ? (
          <PokemonDetail
            key="detail"
            pokemon={selected}
            onClose={closePokemon}
            onNavigate={navigate}
            onSelectId={selectId}
            neighbors={{ previous, next }}
          />
        ) : (
          <motion.main
            key="catalog"
            className="catalog"
            style={{ transformOrigin: `${cameraOrigin.x}px ${cameraOrigin.y}px` }}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.12, filter: "blur(5px)" }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="topbar">
              <a className="brand" href="#" aria-label="Pokédex 151, inicio"><span className="brand-orb" /> POKÉDEX <b>151</b></a>
              <div className="top-meta"><span><i /> SISTEMA EN LÍNEA</span><strong>KANTO · GEN I</strong></div>
            </header>

            <section className="hero mural-hero">
              <div>
                <span className="eyebrow">ARCHIVO NACIONAL · REGIÓN KANTO</span>
                <h1>Descubre el mundo<br /><em>Pokémon.</em></h1>
                <p>Un archivo visual de los 151 Pokémon originales. Toca una criatura para entrar en el mural.</p>
              </div>
              <div className="counter"><span>REGISTROS ENCONTRADOS</span><strong>{String(pokemon.length).padStart(3, "0")}<small>/151</small></strong><div><i style={{ width: `${pokemon.length / 1.51}%` }} /></div></div>
            </section>

            <section className="search-area">
              <div className={`search-box ${searchFocused ? "focused" : ""}`}>
                <Search size={21} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Busca por nombre o número..."
                  aria-label="Buscar Pokémon"
                />
                {query && <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={18} /></button>}
                <kbd>⌘ K</kbd>
                {searchFocused && query && (
                  <div className="suggestions">
                    {results.slice(0, 5).map((item) => (
                      <button key={item.id} onMouseDown={() => openPokemon(item)}>
                        <img src={getArtwork(item.id)} alt="" /><span><b>{displayName(item.name)}</b><small>{item.types.map((type) => TYPE_LABELS[type]).join(" · ")}</small></span><em>{formatId(item.id)}</em>
                      </button>
                    ))}
                    {results.length === 0 && <p>No encontramos coincidencias para “{query}”.</p>}
                  </div>
                )}
              </div>
              <button className="random-button" onClick={() => pokemon.length && openPokemon(pokemon[Math.floor(Math.random() * pokemon.length)])}>Explorar al azar</button>
            </section>

            <PokemonFilters
              selected={types}
              onToggle={(type) => setTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type])}
              onClear={() => setTypes([])}
              sort={sort}
              onSort={setSort}
            />

            <section className="results-header"><div><h2>Mural de Kanto</h2><p>{results.length} criaturas en el archivo visual</p></div><span>SELECCIONA PARA ACERCAR · DATOS EN VIVO</span></section>

            {status === "loading" && <div className="loading-state"><span className="loader" /><h2>Sincronizando Pokédex</h2><p>Recuperando los 151 registros de Kanto...</p></div>}
            {status === "error" && <div className="empty-state"><WifiOff /><h2>No pudimos conectar con PokéAPI</h2><p>Revisa tu conexión y vuelve a cargar la aplicación.</p></div>}
            {status === "ready" && results.length === 0 && <div className="empty-state"><Search /><h2>Sin coincidencias</h2><p>Prueba otro nombre o elimina algún filtro activo.</p></div>}
            <motion.section layout className="pokemon-grid">
              <AnimatePresence>
                {results.map((item) => <PokemonCard key={item.id} pokemon={item} onSelect={openPokemon} />)}
              </AnimatePresence>
            </motion.section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
