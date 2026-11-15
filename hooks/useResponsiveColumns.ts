import { useMediaQuery } from "./useMediaQuery";

// Resolve "quantas colunas de verdade" a partir da preferência salva
// (columnConfig): 0 significa "automático", resolvido pelos mesmos
// breakpoints que ColumnViewer (a leitura) já usava — extraído daqui pra
// ser reaproveitado também pelo editor por blocos, que precisa mostrar as
// MESMAS colunas da leitura ao entrar em modo de edição (achado: "manter
// as colunas da view, não apenas uma coluna").
export function useResponsiveColumns(columnConfig: number): number {
  const isPhone = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(max-width: 1023px)");
  const isDesktop = useMediaQuery("(max-width: 1279px)");

  if (columnConfig !== 0) return columnConfig;
  if (isPhone) return 1;
  if (isTablet) return 2;
  if (isDesktop) return 3;
  return 4;
}
