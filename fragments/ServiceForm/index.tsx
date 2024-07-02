import BackArrow from '@/components/BackArrow';
import Header from '@/components/Header';
import Main from '@/components/Main';
import { Dispatch, SetStateAction } from 'react';
import { ServiceHook } from '@/hooks/useService';
import HeaderForm from './HeaderForm';
import SaveButtonSet from '@/components/SaveButtonSet';
import SortingButtons from '@/components/SortingButtons';
import AddUnitForm from './AddUnitForm';
import ServiceSongUnitViewer from '../ServiceSongUnitViewer';
import { ServiceSongUnit } from '@/models/service';

type SongFormProps = {
  serviceData: ServiceHook;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ServiceForm({ serviceData, setWriteMode }: SongFormProps) {
  const {
    service,
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
    buildSemitoneTransposeChangeHandler,
    buildRemoveUnitHandler,
  } = serviceData;

  // const submitService = postService.bind(null, service.serialize() || null);

  return (
    <form>
      <Header>
        <BackArrow href="/services" />
        <HeaderForm
          title={title}
          setTitle={setTitle}
          worshipLeader={worshipLeader}
          setWorshipLeader={setWorshipLeader}
          date={date}
          setDate={setDate}
        />
        <SaveButtonSet canCancel={!isNewService} enabled={service.isValid} setWriteMode={setWriteMode} />
      </Header>
      <Main className="pt-4">
        <section className="flex flex-col gap-2 max-w-lg mx-auto">
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
                    <ServiceSongUnitViewer
                      unit={unit as ServiceSongUnit}
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
      </Main>
    </form>
  );
}
