import { SlidersHorizontal, X } from "lucide-react";
import type { PokemonType } from "../types";
import { ALL_TYPES, TYPE_LABELS } from "./constants";

type Props = {
  selected: PokemonType[];
  onToggle: (type: PokemonType) => void;
  onClear: () => void;
  sort: string;
  onSort: (value: string) => void;
};

export default function PokemonFilters({ selected, onToggle, onClear, sort, onSort }: Props) {
  return (
    <section className="filter-panel" aria-label="Filtros">
      <div className="filter-heading">
        <span><SlidersHorizontal size={16} /> Filtrar por tipo</span>
        {selected.length > 0 && <button className="clear-button" onClick={onClear}><X size={14} /> Limpiar</button>}
      </div>
      <div className="filter-content">
        <div className="chips">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              className={`filter-chip type-${type} ${selected.includes(type) ? "active" : ""}`}
              onClick={() => onToggle(type)}
              aria-pressed={selected.includes(type)}
            >
              <i />{TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <label className="sort-control">
          <span>Ordenar por</span>
          <select value={sort} onChange={(event) => onSort(event.target.value)}>
            <option value="id">Número Pokédex</option>
            <option value="name">Nombre A–Z</option>
            <option value="height">Altura</option>
            <option value="weight">Peso</option>
          </select>
        </label>
      </div>
    </section>
  );
}
