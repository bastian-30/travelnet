"use client";

import { useParams } from "next/navigation";
import SiteView from "../../../../src/components/SiteView";
import { useViewNavigation } from "../../../../src/context/NavigationContext";

export default function SitePage() {
  const { departmentId, siteId } = useParams<{
    departmentId: string;
    siteId: string;
  }>();
  const navigate = useViewNavigation();

  return (
    <div className="pt-16">
      <SiteView departmentId={departmentId} siteId={siteId} onNavigate={navigate} />
    </div>
  );
}
