import BackArrow from '@/components/BackArrow';
import Header from '@/components/Header';
import ConfigIcon from '@/components/icons/ConfigIcon';
import Main from '@/components/Main';
import { Button } from '@/components/ui/button';
import { Service } from '@/models/service';
import { ServiceSongUnit } from '@/models/service-unit';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import ServiceSongUnitView from './ServiceSongUnitView';
import ServiceConfig from './ServiceConfig';
import { deleteService } from '@/app/services/[service]/actions';

type ServiceViewPageProps = {
  service: Service;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ServiceViewPage({ service, setWriteMode }: ServiceViewPageProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [columns, setColumns] = useState(2);
  const units = service.units;

  const handleToggleConfig = useCallback(() => {
    setShowConfig((prev) => !prev);
  }, [setShowConfig]);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);
  const deleteCurrentService = deleteService.bind(null, service.serialize());

  return (
    <>
      <Header>
        <BackArrow href="/services" />
        <div className="flex ml-4 gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">{service.title}</span>
            {service.worshipLeader && <span className="text-sm">{service.worshipLeader}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleToggleConfig}>
              <ConfigIcon />
            </Button>
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        <ServiceConfig
          columns={columns}
          setColumns={setColumns}
          deleteService={deleteCurrentService}
          onEditButtonClick={handleEditButtonClick}
          visible={showConfig}
        />
        <section className="flex flex-col gap-6 mx-auto">
          {units.map((unit, index) => {
            if (unit) {
              return (
                <>
                  {unit.type === 'SONG' ? (
                    <ServiceSongUnitView unit={unit as ServiceSongUnit} columns={columns} />
                  ) : null}
                </>
              );
            }
            return 'ERROR';
          })}
        </section>
      </Main>
    </>
  );
}
