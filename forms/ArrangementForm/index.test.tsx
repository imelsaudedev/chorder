import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostSongAction } from '@/app/songs/[song]/actions';
import { Dispatch, SetStateAction } from 'react';
import ArrangementFormPage from '@/fragments/ArrangementFormPage';
import { SongUnit } from '@/models/song-unit';
import messages, { format } from '@/i18n/messages';
import { Song } from '@/models/song';
import { SongArrangement } from '@/models/song-arrangement';

describe('SongForm', () => {
  const units = [
    new SongUnit({ content: 'Unit 1', type: 'VERSE', internalId: 1, typeIdx: 1 }),
    new SongUnit({ content: 'Unit 2', type: 'SOLO', internalId: 2, typeIdx: 1 }),
    new SongUnit({ content: 'Unit 2', type: 'VERSE', internalId: 3, typeIdx: 2 }),
  ];
  const arrangement = new SongArrangement({
    key: 'D',
    units,
    songMap: [1, 2, 2, 3],
    lastUnitId: 3,
    isDeleted: false,
    isDefault: true,
  });
  const song = new Song({
    title: 'Title',
    artist: 'Artist',
    arrangements: [arrangement],
  });
  song.currentArrangementId = 0;

  const postSong: PostSongAction = jest.fn();
  const setWriteMode: Dispatch<SetStateAction<boolean>> = jest.fn();

  const originalError = console.error.bind(console.error);
  beforeEach(() => {
    console.error = (msg) => {
      if (!msg.toString().includes('Warning: Invalid value for prop')) originalError(msg);
    };

    const testName = expect.getState().currentTestName || '';
    if (testName.indexOf('creating a new arrangement') >= 0) {
      song.currentArrangement.isNew = true;
    } else {
      song.currentArrangement.isNew = false;
    }
    render(<ArrangementFormPage song={song} postSong={postSong} setWriteMode={setWriteMode} />);
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

  it('adds existing unit to map when button is clicked', () => {
    const addExistingUnitLabel = screen.getByText(messages.songForm.addExistingUnit);
    expect(addExistingUnitLabel).toBeInTheDocument();

    let expectedLength = arrangement.songMap.length;
    for (const unit of units) {
      const label = format(messages.songForm.addUnitWithLabel, { label: `${unit.type}${unit.typeIdx}` });
      const unitButtons = screen.getAllByLabelText(label);
      expect(unitButtons.length).toBe(1);
      const unitButton = unitButtons[0];
      expect(unitButton).toBeEnabled();
      fireEvent.click(unitButton!);
      expectedLength += 1;
      expect(arrangement.songMap[arrangement.songMap.length - 1]).toBe(unit.internalId);
      expect(arrangement.songMap.length).toBe(expectedLength);
    }
  });

  it('creates unit and adds it to map when the add new unit button is clicked', () => {
    const addNewUnitButton = screen.getByLabelText(messages.songForm.newUnit);

    const prevUnitsLength = arrangement.units.length;
    const prevSongMapLength = arrangement.songMap.length;

    fireEvent.click(addNewUnitButton);

    expect(arrangement.units.length).toBe(prevUnitsLength + 1);
    expect(arrangement.songMap.length).toBe(prevSongMapLength + 1);
  });
});
