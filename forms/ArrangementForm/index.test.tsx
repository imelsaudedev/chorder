import { PostSongAction } from '@/app/songs/[song]/actions';
import messages, { format } from '@/i18n/messages';
import { NewSong } from '@/models/song';
import { RequiredIsNew, SongArrangementWith } from '@/models/song-arrangement';
import { SongUnit } from '@/models/song-unit';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Dispatch, SetStateAction } from 'react';
import ArrangementForm from '.';

describe('SongForm', () => {
  const units: SongUnit[] = [
    { content: 'Unit 1', type: 'VERSE', internalId: 1, typeIdx: 1 },
    { content: 'Unit 2', type: 'SOLO', internalId: 2, typeIdx: 1 },
    { content: 'Unit 3', type: 'VERSE', internalId: 3, typeIdx: 2 },
  ];
  const arrangement: SongArrangementWith<RequiredIsNew> = {
    key: 'D',
    units,
    songMap: [1, 2, 2, 3],
    lastUnitId: 3,
    isDeleted: false,
    isDefault: true,
    semitoneTranspose: 0,
    isNew: false,
  };
  const song: NewSong = {
    title: 'Title',
    artist: 'Artist',
    arrangements: [arrangement],
    arrangement,
    slug: 'title',
    lyrics: 'Unit 1\nUnit 2\nUnit 3',
    isDeleted: false,
    currentArrangementId: 0,
  };

  const postSong: PostSongAction = jest.fn();
  const setWriteMode: Dispatch<SetStateAction<boolean>> = jest.fn();

  const originalError = console.error.bind(console.error);
  beforeEach(() => {
    console.error = (msg) => {
      if (!msg.toString().includes('Warning: Invalid value for prop')) originalError(msg);
    };

    const testName = expect.getState().currentTestName || '';
    if (testName.indexOf('creating a new arrangement') >= 0) {
      song.arrangements[0].isNew = true;
    } else {
      song.arrangements[0].isNew = false;
    }
    render(<ArrangementForm song={song} postSong={postSong} setWriteMode={setWriteMode} />);
  });

  it('shows the cancel button when editing a new arrangement', () => {
    const cancelButton = screen.queryByText(messages.messages.cancel);
    expect(cancelButton).toBeInTheDocument();
  });

  it('does not show the cancel button when creating a new arrangement', () => {
    const cancelButton = screen.queryByText(messages.messages.cancel);
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('shows the save button', () => {
    const saveButton = screen.getByText(messages.messages.save);
    expect(saveButton).toBeInTheDocument();
  });

  // it('adds existing unit to map when button is clicked', () => {
  //   // TODO: How to test this now?
  //   const addExistingUnitLabel = screen.getByText(messages.songForm.addExistingUnit);
  //   expect(addExistingUnitLabel).toBeInTheDocument();

  //   let expectedLength = arrangement.songMap.length;
  //   for (const unit of units) {
  //     const label = format(messages.songForm.addUnitWithLabel, { label: `${unit.type}${unit.typeIdx}` });
  //     const unitButtons = screen.getAllByLabelText(label);
  //     expect(unitButtons.length).toBe(1);
  //     const unitButton = unitButtons[0];
  //     expect(unitButton).toBeEnabled();
  //     fireEvent.click(unitButton!);
  //     expectedLength += 1;
  //     expect(arrangement.songMap[arrangement.songMap.length - 1]).toBe(unit.internalId);
  //     expect(arrangement.songMap.length).toBe(expectedLength);
  //   }
  // });

  // it('creates unit and adds it to map when the add new unit button is clicked', () => {
  //   // TODO: How to test this now?
  //   const addNewUnitButton = screen.getByLabelText(messages.songForm.newUnit);

  //   const prevUnitsLength = arrangement.units.length;
  //   const prevSongMapLength = arrangement.songMap.length;

  //   fireEvent.click(addNewUnitButton);

  //   expect(arrangement.units.length).toBe(prevUnitsLength + 1);
  //   expect(arrangement.songMap.length).toBe(prevSongMapLength + 1);
  // });
});
