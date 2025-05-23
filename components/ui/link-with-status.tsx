'use client';

import {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx/lite';

const FLICKER_THRESHOLD = 400;
const MAX_LOADING_DURATION = 15_000;

export type LinkWithStatusProps = Omit<
  ComponentProps<typeof Link>, 'children'
> & {
  loadingClassName?: string
  children: ReactNode | ((props: {
    isLoading: boolean
  }) => ReactNode)
  debugLoading?: boolean
}

export  function LinkWithStatus({
  loadingClassName,
  href, 
  className,
  onClick,
  children,
  debugLoading = false,
  ...props
}: LinkWithStatusProps) {
  const path = usePathname();

  const [pathWhenClicked, setPathWhenClicked] = useState<string>();
  const [_isLoading, setIsLoading] = useState(false);
  const isLoading = _isLoading || debugLoading;
  
  const isLoadingStartTime = useRef<number | undefined>(undefined);

  const startLoadingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const stopLoadingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxLoadingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const isControlled = typeof children === 'function';

  const clearTimeouts = useCallback(() => {
    [startLoadingTimeout, stopLoadingTimeout, maxLoadingTimeout]
      .forEach(timeout => {
        if (timeout.current) { clearTimeout(timeout.current); }
      });
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setPathWhenClicked(undefined);
  }, []);

  const isVisitingLinkHref = path === href;

  const shouldCancelLoading =
    (pathWhenClicked && pathWhenClicked !== path) ||
    isVisitingLinkHref;

  useEffect(() => {
    if (shouldCancelLoading) {
      clearTimeouts();
      const loadingDuration = isLoadingStartTime.current
        ? Date.now() - isLoadingStartTime.current
        : 0;

      if (loadingDuration < FLICKER_THRESHOLD) {
        stopLoadingTimeout.current = setTimeout(
          stopLoading,
          FLICKER_THRESHOLD - loadingDuration,
        );
      } else {
        stopLoading();
      }
    }
  }, [shouldCancelLoading, clearTimeouts, stopLoading]);

  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  return <Link
    {...props}
    href={href}
    className={clsx(
      'transition-[colors,opacity]',
      (loadingClassName || isControlled)
        ? 'opacity-100'
        : isLoading ? 'opacity-50' : 'opacity-100',
      className,
      isLoading && loadingClassName,
    )}
    onClick={e => {
      const isOpeningNewTab = e.metaKey || e.ctrlKey;
      if (!isVisitingLinkHref && !isOpeningNewTab) {
        setPathWhenClicked(path);
        startLoadingTimeout.current = setTimeout(
          () => {
            isLoadingStartTime.current = Date.now();
            setIsLoading(true);
          },
          FLICKER_THRESHOLD,
        );
        maxLoadingTimeout.current = setTimeout(
          stopLoading,
          MAX_LOADING_DURATION,
        );
      }
      onClick?.(e);
    }}
  >
    {typeof children === 'function'
      ? children({ isLoading })
      : children}
  </Link>;
}