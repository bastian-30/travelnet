"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { viewToHref, type View } from "../navigation";

type NavigateFn = (view: View) => void;

const NavigationContext = createContext<NavigateFn>(() => {});

export function ViewNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigate = useCallback<NavigateFn>(
    (view) => {
      router.push(viewToHref(view));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}

export function useViewNavigation(): NavigateFn {
  return useContext(NavigationContext);
}
