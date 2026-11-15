"use client";

import { useFetchRecentServices } from "#api-client";
import Text from "@/components/common/Text";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export default function RecentServicesPanel() {
  const { services, isLoading } = useFetchRecentServices();
  const [query, setQuery] = useState("");

  const filtered = query
    ? services.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.title?.toLowerCase().includes(q) ||
          s.worshipLeader?.toLowerCase().includes(q) ||
          s.songs.some((song) => song.toLowerCase().includes(q))
        );
      })
    : services;

  return (
    <div className="flex flex-col h-full">
      {/* Título + Busca */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <Text variant="overline" as="p" className="mb-2 uppercase tracking-widest text-[10px]">
          Últimas liturgias
        </Text>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            className="h-7 text-xs pl-7 rounded-full"
            placeholder="Filtrar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="px-3 pt-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-12 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-muted/70 rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-muted/50 rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-muted/40 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Text variant="caption" as="p" className="px-3 pt-4 text-xs text-center">
            Nenhum resultado
          </Text>
        )}

        {!isLoading && filtered.map((service) => (
          <div
            key={service.slug}
            className="px-3 py-3 border-b border-border/50 last:border-0"
          >
            <Text variant="overline" as="p" className="mb-0.5 leading-none">
              {formatDate(service.date)}
            </Text>

            {service.title && (
              <Text variant="label" as="p" className="text-xs truncate leading-snug mb-0.5">
                {service.title}
              </Text>
            )}

            {service.worshipLeader && (
              <Text variant="caption" as="p" className="text-[10px] truncate mb-1.5">
                {service.worshipLeader}
              </Text>
            )}

            <ul className="space-y-px">
              {service.songs.map((song, i) => (
                <li key={i}>
                  <Text variant="caption" as="p" className="text-xs truncate">
                    {song}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
