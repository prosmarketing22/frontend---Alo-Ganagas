import { useState, useRef, useEffect } from 'react';

export const ComboBoxAlmacen = ({
  almacenes = [],
  value,
  onChange,
  placeholder = 'Buscar almacén...',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const almacenSeleccionado = almacenes.find(a => a.id === value);

  // Filtrar almacenes por término de búsqueda (solo por nombre)
  const almacenesFiltrados = almacenes.filter(a => {
    const term = searchTerm.toLowerCase();
    return a.name.toLowerCase().includes(term);
  });

  // Ordenar alfabéticamente
  const almacenesOrdenados = [...almacenesFiltrados].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

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
    if (almacenSeleccionado) {
      setSearchTerm('');
    }
  };

  const handleSelect = (almacen) => {
    onChange(almacen.id);
    setSearchTerm(almacen.name);
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
          prev < almacenesOrdenados.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && almacenesOrdenados[highlightedIndex]) {
          handleSelect(almacenesOrdenados[highlightedIndex]);
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

  return (
    <div className="combobox-almacen" ref={containerRef}>
      <div className="combobox-almacen__input-wrapper">
        <span className="combobox-almacen__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (almacenSeleccionado ? almacenSeleccionado.name : searchTerm)}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="combobox-almacen__input"
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="combobox-almacen__clear"
            tabIndex={-1}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <span className="combobox-almacen__arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="combobox-almacen__dropdown" ref={listRef}>
          {almacenesOrdenados.length === 0 ? (
            <div className="combobox-almacen__empty">
              No se encontraron almacenes
            </div>
          ) : (
            almacenesOrdenados.map((almacen, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={almacen.id}
                  data-index={index}
                  className={`combobox-almacen__option ${isHighlighted ? 'combobox-almacen__option--highlighted' : ''}`}
                  onClick={() => handleSelect(almacen)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="combobox-almacen__option-info">
                    <span className="combobox-almacen__option-name">
                      {almacen.name}
                    </span>
                    <span className="combobox-almacen__option-count">
                      {almacen.total_productos || 0} productos
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
