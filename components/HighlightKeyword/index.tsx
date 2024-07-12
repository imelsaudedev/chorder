import { Fragment } from 'react';

type HighlightKeywordProps = {
  text: string;
  keyword: string;
};

export default function HighlightKeyword({ text, keyword }: HighlightKeywordProps) {
  if (!keyword) return text;

  const keywordIndices = [];
  const lowerKeyword = keyword.toLocaleLowerCase();
  const lowerText = text.toLocaleLowerCase();

  let index = findKeyword(lowerText, lowerKeyword, { caseSensitive: true });
  while (index >= 0) {
    keywordIndices.push(index);
    index = findKeyword(lowerText, lowerKeyword, { caseSensitive: true, startAt: index + 1 });
  }

  const parts = [];
  let lastIndex = 0;
  let fragmentIndex = 0;
  keywordIndices.forEach((keywordIndex) => {
    parts.push(<Fragment key={fragmentIndex++}>{text.slice(lastIndex, keywordIndex)}</Fragment>);
    parts.push(
      <span key={fragmentIndex++} className="text-secondary">
        {text.slice(keywordIndex, keywordIndex + keyword.length)}
      </span>
    );
    lastIndex = keywordIndex + keyword.length;
  });
  parts.push(<Fragment key={fragmentIndex++}>{text.slice(lastIndex)}</Fragment>);
  return <>{parts}</>;
}

type FindKeywordOptions = {
  caseSensitive?: boolean;
  startAt?: number;
};
export function findKeyword(text: string, keyword: string, options?: FindKeywordOptions) {
  const caseSensitive = options?.caseSensitive || false;
  const startAt = options?.startAt || 0;
  const lowerKeyword = caseSensitive ? keyword : keyword.toLocaleLowerCase();
  const lowerText = caseSensitive ? text : text.toLocaleLowerCase();

  return lowerText.indexOf(lowerKeyword, startAt);
}
