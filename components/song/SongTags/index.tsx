import { ClientTag } from "@/prisma/models";

type SongTagsProps = {
  tags: ClientTag[];
};

export default function SongTags({ tags }: SongTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: `${tag.group.color}26`,
            color: tag.group.color,
            border: `1px solid ${tag.group.color}4d`,
          }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
