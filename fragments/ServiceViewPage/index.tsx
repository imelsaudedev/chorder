import { deleteService } from '@/app/services/[service]/actions';
import AdjustmentIcon from '@/components/icons/AdjustmentIcon';
import Main from '@/components/Main';
import { Mode } from '@/components/ModeButtonSet';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getHumanReadableTitle, Service } from '@/models/service';
import { ServiceSongUnit } from '@/models/service-unit';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import ServiceConfig from './ServiceConfig';
import ServiceSongUnitView from './ServiceSongUnitView';
import ServiceActionMenu from './ServiceActionMenu';
import { Calendar, MicVocal } from 'lucide-react';

type ServiceViewPageProps = {
  service: Service;
};

export default function ServiceViewPage({ service }: ServiceViewPageProps) {
  const t = useTranslations('Messages');

  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState('chords' as Mode);
  const units = service.units;

  const deleteCurrentService = deleteService.bind(null, service);

  // Formatação da data com iniciais maiúsculas
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(service.date)
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitaliza a primeira letra do dia da semana
    .replace(/ de ([a-z])/, (m, c) => ` de ${c.toUpperCase() + m.slice(5)}`); // Capitaliza a primeira letra do mês

  return (
    <Collapsible>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row flex-grow justify-between gap-2 mb-4">
          {/* Título */}
          <div className="flex flex-col">
            <h1 className="font-bold text-3xl sm:text-4xl leading-none text-primary tracking-tighter mb-2">
              {getHumanReadableTitle(service, t('service'))}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-base sm:text-lg">
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar size={18} />
                {formattedDate}
              </span>
              {service.worshipLeader && (
                <span className="flex items-center gap-1 text-slate-400">
                  <MicVocal size={18} />
                  {service.worshipLeader}
                </span>
              )}
            </div>
          </div>

          {/* Botões de Ação e Configuração */}
          <div className="flex gap-2 items-center md:self-end">
            <ServiceActionMenu deleteService={deleteCurrentService} />
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-9 p-0">
                <AdjustmentIcon />
                <span className="sr-only">{t('toggleConfig')}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <Main className="pb-16">
        <CollapsibleContent>
          <ServiceConfig
            columns={columns}
            setColumns={setColumns}
            fontSize={fontSize}
            setFontSize={setFontSize}
            mode={mode}
            setMode={setMode}
          />
        </CollapsibleContent>

        <section className="flex flex-col gap-4 sm:gap-6 mx-auto" style={{ fontSize: `${fontSize}px` }}>
          {units.map((unit, index) => {
            if (unit) {
              return (
                <Fragment key={index}>
                  {unit.type === 'SONG' ? (
                    <ServiceSongUnitView unit={unit as ServiceSongUnit} columns={columns} mode={mode} />
                  ) : null}
                </Fragment>
              );
            }
            return 'ERROR';
          })}
        </section>
      </Main>
    </Collapsible>
  );
}
