"use client";

import AuthPage from "../../src/components/AuthPage";
import { useViewNavigation } from "../../src/context/NavigationContext";

export default function AccessPage() {
  const navigate = useViewNavigation();
  return <AuthPage onNavigate={navigate} />;
}
