export type View =
  | { type: "home" }
  | {
      type: "department";
      departmentId: string;
    }
  | { type: "site"; departmentId: string; siteId: string }
  | { type: "live" }
  | {
      type: "reviews";
    }
  | { type: "auth" }
  | { type: "collaborator" }
  | { type: "admin" };

export function viewToHref(view: View): string {
  switch (view.type) {
    case "home":
      return "/";
    case "department":
      return `/departamentos/${view.departmentId}`;
    case "site":
      return `/sitios/${view.departmentId}/${view.siteId}`;
    case "live":
      return "/en-vivo";
    case "reviews":
      return "/resenas";
    case "auth":
      return "/acceso";
    case "collaborator":
      return "/colaborador";
    case "admin":
      return "/admin";
  }
}

export function pathnameToViewType(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/departamentos")) return "department";
  if (pathname.startsWith("/sitios")) return "site";
  if (pathname.startsWith("/en-vivo")) return "live";
  if (pathname.startsWith("/resenas")) return "reviews";
  if (pathname.startsWith("/acceso")) return "auth";
  if (pathname.startsWith("/colaborador")) return "collaborator";
  if (pathname.startsWith("/admin")) return "admin";
  return "";
}
