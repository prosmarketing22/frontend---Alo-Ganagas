import { useState, useRef, useEffect } from 'react';

const categoriasLabels = {
  'BALON_GAS': 'Balones de Gas',
  'BIDON_AGUA': 'Bidones de Agua',
  'ACCESORIO': 'Accesorios',
  'OTROS': 'Otros'
};

const ordenCategorias = ['BALON_GAS', 'BIDON_AGUA', 'ACCESORIO', 'OTROS'];

export const ComboBoxProducto = ({
  productos = [],
  value,
  onChange,
  placeholder = 'Buscar producto...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const productoSeleccionado = productos.find(p => p.id === value);

  // Filtrar productos por término de búsqueda
  const productosFiltrados = productos.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(term)) ||
      (categoriasLabels[p.product_type] && categoriasLabels[p.product_type].toLowerCase().includes(term))
    );
  });

  // Agrupar productos filtrados por categoría
  const productosAgrupados = productosFiltrados.reduce((acc, producto) => {
    const tipo = producto.product_type || 'OTROS';
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(producto);
    return acc;
  }, {});

  // Ordenar categorías
  const categoriasOrdenadas = Object.keys(productosAgrupados).sort((a, b) => {
    const indexA = ordenCategorias.indexOf(a);
    const indexB = ordenCategorias.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Lista plana para navegación con teclado
  const listaPlana = categoriasOrdenadas.flatMap(cat => productosAgrupados[cat]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!value) {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  // Scroll al elemento destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (value) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (productoSeleccionado) {
      setSearchTerm('');
    }
  };

  const handleSelect = (producto) => {
    onChange(producto.id);
    setSearchTerm(producto.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < listaPlana.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && listaPlana[highlightedIndex]) {
          handleSelect(listaPlana[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Calcular índice global para cada producto
  let globalIndex = 0;

  return (
    <div className="combobox-producto" ref={containerRef}>
      <div className="combobox-producto__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (productoSeleccionado ? `${productoSeleccionado.code} - ${productoSeleccionado.name}` : searchTerm)}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="combobox-producto__input"
          disabled={disabled}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="combobox-producto__clear"
            tabIndex={-1}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <span className="combobox-producto__arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="combobox-producto__dropdown" ref={listRef}>
          {productosFiltrados.length === 0 ? (
            <div className="combobox-producto__empty">
              No se encontraron productos
            </div>
          ) : (
            categoriasOrdenadas.map(categoria => {
              const productosCategoria = productosAgrupados[categoria];
              return (
                <div key={categoria} className="combobox-producto__group">
                  <div className="combobox-producto__group-header">
                    {categoriasLabels[categoria] || categoria}
                  </div>
                  {productosCategoria.map(producto => {
                    const currentIndex = globalIndex++;
                    const isHighlighted = currentIndex === highlightedIndex;
                    return (
                      <div
                        key={producto.id}
                        data-index={currentIndex}
                        className={`combobox-producto__option ${isHighlighted ? 'combobox-producto__option--highlighted' : ''}`}
                        onClick={() => handleSelect(producto)}
                        onMouseEnter={() => setHighlightedIndex(currentIndex)}
                      >
                        <span className="combobox-producto__option-code">{producto.code}</span>
                        <span className="combobox-producto__option-name">{producto.name}</span>
                        {producto.brand_name && (
                          <span className="combobox-producto__option-brand">{producto.brand_name}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
