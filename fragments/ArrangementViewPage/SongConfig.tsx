import EditIcon from "@/components/icons/EditIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import ColumnButtons from "./ColumnButtons";

type SongConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  deleteArrangementWithId: () => void;
  onEditButtonClick: () => void;
  visible: boolean;
};

export default function SongConfig({
  columns,
  setColumns,
  deleteArrangementWithId,
  onEditButtonClick,
  visible,
}: SongConfigProps) {
  return (
    <div
      className={`flex mb-4 bg-gray-200 p-2 rounded justify-between ${
        visible ? "" : "hidden"
      }`}
    >
      <div className="flex">
        <ColumnButtons columns={columns} setColumns={setColumns} />
      </div>
      <div className="flex">
        <form
          action={deleteArrangementWithId}
          className="grid place-content-center"
        >
          <Button type="submit" variant="ghost">
            <TrashIcon />
          </Button>
        </form>
        <Button onClick={onEditButtonClick} variant="ghost">
          <EditIcon />
        </Button>
      </div>
    </div>
  );
}
