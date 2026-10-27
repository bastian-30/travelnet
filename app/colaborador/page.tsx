"use client";

import CollaboratorDashboard from "../../src/components/CollaboratorDashboard";
import { useViewNavigation } from "../../src/context/NavigationContext";

export default function CollaboratorPage() {
  const navigate = useViewNavigation();
  return <CollaboratorDashboard onNavigate={navigate} />;
}
