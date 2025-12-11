import React from 'react';
import { AnalysisResult, Anomaly } from '../types';

interface AnalysisCardProps {
  report: AnalysisResult;
  onDelete: (id: string) => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ report, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-100 break-inside-avoid">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={report.imageUrl} 
          alt="Installation électrique" 
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
          report.compliant 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {report.compliant ? 'CONFORME (Visuel)' : 'ANOMALIES DÉTECTÉES'}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Équipements détectés</h3>
          <div className="flex flex-wrap gap-2">
            {report.equipmentDetected.map((item, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                {item}
              </span>
            ))}
          </div>
        </div>

        {report.anomalies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Anomalies NF C 16-600</h3>
            <div className="space-y-3">
              {report.anomalies.map((anomaly, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                  anomaly.severity === 'DANGER' ? 'bg-red-50 border-red-500' :
                  anomaly.severity === 'AVERTISSEMENT' ? 'bg-orange-50 border-orange-400' :
                  'bg-gray-50 border-gray-400'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm block mb-1">{anomaly.code || "N/A"}</span>
                    {anomaly.severity === 'DANGER' && <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">DANGER</span>}
                  </div>
                  <p className="text-sm text-gray-800 mb-1">{anomaly.description}</p>
                  <p className="text-xs text-gray-600 italic">💡 Reco: {anomaly.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Résumé pour Rapport</h3>
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border border-gray-200 font-mono select-all">
            {report.summary}
          </div>
        </div>
        
        <div className="flex justify-end mt-4 no-print">
            <button 
                onClick={() => onDelete(report.id)}
                className="text-red-500 text-sm hover:text-red-700 underline"
            >
                Supprimer
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;