import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Returns a callback with stable identity that always calls the latest logic.
 *
 * Useful when listeners must be added/removed with the same function reference.
 */
export default function useStableCallback<TArgs extends unknown[], TResult>(callback: (...args: TArgs) => TResult) {
    const callbackRef = useRef(callback);

    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    return useCallback((...args: TArgs) => callbackRef.current(...args), []);
}
