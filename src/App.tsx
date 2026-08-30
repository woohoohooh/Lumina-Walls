/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  Smartphone, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_SUFFIX = ", mobile wallpaper, vertical 9:16, 1088x2048 resolution, ultra high quality, extremely detailed, sharp focus, clean composition, minimal clutter, balanced layout, space for icons, premium aesthetic, modern trending style, smooth gradients, rich colors, perfect lighting, high contrast, no noise, no artifacts, no blur, no text, no logo, no watermark";

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const generateWallpaper = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const finalPrompt = prompt.trim() + SYSTEM_SUFFIX;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
            imageSize: "1K" // Using 1K for better stability/speed
          },
        },
      });

      let foundImage = false;
      const candidates = response.candidates;
      
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            setImageUrl(`data:image/png;base64,${base64Data}`);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate wallpaper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `lumina-wallpaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26]/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#F27D26]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative max-w-lg mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-[#F27D26]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60">AI Design Tool</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight mb-2">Lumina<span className="font-bold">Walls</span></h1>
          <p className="text-white/40 text-sm">Visualize your perfect screen aesthetic.</p>
        </motion.header>

        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your wallpaper (e.g., 'abstract liquid chrome with neon gradients')..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 min-h-[100px] text-sm focus:outline-none focus:ring-1 focus:ring-[#F27D26]/50 focus:border-[#F27D26]/50 transition-all placeholder:text-white/20 resize-none"
              disabled={isGenerating}
            />
            <button 
              onClick={generateWallpaper}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-4 right-4 p-2 rounded-xl bg-[#F27D26] text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Cyberpunk', 'Minimalist', 'Space', 'Nature', 'Liquid'].map((tag) => (
              <button
                key={tag}
                onClick={() => setPrompt(tag)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                disabled={isGenerating}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col mb-8">
          <AnimatePresence mode="wait">
            {!imageUrl && !isGenerating && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px] min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/20 text-sm">Your masterpiece will appear here</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-[32px] overflow-hidden relative min-h-[400px]"
              >
                <div className="absolute inset-0 bg-[#F27D26]/5 animate-pulse" />
                <div className="relative z-10 text-center">
                  <RefreshCw className="w-10 h-10 text-[#F27D26]/40 animate-spin mx-auto mb-4" />
                  <p className="text-[#F27D26]/60 text-xs font-mono uppercase tracking-widest">Generating Visuals...</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 bg-red-500/5 border border-red-500/10 rounded-[32px] text-center min-h-[400px]"
              >
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <button 
                  onClick={generateWallpaper}
                  className="px-4 py-2 rounded-full bg-white/5 text-xs hover:bg-white/10 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {imageUrl && !isGenerating && (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative aspect-[9/16] w-full rounded-[32px] overflow-hidden shadow-2xl shadow-black group mx-auto"
              >
                <img 
                  ref={imageRef}
                  src={imageUrl} 
                  alt="Generated Wallpaper" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Actions Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={downloadImage}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-bold hover:bg-[#F27D26] transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Wallpaper
                  </button>
                  <button 
                    className="w-full flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl font-medium hover:bg-white/20 transition-colors border border-white/10"
                  >
                    <Smartphone className="w-5 h-5" />
                    Set as Wallpaper
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <footer className="mt-auto text-center pb-8 border-t border-white/5 pt-8">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mb-2">Vertical HD Engine • Lumina Walls</p>
          <p className="text-[9px] text-white/10">AI-generated images are for personal use only.</p>
        </footer>
      </div>
    </div>
  );
}
