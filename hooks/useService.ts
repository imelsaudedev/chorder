import { Service, ServiceSongUnit, ServiceUnit } from '@/models/service';
import { useCallback, useMemo } from 'react';
import useMoveUpDownCallbacks from './useMoveUpDownCallbacks';
import useUpdatableState from './useUpdatableState';

export type ServiceHook = {
  service: Service;
  isNewService: boolean;
  title: string;
  setTitle: (newValue: string) => void;
  worshipLeader: string | null;
  setWorshipLeader: (newValue: string | null) => void;
  date: Date;
  setDate: (newValue: Date) => void;
  units: ServiceUnit[];
  createSongUnit: () => void;
  moveUnitUp: (unitIndex: number) => void;
  moveUnitDown: (unitIndex: number) => void;
  buildRemoveUnitHandler: (unitIndex: number) => () => void;
};

export default function useService(service: Service): ServiceHook {
  const isNewService = !service.slug;
  const [title, setTitle] = useUpdatableState<string>(service.title);
  const [worshipLeader, setWorshipLeader] = useUpdatableState<string | null>(service.worshipLeader);
  const [date, setDate] = useUpdatableState<Date>(service.date);
  const { units, createSongUnit, moveUnitUp, moveUnitDown, buildRemoveUnitHandler } = useUnits(service.units);

  const builtService = useMemoService(title, worshipLeader, date, units);

  return {
    service: builtService,
    isNewService,
    title,
    setTitle,
    worshipLeader,
    setWorshipLeader,
    date,
    setDate,
    units,
    createSongUnit,
    moveUnitUp,
    moveUnitDown,
    buildRemoveUnitHandler,
  };
}

function useMemoService(title: string, worshipLeader: string | null, date: Date, units: ServiceUnit[]) {
  return useMemo(() => {
    return new Service({
      title,
      worshipLeader,
      date,
      units,
    });
  }, [title, worshipLeader, date, units]);
}

function useUnits(units: ServiceUnit[]) {
  const [internalUnits, setInternalUnits] = useUpdatableState(units);

  const { createSongUnit, moveUnitUp, moveUnitDown, buildRemoveUnitHandler } = useUnitCallbacks(
    internalUnits,
    setInternalUnits
  );

  return {
    units: internalUnits,
    createSongUnit,
    moveUnitUp,
    moveUnitDown,
    buildRemoveUnitHandler,
  };
}

function useUnitCallbacks(internalUnits: ServiceUnit[], setInternalUnits: (newValue: ServiceUnit[]) => void) {
  const createSongUnit = useCallback(() => {
    const newUnit = new ServiceSongUnit({});
    setInternalUnits([...internalUnits, newUnit]);
  }, [internalUnits, setInternalUnits]);

  const [moveUnitUp, moveUnitDown] = useMoveUpDownCallbacks(internalUnits, setInternalUnits);

  const buildRemoveUnitHandler = useCallback(
    (unitIndex: number) => {
      return () => {
        const newUnits = [...internalUnits];
        newUnits.splice(unitIndex, 1);
        setInternalUnits(newUnits);
      };
    },
    [internalUnits, setInternalUnits]
  );

  return { createSongUnit, moveUnitUp, moveUnitDown, buildRemoveUnitHandler };
}
