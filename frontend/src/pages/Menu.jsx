import { useEffect, useState } from 'react';
import { getMenu } from '../services/productoService';
import CardProducto from '../components/CardProducto';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Menu() {
  const [productos, setProductos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu()
      .then((data) => {
        setProductos(data);
        setFiltered(data);
        const cats = [...new Set(data.map((p) => p.clasificacion).filter(Boolean))];
        setClasificaciones(cats);
      })
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = productos;
    if (activeFilters.length > 0) {
      result = result.filter((p) =>
        activeFilters.some((f) => p.clasificacion?.toLowerCase().includes(f.toLowerCase()))
      );
    }
    if (search.trim()) {
      result = result.filter((p) =>
        p.nombre_P?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [activeFilters, search, productos]);

  const toggleFilter = (cat) => {
    setActiveFilters((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '8px' }}>Elige tu experiencia</h1>
          <p style={{ color: 'var(--muted)' }}>Explora nuestro menu y encuentra tu platillo perfecto</p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              className="input"
              placeholder="Buscar platillo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--muted)' }} />
            {clasificaciones.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleFilter(cat)}
                className={activeFilters.includes(cat) ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card loading" style={{ height: '360px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '16px' }}>No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid-4">
            {filtered.map((p) => (
              <CardProducto key={p.iD_Producto} producto={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

