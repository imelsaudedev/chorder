import { useEffect } from 'react';

export default function useForwardSlashToSearch() {
  useEffect(() => {
    function handleKeyUp(event: KeyboardEvent) {
      if (event.key !== '/' || event.ctrlKey || event.metaKey) return;
      if (/^(?:input|textarea|select|button)$/i.test((event.target as Element)?.tagName)) return;

      event.preventDefault();
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}
