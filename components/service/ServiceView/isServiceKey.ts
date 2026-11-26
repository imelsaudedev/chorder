/**
 * A chave do SWR é do culto `service`? Aceita o endereço por slug ou por id, com ou sem a query
 * (quem abre por link compartilhado usa `?share=<token>`).
 */
export function isServiceKey(key: unknown, service: { slug: string; id?: number | string }): boolean {
  if (typeof key !== "string") return false;
  return [service.slug, ...(service.id === undefined ? [] : [String(service.id)])].some((id) => {
    const base = `/api/services/${id}`;
    return key === base || key.startsWith(`${base}?`);
  });
}
