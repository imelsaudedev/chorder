import Tag from "@/components/common/Tag";
import { ClientTag } from "@/prisma/models";

type SongTagsProps = {
  tags: ClientTag[];
};

export default function SongTags({ tags }: SongTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Tag key={tag.id} label={tag.name} color={tag.group.color} size="xs" />
      ))}
    </div>
  );
}
