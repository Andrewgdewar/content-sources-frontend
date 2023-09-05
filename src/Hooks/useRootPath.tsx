import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

function useRootPath(): string {
  const { pathname } = useLocation();
  const rootPath = useMemo(
    () => pathname.split('content')[0] + 'content',
    [pathname.split('content')[0]],
  );

  return rootPath;
}

export default useRootPath;
