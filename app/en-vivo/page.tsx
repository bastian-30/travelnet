"use client";

import LiveView from "../../src/components/LiveView";
import { useViewNavigation } from "../../src/context/NavigationContext";

export default function LivePage() {
  const navigate = useViewNavigation();
  return <LiveView onNavigate={navigate} />;
}
