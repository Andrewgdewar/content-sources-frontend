import { isEqual } from 'lodash';
import { useEffect, useRef } from 'react';

function useDeepCompareMemoize(value) {
  const ref = useRef();
  // it can be done by using useMemo as well
  // but useRef is rather cleaner and easier

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

export default function useDeepCompareEffect(callback, dependencies) {
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}
