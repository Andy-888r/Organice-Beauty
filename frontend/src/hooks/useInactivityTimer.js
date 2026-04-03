import { useEffect, useRef, useCallback } from 'react';

const TIEMPO_INACTIVIDAD = 4 * 60 * 1000; // 4 minutos → luego 1 min de aviso = 5 min total
const TIEMPO_AVISO       = 1 * 60 * 1000; // 1 minuto de aviso

const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export const useInactivityTimer = ({ onWarning, onLogout }) => {
  const timerInactividad = useRef(null);
  const timerAviso       = useRef(null);

  const limpiarTimers = useCallback(() => {
    if (timerInactividad.current) clearTimeout(timerInactividad.current);
    if (timerAviso.current)       clearTimeout(timerAviso.current);
  }, []);

  const reiniciarTimer = useCallback(() => {
    limpiarTimers();

    // A los 4 minutos → mostrar aviso
    timerInactividad.current = setTimeout(() => {
      onWarning();
      // 1 minuto después → cerrar sesión
      timerAviso.current = setTimeout(() => {
        onLogout();
      }, TIEMPO_AVISO);
    }, TIEMPO_INACTIVIDAD);
  }, [limpiarTimers, onWarning, onLogout]);

  useEffect(() => {
    reiniciarTimer();
    EVENTOS.forEach(e => window.addEventListener(e, reiniciarTimer));

    return () => {
      limpiarTimers();
      EVENTOS.forEach(e => window.removeEventListener(e, reiniciarTimer));
    };
  }, [reiniciarTimer, limpiarTimers]);

  return { reiniciarTimer };
};