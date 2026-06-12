type FontResult = { variable: string; style: { fontFamily: string }; className: string };
type FontFn = (opts?: Record<string, unknown>) => FontResult;

const mockFont: FontFn = () => ({ variable: '', style: { fontFamily: '' }, className: '' });

export const Inter = mockFont;
export const Bricolage_Grotesque = mockFont;
export const IBM_Plex_Sans = mockFont;
export const IBM_Plex_Mono = mockFont;
export const IBM_Plex_Serif = mockFont;
export default mockFont;
