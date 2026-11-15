"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Tag from "@/components/common/Tag";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";
import {
  AlertCircle, ArrowLeft, Bell, BookOpen, Check, ChevronDown, ChevronRight,
  CircleMinus, CirclePlus, Copy, Edit, ExternalLink, Eye, FileAudio,
  Heart, Home, Info, Loader2, LogOut, Menu, Music, Pause, Play,
  Plus, Search, Settings, Trash2, Upload, User, Volume2, X, Youtube,
} from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────────────── */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 py-10 border-b border-zinc-100 last:border-0">
      <h2 className="font-display font-semibold text-xl text-zinc-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-secondary inline-block" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Token({ label, className, value }: { label: string; className?: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-zinc-700">{label}</span>
      {className && <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded w-fit">{className}</code>}
      {value && <span className="text-[11px] text-zinc-400 font-mono">{value}</span>}
    </div>
  );
}

/* ─── color swatch ───────────────────────────────────────────────────── */

function ColorSwatch({
  bg, label, twClass, value, textClass = "text-zinc-900",
}: {
  bg: string; label: string; twClass: string; value: string; textClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div
        className="h-14 rounded-lg border border-black/5 shadow-sm"
        style={{ background: bg }}
      />
      <Token label={label} className={twClass} value={value} />
    </div>
  );
}

/* ─── section: nav ───────────────────────────────────────────────────── */

const NAV = [
  { id: "cores", label: "Cores" },
  { id: "tipografia", label: "Tipografia" },
  { id: "espacamento", label: "Espaçamento" },
  { id: "bordas", label: "Bordas & Sombras" },
  { id: "botoes", label: "Botões" },
  { id: "formularios", label: "Formulários" },
  { id: "cards", label: "Cards" },
  { id: "abas", label: "Abas" },
  { id: "feedback", label: "Feedback" },
  { id: "tags", label: "Tags" },
  { id: "icones", label: "Ícones" },
];

/* ─── page ───────────────────────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Header */}
      <header className="border-b border-zinc-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-lg text-zinc-900">Design System</span>
            <span className="text-xs bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded-full">chorder-alt</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Tailwind v4 · shadcn/ui · Lucide</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 flex gap-12 py-8">

        {/* Sidebar */}
        <aside className="hidden lg:block w-44 shrink-0">
          <nav className="sticky top-22 flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* ── Cores ──────────────────────────────────────────────── */}
          <Section id="cores" title="Cores">

            <div className="flex flex-col gap-8">

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Tokens semânticos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <ColorSwatch bg="hsl(0 0% 9%)" label="primary" twClass="bg-primary" value="hsl(0 0% 9%)" />
                  <ColorSwatch bg="hsl(161 94% 30%)" label="secondary" twClass="bg-secondary" value="hsl(161 94% 30%)" textClass="text-white" />
                  <ColorSwatch bg="hsl(23 100% 60%)" label="accent" twClass="bg-accent" value="hsl(23 100% 60%)" />
                  <ColorSwatch bg="hsl(0 84.2% 60.2%)" label="destructive" twClass="bg-destructive" value="hsl(0 84.2% 60.2%)" />
                  <ColorSwatch bg="hsl(160 8% 72%)" label="muted" twClass="bg-muted" value="hsl(160 8% 72%)" />
                  <ColorSwatch bg="hsl(0 0% 100%)" label="background" twClass="bg-background" value="hsl(0 0% 100%)" />
                  <ColorSwatch bg="hsl(164 84% 4.9%)" label="foreground" twClass="text-foreground" value="hsl(164 84% 4.9%)" textClass="text-white" />
                  <ColorSwatch bg="hsl(0 0% 89.8%)" label="border" twClass="border-border" value="hsl(0 0% 89.8%)" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Emerald — cor de destaque</p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="flex flex-col gap-1">
                      <div className={`h-8 rounded bg-emerald-${shade} border border-black/5`} />
                      <span className="text-[10px] text-zinc-400 text-center">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Zinc — neutros de UI</p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="flex flex-col gap-1">
                      <div className={`h-8 rounded bg-zinc-${shade} border border-black/5`} />
                      <span className="text-[10px] text-zinc-400 text-center">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Section>

          {/* ── Tipografia ─────────────────────────────────────────── */}
          <Section id="tipografia" title="Tipografia">

            <div className="flex flex-col gap-8">

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Famílias</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "IBM Plex Sans", cls: "font-sans", desc: "Corpo de texto, UI padrão" },
                    { name: "Space Grotesk", cls: "font-display", desc: "Headings, display" },
                    { name: "IBM Plex Serif", cls: "font-serif", desc: "Texto editorial" },
                    { name: "IBM Plex Mono", cls: "font-mono", desc: "Código, valores técnicos" },
                  ].map((f) => (
                    <div key={f.name} className="p-4 rounded-lg border border-zinc-100 bg-zinc-50 flex flex-col gap-1">
                      <span className={cn("text-2xl text-zinc-900", f.cls)}>Aa Bb Cc 123</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold text-zinc-700">{f.name}</span>
                        <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">{f.cls}</code>
                      </div>
                      <span className="text-xs text-zinc-400">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Variantes — componente Text</p>
                <div className="flex flex-col divide-y divide-zinc-100">
                  {[
                    { variant: "heading-xl" as const, sample: "Heading XL — título de página" },
                    { variant: "heading-lg" as const, sample: "Heading LG — título de seção" },
                    { variant: "heading-md" as const, sample: "Heading MD — subtítulo" },
                    { variant: "heading-sm" as const, sample: "Heading SM — UI chrome" },
                    { variant: "body" as const, sample: "Body — texto corrido, parágrafos e descrições" },
                    { variant: "label" as const, sample: "Label — labels de formulário, metadados" },
                    { variant: "caption" as const, sample: "Caption — datas, artistas, texto secundário" },
                    { variant: "overline" as const, sample: "Overline — categorias em caps" },
                  ].map(({ variant, sample }) => (
                    <div key={variant} className="py-3 flex items-baseline justify-between gap-4">
                      <Text variant={variant}>{sample}</Text>
                      <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded shrink-0">{variant}</code>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Section>

          {/* ── Espaçamento ────────────────────────────────────────── */}
          <Section id="espacamento" title="Espaçamento">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Escala de spacing (rem × 4px)</p>
              <div className="flex flex-col gap-2">
                {[
                  { t: "1", px: "4px" }, { t: "2", px: "8px" }, { t: "3", px: "12px" },
                  { t: "4", px: "16px" }, { t: "5", px: "20px" }, { t: "6", px: "24px" },
                  { t: "8", px: "32px" }, { t: "10", px: "40px" }, { t: "12", px: "48px" },
                  { t: "16", px: "64px" }, { t: "20", px: "80px" }, { t: "24", px: "96px" },
                ].map(({ t, px }) => (
                  <div key={t} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-zinc-400 w-6 text-right">{t}</span>
                    <div className="bg-secondary/20 rounded h-5" style={{ width: px }} />
                    <span className="text-xs text-zinc-400">{px}</span>
                    <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">p-{t} / gap-{t}</code>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Bordas & Sombras ────────────────────────────────────── */}
          <Section id="bordas" title="Bordas & Sombras">
            <div className="flex flex-col gap-8">

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Border radius</p>
                <div className="flex flex-wrap gap-6 items-end">
                  {[
                    { label: "none", cls: "rounded-none", px: "0px" },
                    { label: "sm", cls: "rounded-sm", px: "calc(0.5rem - 4px)" },
                    { label: "md", cls: "rounded-md", px: "calc(0.5rem - 2px)" },
                    { label: "default (lg)", cls: "rounded-lg", px: "0.5rem" },
                    { label: "xl", cls: "rounded-xl", px: "0.75rem" },
                    { label: "2xl", cls: "rounded-2xl", px: "1rem" },
                    { label: "full", cls: "rounded-full", px: "9999px" },
                  ].map(({ label, cls, px }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div className={cn("w-16 h-16 bg-zinc-100 border border-zinc-200", cls)} />
                      <span className="text-xs font-semibold text-zinc-700">{label}</span>
                      <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">{cls}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Sombras</p>
                <div className="flex flex-wrap gap-6 items-end">
                  {["shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl"].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-3">
                      <div className={cn("w-20 h-20 bg-white rounded-lg", s)} />
                      <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">{s}</code>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Section>

          {/* ── Botões ─────────────────────────────────────────────── */}
          <Section id="botoes" title="Botões">
            <div className="flex flex-col gap-8">

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Variantes</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default"><Check size={15} />Default</Button>
                  <Button variant="secondary"><Music size={15} />Secondary</Button>
                  <Button variant="outline"><Upload size={15} />Outline</Button>
                  <Button variant="ghost"><Settings size={15} />Ghost</Button>
                  <Button variant="link"><ExternalLink size={15} />Link</Button>
                  <Button variant="destructive"><Trash2 size={15} />Destructive</Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Tamanhos</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Plus /></Button>
                  <Button size="icon" variant="outline"><Search /></Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Estados</p>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Desabilitado</Button>
                  <Button disabled><Loader2 size={15} className="animate-spin" />Carregando</Button>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Referência de classes</p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 font-mono text-xs">
                  {[
                    ["default", "bg-primary text-primary-foreground"],
                    ["secondary", "bg-secondary text-secondary-foreground"],
                    ["outline", "border bg-background hover:bg-accent"],
                    ["ghost", "hover:bg-accent hover:text-accent-foreground"],
                    ["destructive", "bg-destructive text-white"],
                  ].map(([v, cls]) => (
                    <div key={v} className="flex gap-2">
                      <span className="text-zinc-400 w-24 shrink-0">{v}</span>
                      <span className="text-zinc-600">{cls}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Section>

          {/* ── Formulários ────────────────────────────────────────── */}
          <Section id="formularios" title="Formulários">
            <div className="flex flex-col gap-8">

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label>Input padrão</Label>
                  <Input placeholder="Placeholder…" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Input com ícone</Label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input className="pl-9" placeholder="Buscar…" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Desabilitado</Label>
                  <Input disabled placeholder="Não editável" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Com erro</Label>
                  <Input aria-invalid="true" defaultValue="Valor inválido" />
                  <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} />Campo obrigatório</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label>Textarea</Label>
                  <Textarea placeholder="Escreva aqui…" rows={4} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Select</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c">Dó (C)</SelectItem>
                      <SelectItem value="d">Ré (D)</SelectItem>
                      <SelectItem value="e">Mi (E)</SelectItem>
                      <SelectItem value="f">Fá (F)</SelectItem>
                      <SelectItem value="g">Sol (G)</SelectItem>
                      <SelectItem value="a">Lá (A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Switch id="sw1" />
                  <Label htmlFor="sw1">Desligado</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="sw2" defaultChecked />
                  <Label htmlFor="sw2">Ligado</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="sw3" disabled />
                  <Label htmlFor="sw3" className="text-muted-foreground">Desabilitado</Label>
                </div>
              </div>

            </div>
          </Section>

          {/* ── Cards ──────────────────────────────────────────────── */}
          <Section id="cards" title="Cards">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <Card>
                <CardHeader>
                  <CardTitle>Glória e Força</CardTitle>
                  <CardDescription>Vencedores por Cristo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Tom: D · 5 seções</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" variant="outline"><Edit size={13} />Editar</Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 size={13} />Excluir</Button>
                </CardFooter>
              </Card>

              <Card className="border-secondary/30 bg-secondary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Card destacado</CardTitle>
                    <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded-full font-medium">Ativo</span>
                  </div>
                  <CardDescription>Com badge de status</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Conteúdo com bordas na cor secondary.</p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground hover:border-secondary hover:text-secondary transition-colors cursor-pointer group">
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium">Adicionar novo</p>
              </Card>

            </div>
          </Section>

          {/* ── Abas ───────────────────────────────────────────────── */}
          <Section id="abas" title="Abas">
            <Tabs defaultValue="letras">
              <TabsList>
                <TabsTrigger value="letras"><BookOpen size={14} />Letras</TabsTrigger>
                <TabsTrigger value="cifras"><Music size={14} />Cifras</TabsTrigger>
                <TabsTrigger value="audio"><Volume2 size={14} />Áudio</TabsTrigger>
              </TabsList>
              <TabsContent value="letras" className="mt-4 p-4 rounded-lg border border-zinc-100 bg-zinc-50 text-sm text-zinc-600">
                Conteúdo da aba Letras. Use <code className="text-secondary">TabsList</code>, <code className="text-secondary">TabsTrigger</code> e <code className="text-secondary">TabsContent</code>.
              </TabsContent>
              <TabsContent value="cifras" className="mt-4 p-4 rounded-lg border border-zinc-100 bg-zinc-50 text-sm text-zinc-600">
                Conteúdo da aba Cifras.
              </TabsContent>
              <TabsContent value="audio" className="mt-4 p-4 rounded-lg border border-zinc-100 bg-zinc-50 text-sm text-zinc-600">
                Conteúdo da aba Áudio.
              </TabsContent>
            </Tabs>
          </Section>

          {/* ── Feedback ───────────────────────────────────────────── */}
          <Section id="feedback" title="Feedback">
            <div className="flex flex-col gap-8">

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Skeleton</p>
                <div className="flex flex-col gap-3 max-w-sm">
                  <Skeleton className="h-8 w-3/4 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-4/6 rounded" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Estados de alert</p>
                <div className="flex flex-col gap-3 max-w-lg">
                  {[
                    { icon: Info, bg: "bg-blue-50 border-blue-200", iconCls: "text-blue-500", textCls: "text-blue-800", label: "Informação", msg: "Uma dica ou informação contextual para o usuário." },
                    { icon: Check, bg: "bg-emerald-50 border-emerald-200", iconCls: "text-emerald-500", textCls: "text-emerald-800", label: "Sucesso", msg: "A ação foi concluída com sucesso." },
                    { icon: AlertCircle, bg: "bg-red-50 border-red-200", iconCls: "text-red-500", textCls: "text-red-800", label: "Erro", msg: "Algo deu errado. Tente novamente." },
                  ].map(({ icon: Icon, bg, iconCls, textCls, label, msg }) => (
                    <div key={label} className={cn("flex items-start gap-3 p-3 rounded-lg border text-sm", bg)}>
                      <Icon size={16} className={cn("mt-0.5 shrink-0", iconCls)} />
                      <div>
                        <p className={cn("font-medium", textCls)}>{label}</p>
                        <p className={cn("text-xs mt-0.5", textCls, "opacity-80")}>{msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Estado vazio</p>
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-zinc-200 max-w-sm text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Music size={20} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-700 text-sm">Nenhuma música encontrada</p>
                    <p className="text-xs text-zinc-400 mt-1">Adicione músicas ao repertório para começar.</p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-1"><Plus size={13} />Adicionar música</Button>
                </div>
              </div>

            </div>
          </Section>

          {/* ── Tags ───────────────────────────────────────────────── */}
          <Section id="tags" title="Tags">
            <div className="flex flex-col gap-8">

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Variantes semânticas</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {(["default", "success", "warning", "error", "info", "muted"] as const).map((v) => (
                    <div key={v} className="flex flex-col items-start gap-1.5">
                      <Tag label={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} size="sm" />
                      <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">variant=&quot;{v}&quot;</code>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Tamanhos</p>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <Tag label="Pequena" variant="success" size="xs" />
                    <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">size=&quot;xs&quot;</code>
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <Tag label="Normal" variant="success" size="sm" />
                    <code className="text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">size=&quot;sm&quot;</code>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Cor dinâmica (vinda do banco)</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                    <Tag key={color} label="Adoração" color={color} />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 mt-2">Fundo, texto e borda gerados automaticamente com opacidade.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Uso em lista de músicas</p>
                <div className="flex flex-wrap gap-1.5">
                  <Tag label="Adoração" color="#10b981" />
                  <Tag label="Louvor" color="#3b82f6" />
                  <Tag label="Comunhão" color="#8b5cf6" />
                  <Tag label="Páscoa" color="#f59e0b" />
                </div>
              </div>

            </div>
          </Section>

          {/* ── Ícones ─────────────────────────────────────────────── */}
          <Section id="icones" title="Ícones">
            <p className="text-sm text-zinc-500 mb-5">
              Todos os ícones são do <span className="text-zinc-800 font-medium">Lucide React</span>.
              Use <code className="text-secondary bg-secondary/10 px-1.5 py-0.5 rounded text-xs">size</code> para controlar o tamanho
              e <code className="text-secondary bg-secondary/10 px-1.5 py-0.5 rounded text-xs">className</code> para a cor via <code className="text-secondary bg-secondary/10 px-1.5 py-0.5 rounded text-xs">text-*</code>.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {[
                { icon: Music, name: "Music" },
                { icon: Play, name: "Play" },
                { icon: Pause, name: "Pause" },
                { icon: Volume2, name: "Volume2" },
                { icon: FileAudio, name: "FileAudio" },
                { icon: Youtube, name: "Youtube" },
                { icon: Search, name: "Search" },
                { icon: Plus, name: "Plus" },
                { icon: Edit, name: "Edit" },
                { icon: Trash2, name: "Trash2" },
                { icon: Copy, name: "Copy" },
                { icon: Upload, name: "Upload" },
                { icon: Settings, name: "Settings" },
                { icon: User, name: "User" },
                { icon: LogOut, name: "LogOut" },
                { icon: Bell, name: "Bell" },
                { icon: Home, name: "Home" },
                { icon: Menu, name: "Menu" },
                { icon: ChevronDown, name: "ChevronDown" },
                { icon: ChevronRight, name: "ChevronRight" },
                { icon: ArrowLeft, name: "ArrowLeft" },
                { icon: X, name: "X" },
                { icon: Check, name: "Check" },
                { icon: Eye, name: "Eye" },
                { icon: Info, name: "Info" },
                { icon: AlertCircle, name: "AlertCircle" },
                { icon: ExternalLink, name: "ExternalLink" },
                { icon: Heart, name: "Heart" },
                { icon: BookOpen, name: "BookOpen" },
                { icon: CircleMinus, name: "CircleMinus" },
                { icon: CirclePlus, name: "CirclePlus" },
                { icon: Loader2, name: "Loader2" },
              ].map(({ icon: Icon, name }) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-colors group"
                >
                  <Icon size={20} className="text-zinc-700 group-hover:text-secondary transition-colors" />
                  <span className="text-[10px] text-zinc-400 text-center leading-tight font-mono">{name}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider w-full">Tamanhos</p>
              {[12, 14, 16, 18, 20, 24, 32].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <Music size={s} className="text-secondary" />
                  <span className="text-[10px] text-zinc-400 font-mono">{s}px</span>
                </div>
              ))}
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}
