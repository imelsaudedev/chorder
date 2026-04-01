import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { MarkdownViewer } from "../MarkdownViewer";

interface MarkdownUnitFormProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export const MarkdownUnitForm: React.FC<MarkdownUnitFormProps> = ({
  initialContent = "",
  onChange,
}) => {
  const t = useTranslations();
  const [content, setContent] = useState(initialContent);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row gap-4 h-96">
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("UnitData.markdownContent")}
          </label>
          <textarea
            value={content}
            onChange={handleContentChange}
            className="flex-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700"
            placeholder={t("UnitData.markdownPlaceholder")}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("Messages.preview")}
          </label>
          <div className="flex-1 p-4 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-md overflow-y-auto">
            <MarkdownViewer content={content || `*${t("Messages.preview")}...*`} />
          </div>
        </div>
      </div>
    </div>
  );
};
