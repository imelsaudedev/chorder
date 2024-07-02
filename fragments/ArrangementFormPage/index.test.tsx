import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostSongAction } from '@/app/songs/[song]/actions';
import { Dispatch, SetStateAction } from 'react';
import ArrangementFormPage from '@/fragments/ArrangementFormPage';
import { SongUnit } from '@/models/song-unit';
import { SongHook } from '@/hooks/useSong';
import messages, { format } from '@/i18n/messages';
import { Song, SongArrangement } from '@/models/song';

describe('SongForm', () => {
  const units = [
    new SongUnit({ content: 'Unit 1', type: 'VERSE', internalId: 1, typeIdx: 1 }),
    new SongUnit({ content: 'Unit 2', type: 'SOLO', internalId: 2, typeIdx: 1 }),
    new SongUnit({ content: 'Unit 2', type: 'VERSE', internalId: 3, typeIdx: 2 }),
  ];
  const songMap = [1, 2, 2, 3];
  const songUnitMap = [units[0], units[1], units[1], units[2]];

  const song = new Song({
    title: 'Title',
    artist: 'Artist',
    arrangements: [
      new SongArrangement({
        key: 'D',
        units,
        songMap,
        lastUnitId: 3,
        isDeleted: false,
        isDefault: true,
      }),
    ],
  });

  const songData: SongHook = {
    song,
    arrangementIndex: 0,
    isNewArrangement: false,
    title: song.title,
    setTitle: jest.fn(),
    artist: song.artist,
    setArtist: jest.fn(),
    songKey: song.arrangements[0].key,
    setSongKey: jest.fn(),
    units,
    songMap,
    songUnitMap,
    createUnit: jest.fn(),
    addUnit: jest.fn(),
    moveUnitUp: jest.fn(),
    moveUnitDown: jest.fn(),
    buildRemoveUnitHandler: jest.fn(),
    buildUpdateUnitHandler: jest.fn(),
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
      songData.isNewArrangement = true;
    } else {
      songData.isNewArrangement = false;
    }
    render(<ArrangementFormPage songData={songData} postSong={postSong} setWriteMode={setWriteMode} />);
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
    expect(saveButton).toBeEnabled();
  });

  it('renders the add existing unit section when units are present', () => {
    const addExistingUnitLabel = screen.getByText(messages.songForm.addExistingUnit);
    expect(addExistingUnitLabel).toBeInTheDocument();

    for (const unit of units) {
      const label = format(messages.songForm.addUnitWithLabel, { label: `${unit.type}${unit.typeIdx}` });
      const unitButtons = screen.getAllByLabelText(label);
      expect(unitButtons.length).toBe(1);
      const unitButton = unitButtons[0];
      expect(unitButton).toBeEnabled();
      fireEvent.click(unitButton!);
      expect(songData.addUnit).toHaveBeenCalledWith(unit);
    }
  });

  it('calls onCreateUnit when the add new unit button is clicked', () => {
    const addNewUnitButton = screen.getByLabelText(messages.songForm.newUnit);
    fireEvent.click(addNewUnitButton);

    expect(songData.createUnit).toHaveBeenCalled();
  });
});
