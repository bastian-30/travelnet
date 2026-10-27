"use client";

import { useParams } from "next/navigation";
import DepartmentView from "../../../src/components/DepartmentView";
import { useViewNavigation } from "../../../src/context/NavigationContext";

export default function DepartmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewNavigation();

  return (
    <div className="pt-16">
      <DepartmentView departmentId={id} onNavigate={navigate} />
    </div>
  );
}
