
import React, { useState, useCallback, useRef } from 'react';
import { editOutfit } from './services/geminiService';
import { ImageState, HistoryItem } from './types';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    modified: null,
    loading: false,
    error: null,
  });
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageState(prev => ({
          ...prev,
          original: event.target?.result as string,
          modified: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
      // Clear the value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const generateOutfit = async () => {
    if (!imageState.original || !prompt) return;

    setImageState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const modifiedImage = await editOutfit(imageState.original, prompt);
      setImageState(prev => ({
        ...prev,
        modified: modifiedImage,
        loading: false,
      }));

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        original: imageState.original,
        modified: modifiedImage,
        prompt: prompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setImageState(prev => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to generate new outfit. Please try again."
      }));
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearApp = () => {
    setImageState({
      original: null,
      modified: null,
      loading: false,
      error: null
    });
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hidden File Input (Always accessible) */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fashion<span className="text-indigo-600">AI</span></h1>
          </div>
          <button 
            onClick={clearApp}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Editor Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Image Display */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {imageState.modified ? 'Modified Result' : (imageState.original ? 'Source Image' : 'Start Here')}
                  </h3>
                  
                  <div className="relative group overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 aspect-[3/4] flex items-center justify-center">
                    {!imageState.original ? (
                      <div 
                        onClick={triggerFileUpload}
                        className="text-center p-8 cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-600 font-medium">Upload a photo to begin</p>
                        <p className="text-slate-400 text-sm mt-1">Portrait or full body shots work best</p>
                      </div>
                    ) : (
                      <img 
                        src={imageState.modified || imageState.original} 
                        alt="Canvas" 
                        className="w-full h-full object-contain"
                      />
                    )}

                    {imageState.loading && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-slate-900 font-semibold text-lg animate-pulse">Tailoring your outfit...</p>
                        <p className="text-slate-500 text-sm">This takes about 10-15 seconds</p>
                      </div>
                    )}
                  </div>

                  {imageState.original && !imageState.loading && (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                       <span className="text-xs text-slate-500 font-medium">Original image selected</span>
                       <button 
                        onClick={triggerFileUpload}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 focus:outline-none"
                       >
                         Change Image
                       </button>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Describe the new outfit
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A stylish neon cyberpunk leather jacket with glowing trims, black cargo pants, and futuristic sneakers."
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-500 uppercase">Quick Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Modern Space Suit",
                        "Traditional Vietnamese Ao Dai",
                        "Classic Tuxedo",
                        "Superhero Cape & Armor",
                        "Summer Beachwear",
                        "Steampunk Gear"
                      ].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setPrompt(tag)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={generateOutfit}
                      disabled={!imageState.original || !prompt || imageState.loading}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 transition-all duration-300 ${
                        !imageState.original || !prompt || imageState.loading
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1 active:scale-95'
                      }`}
                    >
                      {imageState.loading ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l1.413 9.927 3.944.3a1 1 0 01.896 1.2l-.242 1.45a1 1 0 01-1.196.82l-4.103-.312-.62 4.342a1 1 0 01-1.197.848l-1.45-.207a1 1 0 01-.847-1.197l.962-6.742-3.944-.3a1 1 0 01-.896-1.2l.242-1.45a1 1 0 011.196-.82l4.103.312.62-4.342a1 1 0 011.197-.848l1.45.207z" clipRule="evenodd" />
                          </svg>
                          <span>Generate Outfit</span>
                        </>
                      )}
                    </button>
                    {imageState.error && (
                      <p className="mt-2 text-xs text-red-500 font-medium text-center">
                        {imageState.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start space-x-3">
              <div className="mt-0.5 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold">Pro Tip:</span> For the best results, use a high-quality photo of one person facing the camera. Mention specific colors and materials in your description to guide the AI better.
              </div>
            </div>
          </div>

          {/* History Column */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Recent Creations</span>
            </h2>
            
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl h-64 flex items-center justify-center flex-col text-slate-400 p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">No creations yet</p>
                  <p className="text-xs mt-1">Generated outfits will appear here for your session.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setImageState({ original: item.original, modified: item.modified, loading: false, error: null })}>
                    <div className="flex p-3">
                      <div className="w-20 h-28 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={item.modified} alt="Modified" className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1 bg-white/80 p-0.5 rounded shadow-sm">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col justify-center overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.prompt}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">Re-applied from history</p>
                        <div className="mt-3 flex items-center space-x-2">
                           <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                             </svg>
                           </div>
                           <span className="text-[10px] font-bold text-indigo-600 uppercase">View Result</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-slate-400 text-sm border-t border-slate-100 pt-8 pb-8">
        <p>&copy; {new Date().getFullYear()} FashionAI Studio. Powered by Gemini 2.5.</p>
        <p className="mt-2 font-medium text-slate-500">Bản quyền phần mềm thuộc về Hoa Bất Tử</p>
      </footer>
    </div>
  );
};

export default App;
