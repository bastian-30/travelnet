import { useState } from "react";
import { useCatalog } from "../hooks/useCatalog";

interface NicaMapProps {
  onDepartmentClick: (deptId: string) => void;
  activeDepartmentId?: string;
}

const deptPositions: Record<string, { x: number; y: number }> = {
  chinandega: { x: 80, y: 112 },
  leon: { x: 95, y: 148 },
  managua: { x: 145, y: 165 },
  masaya: { x: 168, y: 185 },
  carazo: { x: 152, y: 208 },
  rivas: { x: 138, y: 242 },
  granada: { x: 205, y: 196 },
  chontales: { x: 262, y: 190 },
  boaco: { x: 232, y: 152 },
  matagalpa: { x: 242, y: 108 },
  jinotega: { x: 258, y: 70 },
  esteli: { x: 168, y: 68 },
  madriz: { x: 155, y: 45 },
  "nueva-segovia": { x: 210, y: 32 },
  raan: { x: 318, y: 108 },
  raas: { x: 325, y: 192 },
  "rio-san-juan": { x: 280, y: 265 },
};

const allDepts = [
  { id: "chinandega", name: "Chinandega" },
  { id: "leon", name: "León" },
  { id: "managua", name: "Managua" },
  { id: "masaya", name: "Masaya" },
  { id: "carazo", name: "Carazo" },
  { id: "rivas", name: "Rivas" },
  { id: "granada", name: "Granada" },
  { id: "chontales", name: "Chontales" },
  { id: "boaco", name: "Boaco" },
  { id: "matagalpa", name: "Matagalpa" },
  { id: "jinotega", name: "Jinotega" },
  { id: "esteli", name: "Estelí" },
  { id: "madriz", name: "Madriz" },
  { id: "nueva-segovia", name: "Nueva Segovia" },
  { id: "raan", name: "RAAN" },
  { id: "raas", name: "RAAS" },
  { id: "rio-san-juan", name: "Río San Juan" },
];

export default function NicaMap({ onDepartmentClick, activeDepartmentId }: NicaMapProps) {
  const departments = useCatalog();
  const [hovered, setHovered] = useState<string | null>(null);

  const hasData = (id: string) => departments.some((d) => d.id === id);

  const tooltip = hovered ? allDepts.find((d) => d.id === hovered) : null;

  return (
    <div className="relative w-full flex flex-col items-center">
      <svg
        viewBox="0 0 420 310"
        className="w-full max-w-2xl"
        style={{ filter: "drop-shadow(0 0 32px rgba(26,111,196,0.25))" }}
      >
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0A1A42" />
            <stop offset="100%" stopColor="#050D28" />
          </radialGradient>
          <radialGradient id="landGrad" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#0F3060" />
            <stop offset="100%" stopColor="#091E48" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width="420" height="310" fill="url(#oceanGrad)" rx="12" />

        {/* Pacific Ocean label */}
        <text x="32" y="185" fill="#1A6FC4" fontSize="9" opacity="0.5" fontStyle="italic">
          Océano
        </text>
        <text x="30" y="196" fill="#1A6FC4" fontSize="9" opacity="0.5" fontStyle="italic">
          Pacífico
        </text>

        {/* Caribbean label */}
        <text x="360" y="155" fill="#1A6FC4" fontSize="9" opacity="0.5" fontStyle="italic">
          Mar
        </text>
        <text x="355" y="166" fill="#1A6FC4" fontSize="9" opacity="0.5" fontStyle="italic">
          Caribe
        </text>

        {/* Honduras label */}
        <text x="170" y="18" fill="#8BA3C7" fontSize="9" opacity="0.4" fontStyle="italic">
          Honduras
        </text>

        {/* Costa Rica label */}
        <text x="160" y="296" fill="#8BA3C7" fontSize="9" opacity="0.4" fontStyle="italic">
          Costa Rica
        </text>

        {/* Nicaragua mainland shape */}
        <path
          d="M 92,95 C 80,78 86,57 106,46 L 148,33 L 193,23 L 237,19 L 274,26 L 304,44 L 336,60 C 368,74 388,103 390,138 L 389,173 C 387,206 373,236 350,256 L 316,276 C 288,293 253,299 217,296 L 168,286 C 140,277 116,260 100,242 L 86,214 C 71,189 67,162 70,138 L 76,114 Z"
          fill="url(#landGrad)"
          stroke="#1A6FC4"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Honduras coast hatching line */}
        <line
          x1="95"
          y1="46"
          x2="337"
          y2="58"
          stroke="#8BA3C7"
          strokeWidth="0.5"
          strokeDasharray="3,4"
          opacity="0.2"
        />

        {/* Costa Rica border */}
        <line
          x1="86"
          y1="218"
          x2="318"
          y2="280"
          stroke="#8BA3C7"
          strokeWidth="0.5"
          strokeDasharray="3,4"
          opacity="0.2"
        />

        {/* Lake Managua (Xolotlán) */}
        <ellipse
          cx="152"
          cy="148"
          rx="22"
          ry="13"
          fill="#0D2A5E"
          stroke="#1A6FC4"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        <text x="141" y="152" fill="#3B8FE8" fontSize="6" opacity="0.7">
          Lago Xolotlán
        </text>

        {/* Lake Nicaragua (Cocibolca) */}
        <ellipse
          cx="240"
          cy="222"
          rx="44"
          ry="30"
          fill="#0D2A5E"
          stroke="#1A6FC4"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        <text x="218" y="225" fill="#3B8FE8" fontSize="7" opacity="0.7">
          Lago Cocibolca
        </text>

        {/* Department dots */}
        {allDepts.map((dept) => {
          const pos = deptPositions[dept.id];
          if (!pos) return null;
          const isActive = activeDepartmentId === dept.id;
          const isHovered = hovered === dept.id;
          const clickable = hasData(dept.id);
          const color = isActive
            ? "#F4C430"
            : isHovered && clickable
              ? "#27AE60"
              : clickable
                ? "#3B8FE8"
                : "#4A6080";
          const r = isActive ? 6 : isHovered && clickable ? 5.5 : clickable ? 4.5 : 3;

          return (
            <g
              key={dept.id}
              style={{ cursor: clickable ? "pointer" : "default" }}
              onClick={() => clickable && onDepartmentClick(dept.id)}
              onMouseEnter={() => setHovered(dept.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Glow ring */}
              {(isActive || (isHovered && clickable)) && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 5}
                  fill="none"
                  stroke={isActive ? "#F4C430" : "#27AE60"}
                  strokeWidth="1"
                  opacity="0.4"
                />
              )}
              <circle cx={pos.x} cy={pos.y} r={r} fill={color} />
              {/* Label */}
              <text
                x={pos.x + (pos.x > 300 ? -4 : 7)}
                y={pos.y + 3}
                fill={isActive ? "#F4C430" : isHovered && clickable ? "#27AE60" : "#8BA3C7"}
                fontSize={isActive || (isHovered && clickable) ? "8" : "7"}
                fontWeight={isActive ? "bold" : "normal"}
                textAnchor={pos.x > 300 ? "end" : "start"}
              >
                {dept.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && hasData(tooltip.id) && (
        <div
          className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(26,111,196,0.2)",
            color: "#F4C430",
            border: "1px solid rgba(244,196,48,0.3)",
          }}
        >
          Haz clic para explorar {tooltip.name}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <span className="text-xs" style={{ color: "#8BA3C7" }}>
            Departamento disponible
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F4C430" }} />
          <span className="text-xs" style={{ color: "#8BA3C7" }}>
            Seleccionado
          </span>
        </div>
      </div>
    </div>
  );
}
