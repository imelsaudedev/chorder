import SortingButtons from '@/components/SortingButtons';
import { Service } from '@/models/service';
import { ServiceSongUnit, ServiceUnit } from '@/models/service-unit';
import { Song } from '@/models/song';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import ServiceSongUnitEditor from '../../fragments/ServiceSongUnitEditor';
import AddUnitForm from './AddUnitForm';
import { UnitSchema } from './schema';
import { ServiceUnitsHook } from './useServiceUnits';
import SortableServiceUnitForm from './SortableServiceUnitForm';

type UnitListFormServiceUnitElement = {
  id: string;
} & UnitSchema;

type ServiceFormProps = {
  unitsFields: UnitListFormServiceUnitElement[];
  unitsHook: ServiceUnitsHook;
};

export default function ServiceUnitListForm({ unitsFields, unitsHook }: ServiceFormProps) {
  return (
    <section className="max-w-lg mx-auto">
      {unitsFields.map((field, index) => (
        <SortableServiceUnitForm key={field.id} unit={field} index={index} unitsHook={unitsHook} />
      ))}
      <div className="pl-10">
        <AddUnitForm units={arrangement.units} onCreateUnit={onCreateUnit} onAddExistingUnit={onAddExistingUnit} />
        <AddUnitForm onCreateUnit={createSongUnit} />
      </div>
    </section>
  );

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
