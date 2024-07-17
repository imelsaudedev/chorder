import { deleteService } from '@/app/services/[service]/actions';
import ConfigIcon from '@/components/icons/ConfigIcon';
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

  return (
    <Collapsible>
      <div className="px-4">
        <div className="flex gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <h1 className="font-bold text-2xl leading-none text-primary">
              {getHumanReadableTitle(service, t('service'))}
            </h1>
            {service.worshipLeader && <span className="text-sm text-muted">{service.worshipLeader}</span>}
          </div>
          <div className="flex gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ConfigIcon />
                <span className="sr-only">{t('toggleConfig')}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>
      <Main>
        <CollapsibleContent>
          <ServiceConfig
            columns={columns}
            setColumns={setColumns}
            fontSize={fontSize}
            setFontSize={setFontSize}
            mode={mode}
            setMode={setMode}
            deleteService={deleteCurrentService}
          />
        </CollapsibleContent>
        <section className="flex flex-col gap-6 mx-auto" style={{ fontSize: `${fontSize}px` }}>
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
