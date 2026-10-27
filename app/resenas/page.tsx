"use client";

import ReviewsView from "../../src/components/ReviewsView";
import { useViewNavigation } from "../../src/context/NavigationContext";

export default function ReviewsPage() {
  const navigate = useViewNavigation();
  return <ReviewsView onNavigate={navigate} />;
}
