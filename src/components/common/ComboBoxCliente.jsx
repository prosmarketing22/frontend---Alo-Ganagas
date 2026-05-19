import { useState, useRef, useEffect } from 'react';

export const ComboBoxCliente = ({
  clientes = [],
  value,
  onChange,
  placeholder = 'Buscar cliente por nombre, DNI, dirección, teléfono...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const clienteSeleccionado = clientes.find(c => c.id === value);

  const clientesFiltrados = clientes.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.full_name && c.full_name.toLowerCase().includes(term)) ||
      (c.dni && c.dni.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.district && c.district.toLowerCase().includes(term)) ||
      (c.reference && c.reference.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.referral_code && c.referral_code.toLowerCase().includes(term)) ||
      (c.customer_type && c.customer_type.toLowerCase().replace('_', ' ').includes(term))
    );
  });

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

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
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
    if (clienteSeleccionado) {
      setSearchTerm('');
    }
  };

  const handleSelect = (cliente) => {
    onChange(cliente.id);
    setSearchTerm(cliente.full_name);
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
          prev < clientesFiltrados.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && clientesFiltrados[highlightedIndex]) {
          handleSelect(clientesFiltrados[highlightedIndex]);
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

  const getDisplayValue = () => {
    if (isOpen) return searchTerm;
    if (clienteSeleccionado) {
      const doc = clienteSeleccionado.dni || '';
      return `${clienteSeleccionado.full_name}${doc ? ' - ' + doc : ''}`;
    }
    return searchTerm;
  };

  const formatCustomerType = (type) => {
    if (type === 'NEGOCIO') return 'Negocio';
    if (type === 'PERSONA_NATURAL') return 'Persona';
    return type;
  };

  return (
    <div className="combobox-cliente" ref={containerRef}>
      <div className="combobox-cliente__input-wrapper">
        <span className="combobox-cliente__search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="combobox-cliente__input"
          disabled={disabled}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="combobox-cliente__clear"
            tabIndex={-1}
            title="Limpiar selección"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <span className="combobox-cliente__arrow" data-open={isOpen}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="combobox-cliente__dropdown" ref={listRef}>
          <div className="combobox-cliente__dropdown-header">
            <span className="combobox-cliente__result-count">
              {clientesFiltrados.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
            </span>
            {searchTerm.trim() && (
              <span className="combobox-cliente__search-hint">
                Filtrando por: "{searchTerm.trim()}"
              </span>
            )}
          </div>

          <div className="combobox-cliente__list">
            {clientesFiltrados.length === 0 ? (
              <div className="combobox-cliente__empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>No se encontraron clientes</span>
                <span className="combobox-cliente__empty-hint">Intenta con otro nombre, DNI o dirección</span>
              </div>
            ) : (
              clientesFiltrados.map((cliente, index) => {
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={cliente.id}
                    data-index={index}
                    className={`combobox-cliente__option ${isHighlighted ? 'combobox-cliente__option--highlighted' : ''}`}
                    onClick={() => handleSelect(cliente)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="combobox-cliente__option-row">
                      <div className="combobox-cliente__option-avatar">
                        {cliente.full_name ? cliente.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="combobox-cliente__option-info">
                        <div className="combobox-cliente__option-main">
                          <span className="combobox-cliente__option-name">{cliente.full_name}</span>
                          <div className="combobox-cliente__option-badges">
                            {cliente.dni && (
                              <span className="combobox-cliente__badge combobox-cliente__badge--dni">
                                {cliente.dni}
                              </span>
                            )}
                            {cliente.customer_type && (
                              <span className={`combobox-cliente__badge combobox-cliente__badge--type combobox-cliente__badge--type-${cliente.customer_type.toLowerCase()}`}>
                                {formatCustomerType(cliente.customer_type)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="combobox-cliente__option-details">
                          {cliente.address && (
                            <span className="combobox-cliente__detail">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {cliente.address}{cliente.district ? `, ${cliente.district}` : ''}
                            </span>
                          )}
                          {cliente.phone && (
                            <span className="combobox-cliente__detail">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              {cliente.phone}
                            </span>
                          )}
                          {cliente.email && (
                            <span className="combobox-cliente__detail">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                              {cliente.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
