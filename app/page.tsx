"use client";

import HomePage from "../src/components/HomePage";
import { useViewNavigation } from "../src/context/NavigationContext";

export default function Page() {
  const navigate = useViewNavigation();
  return <HomePage onNavigate={navigate} />;
}
