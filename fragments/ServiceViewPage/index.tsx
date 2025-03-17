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
import { Fragment, useState, useRef } from 'react';
import ServiceConfig from './ServiceConfig';
import ServiceSongUnitView from './ServiceSongUnitView';
import ServiceActionMenu from './ServiceActionMenu';
import { Calendar, MicVocal, Minimize, Maximize } from 'lucide-react';
import FullScreenToggle from '@/components/FullScreenToggle';

type ServiceViewPageProps = {
  service: Service;
};

export default function ServiceViewPage({ service }: ServiceViewPageProps) {
  const t = useTranslations('Messages');
  const [currentIndex, setCurrentIndex] = useState(0);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState('chords' as Mode);
  const units = service.units;

  const deleteCurrentService = deleteService.bind(null, service);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(service.date)
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/ de ([a-z])/, (m, c) => ` de ${c.toUpperCase() + m.slice(5)}`);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      unitRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNext = () => {
    if (currentIndex < units.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      unitRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Collapsible>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row flex-grow justify-between gap-2 mb-4 fullscreen-hidden">
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
                    <div ref={(el) => (unitRefs.current[index] = el)}>
                      <ServiceSongUnitView
                        unit={unit as ServiceSongUnit}
                        columns={columns}
                        mode={mode}
                        order={index + 1}
                      />
                    </div>
                  ) : null}
                </Fragment>
              );
            }
            return 'ERROR';
          })}
        </section>
      </Main>

      <FullScreenToggle onPrevious={handlePrevious} onNext={handleNext} />
    </Collapsible>
  );
}
