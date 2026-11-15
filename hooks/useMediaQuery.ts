import { useSyncExternalStore } from 'react';

// useSyncExternalStore (não useState+useEffect) por design: o servidor não
// tem como saber a largura real da tela do cliente, então o snapshot do
// servidor (getServerSnapshot, sempre `false`) nunca bate com o do cliente
// quando a media query é verdadeira — com useEffect isso disparava o erro
// de hydration mismatch do React assim que um consumidor passou a decidir
// LAYOUT (grid-cols-N) a partir do valor (achado em teste manual, editor de
// músicas). useSyncExternalStore é o jeito documentado pelo próprio React
// de ler uma API do navegador que pode diferir do snapshot do servidor sem
// gerar esse erro — ele re-renderiza para o valor real assim que monta, em
// vez de alertar como um mismatch.
function subscribe(query: string, onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    getServerSnapshot
  );
}
