import { useEffect, useState } from 'react';

export default function useUpdatableState<T>(value: T): [T, (newValue: T) => void] {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return [internalValue, setInternalValue];
}
