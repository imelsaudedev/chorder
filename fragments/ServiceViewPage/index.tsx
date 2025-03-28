import PageHeader from '@/components/PageHeader';
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
import { Calendar, MicVocal, ArrowLeft } from 'lucide-react';
import FullScreenToggle from '@/components/FullScreenToggle';
import Link from 'next/link';

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
  const [density, setDensity] = useState<'compact' | 'normal'>('normal');

  const units = service.units;
  const deleteCurrentService = deleteService.bind(null, service);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
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

  const subtitle = (
    <div className="flex flex-row items-center gap-4 leading-tight">
      <span className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        {formattedDate}
      </span>
      {service.worshipLeader && (
        <span className="flex items-center gap-1">
          <MicVocal className="w-4 h-4" />
          <span className="hidden sm:block">Dirigido por</span>
          {service.worshipLeader}
        </span>
      )}
    </div>
  );

  return (
    <Collapsible>
      <PageHeader
        backLinkHref="/services"
        backLinkText="Liturgias"
        title={getHumanReadableTitle(service, t('service'))}
        subtitle={subtitle}
        actions={
          <div className="flex gap-2 items-center md:self-end">
            <ServiceActionMenu deleteService={deleteCurrentService} />
            {/* O botão de configuração agora está dentro do Collapsible */}
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <AdjustmentIcon />
                <span className="sr-only">{t('toggleConfig')}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        }
      />

      <CollapsibleContent>
        <ServiceConfig
          columns={columns}
          setColumns={setColumns}
          fontSize={fontSize}
          setFontSize={setFontSize}
          mode={mode}
          setMode={setMode}
          density={density}
          setDensity={setDensity}
        />
      </CollapsibleContent>

      <Main density={density} className="py-4 sm:py-6 lg:py-8">
        <section
          className={`flex flex-col mx-auto ${density === 'compact' ? 'gap-2 text-sm' : 'gap-8 text-base'}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {units.map((unit, index) => (
            <Fragment key={index}>
              {unit?.type === 'SONG' && (
                <div ref={(el) => (unitRefs.current[index] = el)}>
                  <ServiceSongUnitView
                    unit={unit as ServiceSongUnit}
                    columns={columns}
                    mode={mode}
                    order={index + 1}
                    density={density}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </section>
      </Main>

      <FullScreenToggle onPrevious={handlePrevious} onNext={handleNext} />
    </Collapsible>
  );
}
