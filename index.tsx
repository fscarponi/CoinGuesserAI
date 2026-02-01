import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- CSS Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    gap: "20px",
    position: "relative",
  },
  header: {
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#00e676",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "10px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "40px",
  },
  headerControls: {
    position: "absolute",
    right: 0,
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    transition: "transform 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e0e0e0",
  },
  settingsPanel: {
    backgroundColor: "#1e1e1e",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    animation: "fadeIn 0.2s ease-out",
    zIndex: 10,
  },
  inputGroup: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #444",
    backgroundColor: "#121212",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
  },
  buttonSecondary: {
    padding: "0 20px",
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  statusText: {
    fontSize: "0.8rem",
    color: "#888",
    textAlign: "left",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "1/1",
    backgroundColor: "#000",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 230, 118, 0.2)",
    border: "2px solid #333",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  scanButton: {
    width: "100%",
    padding: "18px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#121212",
    backgroundColor: "#00e676",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "transform 0.1s, opacity 0.2s",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
  },
  scanButtonDisabled: {
    backgroundColor: "#444",
    color: "#888",
    cursor: "not-allowed",
  },
  listContainer: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "20px",
  },
  listItem: {
    backgroundColor: "#1e1e1e",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    borderLeft: "4px solid #00e676",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    animation: "fadeIn 0.3s ease-out",
  },
  itemMain: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#fff",
  },
  itemSub: {
    fontSize: "0.9rem",
    color: "#aaa",
  },
  clearButton: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    border: "1px solid #ff5252",
    color: "#ff5252",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    alignSelf: "center",
    marginTop: "10px",
  },
  error: {
    color: "#ff5252",
    textAlign: "center",
    fontSize: "0.9rem",
    padding: "10px",
  },
};

// --- Type Definitions ---
interface ScanResult {
  id: number;
  raw: string;
  nation?: string;
  value?: string;
  year?: string;
  timestamp: string;
}

// --- Icons ---
const VolumeUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L5.09 9.66c-.12.2-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

