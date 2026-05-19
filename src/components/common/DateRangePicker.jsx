import { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import '../../styles/components/dateRangePicker.css';

export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  placeholder = 'Seleccionar fechas',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState('start'); // 'start' | 'end'
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (startDate) {
      setTempStartDate(new Date(startDate + 'T00:00:00'));
    } else {
      setTempStartDate(null);
    }
    if (endDate) {
      setTempEndDate(new Date(endDate + 'T00:00:00'));
    } else {
      setTempEndDate(null);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDayClick = (day) => {
    if (selecting === 'start') {
      setTempStartDate(day);
      setTempEndDate(null);
      setSelecting('end');
    } else {
      if (day < tempStartDate) {
        // Si selecciona una fecha anterior, reinicia
        setTempStartDate(day);
        setTempEndDate(null);
        setSelecting('end');
      } else {
        setTempEndDate(day);
        setSelecting('start');
        // Aplicar cambios
        const start = format(tempStartDate, 'yyyy-MM-dd');
        const end = format(day, 'yyyy-MM-dd');
        onChange({ startDate: start, endDate: end });
        setIsOpen(false);
      }
    }
  };

  const handleSelectSingleDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setTempStartDate(day);
    setTempEndDate(day);
    setSelecting('start');
    onChange({ startDate: dateStr, endDate: dateStr });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelecting('start');
    onChange({ startDate: '', endDate: '' });
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

    return (
      <div className="drp-calendar">
        <div className="drp-calendar-header">
          <button
            type="button"
            className="drp-nav-btn"
            onClick={handlePrevMonth}
          >
            ◀
          </button>
          <span className="drp-month-label">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            type="button"
            className="drp-nav-btn"
            onClick={handleNextMonth}
          >
            ▶
          </button>
        </div>

        <div className="drp-weekdays">
          {weekDays.map(day => (
            <div key={day} className="drp-weekday">{day}</div>
          ))}
        </div>

        <div className="drp-days">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isStart = tempStartDate && isSameDay(day, tempStartDate);
            const isEnd = tempEndDate && isSameDay(day, tempEndDate);
            const isInRange = tempStartDate && tempEndDate &&
              isWithinInterval(day, { start: tempStartDate, end: tempEndDate });
            const isToday = isSameDay(day, new Date());

            let dayClass = 'drp-day';
            if (!isCurrentMonth) dayClass += ' drp-day--other-month';
            if (isToday) dayClass += ' drp-day--today';
            if (isStart) dayClass += ' drp-day--start';
            if (isEnd) dayClass += ' drp-day--end';
            if (isInRange && !isStart && !isEnd) dayClass += ' drp-day--in-range';
            if (isStart && isEnd) dayClass += ' drp-day--single';

            return (
              <button
                key={idx}
                type="button"
                className={dayClass}
                onClick={() => handleDayClick(day)}
                onDoubleClick={() => handleSelectSingleDay(day)}
                disabled={!isCurrentMonth}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        <div className="drp-footer">
          <div className="drp-hint">
            {selecting === 'start' ? 'Selecciona fecha inicio' : 'Selecciona fecha fin'}
            <br />
            <small>Doble clic para un solo día</small>
          </div>
          <div className="drp-actions">
            {(tempStartDate || tempEndDate) && (
              <button
                type="button"
                className="drp-clear-btn"
                onClick={handleClear}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getDisplayValue = () => {
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      if (isSameDay(start, end)) {
        return format(start, 'dd/MM/yyyy');
      }
      return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
    }
    return '';
  };

  return (
    <div className="drp-container" ref={containerRef}>
      <div
        className={`drp-input ${disabled ? 'drp-input--disabled' : ''} ${isOpen ? 'drp-input--active' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="drp-input-icon">📅</span>
        <span className={`drp-input-text ${!getDisplayValue() ? 'drp-input-placeholder' : ''}`}>
          {getDisplayValue() || placeholder}
        </span>
        {getDisplayValue() && !disabled && (
          <button
            type="button"
            className="drp-input-clear"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="drp-dropdown">
          {renderCalendar()}
        </div>
      )}
    </div>
  );
};
