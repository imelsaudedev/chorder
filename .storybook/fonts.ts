// Stubs das fontes para o Storybook — next/font não funciona fora do contexto
// do Next.js (o esbuild dep scanner não resolve módulos virtuais do Next.js).
// As propriedades .variable retornam strings vazias; os estilos visuais das
// fontes ficam pelo globals.css que o preview.tsx já importa.
export const bricolageGrotesque = { variable: "" };
export const ibmPlexSans = { variable: "" };
export const ibmPlexMono = { variable: "" };
export const ibmPlexSerif = { variable: "" };
