import { useState, useMemo, useRef, useEffect, useCallback, Suspense } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  resumenPatio, islasDetalladas, islasZonaNorte, islasZonaSur,
  capacidadTotalPlano, NAVIERAS, initIslasIfNeeded,
  type IslaDetallada, type CeldaGrid,
} from '../data/mockData';
import { Search, RotateCcw, ZoomIn, ZoomOut, Snowflake, MapPin, Layers, ChevronUp, X, Box, Truck, Maximize2, Boxes, Container } from 'lucide-react';

const navieraColor: Record<string, string> = {};
NAVIERAS.forEach(n => { navieraColor[n.nombre] = n.color; });

// Colores 3D tenues y apagados para render sobre fondo oscuro
const navieraColor3D: Record<string, string> = {
  'CMA CGM': '#c47030',
  'Cosco Shipping': '#3a6fa8',
  'HMM': '#3a98a8',
  'ONE': '#a84070',
  'PIL': '#8a7050',
  'Evergreen': '#3a8a50',
  'Wan Hai': '#a8a040',
  'Yang Ming': '#3a9a88',
  'Hapag-Lloyd': '#b85a30',
};

// ==========================================
// VISTA COMPACTA: bloque coloreado con info
// ==========================================
function IslaCompacta({
  isla,
  selected,
  onSelect,
  zoom,
}: {
  isla: IslaDetallada;
  selected: boolean;
  onSelect: () => void;
  zoom: number;
}) {
  const { config, ocupacion, ocupacionPct } = isla;

  // Tamano proporcional - basado en grid real
  const scale = 6.5; // px por columna (base para aspect ratio)
  const baseH = config.gridFilas * scale;

  // Color dominante
  const topNavieras = isla.resumenNavieras.slice(0, 3);
  const gradientBg = topNavieras.length >= 2
    ? `linear-gradient(135deg, ${navieraColor[topNavieras[0].naviera]}cc 0%, ${navieraColor[topNavieras[1].naviera]}99 100%)`
    : `${navieraColor[topNavieras[0]?.naviera] || '#555'}bb`;

  const pctColor = ocupacionPct > 90 ? '#ef4444' : ocupacionPct > 75 ? '#f59e0b' : '#22c55e';

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-all relative group ${
        selected
          ? 'border-white shadow-xl ring-2 ring-blue-400 scale-[1.03]'
          : 'border-white/15 hover:border-white/40 hover:shadow-lg'
      }`}
      style={{
        flex: `${config.gridColumnas} 1 0%`,
        height: baseH * zoom,
        minWidth: 55 * zoom,
        minHeight: 40 * zoom,
      }}
      onClick={onSelect}
    >
      {/* Fondo con gradiente naviera */}
      <div className="absolute inset-0" style={{ background: gradientBg }}>
        {/* Grid sutil de filas */}
        <div className="absolute inset-0 flex flex-col gap-[1px] p-1 opacity-30">
          {Array.from({ length: Math.min(config.gridFilas, 12) }).map((_, i) => (
            <div key={i} className="flex-1 flex gap-[1px]">
              {Array.from({ length: Math.min(config.gridColumnas, 15) }).map((_, j) => (
                <div key={j} className="flex-1 rounded-[0.5px] bg-white/20" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-1.5 z-10">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-bold text-white drop-shadow leading-none block">
              {config.id.replace('ISLA-', '').replace('SUR-', 'S-')}
            </span>
            <span className="text-[9px] text-white/60 drop-shadow leading-none mt-0.5 block">
              {config.gridFilas}x{config.gridColumnas}
            </span>
          </div>
          <div className="flex gap-0.5">
            {topNavieras.map(n => (
              <div key={n.naviera} className="w-2.5 h-2.5 rounded-full border border-white/40"
                style={{ backgroundColor: navieraColor[n.naviera] }} title={n.naviera} />
            ))}
          </div>
        </div>

        <div className="text-center">
          <span className="text-lg font-black text-white drop-shadow-lg leading-none">
            {ocupacion.toLocaleString()}
          </span>
          <span className="text-[9px] text-white/50 block -mt-0.5">
            / {config.capacidad.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex-1 bg-black/25 rounded-full h-1.5">
            <div className="h-full rounded-full transition-all" style={{ width: `${ocupacionPct}%`, backgroundColor: pctColor }} />
          </div>
          <span className="text-xs font-bold text-white/80">{ocupacionPct}%</span>
        </div>
      </div>

      {/* Reefer badge */}
      {config.esReefer && (
        <div className="absolute top-1 right-1 z-20">
          <Snowflake size={10} className="text-cyan-300 drop-shadow" />
        </div>
      )}

      {/* Estiba badge */}
      <div className="absolute bottom-1 right-1 bg-black/30 rounded px-0.5 text-[6px] text-white/40 z-10">
        E{config.estiba}
      </div>

      {/* Expand icon on hover */}
      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <Maximize2 size={10} className="text-white/60" />
      </div>
    </div>
  );
}

// ==========================================
// VISTA AMPLIADA: grid celda a celda
// ==========================================
function CeldaVisual({ celda, size }: { celda: CeldaGrid; size: number }) {
  if (celda.nivelOcupado === 0) {
    return <div style={{ width: size, height: size }} className="bg-white/[0.03] rounded-[0.5px]" />;
  }

  const topCont = celda.contenedores[celda.nivelOcupado - 1];
  if (!topCont) return <div style={{ width: size, height: size }} className="bg-white/[0.03]" />;

  const color = navieraColor[topCont.naviera] || '#666';
  const opacity = 0.35 + (celda.nivelOcupado / 7) * 0.65;

  const isEvacuar = topCont.estado === 'listo_evacuar';
  const isInspeccion = topCont.estado === 'en_inspeccion';
  const isReefer = topCont.estado === 'reefer';

  return (
    <div
      className="rounded-[0.5px]"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity,
        boxShadow: isEvacuar ? 'inset 0 0 0 1px #facc15' : isInspeccion ? 'inset 0 0 0 1px #ef4444' : isReefer ? 'inset 0 0 0 1px #22d3ee' : 'none',
      }}
      title={`${topCont.id} | ${topCont.naviera} | ${topCont.tipoContenedor} | N${celda.nivelOcupado} | ${topCont.diasEnPatio}d`}
    />
  );
}

function IslaAmpliada({
  isla,
  onClose,
}: {
  isla: IslaDetallada;
  onClose: () => void;
}) {
  const { config, ocupacionPct, grid, groundSlots, groundSlotsOcupados, resumenNavieras } = isla;

  // Calcular estadisticas
  let totalCont = 0, listoEvacuar = 0, enInspeccion = 0, reefer = 0, nivelMaxReal = 0;
  let cont20ft = 0, cont40ft = 0, dwellTotal = 0;
  const tipoCount: Record<string, number> = {};
  for (const fila of grid) {
    for (const celda of fila) {
      if (celda.nivelOcupado > nivelMaxReal) nivelMaxReal = celda.nivelOcupado;
      for (const cont of celda.contenedores) {
        if (!cont) continue;
        totalCont++;
        dwellTotal += cont.diasEnPatio;
        if (cont.estado === 'listo_evacuar') listoEvacuar++;
        if (cont.estado === 'en_inspeccion') enInspeccion++;
        if (cont.estado === 'reefer') reefer++;
        if (cont.tamano === '20ft') cont20ft++;
        else cont40ft++;
        tipoCount[cont.tipoContenedor] = (tipoCount[cont.tipoContenedor] || 0) + 1;
      }
    }
  }
  const dwellAvg = totalCont > 0 ? Math.round(dwellTotal / totalCont * 10) / 10 : 0;
  const pctColor = ocupacionPct > 90 ? '#ef4444' : ocupacionPct > 75 ? '#f59e0b' : '#22c55e';

  // Tamano de celda adaptado al grid
  const maxCellW = Math.floor(600 / config.gridColumnas);
  const maxCellH = Math.floor(350 / config.gridFilas);
  const cellSz = Math.max(3, Math.min(maxCellW, maxCellH, 12));

  return (
    <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-black/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-white">{config.nombre}</h3>
          <span className="text-[10px] text-white/40">{config.gridFilas} filas x {config.gridColumnas} columnas x E{config.estiba}</span>
          {config.esReefer && <Snowflake size={12} className="text-cyan-400" />}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 cursor-pointer transition-colors">
          <X size={16} className="text-white/60" />
        </button>
      </div>

      <div className="flex">
        {/* Grid de contenedores */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Leyenda de columnas */}
          <div className="flex gap-0 mb-1 ml-6">
            {Array.from({ length: config.gridColumnas }).map((_, c) => (
              <div key={c} style={{ width: cellSz }} className="text-center">
                {c % 5 === 0 && <span className="text-[6px] text-white/20">{c + 1}</span>}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-0">
            {grid.map((fila, fi) => (
              <div key={fi} className="flex items-center gap-0">
                {/* Num fila */}
                <div className="w-6 shrink-0 text-right pr-1">
                  {fi % 3 === 0 && <span className="text-[6px] text-white/20">{fi + 1}</span>}
                </div>
                {/* Celdas */}
                <div className="flex gap-0">
                  {fila.map((celda, ci) => (
                    <CeldaVisual key={ci} celda={celda} size={cellSz} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel stats derecha */}
        <div className="w-56 shrink-0 border-l border-white/5 p-3 space-y-2 bg-black/10">
          {/* Metricas */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] text-white/40">Contenedores</p>
              <p className="text-sm font-bold text-white">{totalCont.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] text-white/40">Capacidad</p>
              <p className="text-sm font-bold text-white">{config.capacidad.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] text-white/40">Ground slots</p>
              <p className="text-sm font-bold text-white">{groundSlots}</p>
            </div>
            <div className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] text-white/40">Slots ocup.</p>
              <p className="text-sm font-bold text-white">{groundSlotsOcupados}</p>
            </div>
            <div className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] text-white/40">Estiba max</p>
              <p className="text-sm font-bold text-white">{nivelMaxReal}</p>
            </div>
            <div className="bg-white/5 rounded p-1.5 text-center">
              <p className="text-[8px] text-white/40">Dwell avg</p>
              <p className="text-sm font-bold text-white">{dwellAvg}d</p>
            </div>
          </div>

          {/* Ocupacion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-white/40">Ocupacion</span>
              <span className="text-[10px] font-bold" style={{ color: pctColor }}>{ocupacionPct}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="h-full rounded-full" style={{ width: `${ocupacionPct}%`, backgroundColor: pctColor }} />
            </div>
          </div>

          {/* Estados */}
          <div className="flex gap-1.5">
            <div className="flex-1 bg-yellow-500/10 rounded p-1.5 text-center">
              <p className="text-[8px] text-yellow-400/60">Evacuar</p>
              <p className="text-xs font-bold text-yellow-400">{listoEvacuar}</p>
            </div>
            <div className="flex-1 bg-red-500/10 rounded p-1.5 text-center">
              <p className="text-[8px] text-red-400/60">Inspeccion</p>
              <p className="text-xs font-bold text-red-400">{enInspeccion}</p>
            </div>
          </div>

          {/* Tipos de contenedor */}
          <div>
            <p className="text-[9px] text-white/40 mb-1">Tipos:</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(tipoCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tipo, cnt]) => (
                <div key={tipo} className="bg-white/5 rounded px-1.5 py-0.5 flex justify-between items-center">
                  <span className="text-[8px] text-white/40">{tipo}</span>
                  <span className="text-[9px] font-bold text-white">{cnt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navieras */}
          <div>
            <p className="text-[9px] text-white/40 mb-1">Navieras:</p>
            <div className="space-y-0.5">
              {resumenNavieras.map(n => (
                <div key={n.naviera} className="flex items-center gap-1.5 text-[9px]">
                  <div className="w-2 h-2 rounded" style={{ backgroundColor: navieraColor[n.naviera] }} />
                  <span className="text-white/60 flex-1">{n.naviera}</span>
                  <span className="text-white/80 font-bold">{n.cantidad.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda grid */}
      <div className="px-4 py-1.5 bg-black/20 flex items-center gap-4">
        <div className="flex items-center gap-4">
          {NAVIERAS.map(n => (
            <div key={n.nombre} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: n.color }} />
              <span className="text-[8px] text-white/40">{n.abrev}</span>
            </div>
          ))}
        </div>
        <div className="ml-auto flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm border border-yellow-400 bg-yellow-400/20" />
            <span className="text-[8px] text-white/30">Evacuar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm border border-red-400 bg-red-400/20" />
            <span className="text-[8px] text-white/30">Inspeccion</span>
          </div>
          <span className="text-[8px] text-white/20">Intensidad = nivel estiba</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Acceso visual
// ==========================================
function AccesoVisual({ nombre, via }: { nombre: string; via: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/25 rounded px-2 py-1">
      <Truck size={10} className="text-blue-400" />
      <div>
        <span className="text-[9px] font-bold text-blue-300 block leading-none">{nombre}</span>
        <span className="text-[6px] text-blue-400/60 block leading-none mt-0.5">{via}</span>
      </div>
    </div>
  );
}

// ==========================================
// VISTA 3D - Patio completo con contenedores realistas
// ==========================================
// Proporciones realistas: contenedor 40ft = ~12m largo x 2.4m ancho x 2.6m alto
// Escala 3D: 1 unidad = ~2.5m
const CW = 0.95;   // ancho contenedor (eje X) - transversal
const CD = 0.38;   // profundidad contenedor (eje Z) - fila
const CH = 0.38;   // alto por nivel (eje Y)
const G3 = 0.06;   // gap entre contenedores
const ISLA_GAP = 3; // separacion entre islas en 3D

function getIslaPosition(id: string): { x: number; z: number } {
  const colUnit = CW + G3;
  const rowUnit = CD + G3;
  switch (id) {
    case 'ISLA-01': return { x: 0, z: 0 };
    case 'ISLA-02': return { x: (20 * colUnit) + ISLA_GAP, z: 0 };
    case 'ISLA-03': return { x: (40 * colUnit) + ISLA_GAP * 2, z: 0 };
    case 'ISLA-04': return { x: (60 * colUnit) + ISLA_GAP * 3, z: 0 };
    case 'ISLA-05': return { x: (20 * colUnit) + ISLA_GAP, z: (20 * rowUnit) + ISLA_GAP * 2 };
    case 'ISLA-06': return { x: (40 * colUnit) + ISLA_GAP * 2, z: (20 * rowUnit) + ISLA_GAP * 2 };
    case 'ISLA-07': return { x: (61 * colUnit) + ISLA_GAP * 3, z: (20 * rowUnit) + ISLA_GAP * 2 };
    case 'SUR-A': return { x: 0, z: (40 * rowUnit) + ISLA_GAP * 5 };
    case 'SUR-B': return { x: (14 * colUnit) + ISLA_GAP, z: (40 * rowUnit) + ISLA_GAP * 5 };
    case 'SUR-C': return { x: 0, z: (54 * rowUnit) + ISLA_GAP * 7 };
    case 'SUR-D': return { x: (8 * colUnit) + ISLA_GAP, z: (54 * rowUnit) + ISLA_GAP * 7 };
    case 'SUR-E': return { x: (22 * colUnit) + ISLA_GAP * 2, z: (54 * rowUnit) + ISLA_GAP * 7 };
    case 'SUR-F': return { x: 0, z: (63 * rowUnit) + ISLA_GAP * 9 };
    case 'SUR-G': return { x: (10 * colUnit) + ISLA_GAP, z: (63 * rowUnit) + ISLA_GAP * 9 };
    default: return { x: 0, z: 0 };
  }
}

// Logo Woodward - renderizado como HTML overlay en la escena 3D
function WoodwardLogo({ position }: { position: [number, number, number] }) {
  return (
    <Html position={position} transform occlude={false} style={{ pointerEvents: 'none' }}>
      <img src="/woodward-logistica.svg" alt="Logistica Woodward" style={{ width: 220, opacity: 0.92 }} />
    </Html>
  );
}

// Contenedores estilo futurista: cuerpo oscuro con emissive del color naviera
const containerGeo = new THREE.BoxGeometry(CW * 0.96, CH * 0.92, CD * 0.94);

function NavieraInstancedGroup({ items, color, maxCount, entryProgress, naviera, onContainerClick }: {
  items: { x: number; y: number; z: number }[];
  color: string;
  maxCount: number;
  entryProgress: number;
  naviera: string;
  onContainerClick?: (pos: { x: number; y: number; z: number }, naviera: string, index: number) => void;
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  // Material oscuro con emissive del color de naviera - efecto glow
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080c16',
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
  }), [color]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || items.length === 0) return;
    const dummy = new THREE.Object3D();
    const p = Math.min(1, entryProgress);
    const eased = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;
    items.forEach((inst, i) => {
      dummy.position.set(inst.x, inst.y * eased, inst.z);
      dummy.scale.set(1, Math.max(0.01, eased), 1);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);
    });
    body.instanceMatrix.needsUpdate = true;
    body.count = items.length;
  }, [items, entryProgress]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && onContainerClick) {
      const item = items[e.instanceId];
      if (item) onContainerClick(item, naviera, e.instanceId);
    }
  }, [items, naviera, onContainerClick]);

  if (items.length === 0) return null;

  return (
    <instancedMesh ref={bodyRef} args={[containerGeo, bodyMat, maxCount]} onClick={handleClick} />
  );
}

// Contenedores de la isla agrupados por naviera
function IslaInstanced3D({ isla, offsetX, offsetZ, highlightId, entryProgress, onContainerClick }: {
  isla: IslaDetallada;
  offsetX: number;
  offsetZ: number;
  highlightId: string | null;
  entryProgress: number;
  onContainerClick?: (pos: { x: number; y: number; z: number }, naviera: string, index: number) => void;
}) {
  const { grid, config } = isla;

  const { groups, highlightPos } = useMemo(() => {
    const byNaviera: Record<string, { x: number; y: number; z: number }[]> = {};
    let hlPos: { x: number; y: number; z: number } | null = null;
    for (let f = 0; f < grid.length; f++) {
      for (let c = 0; c < grid[f].length; c++) {
        const celda = grid[f][c];
        if (celda.nivelOcupado === 0) continue;
        for (let n = 0; n < celda.nivelOcupado; n++) {
          const cont = celda.contenedores[n];
          if (!cont) continue;
          const px = offsetX + c * (CW + G3);
          const py = n * (CH + 0.01) + CH / 2;
          const pz = offsetZ + f * (CD + G3);
          const navKey = cont.naviera;
          if (!byNaviera[navKey]) byNaviera[navKey] = [];
          byNaviera[navKey].push({ x: px, y: py, z: pz });
          if (highlightId && cont.id === highlightId) {
            hlPos = { x: px, y: py, z: pz };
          }
        }
      }
    }
    return { groups: byNaviera, highlightPos: hlPos };
  }, [grid, offsetX, offsetZ, highlightId]);

  return (
    <group>
      {Object.entries(groups).map(([naviera, items]) => (
        <NavieraInstancedGroup
          key={naviera}
          items={items}
          color={navieraColor3D[naviera] || navieraColor[naviera] || '#888'}
          maxCount={config.capacidad}
          entryProgress={entryProgress}
          naviera={naviera}
          onContainerClick={onContainerClick}
        />
      ))}
      {highlightPos && <SearchBeacon3D position={highlightPos} />}
    </group>
  );
}

// Beacon pulsante para localizar contenedor buscado (usa useFrame de R3F)
function SearchBeacon3D({ position }: { position: { x: number; y: number; z: number } }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pillarRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 3;
    if (ringRef.current) {
      const s = 1.0 + Math.sin(t) * 0.4;
      ringRef.current.scale.set(s, 1, s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(t) * 0.3;
    }
    if (pillarRef.current) {
      (pillarRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group position={[position.x, 0, position.z]}>
      <mesh ref={pillarRef} position={[0, 10, 0]}>
        <cylinderGeometry args={[0.12, 0.5, 20, 8]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
      </mesh>
      <mesh ref={ringRef} position={[0, position.y + CH / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 24]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 20, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
    </group>
  );
}

// Base de la isla (plataforma con hover + click)
function IslaBase3D({ isla, offsetX, offsetZ, selected, onSelect }: {
  isla: IslaDetallada;
  offsetX: number;
  offsetZ: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { config } = isla;
  const w = config.gridColumnas * (CW + G3);
  const d = config.gridFilas * (CD + G3);
  const [hovered, setHovered] = useState(false);

  const baseColor = config.esReefer ? '#0a1525' : '#0a0e18';
  const emissiveColor = selected ? '#0055cc' : hovered ? '#003388' : '#001133';
  const emissiveIntensity = selected ? 0.6 : hovered ? 0.4 : 0.08;

  return (
    <group>
      {/* Plataforma */}
      <mesh
        position={[offsetX + w / 2, -0.06, offsetZ + d / 2]}
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <boxGeometry args={[w + 0.4, 0.1, d + 0.3]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>
      {/* Borde */}
      <mesh position={[offsetX + w / 2, -0.02, offsetZ + d / 2]}>
        <boxGeometry args={[w + 0.5, 0.02, d + 0.4]} />
        <meshStandardMaterial
          color="#060a14"
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.5}
          roughness={0.9}
        />
      </mesh>
      {/* Label */}
      <Text
        position={[offsetX + w / 2, -0.15, offsetZ + d + 0.6]}
        fontSize={0.55}
        color={config.zona === 'norte' ? '#2563eb' : '#d97706'}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {config.id.replace('ISLA-', 'I').replace('SUR-', 'S-')} ({isla.ocupacionPct}%)
      </Text>

      {/* Popup info al seleccionar */}
      {selected && (
        <Html position={[offsetX + w / 2, 4, offsetZ + d / 2]} center distanceFactor={40}>
          <div className="bg-[#0f1a2e]/95 border border-blue-500/30 rounded-lg px-4 py-3 min-w-[180px] shadow-xl backdrop-blur pointer-events-none">
            <p className="text-white font-bold text-sm">{config.nombre || config.id}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${isla.ocupacionPct}%` }} />
              </div>
              <span className="text-blue-300 text-xs font-mono">{isla.ocupacionPct}%</span>
            </div>
            <p className="text-white/50 text-[10px] mt-1">{isla.ocupacion}/{config.capacidad} contenedores</p>
            {config.esReefer && <span className="text-cyan-400 text-[10px]">Reefer</span>}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {isla.resumenNavieras.slice(0, 3).map(n => (
                <span key={n.naviera} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                  {n.naviera.split(' ')[0]}: {n.cantidad}
                </span>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Vialidad futurista (lineas de energia)
function Vialidad3D({ x1, z, x2 }: { x1: number; z: number; x2: number }) {
  const w = x2 - x1;
  return (
    <group>
      {/* Base oscura */}
      <mesh position={[x1 + w / 2, -0.09, z]} receiveShadow>
        <boxGeometry args={[w, 0.02, 2.0]} />
        <meshStandardMaterial color="#0a1020" roughness={0.9} metalness={0.3} />
      </mesh>
      {/* Lineas luminosas cyan */}
      <mesh position={[x1 + w / 2, -0.07, z - 0.8]}>
        <boxGeometry args={[w, 0.01, 0.03]} />
        <meshBasicMaterial color="#00a8ff" opacity={0.6} transparent />
      </mesh>
      <mesh position={[x1 + w / 2, -0.07, z + 0.8]}>
        <boxGeometry args={[w, 0.01, 0.03]} />
        <meshBasicMaterial color="#00a8ff" opacity={0.6} transparent />
      </mesh>
      {/* Segmentos punteados centrales */}
      {Array.from({ length: Math.floor(w / 3) }).map((_, i) => (
        <mesh key={i} position={[x1 + 1.5 + i * 3, -0.07, z]}>
          <boxGeometry args={[1.5, 0.01, 0.04]} />
          <meshBasicMaterial color="#00a8ff" opacity={0.3} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Particulas ambientales flotantes
function AmbientParticles({ maxX, maxZ, centerX, centerZ }: { maxX: number; maxZ: number; centerX: number; centerZ: number }) {
  const count = 60;
  const ref = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * (maxX + 10),
      y: Math.random() * 8 + 0.5,
      z: (Math.random() - 0.5) * (maxZ + 10),
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [maxX, maxZ]);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(
        centerX + p.x + Math.sin(t * p.speed * 0.3 + p.phase) * 0.5,
        p.y + Math.sin(t * p.speed + p.phase) * 1.5,
        centerZ + p.z + Math.cos(t * p.speed * 0.2 + p.phase) * 0.5,
      );
      dummy.scale.setScalar(0.03 + Math.sin(t * 2 + p.phase) * 0.01);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#8ab4f8" transparent opacity={0.12} />
    </instancedMesh>
  );
}

// Tooltip para contenedor clickeado
function ContainerTooltip({ position, naviera, onClose }: {
  position: { x: number; y: number; z: number };
  naviera: string;
  onClose: () => void;
}) {
  return (
    <Html position={[position.x, position.y + 1.5, position.z]} center distanceFactor={30}>
      <div
        className="bg-[#0f1a2e]/95 border border-cyan-500/30 rounded-lg px-3 py-2 min-w-[140px] shadow-xl backdrop-blur cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <p className="text-cyan-300 font-bold text-xs">{naviera}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: navieraColor3D[naviera] || '#888' }} />
          <span className="text-white/60 text-[10px]">Nivel {Math.round(position.y / CH)}</span>
        </div>
      </div>
    </Html>
  );
}

// Camara con transicion suave hacia isla seleccionada
function CameraController({ targetPos, controlsRef }: {
  targetPos: { x: number; z: number } | null;
  controlsRef: React.RefObject<any>;
}) {
  const targetVec = useRef(new THREE.Vector3());
  const active = useRef(false);

  useEffect(() => {
    if (targetPos) {
      targetVec.current.set(targetPos.x, 0, targetPos.z);
      active.current = true;
    } else {
      active.current = false;
    }
  }, [targetPos]);

  useFrame(() => {
    if (!active.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const current = controls.target as THREE.Vector3;
    current.lerp(targetVec.current, 0.04);
    controls.update();
    if (current.distanceTo(targetVec.current) < 0.1) {
      active.current = false;
    }
  });

  return null;
}

function PatioCompleto3D({ highlightContainerId }: { highlightContainerId: string | null }) {
  const allPositions = islasDetalladas.map(isla => {
    const pos = getIslaPosition(isla.config.id);
    const w = isla.config.gridColumnas * (CW + G3);
    const d = isla.config.gridFilas * (CD + G3);
    return { isla, pos, w, d };
  });

  const maxX = Math.max(...allPositions.map(p => p.pos.x + p.w));
  const maxZ = Math.max(...allPositions.map(p => p.pos.z + p.d));
  const centerX = maxX / 2;
  const centerZ = maxZ / 2;
  const maxDim = Math.max(maxX, maxZ);
  const camDist = maxDim * 0.9;

  // Estado interactivo
  const [selectedIsla, setSelectedIsla] = useState<string | null>(null);
  const [containerTooltip, setContainerTooltip] = useState<{ pos: { x: number; y: number; z: number }; naviera: string } | null>(null);
  const controlsRef = useRef<any>(null);

  // Animacion de entrada
  const entryRef = useRef(0);
  const [entryProgress, setEntryProgress] = useState(0);
  useFrame((_, delta) => {
    if (entryRef.current < 1) {
      entryRef.current = Math.min(1, entryRef.current + delta * 0.7);
      setEntryProgress(entryRef.current);
    }
  });

  // Target de camara al seleccionar isla
  const cameraTarget = useMemo(() => {
    if (!selectedIsla) return null;
    const found = allPositions.find(p => p.isla.config.id === selectedIsla);
    if (!found) return null;
    return { x: found.pos.x + found.w / 2, z: found.pos.z + found.d / 2 };
  }, [selectedIsla, allPositions]);

  const handleContainerClick = useCallback((pos: { x: number; y: number; z: number }, naviera: string) => {
    setContainerTooltip({ pos, naviera });
  }, []);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[centerX + camDist * 0.5, camDist * 0.6, centerZ + camDist * 0.7]}
        fov={50}
      />
      <OrbitControls
        ref={controlsRef}
        target={[centerX, 0, centerZ]}
        enableDamping
        dampingFactor={0.1}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={camDist * 4}
        autoRotate
        autoRotateSpeed={0.3}
      />

      <CameraController targetPos={cameraTarget} controlsRef={controlsRef} />

      {/* Iluminacion futurista - mas fria y tenue */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[centerX + 25, 35, centerZ - 25]} intensity={0.6} color="#4488ff" />
      <directionalLight position={[centerX - 15, 20, centerZ + 20]} intensity={0.3} color="#2266cc" />
      <hemisphereLight args={['#1a2a4a', '#060a14', 0.4]} />

      {/* Suelo general - oscuro futurista */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.12, centerZ]} receiveShadow
        onClick={() => { setSelectedIsla(null); setContainerTooltip(null); }}>
        <planeGeometry args={[maxX + 12, maxZ + 12]} />
        <meshStandardMaterial color="#080c16" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Grid futurista en el suelo - lineas X */}
      {Array.from({ length: Math.floor((maxX + 10) / 3) }).map((_, i) => (
        <mesh key={`gx${i}`} position={[i * 3 - 5, -0.11, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.015, maxZ + 10]} />
          <meshBasicMaterial color="#1a3a6e" transparent opacity={0.2} />
        </mesh>
      ))}
      {/* Grid futurista en el suelo - lineas Z */}
      {Array.from({ length: Math.floor((maxZ + 10) / 3) }).map((_, i) => (
        <mesh key={`gz${i}`} position={[centerX, -0.11, i * 3 - 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[maxX + 10, 0.015]} />
          <meshBasicMaterial color="#1a3a6e" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Vialidad entre zona norte y sur */}
      <Vialidad3D x1={-3} z={allPositions.find(p => p.isla.config.id === 'SUR-A')!.pos.z - 2} x2={maxX + 3} />

      {/* Todas las islas */}
      {allPositions.map(({ isla, pos }) => (
        <group key={isla.config.id}>
          <IslaBase3D
            isla={isla}
            offsetX={pos.x}
            offsetZ={pos.z}
            selected={selectedIsla === isla.config.id}
            onSelect={() => setSelectedIsla(prev => prev === isla.config.id ? null : isla.config.id)}
          />
          <IslaInstanced3D
            isla={isla}
            offsetX={pos.x}
            offsetZ={pos.z}
            highlightId={highlightContainerId}
            entryProgress={entryProgress}
            onContainerClick={handleContainerClick}
          />
        </group>
      ))}

      {/* Tooltip contenedor */}
      {containerTooltip && (
        <ContainerTooltip
          position={containerTooltip.pos}
          naviera={containerTooltip.naviera}
          onClose={() => setContainerTooltip(null)}
        />
      )}

      {/* Particulas ambientales */}
      <AmbientParticles maxX={maxX} maxZ={maxZ} centerX={centerX} centerZ={centerZ} />

      {/* Logo Woodward al lado del titulo */}
      <WoodwardLogo position={[centerX - 20, 10, -6]} />

      {/* Titulo patio */}
      <Text
        position={[centerX, 10, -6]}
        fontSize={3.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.08}
        outlineColor="#0a1628"
        letterSpacing={0.05}
      >
        PATIO PTD LOGISTICS
      </Text>
      <Text
        position={[centerX, 7.5, -6]}
        fontSize={1.4}
        color="#8ab4f8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#0a1628"
      >
        {resumenPatio.totalContenedores.toLocaleString()} contenedores
      </Text>

      {/* Zona labels */}
      <Text position={[centerX, 3.5, -2]} fontSize={0.45} color="#2563eb" anchorX="center">
        ZONA NORTE - 15,407 cap
      </Text>
      <Text position={[centerX / 3, 3.5, allPositions.find(p => p.isla.config.id === 'SUR-A')!.pos.z - 0.5]} fontSize={0.4} color="#d97706" anchorX="center">
        ZONA SUR - 4,788 cap
      </Text>

      {/* Accesos */}
      <Text position={[-3, 0.3, allPositions.find(p => p.isla.config.id === 'ISLA-05')!.pos.z + 3]} fontSize={0.3} color="#0369a1" anchorX="center" rotation={[0, Math.PI / 2, 0]}>
        Acceso 2 - Av. Lopez Mateos
      </Text>
      <Text position={[centerX, 0.3, maxZ + 2.5]} fontSize={0.3} color="#0369a1" anchorX="center">
        Acceso 1 - Carretera Mzllo-Minatitlan
      </Text>
    </>
  );
}

function Patio3DView({ highlightContainerId }: { highlightContainerId: string | null }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes size={14} className="text-blue-500" />
          <span className="text-xs text-gray-700 font-medium">
            Vista 3D - Patio Completo ({resumenPatio.totalContenedores.toLocaleString()} contenedores)
          </span>
          {highlightContainerId && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-300 animate-pulse">
              Localizando: {highlightContainerId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400">Rotar: click + arrastrar | Zoom: scroll | Pan: click derecho</span>
          <div className="flex gap-2">
            {NAVIERAS.map(n => (
              <div key={n.nombre} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: n.color }} />
                <span className="text-[8px] text-gray-500">{n.abrev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 600 }}>
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ background: '#060a14' }}
          onCreated={({ gl }) => { gl.setClearColor('#060a14'); }}
        >
          <Suspense fallback={null}>
            <PatioCompleto3D highlightContainerId={highlightContainerId} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

// ==========================================
// PANEL PRINCIPAL
// ==========================================
export default function PatioPanel() {
  initIslasIfNeeded();
  const [selectedIsla, setSelectedIsla] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const pieData = resumenPatio.porNaviera.map(n => ({
    name: n.naviera,
    value: n.cantidad,
    color: navieraColor[n.naviera],
  }));

  // Buscar contenedor
  const searchResult = useMemo(() => {
    if (searchTerm.length < 5) return null;
    for (const isla of islasDetalladas) {
      for (let f = 0; f < isla.grid.length; f++) {
        for (let c = 0; c < isla.grid[f].length; c++) {
          for (let n = 0; n < isla.grid[f][c].contenedores.length; n++) {
            const cont = isla.grid[f][c].contenedores[n];
            if (cont && cont.id.toLowerCase().includes(searchTerm.toLowerCase())) {
              return { isla: isla.config.id, islaNombre: isla.config.nombre, fila: f + 1, columna: c + 1, nivel: n + 1, contenedor: cont };
            }
          }
        }
      }
    }
    return null;
  }, [searchTerm]);

  const islaDetalle = selectedIsla ? islasDetalladas.find(i => i.config.id === selectedIsla) : null;

  const handleSelect = (id: string) => setSelectedIsla(selectedIsla === id ? null : id);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Contenedores en patio</p>
          <p className="text-xl font-bold text-gray-800">{resumenPatio.totalContenedores.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Capacidad plano</p>
          <p className="text-xl font-bold text-gray-800">{capacidadTotalPlano.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Ocupacion</p>
          <p className="text-xl font-bold" style={{ color: resumenPatio.ocupacion > 85 ? '#ef4444' : resumenPatio.ocupacion > 70 ? '#f59e0b' : '#22c55e' }}>
            {resumenPatio.ocupacion}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Dwell time avg</p>
          <p className="text-xl font-bold text-gray-800">{resumenPatio.dwellTimePromedio}d</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Hoy ingresaron</p>
          <p className="text-xl font-bold text-green-600">+{resumenPatio.deltaHoy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Reefers</p>
          <div className="flex items-center justify-center gap-1">
            <Snowflake size={14} className="text-cyan-500" />
            <p className="text-xl font-bold text-cyan-600">{capacidadTotalPlano.reefers}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar contenedor..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg w-56 focus:outline-none focus:border-blue-400" />
          </div>
          {searchResult && (
            <div className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 cursor-pointer"
              onClick={() => setSelectedIsla(searchResult.isla)}>
              <strong>{searchResult.contenedor.id}</strong> en {searchResult.islaNombre} - F{searchResult.fila} C{searchResult.columna} N{searchResult.nivel}
            </div>
          )}
          {searchTerm.length > 4 && !searchResult && <span className="text-xs text-red-500">No encontrado</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            <ZoomOut size={14} className="text-gray-600" />
          </button>
          <span className="text-[10px] text-gray-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.8, z + 0.1))} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            <ZoomIn size={14} className="text-gray-600" />
          </button>
          <button onClick={() => { setZoom(1); setSelectedIsla(null); setSearchTerm(''); }} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
            <RotateCcw size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* MAPA DEL PATIO */}
        <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-2 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/80 font-medium">PATIO PTD LOGISTICS - Plano PC-001</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/40">
                {capacidadTotalPlano.zonaNorte.area.toLocaleString()} + {capacidadTotalPlano.zonaSur.area.toLocaleString()} m2
              </span>
              <div className="flex items-center gap-1 bg-white/5 rounded px-1.5 py-0.5">
                <MapPin size={8} className="text-white/40" />
                <span className="text-[8px] text-white/40">N</span>
                <ChevronUp size={8} className="text-white/40" />
              </div>
            </div>
          </div>

          <div className="p-4 overflow-auto" style={{ maxHeight: '580px' }}>
            {/* ZONA NORTE */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-blue-500/20" />
                <span className="text-[9px] font-bold text-blue-400 tracking-wider px-2">
                  ZONA NORTE - 116,828 m2 - 15,407 cont - 7 islas
                </span>
                <div className="h-px flex-1 bg-blue-500/20" />
              </div>

              {/* Fila 1: Islas 01-04 */}
              <div className="flex gap-2 items-stretch mb-2">
                {islasZonaNorte.filter(i => ['ISLA-01', 'ISLA-02', 'ISLA-03', 'ISLA-04'].includes(i.config.id)).map(isla => (
                  <IslaCompacta key={isla.config.id} isla={isla} selected={selectedIsla === isla.config.id}
                    onSelect={() => handleSelect(isla.config.id)} zoom={zoom} />
                ))}
              </div>

              {/* Fila 2: Acceso2 + 05, 06 + 07 */}
              <div className="flex gap-2 items-stretch">
                <AccesoVisual nombre="Acceso 2" via="Av. Lopez Mateos" />
                {islasZonaNorte.filter(i => ['ISLA-05', 'ISLA-06', 'ISLA-07'].includes(i.config.id)).map(isla => (
                  <IslaCompacta key={isla.config.id} isla={isla} selected={selectedIsla === isla.config.id}
                    onSelect={() => handleSelect(isla.config.id)} zoom={zoom} />
                ))}
              </div>
            </div>

            {/* VIALIDAD */}
            <div className="flex items-center gap-2 my-3">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
              <span className="text-[8px] text-yellow-500/40 tracking-widest">VIALIDAD INTERNA</span>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
            </div>

            {/* ZONA SUR */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-amber-500/20" />
                <span className="text-[9px] font-bold text-amber-400 tracking-wider px-2">
                  ZONA SUR - 37,568 m2 - 4,788 cont - 7 bloques
                </span>
                <div className="h-px flex-1 bg-amber-500/20" />
              </div>

              <div>
                {/* Fila sup: A + B + Area Usos Multiples */}
                <div className="flex gap-2 items-stretch mb-2">
                  {islasZonaSur.filter(i => ['SUR-A', 'SUR-B'].includes(i.config.id)).map(isla => (
                    <IslaCompacta key={isla.config.id} isla={isla} selected={selectedIsla === isla.config.id}
                      onSelect={() => handleSelect(isla.config.id)} zoom={zoom} />
                  ))}
                  {/* Area usos multiples */}
                  <div className="rounded border-2 border-dashed border-white/8 flex items-center justify-center"
                    style={{ flex: '14 1 0%', minHeight: 91 }}>
                    <div className="text-center">
                      <Box size={14} className="text-white/10 mx-auto mb-1" />
                      <p className="text-[8px] text-white/15 font-bold leading-tight">AREA USOS<br/>MULTIPLES</p>
                    </div>
                  </div>
                </div>
                {/* Fila media: C + D + E */}
                <div className="flex gap-2 items-stretch mb-2">
                  {islasZonaSur.filter(i => ['SUR-C', 'SUR-D', 'SUR-E'].includes(i.config.id)).map(isla => (
                    <IslaCompacta key={isla.config.id} isla={isla} selected={selectedIsla === isla.config.id}
                      onSelect={() => handleSelect(isla.config.id)} zoom={zoom} />
                  ))}
                </div>
                {/* Fila inf: F + G */}
                <div className="flex gap-2 items-stretch">
                  {islasZonaSur.filter(i => ['SUR-F', 'SUR-G'].includes(i.config.id)).map(isla => (
                    <IslaCompacta key={isla.config.id} isla={isla} selected={selectedIsla === isla.config.id}
                      onSelect={() => handleSelect(isla.config.id)} zoom={zoom} />
                  ))}
                </div>
              </div>
            </div>

            {/* ACCESO 1 */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <AccesoVisual nombre="Acceso 1" via="Carretera Mzllo-Minatitlan" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            </div>
          </div>

          {/* Total contenedores */}
          <div className="px-4 py-2.5 bg-black/30 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Container size={14} className="text-white/50" />
              <span className="text-sm font-bold text-white">{resumenPatio.totalContenedores.toLocaleString()}</span>
              <span className="text-[10px] text-white/50">contenedores en patio</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[10px] text-white/40">Capacidad: {capacidadTotalPlano.total.toLocaleString()}</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[10px] text-white/40">Ocupacion: {resumenPatio.ocupacion}%</span>
          </div>

          {/* Leyenda */}
          <div className="px-4 py-2 bg-black/20 flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-wrap gap-3">
              {NAVIERAS.map(n => (
                <div key={n.nombre} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: n.color }} />
                  <span className="text-[10px] text-white/60">{n.nombre}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-sm" />
                <span className="text-[9px] text-white/40">Evacuar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-sm" />
                <span className="text-[9px] text-white/40">Inspeccion</span>
              </div>
              <div className="flex items-center gap-1">
                <Snowflake size={8} className="text-cyan-400" />
                <span className="text-[9px] text-white/40">Reefer</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL LATERAL */}
        <div className="w-72 shrink-0 space-y-3">
          {/* Inventario naviera */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Inventario por naviera</h3>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number | undefined) => (v ?? 0).toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1">
              {resumenPatio.porNaviera.map(nav => (
                <div key={nav.naviera} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: navieraColor[nav.naviera] }} />
                    <span className="text-gray-600">{nav.naviera}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{nav.cantidad.toLocaleString()}</span>
                    <span className="text-gray-400">{nav.porcentaje}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla islas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Islas / Bloques</h3>
            <div className="space-y-1 max-h-[220px] overflow-y-auto">
              {islasDetalladas.map(isla => {
                const pctColor = isla.ocupacionPct > 90 ? '#ef4444' : isla.ocupacionPct > 75 ? '#f59e0b' : '#22c55e';
                return (
                  <div key={isla.config.id}
                    className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors text-[9px] ${
                      selectedIsla === isla.config.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelect(isla.config.id)}>
                    <span className="font-mono text-gray-500 w-7 shrink-0">
                      {isla.config.id.replace('ISLA-', '').replace('SUR-', 'S-')}
                    </span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-full rounded-full" style={{ width: `${isla.ocupacionPct}%`, backgroundColor: pctColor }} />
                      </div>
                    </div>
                    <span className="font-bold w-8 text-right" style={{ color: pctColor }}>{isla.ocupacionPct}%</span>
                    <span className="text-gray-400 w-12 text-right">{isla.ocupacion.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placeholder si no hay seleccion */}
          {!islaDetalle && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <Layers size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Click en una isla para ver el grid de contenedores</p>
            </div>
          )}
        </div>
      </div>

      {/* Vista 3D del patio completo - siempre visible */}
      <Patio3DView highlightContainerId={searchResult?.contenedor.id || null} />

      {/* VISTA AMPLIADA - ocupa todo el ancho inferior */}
      {islaDetalle && (
        <IslaAmpliada
          isla={islaDetalle}
          onClose={() => setSelectedIsla(null)}
        />
      )}
    </div>
  );
}