// --- Main Component ---
const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for History
  const [history, setHistory] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem("coinScanHistory");
    return saved ? JSON.parse(saved) : [];
  });
  
  // State for Settings
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem("geminiApiKey") || "";
  });
  const [tempKeyInput, setTempKeyInput] = useState("");
  
  // State for Audio
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("coinScanMuted") === "true";
  });

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use rear camera
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Impossibile accedere alla fotocamera. Verifica i permessi.");
      }
    };

    startCamera();

    return () => {
      // Cleanup tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem("coinScanHistory", JSON.stringify(history));
  }, [history]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem("coinScanMuted", String(newState));
    if (newState) {
      window.speechSynthesis.cancel();
    }
  };

  const saveCustomKey = () => {
    const key = tempKeyInput.trim();
    if (key) {
      localStorage.setItem("geminiApiKey", key);
      setCustomKey(key);
      setTempKeyInput("");
      setShowSettings(false);
    }
  };

  const removeCustomKey = () => {
    localStorage.removeItem("geminiApiKey");
    setCustomKey("");
    setShowSettings(false);
  };

  const speakResult = (text: string) => {
    if (isMuted) return;
    
    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT"; // Force Italian
    utterance.rate = 1.1; // Slightly faster
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Freeze the video frame to give visual feedback
    videoRef.current.pause();

    setIsScanning(true);
    setError(null);

    try {
      // Determine which key to use: Custom > Env Var
      const apiKeyToUse = customKey || process.env.API_KEY;
      
      if (!apiKeyToUse) {
        throw new Error("Nessuna API Key trovata. Inseriscila nelle impostazioni ⚙️.");
      }

      // Initialize AI with the specific key for this request
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

      // 1. Capture Frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context missing");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

      // 2. Prepare API Request
      const modelId = "gemini-3-flash-preview";
      const systemPrompt = `Sei un'interfaccia API di scansione numismatica ultra-veloce. Il tuo unico compito è identificare monete da immagini o flussi video.

REGOLE DI RISPOSTA:
1. Analizza ogni moneta presente nell'immagine.
2. Per ogni moneta, restituisci ESCLUSIVAMENTE una riga nel formato: [NAZIONE] | [VALORE NOMINALE] | [ANNO]
3. Se ci sono più monete, usa un elenco puntato.
4. NON aggiungere introduzioni ("Ecco i risultati"), conclusioni o descrizioni del metallo/stato.
5. Se un dato è illeggibile, scrivi [?] al suo posto (es: Italia | 500 Lire | [?]).
6. Se l'immagine non contiene monete, rispondi: "Nessuna moneta rilevata".
7. Dai priorità assoluta alla precisione della nazione e del valore.`;

      // 3. Call API
      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: "Analizza la moneta e rispondi solo con: NAZIONE | VALORE | ANNO",
            },
          ],
        },
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Low temperature for factual precision
        },
      });

      const text = response.text || "Errore nella lettura";
      
      // 4. Parse Results
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      const newItems: ScanResult[] = lines.map(line => {
        // Clean markdown list chars if present
        const cleanLine = line.replace(/^[\*\-•]\s*/, '').trim();
        const parts = cleanLine.split('|').map(p => p.trim());
        
        // Simple parsing logic based on requested format
        return {
          id: Date.now() + Math.random(),
          raw: cleanLine,
          nation: parts[0] || "?",
          value: parts[1] || "?",
          year: parts[2] || "?",
          timestamp: new Date().toLocaleTimeString(),
        };
      });

      setHistory((prev) => [...newItems, ...prev]);

      // 5. Speak Result (Basic TTS)
      if (newItems.length > 0) {
        const item = newItems[0];
        if (item.raw.includes("Nessuna moneta")) {
           speakResult("Nessuna moneta trovata.");
        } else {
           // Construct a natural sentence: e.g., "500 Lire, Italia, 1980"
           const speechText = `${item.value}, ${item.nation}, ${item.year}`;
           speakResult(speechText);
        }
      }

    } catch (err: any) {
      console.error("Scan error:", err);
      // Nice error message handling
      let msg = "Errore scansione.";
      if (err.message && err.message.includes("API Key")) msg = err.message;
      else if (err.toString().includes("403")) msg = "API Key non valida.";
      setError(msg);
      speakResult("Errore.");
    } finally {
      setIsScanning(false);
      // Resume the video feed
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Resume error", e));
      }
    }
  };

  const clearList = () => {
    if (confirm("Cancellare la cronologia?")) {
      setHistory([]);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        CoinGuesserAI
        <div style={styles.headerControls}>
           <button 
            style={styles.iconButton}
            onClick={toggleMute}
            aria-label={isMuted ? "Attiva audio" : "Disattiva audio"}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </button>
          <button 
            style={styles.iconButton} 
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Impostazioni"
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={styles.settingsPanel}>
          <div style={styles.statusText}>
            {customKey ? "Chiave personalizzata attiva ✅" : "Uso chiave predefinita 🤖"}
          </div>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="password"
              placeholder="Inserisci Gemini API Key..."
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
            />
            <button style={styles.buttonSecondary} onClick={saveCustomKey}>
              SALVA
            </button>
          </div>
          {customKey && (
             <button 
              style={{...styles.buttonSecondary, backgroundColor: 'transparent', color: '#ff5252', border: 'none', alignSelf: 'flex-start', padding: 0, marginTop: '5px'}} 
              onClick={removeCustomKey}
            >
              Rimuovi chiave personalizzata
            </button>
          )}
        </div>
      )}

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Video Viewfinder */}
      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />
      </div>

      {/* Error Message */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Main Action */}
      <button
        onClick={handleScan}
        disabled={isScanning}
        style={{
          ...styles.scanButton,
          ...(isScanning ? styles.scanButtonDisabled : {}),
        }}
      >
        {isScanning ? "Analisi in corso..." : "SCANSIONA"}
      </button>

      {/* Results List */}
      <div style={styles.listContainer}>
        {history.length === 0 && (
          <div style={{ textAlign: "center", color: "#555", marginTop: "20px" }}>
            Scansiona una moneta per iniziare
          </div>
        )}
        
        {history.map((item) => (
          <div key={item.id} style={styles.listItem}>
            {item.raw.includes("Nessuna moneta") ? (
               <div style={{color: "#aaa"}}>{item.raw}</div>
            ) : (
              <>
                <div style={styles.itemMain}>
                  {item.value} <span style={{fontWeight: 'normal'}}>({item.nation})</span>
                </div>
                <div style={styles.itemSub}>
                  Anno: {item.year} • Scansionata alle {item.timestamp}
                </div>
              </>
            )}
          </div>
        ))}
        
        {history.length > 0 && (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <button onClick={clearList} style={styles.clearButton}>
              Pulisci Lista
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);