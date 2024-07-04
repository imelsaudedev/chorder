import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import messages from '@/i18n/messages';
import { SongArrangement } from '@/models/song-arrangement';
import { Fragment } from 'react';

type SongUnitContentViewProps = {
  arrangement: SongArrangement;
};

export default function SongUnitContentView({ arrangement }: SongUnitContentViewProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div>{messages.songData.lyrics}</div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="columns-xs">
            {arrangement.songUnitMap
              .map((unit) => unit.lyrics)
              .map((verse, verseIdx) => (
                <Fragment key={verseIdx}>
                  {verse.split('\n').map((line, lineIdx) => (
                    <p key={lineIdx}>{line}</p>
                  ))}
                  <p className="h-2"></p>
                </Fragment>
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
