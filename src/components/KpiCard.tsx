interface KpiCardProps {
  titulo: string;
  valor: string;
  subtitulo?: string;
  color?: string;
  icono?: React.ReactNode;
}

export default function KpiCard({ titulo, valor, subtitulo, color = 'bg-azul-medio', icono }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className={`h-1 ${color}`} />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{titulo}</p>
          {icono && <span className="text-gray-400">{icono}</span>}
        </div>
        <p className="text-2xl font-bold text-gray-800 mt-1">{valor}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
      </div>
    </div>
  );
}
