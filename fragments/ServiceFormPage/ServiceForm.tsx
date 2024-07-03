import SortingButtons from '@/components/SortingButtons';
import { Service } from '@/models/service';
import { ServiceSongUnit, ServiceUnit } from '@/models/service-unit';
import { Song } from '@/models/song';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import ServiceSongUnitEditor from '../ServiceSongUnitEditor';
import AddUnitForm from './AddUnitForm';

type ServiceFormProps = {
  service: Service;
  updateService: () => void;
};

export default function ServiceForm({ service, updateService }: ServiceFormProps) {
  const [units, setUnits] = useState(service.units);
  const moveUnitUp = useMoveUnitUpCallback(service, setUnits, updateService);
  const moveUnitDown = useMoveUnitDownCallback(service, setUnits, updateService);
  const updateSong = useUpdateSongCallback(service, setUnits, updateService);
  const buildSemitoneTransposeChangeHandler = useBuildSemitoneTransposeChangeHandlerCallback(
    service,
    setUnits,
    updateService
  );
  const buildRemoveUnitHandler = useBuildRemoveUnitHandlerCallback(service, setUnits, updateService);
  const createSongUnit = useCreateSongUnitCallback(service, setUnits, updateService);

  return (
    <section className="flex flex-col gap-2 mx-auto">
      {units.map((unit, index) => {
        if (unit) {
          return (
            <div key={index} className="flex">
              <SortingButtons
                moveUnitUp={moveUnitUp}
                moveUnitDown={moveUnitDown}
                listSize={units.length}
                index={index}
              />
              {unit.type === 'SONG' ? (
                <ServiceSongUnitEditor
                  unit={unit as ServiceSongUnit}
                  updateSong={updateSong}
                  setSemitoneTranspose={buildSemitoneTransposeChangeHandler(index)}
                  removeUnit={buildRemoveUnitHandler(index)}
                />
              ) : null}
            </div>
          );
        }
        return 'ERROR';
      })}
      <div className="pl-10">
        <AddUnitForm onCreateUnit={createSongUnit} />
      </div>
    </section>
  );
}

function useMoveUnitUpCallback(
  service: Service,
  setUnits: Dispatch<SetStateAction<ServiceUnit[]>>,
  updateService: () => void
) {
  return useCallback(
    (index: number) => {
      service.moveUnitUp(index);
      setUnits([...service.units]);
      updateService();
    },
    [service, setUnits, updateService]
  );
}

function useMoveUnitDownCallback(
  service: Service,
  setUnits: Dispatch<SetStateAction<ServiceUnit[]>>,
  updateService: () => void
) {
  return useCallback(
    (index: number) => {
      service.moveUnitDown(index);
      setUnits([...service.units]);
      updateService();
    },
    [service, setUnits, updateService]
  );
}

function useUpdateSongCallback(
  service: Service,
  setUnits: Dispatch<SetStateAction<ServiceUnit[]>>,
  updateService: () => void
) {
  return useCallback(() => {
    setUnits([...service.units]);
    updateService();
  }, [service, setUnits, updateService]);
}

function useBuildSemitoneTransposeChangeHandlerCallback(
  service: Service,
  setUnits: Dispatch<SetStateAction<ServiceUnit[]>>,
  updateService: () => void
) {
  return useCallback(
    (index: number) => (semitoneTranspose: number) => {
      (service.units[index] as ServiceSongUnit).semitoneTranspose = semitoneTranspose;
      setUnits([...service.units]);
      updateService();
    },
    [service, setUnits, updateService]
  );
}

function useBuildRemoveUnitHandlerCallback(
  service: Service,
  setUnits: Dispatch<SetStateAction<ServiceUnit[]>>,
  updateService: () => void
) {
  return useCallback(
    (index: number) => () => {
      service.removeUnit(index);
      setUnits([...service.units]);
      updateService();
    },
    [service, setUnits, updateService]
  );
}

function useCreateSongUnitCallback(
  service: Service,
  setUnits: Dispatch<SetStateAction<ServiceUnit[]>>,
  updateService: () => void
) {
  return useCallback(
    (song: Song) => {
      service.addUnit(new ServiceSongUnit({ song, arrangementId: song.currentArrangementId }));
      setUnits([...service.units]);
      updateService();
    },
    [service, setUnits, updateService]
  );
}
