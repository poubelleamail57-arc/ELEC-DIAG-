import React, { useState } from 'react';
import { analyzeElectricalImage } from './services/geminiService';
import { AnalysisResult, ViewState } from './types';
import NavBar from './components/NavBar';
import AnalysisCard from './components/AnalysisCard';
import ChatAssistant from './components/ChatAssistant';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [reports, setReports] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const result = await analyzeElectricalImage(base64String);
        
        const newReport: AnalysisResult = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          imageUrl: base64String,
          ...result
        };

        setReports(prev => [newReport, ...prev]);
        setView(ViewState.REPORT);
      } catch (err) {
        setError("Impossible d'analyser la photo. Vérifiez votre clé API ou la connexion.");
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    event.target.value = '';
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm pt-safe-top sticky top-0 z-40 no-print">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-bold text-gray-800">DiagElec AI</h1>
          </div>
          {view === ViewState.REPORT && reports.length > 0 && (
            <button onClick={handlePrint} className="text-blue-600 font-medium text-sm">
              Exporter PDF
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-center animate-pulse">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="font-semibold text-gray-800">Analyse IA en cours...</p>
                    <p className="text-xs text-gray-500 mt-2">Vérification NF C 16-600</p>
                </div>
            </div>
        )}

        {/* View: Home / Scanner */}
        {view === ViewState.HOME && (
          <div className="flex flex-col items-center justify-center py-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Nouveau Diagnostic</h2>
              <p className="text-gray-500">Prenez en photo un tableau, une prise ou une installation.</p>
            </div>

            <div className="w-full relative group cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="bg-white border-2 border-dashed border-blue-300 rounded-3xl p-10 flex flex-col items-center justify-center shadow-sm group-hover:bg-blue-50 transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-blue-600 font-bold text-lg">Prendre une photo</span>
                <span className="text-xs text-gray-400 mt-2">ou choisir depuis la galerie</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <span className="block text-2xl font-bold text-gray-800">{reports.length}</span>
                    <span className="text-xs text-gray-500">Photos analysées</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <span className="block text-2xl font-bold text-red-500">
                        {reports.reduce((acc, curr) => acc + curr.anomalies.length, 0)}
                    </span>
                    <span className="text-xs text-gray-500">Anomalies totales</span>
                </div>
            </div>
          </div>
        )}

        {/* View: Reports / Results */}
        {(view === ViewState.REPORT || view === ViewState.ANALYSIS_RESULT) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-xl font-bold text-gray-800">Rapport de Diagnostic</h2>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 mb-4">Aucune analyse pour le moment.</p>
                <button 
                  onClick={() => setView(ViewState.HOME)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                  Commencer
                </button>
              </div>
            ) : (
              <div className="space-y-8 print:space-y-8">
                 <div className="print-only hidden mb-8">
                    <h1 className="text-3xl font-bold mb-2">Rapport de Diagnostic Électrique</h1>
                    <p className="text-gray-600">Généré par DiagElec AI - NF C 16-600</p>
                 </div>
                {reports.map((report) => (
                  <AnalysisCard key={report.id} report={report} onDelete={deleteReport} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View: Chat Assistant */}
        {view === ViewState.CHAT && (
          <div>
             <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Assistant Technique</h2>
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ChatAssistant />
             </div>
          </div>
        )}
      </main>

      <NavBar currentView={view} setView={setView} />
    </div>
  );
}

export default App;