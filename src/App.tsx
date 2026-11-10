import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Tv, 
  Upload, 
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Settings,
  MessageSquare,
  HelpCircle,
  Video,
  Cloud,
  Database,
  Folder,
  FolderOpen,
  Chrome,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import { Trigger } from "./types";
import { saveOfflineVideo, deleteOfflineVideo, getAllOfflineVideos } from "./utils/offlineDb";

interface CustomQuestion {
  id: string;
  phrase: string;
  videoUrl: string;
  videoName: string;
  googleDriveId?: string;
}

interface SuggestedQuestion {
  id: string;
  text: string;
  targetSlotId?: string;
}

export default function App() {
  // Navigation: state to change between the interactive screen "chat" and "settings"
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");

  // Google Drive Integration States
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem("eco_google_token") || null;
  });
  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem("eco_google_client_id") || "";
  });
  const [introDriveId, setIntroDriveId] = useState(() => {
    return localStorage.getItem("eco_intro_drive_id") || "";
  });
  const [googleFiles, setGoogleFiles] = useState<any[] | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [folderHistory, setFolderHistory] = useState<{ id: string; name: string }[]>([
    { id: "root", name: "Meu Drive" }
  ]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSearchQuery, setDriveSearchQuery] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  // Connect via standard OAuth 2.0 Implicit Flow
  const handleGoogleLogin = () => {
    if (!googleClientId) {
      alert("Por favor, digite seu Google Client ID antes de conectar.");
      return;
    }
    const scopes = "https://www.googleapis.com/auth/drive.readonly";
    const redirectUri = window.location.origin; // Matches iframe domain
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}&state=gdrive_auth`;
    
    // Redirect to login
    window.location.href = authUrl;
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setGoogleAccessToken(tokenInput.trim());
    sessionStorage.setItem("eco_google_token", tokenInput.trim());
    setTokenInput("");
    setActiveTab("settings");
  };

  const handleGoogleLogout = () => {
    setGoogleAccessToken(null);
    sessionStorage.removeItem("eco_google_token");
    setGoogleFiles(null);
    setCurrentFolderId("root");
    setFolderHistory([{ id: "root", name: "Meu Drive" }]);
  };

  const handleFolderClick = (folder: { id: string; name: string }) => {
    const nextHistory = [...folderHistory, { id: folder.id, name: folder.name }];
    setFolderHistory(nextHistory);
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    const nextHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(nextHistory);
    setCurrentFolderId(nextHistory[nextHistory.length - 1].id);
  };

  const fetchGoogleDriveFiles = async (folderId: string = "root", search: string = "") => {
    if (!googleAccessToken) return;
    setIsDriveLoading(true);
    setDriveError(null);
    try {
      let query = `mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'video/'`;
      if (folderId && folderId !== "root") {
        query = `('${folderId}' in parents) and (${query})`;
      } else if (folderId === "root") {
        query = `('root' in parents) and (${query})`;
      }
      
      if (search.trim()) {
        query = `(${query}) and (name contains '${search.replace(/'/g, "\\'")}')`;
      }
      
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size)&pageSize=100&orderBy=folder,name`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleGoogleLogout();
          throw new Error("Sessão Google Drive expirada. Reconecte por segurança.");
        }
        throw new Error(`Google API returned status ${response.status}`);
      }
      
      const data = await response.json();
      setGoogleFiles(data.files || []);
    } catch (err: any) {
      console.error("Error fetching Google Drive files:", err);
      setDriveError(err.message || "Falha ao ler arquivos.");
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Google OAuth URL redirect hash parameters parser
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      const state = params.get("state");
      
      if (token && state === "gdrive_auth") {
        setGoogleAccessToken(token);
        sessionStorage.setItem("eco_google_token", token);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        setActiveTab("settings");
      }
    }
  }, []);

  // Restore local offline cached videos from IndexedDB on startup
  useEffect(() => {
    getAllOfflineVideos().then((storedVideos) => {
      if (!storedVideos || storedVideos.length === 0) return;
      storedVideos.forEach((item) => {
        const objUrl = URL.createObjectURL(item.blob);
        if (item.id === "intro") {
          setIntroUrl(objUrl);
          setIntroName(item.name);
        } else {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, videoUrl: objUrl, videoName: item.name } : q
            )
          );
        }
      });
    }).catch((err) => {
      console.warn("IndexedDB offline cache load error:", err);
    });
  }, []);

  // Fetch file list when token or current folder shifts
  useEffect(() => {
    if (googleAccessToken) {
      fetchGoogleDriveFiles(currentFolderId, driveSearchQuery);
    } else {
      setGoogleFiles(null);
    }
  }, [googleAccessToken, currentFolderId]);

  // Dynamic Questions List State
  const [questions, setQuestions] = useState<CustomQuestion[]>(() => {
    try {
      const saved = localStorage.getItem("eco_custom_questions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((q: any) => ({
            id: q.id,
            phrase: q.phrase || "",
            videoUrl: "", // Object/Blob URLs expire across page refreshes
            videoName: q.videoName || "",
            googleDriveId: q.googleDriveId || undefined
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load eco_custom_questions:", e);
    }

    // Default 2 questions
    return [
      { id: "questionA", phrase: "mostrar natureza", videoUrl: "", videoName: "" },
      { id: "questionB", phrase: "mostrar chuva", videoUrl: "", videoName: "" }
    ];
  });

  // User Configurable Suggested Questions State
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>(() => {
    try {
      const saved = localStorage.getItem("wit_suggested_questions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load wit_suggested_questions:", e);
    }
    return [
      { id: "sug-intro", text: "apresentação", targetSlotId: "intro" },
      { id: "sug-1", text: "mostrar natureza", targetSlotId: "questionA" },
      { id: "sug-2", text: "mostrar chuva", targetSlotId: "questionB" }
    ];
  });

  // Persist suggested questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("wit_suggested_questions", JSON.stringify(suggestedQuestions));
    } catch (e) {
      console.error("Failed to save wit_suggested_questions:", e);
    }
  }, [suggestedQuestions]);

  const addSuggestedQuestion = () => {
    const newId = "sug_" + Date.now();
    setSuggestedQuestions(prev => [
      ...prev,
      { id: newId, text: "Nova pergunta sugerida", targetSlotId: questions[0]?.id || "intro" }
    ]);
  };

  const updateSuggestedQuestionText = (id: string, text: string) => {
    setSuggestedQuestions(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  };

  const updateSuggestedQuestionTarget = (id: string, targetSlotId: string) => {
    setSuggestedQuestions(prev => prev.map(s => s.id === id ? { ...s, targetSlotId } : s));
  };

  const removeSuggestedQuestion = (id: string) => {
    setSuggestedQuestions(prev => prev.filter(s => s.id !== id));
  };

  const syncSuggestionsWithChannels = () => {
    const synced: SuggestedQuestion[] = [
      { id: "sug-intro", text: "apresentação", targetSlotId: "intro" },
      ...questions
        .filter(q => q.phrase && q.phrase.trim())
        .map(q => ({
          id: "sug_" + q.id,
          text: q.phrase.trim(),
          targetSlotId: q.id
        }))
    ];
    setSuggestedQuestions(synced);
  };

  // Local object URLs for video files (stored in state for active session)
  const [introUrl, setIntroUrl] = useState<string>("");
  const [introName, setIntroName] = useState(() => localStorage.getItem("eco_intro_name") || "");

  // Active slot corresponds to either "intro" or any question id
  const [activeVideoSlot, setActiveVideoSlot] = useState<string>("intro");

  // Chat conversation state
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSpeechDetected, setLastSpeechDetected] = useState<string>("");
  const [realtimeSpeech, setRealtimeSpeech] = useState<string>("");
  const [speechError, setSpeechError] = useState("");
  const [aiResponseText, setAiResponseText] = useState<string>(
    "Canal pronto. Clique no microfone ou digite abaixo para falar um dos comandos configurados."
  );

  // Playback settings
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoPlayError, setVideoPlayError] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [showReplayPrompt, setShowReplayPrompt] = useState(false);
  const [viewedSlots, setViewedSlots] = useState<string[]>([]);
  const [videoFinished, setVideoFinished] = useState<boolean>(false);
  const [videoFit, setVideoFit] = useState<"contain" | "cover">("contain");
  const [hidePanels, setHidePanels] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Web Speech API references
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper helper to clean and evaluate similarity between recognized text and target phrases
  const getFuzzyMatchScore = (input: string, targetPhrase: string): number => {
    if (!input || !targetPhrase) return 0;
    
    const cleanString = (s: string) => {
      return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9\s]/g, "") // remove punctuation
        .trim();
    };

    const inputClean = cleanString(input);
    const targetClean = cleanString(targetPhrase);

    if (!inputClean || !targetClean) return 0;

    // Exact match
    if (inputClean === targetClean) return 1.0;

    // Substring contains
    if (inputClean.includes(targetClean) || targetClean.includes(inputClean)) {
      return 0.95;
    }

    // Split words to see the intersection of keywords (plurals and verb stems)
    const inputWords = inputClean.split(/\s+/).filter(w => w.length > 1);
    const targetWords = targetClean.split(/\s+/).filter(w => w.length > 2);

    if (targetWords.length === 0) return 0;

    let matchCount = 0;
    for (const tWord of targetWords) {
      const matched = inputWords.some(iWord => {
        if (iWord === tWord) return true;
        // Check partial word prefixes to match e.g. "mostra" and "mostrar", "chuva" and "chuvas", etc.
        const minLen = Math.min(tWord.length, iWord.length);
        if (minLen >= 4) {
          const prefixT = tWord.substring(0, 4);
          const prefixI = iWord.substring(0, 4);
          if (prefixT === prefixI) return true;
        }
        return false;
      });
      if (matched) matchCount++;
    }

    return matchCount / targetWords.length;
  };

  // Sync state metadata to localStorage
  useEffect(() => {
    localStorage.setItem("eco_intro_name", introName);
    localStorage.setItem("eco_intro_drive_id", introDriveId);
    localStorage.setItem("eco_google_client_id", googleClientId);
    
    const configToSave = questions.map(q => ({
      id: q.id,
      phrase: q.phrase,
      videoName: q.videoName,
      googleDriveId: q.googleDriveId
    }));
    localStorage.setItem("eco_custom_questions", JSON.stringify(configToSave));
  }, [questions, introName, introDriveId, googleClientId]);

  // Web Speech API driver setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = "pt-BR";
    rec.interimResults = true; // Enabled true for real-time transcription feedback
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setSpeechError("");
      setRealtimeSpeech("");
    };

    rec.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setRealtimeSpeech(interimTranscript);
      }

      if (finalTranscript) {
        setLastSpeechDetected(finalTranscript);
        setRealtimeSpeech("");
        setIsListening(false);
        handleIncomingCommand(finalTranscript);
      }
    };

    rec.onerror = (event: any) => {
      setIsListening(false);
      setRealtimeSpeech("");
      if (event.error === "not-allowed") {
        setSpeechError("Acesso ao microfone negado.");
      } else if (event.error === "no-speech") {
        setSpeechError("Nenhuma fala detectada.");
      } else {
        setSpeechError(`Erro no microfone: ${event.error}`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => {
      rec.abort();
    };
  }, [questions]);

  // Play and reload helper triggered on video changes - Google Drive is completely optional
  const activeVideoUrl = (() => {
    if (activeVideoSlot === "intro") {
      // Prioritize direct local/offline cached video
      if (introUrl) return introUrl;
      // Optional fallback to Google Drive stream if configured
      if (introDriveId) {
        return googleAccessToken
          ? `/api/drive/stream?fileId=${introDriveId}&token=${encodeURIComponent(googleAccessToken)}`
          : `/api/drive/stream?fileId=${introDriveId}`;
      }
      return "";
    }
    const match = questions.find(q => q.id === activeVideoSlot);
    if (match) {
      // Prioritize direct local/offline cached video
      if (match.videoUrl) return match.videoUrl;
      // Optional fallback to Google Drive stream if configured
      if (match.googleDriveId) {
        return googleAccessToken
          ? `/api/drive/stream?fileId=${match.googleDriveId}&token=${encodeURIComponent(googleAccessToken)}`
          : `/api/drive/stream?fileId=${match.googleDriveId}`;
      }
      return match.videoUrl;
    }
    return "";
  })();

  const isActiveSlotDriveMedia = (() => {
    if (activeVideoSlot === "intro") {
      return !introUrl && !!introDriveId;
    }
    const match = questions.find(q => q.id === activeVideoSlot);
    return !!(match && !match.videoUrl && match.googleDriveId);
  })();

  useEffect(() => {
    setShowReplayPrompt(false);
    setVideoFinished(false);
    if (videoRef.current) {
      const v = videoRef.current;
      setVideoPlayError("");
      try {
        v.load();
        const playPromise = v.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Automatic play delayed/prevented:", err);
          });
        }
      } catch (err) {
        console.error("Video load error:", err);
      }
    }
  }, [activeVideoSlot, activeVideoUrl]);

  // Handle local video files selection (saved automatically to IndexedDB so Google Drive is not required)
  const handleFileChange = async (slotId: string, file: File) => {
    const url = URL.createObjectURL(file);
    try {
      await saveOfflineVideo(slotId, file.name, file, file.size);
    } catch (e) {
      console.warn("Could not save video to offline storage:", e);
    }

    if (slotId === "intro") {
      setIntroUrl(url);
      setIntroName(file.name);
      setIntroDriveId("");
      localStorage.removeItem("eco_intro_drive_id");
      setActiveVideoSlot("intro");
    } else {
      setQuestions(prev => prev.map(q => {
        if (q.id === slotId) {
          return { ...q, videoUrl: url, videoName: file.name, googleDriveId: undefined };
        }
        return q;
      }));
      setActiveVideoSlot(slotId);
    }
  };

  // Helper to remove an attached video from a slot
  const clearVideo = async (slotId: string) => {
    try {
      await deleteOfflineVideo(slotId);
    } catch (e) {}

    if (slotId === "intro") {
      setIntroUrl("");
      setIntroName("");
      setIntroDriveId("");
      localStorage.removeItem("eco_intro_drive_id");
      localStorage.removeItem("eco_intro_name");
    } else {
      setQuestions(prev => prev.map(q => {
        if (q.id === slotId) {
          return { ...q, videoUrl: "", videoName: "", googleDriveId: undefined };
        }
        return q;
      }));
    }
  };

  // Add questions helper
  const addQuestion = () => {
    const newId = `trigger_${Date.now()}`;
    setQuestions(prev => [
      ...prev,
      {
        id: newId,
        phrase: `nova resposta ${prev.length + 1}`,
        videoUrl: "",
        videoName: ""
      }
    ]);
  };

  // Remove question helper
  const removeQuestion = async (id: string) => {
    if (window.confirm("Deseja mesmo excluir esta pergunta?")) {
      try {
        await deleteOfflineVideo(id);
      } catch (e) {}
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (activeVideoSlot === id) {
        setActiveVideoSlot("intro");
      }
    }
  };

  const updateQuestionPhrase = (id: string, phrase: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, phrase };
      }
      return q;
    }));
  };

  // Toggle voice listening trigger
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          setRealtimeSpeech("");
          setSpeechError("");
          recognitionRef.current.start();
        } catch (err) {
          console.error("Mic start error:", err);
        }
      } else {
        setSpeechError("Microfone indisponível ou permissão bloqueada no navegador.");
      }
    }
  };

  const getActiveVideoUrl = () => {
    return activeVideoUrl;
  };

  const getActiveVideoTitle = () => {
    if (activeVideoSlot === "intro") return `APRESENTAÇÃO INICIAL: ${introName || "Sem Arquivo"}`;
    const match = questions.find(q => q.id === activeVideoSlot);
    if (match) {
      return `PROJEÇÃO: ${match.phrase.toUpperCase()} (${match.videoName || "Sem Arquivo"})`;
    }
    return "APRESENTAÇÃO INICIAL";
  };

  const isIntroSpecialVideo = activeVideoSlot === "intro" && (
    introName === "WhatsApp Video 2026-06-12 at 08.35.25.mp4" ||
    introName === "WhatsApp Video 2026-06-12 at 08.35.25" ||
    introName?.includes("WhatsApp Video 2026-06-12 at 08.35.25.mp4") ||
    getActiveVideoTitle() === "APRESENTAÇÃO INICIAL: WhatsApp Video 2026-06-12 at 08.35.25.mp4"
  );

  const playableSlots = [
    ...(introUrl || introDriveId ? ["intro"] : []),
    ...questions.filter(q => q.videoUrl || q.googleDriveId).map(q => q.id)
  ];

  const allVideosPlayed = playableSlots.length > 0 && playableSlots.every(slot => viewedSlots.includes(slot));

  const resetAllTriggers = async () => {
    if (window.confirm("Deseja apagar todos os vídeos carregados e redefinir as frases de ativação para o padrão?")) {
      try {
        await deleteOfflineVideo("intro");
        questions.forEach(q => deleteOfflineVideo(q.id).catch(() => {}));
      } catch (e) {}
      setIntroUrl("");
      setIntroName("");
      setIntroDriveId("");
      localStorage.removeItem("eco_intro_drive_id");
      localStorage.removeItem("eco_intro_name");
      setQuestions([
        { id: "questionA", phrase: "mostrar natureza", videoUrl: "", videoName: "" },
        { id: "questionB", phrase: "mostrar chuva", videoUrl: "", videoName: "" }
      ]);
      setSuggestedQuestions([
        { id: "sug-intro", text: "apresentação", targetSlotId: "intro" },
        { id: "sug-1", text: "mostrar natureza", targetSlotId: "questionA" },
        { id: "sug-2", text: "mostrar chuva", targetSlotId: "questionB" }
      ]);
      localStorage.removeItem("wit_suggested_questions");
      setActiveVideoSlot("intro");
      setLastSpeechDetected("");
      setRealtimeSpeech("");
      setAiResponseText("Ajustes redefinidos. Você pode carregar vídeos locais pelo botão no player ou nas configurações.");
    }
  };

  // Main voice commander parser & matcher to trigger projection shifts
  const handleIncomingCommand = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLastSpeechDetected(trimmed);
    setInputText("");
    setIsAnalyzing(true);
    setSpeechError("");

    const virtualTriggers: Trigger[] = [
      { id: "intro", phrase: "introdução", videoUrl: introUrl, description: "Introdução ou início" },
      ...questions.map(q => ({
        id: q.id,
        phrase: q.phrase,
        videoUrl: q.videoUrl,
        description: `Pergunta: ${q.phrase}`
      })),
      ...suggestedQuestions.filter(s => s.targetSlotId).map(s => ({
        id: s.targetSlotId!,
        phrase: s.text,
        videoUrl: s.targetSlotId === "intro" ? introUrl : (questions.find(q => q.id === s.targetSlotId)?.videoUrl || ""),
        description: `Sugestão: ${s.text}`
      }))
    ];

    try {
      // Calculate direct alignment scores with our optimized fuzzy word matcher
      const candidateList = [
        ...questions.map(q => ({ id: q.id, phrase: q.phrase })),
        ...suggestedQuestions.filter(s => s.targetSlotId).map(s => ({ id: s.targetSlotId!, phrase: s.text }))
      ];
      const scores = candidateList.map(cand => ({
        id: cand.id,
        phrase: cand.phrase,
        score: getFuzzyMatchScore(trimmed, cand.phrase)
      }));

      // Common phrases for intro/home/reset
      const introPhrases = ["introducao", "introdução", "inicio", "iniciar", "voltar", "comeco", "começo", "começar", "apresentação"];
      const scoreIntro = Math.max(...introPhrases.map(p => getFuzzyMatchScore(trimmed, p)));

      // Find the highest score among questions
      const bestMatch = scores.reduce((best, curr) => curr.score > best.score ? curr : best, { id: "", phrase: "", score: 0 });

      console.log(`[Scores] Best Match: "${bestMatch.phrase}" (${bestMatch.score}) | Intro: ${scoreIntro}`);

      // We privilege clear fuzzy score matches over contacting a server (keeps app instantaneous if confident)
      if (bestMatch.score >= 0.5 && bestMatch.score >= scoreIntro) {
        setHasStarted(true);
        setVideoFinished(false);
        setActiveVideoSlot(bestMatch.id);
        setAiResponseText(`[Sintonia] Comando de voz correspondido! Transmitindo Vídeo: "${bestMatch.phrase}"`);
        setIsAnalyzing(false);
        return;
      } else if (scoreIntro >= 0.5 && scoreIntro >= bestMatch.score) {
        setHasStarted(true);
        setVideoFinished(false);
        setActiveVideoSlot("intro");
        setAiResponseText("[Sintonia] Voltando à apresentação inicial.");
        setIsAnalyzing(false);
        return;
      }

      // Query server for smart fallback matching if fuzzy metrics are ambiguous
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: trimmed,
          triggers: virtualTriggers
        })
      });

      if (!response.ok) {
        throw new Error("Erro de resposta do servidor de análise.");
      }

      const result = await response.json();
      const matchedId = result.matchedTriggerId;
      
      if (matchedId === "intro") {
        setHasStarted(true);
        setVideoFinished(false);
        setActiveVideoSlot("intro");
        setAiResponseText(result.response || "Comando de retorno correspondido. Sintonizando introdução inicial.");
      } else if (matchedId) {
        const matchedQuestion = questions.find(q => q.id === matchedId);
        if (matchedQuestion) {
          setHasStarted(true);
          setVideoFinished(false);
          setActiveVideoSlot(matchedId);
          setAiResponseText(result.response || `Entendi! Sintonizando o Vídeo correspondente a: "${matchedQuestion.phrase}"`);
        } else {
          setAiResponseText(`Comando não identificado. Por favor, fale um comando configurado.`);
        }
      } else {
        const phrasesList = questions.map(q => `"${q.phrase}"`).join(" ou ");
        setAiResponseText(`Comando não identificado. Por favor, fale um comando configurado: ${phrasesList}.`);
      }

    } catch (err) {
      // Local strict offline fallback matcher
      const scores = questions.map(q => ({
        id: q.id,
        phrase: q.phrase,
        score: getFuzzyMatchScore(trimmed, q.phrase)
      }));
      const bestMatch = scores.reduce((best, curr) => curr.score > best.score ? curr : best, { id: "", phrase: "", score: 0 });

      if (bestMatch.score > 0.35) {
        setHasStarted(true);
        setVideoFinished(false);
        setActiveVideoSlot(bestMatch.id);
        setAiResponseText(`[Sintonizado] Vídeo correspondido.`);
      } else {
        const phrasesList = questions.map(q => `"${q.phrase}"`).join(" ou ");
        setAiResponseText(`Não foi possível compreender "${trimmed}". Diga exatamente ${phrasesList}.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="ecobot-root" className="min-h-screen bg-[#0b132b] text-slate-100 font-sans flex flex-col selection:bg-sky-400 selection:text-slate-950">
      
      {/* Waveform keyframe for active recording state */}
      <style>{`
        @keyframes customGrow {
          0%, 100% { height: 6px; }
          50% { height: 24px; }
        }
        .v-wave-1 { animation: customGrow 0.5s infinite ease-in-out; }
        .v-wave-2 { animation: customGrow 0.7s infinite ease-in-out 0.12s; }
        .v-wave-3 { animation: customGrow 0.4s infinite ease-in-out 0.24s; }
        .v-wave-4 { animation: customGrow 0.6s infinite ease-in-out 0.36s; }
      `}</style>

      {/* Simplified, neat Navigation Row in Dark Blue */}
      {!hidePanels && (
        <header id="ecobot-nav" className="bg-[#0e1a3a]/90 backdrop-blur-md border-b border-blue-900/60 py-4 px-6 sticky top-0 z-20 shadow-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-950 border-2 border-sky-400 flex items-center justify-center font-display font-black text-xs tracking-wider text-sky-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] select-none">
                WIT
              </div>
              <div>
                <h1 className="font-display font-extrabold text-lg text-white uppercase tracking-tight flex items-center gap-1.5 leading-none">
                  ASSISTENTE VIRTUAL <span className="text-[9px] bg-blue-900 text-sky-200 font-mono px-2 py-0.5 rounded tracking-widest normal-case border border-blue-700">LIVE</span>
                </h1>
                <p className="text-[11px] text-sky-300/80 font-mono mt-0.5">
                  sua assistente virtual e natural
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Swappers to transition between interactive console (chat) and configs (settings) */}
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 tracking-tight uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer ${
                  activeTab === "chat" 
                    ? "bg-blue-600 text-white border-blue-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" 
                    : "bg-[#132247] text-sky-100 border-blue-900/80 hover:bg-[#1a2d5e] hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat / Player</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 tracking-tight uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer ${
                  activeTab === "settings" 
                    ? "bg-blue-600 text-white border-blue-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" 
                    : "bg-[#132247] text-sky-100 border-blue-900/80 hover:bg-[#1a2d5e] hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurações</span>
              </button>

              <div className="w-px h-6 bg-blue-900/80 mx-1 hidden sm:block" />

              <button
                onClick={() => setVideoMuted(prev => !prev)}
                className={`hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border-2 border-blue-900/80 tracking-tight uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-none cursor-pointer ${
                  !videoMuted ? "bg-blue-600 text-white border-blue-400" : "bg-[#132247] text-sky-200 hover:bg-[#1a2d5e]"
                }`}
                title={videoMuted ? "Desmutar áudio" : "Mutar áudio"}
              >
                {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {activeTab === "chat" && (
                <button
                  onClick={() => setHidePanels(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 border-blue-900/80 tracking-tight uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] bg-[#132247] text-sky-100 hover:bg-blue-600 hover:text-white cursor-pointer"
                  title="Ocultar painéis e ampliar vídeo"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ocultar Painel</span>
                </button>
              )}
            </div>

          </div>
        </header>
      )}

      {/* Main Area */}
      <main className={`flex-1 w-full ${hidePanels ? "max-w-7xl px-2 py-4" : "max-w-5xl px-4 py-8"} mx-auto flex flex-col justify-start transition-all duration-300`}>
        
        {/* Floating Restore Button when Options/Panels are Hidden */}
        {hidePanels && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <button
              onClick={() => setHidePanels(false)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase rounded-xl border-2 border-blue-400 shadow-[3px_3px_0px_0px_rgba(11,19,43,0.8)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(11,19,43,0.8)] active:translate-y-[2px] transition-all cursor-pointer select-none"
              title="Restaurar Painel de Controle e Configurações"
            >
              <Eye className="w-4 h-4" />
              <span>Painel Completo</span>
            </button>
          </div>
        )}

        {/* VIEW 1: CHAT & PROJECTION (Simplified, dedicated single panel for interaction) */}
        {activeTab === "chat" && (
          <div className={`space-y-6 animate-fade-in ${hidePanels ? "max-w-7xl" : "max-w-5xl"} mx-auto w-full transition-all duration-300`}>
            
            <div className="bg-[#0f1b3d] border-2 border-blue-900/90 rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(3,7,18,0.7)] text-left flex flex-col gap-6 transition-all duration-300">
              
              {/* Card Header & Controls Toolbar */}
              {hidePanels ? (
                <div className="flex items-center justify-between border-b-2 border-blue-900/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-950 border-2 border-sky-400 flex items-center justify-center font-display font-black text-xs text-sky-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] select-none">
                      WIT
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-sm text-white uppercase tracking-tight flex items-center gap-2 leading-none">
                        ASSISTENTE VIRTUAL
                        <span className="text-[9px] bg-blue-900 text-sky-200 font-mono px-2 py-0.5 rounded tracking-widest uppercase border border-blue-700">
                          MODO INTERAÇÃO
                        </span>
                      </h2>
                      <p className="text-[10px] text-sky-300/80 font-mono mt-0.5">
                        Veja o vídeo e pergunte à assistente
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVideoFit(prev => prev === "contain" ? "cover" : "contain")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono border-2 border-blue-900/80 tracking-tight uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.4)] bg-[#132247] text-sky-100 hover:bg-[#1c3061] cursor-pointer active:translate-y-[1px]"
                      title={videoFit === "contain" ? "Preencher Tela" : "Enquadramento Original"}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{videoFit === "contain" ? "Preencher" : "Original"}</span>
                    </button>

                    <button
                      onClick={() => setVideoMuted(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono border-2 border-blue-900/80 tracking-tight uppercase cursor-pointer transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px] ${
                        !videoMuted ? "bg-blue-600 text-white border-blue-400" : "bg-[#132247] text-sky-200 hover:bg-[#1c3061]"
                      }`}
                      title={videoMuted ? "Desmutar áudio" : "Mutar áudio"}
                    >
                      {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{videoMuted ? "Mudo" : "Com Som"}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs font-mono bg-[#132247] px-2.5 py-1.5 rounded-lg border border-blue-800 text-sky-200">
                      <span className={`w-2 h-2 rounded-full border border-sky-400 ${isListening ? "bg-sky-400 animate-ping" : "bg-blue-700"}`} />
                      <span className="font-bold text-[10px]">{isListening ? "ESCUTANDO" : "PRONTO"}</span>
                    </div>

                    <button
                      onClick={() => setHidePanels(false)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono border-2 border-blue-900/80 tracking-tight uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.4)] bg-[#132247] text-sky-100 hover:bg-blue-600 hover:text-white cursor-pointer active:translate-y-[1px]"
                      title="Voltar ao Painel Completo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Painel Completo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-blue-900/60 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-blue-900 text-sky-200 border border-blue-700 px-2.5 py-0.5 rounded uppercase">
                      ÁREA DE INTERAÇÃO
                    </span>
                    <h2 className="text-sm font-display font-black text-white uppercase tracking-wider mt-1">
                      Visualização de Vídeo & Chat de Voz Local
                    </h2>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão de Enquadramento de Vídeo */}
                    <button
                      onClick={() => setVideoFit(prev => prev === "contain" ? "cover" : "contain")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono border-2 border-blue-900/80 tracking-tight uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] bg-[#132247] text-sky-100 hover:bg-[#1c3061] hover:text-white cursor-pointer active:translate-y-[1px]"
                      title={videoFit === "contain" ? "Preencher Tela (Ajustar Vídeo)" : "Enquadramento Original Proporcional"}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>{videoFit === "contain" ? "Preencher" : "Original"}</span>
                    </button>

                    {/* Botão de Mudo / Som */}
                    <button
                      onClick={() => setVideoMuted(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono border-2 border-blue-900/80 tracking-tight uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[1px] ${
                        !videoMuted ? "bg-blue-600 text-white border-blue-400" : "bg-[#132247] text-sky-200 hover:bg-[#1c3061]"
                      }`}
                      title={videoMuted ? "Desmutar áudio" : "Mutar áudio"}
                    >
                      {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{videoMuted ? "Mudo" : "Com Som"}</span>
                    </button>

                    {/* Botão Ocultar Painel */}
                    <button
                      onClick={() => setHidePanels(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono border-2 border-blue-900/80 tracking-tight uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] bg-[#132247] text-sky-100 hover:bg-blue-600 hover:text-white cursor-pointer active:translate-y-[1px]"
                      title="Ocultar painéis administrativos e deixar apenas vídeo e interação"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar Painel</span>
                    </button>

                    {/* Status de Escuta */}
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-[#132247] px-2.5 py-1.5 rounded-lg border border-blue-800 text-sky-200">
                      <span className={`w-2 h-2 rounded-full border border-sky-400 ${isListening ? "bg-sky-400 animate-ping" : "bg-blue-700"}`} />
                      <span className="font-bold text-[10px]">{isListening ? "ESCUTANDO" : "PRONTO"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visualizer Video Stream Box - 7 out of 12 Columns */}
                <div className="lg:col-span-7 flex flex-col transition-all duration-300">
                  <div className={`bg-zinc-950 border-2 border-black rounded-2xl overflow-hidden relative flex-1 ${hidePanels ? "min-h-[380px] md:min-h-[460px]" : "min-h-[300px] md:min-h-[400px]"} flex flex-col justify-center items-center group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300`}>
                    
                    {/* Note: In-video buttons removed completely so footage is never obstructed */}

                    {!hasStarted ? (
                      <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center z-40 animate-fade-in text-zinc-300">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] opacity-70 pointer-events-none" />
                        
                        <div className="relative mb-6">
                          <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 bg-white text-black text-[8px] font-mono px-1.5 py-0.5 rounded font-black uppercase tracking-wider leading-none">
                            PRONTO
                          </span>
                        </div>

                        <div className="space-y-3 max-w-sm">
                          <h4 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-wider leading-tight">
                            Bem-vindo à Assistente Virtual
                          </h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                            Pronto para iniciar sua jornada de interação natural e automação com nossa assistente virtual.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setHasStarted(true);
                            setVideoMuted(false); // Enable direct audio feedback instantly because we have user gesture!
                            // Try to trigger video play after state transition
                            setTimeout(() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = 0;
                                const p = videoRef.current.play();
                                if (p !== undefined) {
                                  p.catch(err => console.warn("Video failed to play after starting:", err));
                                }
                              }
                            }, 50);
                          }}
                          className="mt-8 px-6 py-3.5 bg-white text-black font-display font-black text-xs uppercase tracking-widest rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[3px] active:shadow-none hover:bg-zinc-200 transition-all cursor-pointer select-none"
                        >
                          Iniciar Experimentação
                        </button>
                      </div>
                    ) : getActiveVideoUrl() ? (
                      <div className="absolute inset-0 bg-black flex items-center justify-center">
                        <video
                          key={activeVideoSlot}
                          ref={videoRef}
                          src={getActiveVideoUrl()}
                          className={`w-full h-full ${videoFit === "contain" ? "object-contain" : "object-cover"} transition-all duration-300`}
                          autoPlay
                          muted={videoMuted}
                          playsInline
                          onEnded={() => {
                            setVideoFinished(true);
                            setShowReplayPrompt(true);
                            setViewedSlots((prev) => {
                              if (prev.includes(activeVideoSlot)) return prev;
                              return [...prev, activeVideoSlot];
                            });
                          }}
                          onError={() => {
                            setVideoPlayError("Não foi possível reproduzir este arquivo de vídeo local.");
                          }}
                        />

                        {/* Top banner tag overlay (only shown when panels are not hidden) */}
                        {!hidePanels && !isIntroSpecialVideo && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-white text-black border-2 border-black text-[9px] font-mono px-3 py-1 rounded-md font-extrabold uppercase shadow-md tracking-wider">
                              {getActiveVideoTitle()}
                            </span>
                          </div>
                        )}

                        {/* END OF VIDEO: SPINNER OR THANK YOU OVERLAYS */}
                        {videoFinished && (
                          allVideosPlayed ? (
                            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md animate-fade-in border-2 border-white">
                              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white flex items-center justify-center text-white mb-4 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                <Sparkles className="w-8 h-8 animate-pulse" />
                              </div>
                              <h3 className="font-display font-black text-sm md:text-base text-white uppercase tracking-wider max-w-md leading-snug">
                                OBRIGADO POR PARTICIPAR DESTA VISITA EM NOSSA FLORESTA DO FUTURO
                              </h3>
                              <p className="text-zinc-400 font-mono text-[10px] mt-2 max-w-xs">
                                Esperamos que você tenha se conectado profundamente com a tecnologia e a preservação ambiental do amanhã.
                              </p>
                              <div className="flex gap-2 mt-5">
                                <button
                                  onClick={() => {
                                    setVideoFinished(false);
                                    if (videoRef.current) {
                                      videoRef.current.currentTime = 0;
                                      const playPromise = videoRef.current.play();
                                      if (playPromise !== undefined) {
                                        playPromise.catch(err => console.warn("Failed to play: ", err));
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[9px] font-bold uppercase rounded border border-zinc-700 transition-all cursor-pointer"
                                >
                                  Reassistir Vídeo
                                </button>
                                <button
                                  onClick={() => {
                                    setViewedSlots([]);
                                    setVideoFinished(false);
                                    setActiveVideoSlot("intro");
                                  }}
                                  className="px-4 py-1.5 bg-white text-black font-mono text-[9px] font-black uppercase rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all hover:bg-zinc-200"
                                >
                                  Reiniciar Visita
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-end p-6 pb-12 text-center z-20 animate-fade-in pointer-events-none">
                              {/* Subtly darkened bottom bar overlay for text readability without overall blackout */}
                              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                              
                              <div className="relative z-10 bg-black/75 border border-white/30 backdrop-blur-md px-5 py-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] max-w-sm flex flex-col items-center gap-2 pointer-events-auto">
                                {/* Glowing spinning circle - compact scale */}
                                <div className="relative flex items-center justify-center mb-1">
                                  <div className="w-10 h-10 rounded-full border-3 border-zinc-800 border-t-white border-r-white/40 border-b-white/15 animate-spin" />
                                  <span className="absolute w-2 h-2 rounded-full bg-white animate-ping" />
                                </div>
                                <h3 className="text-white font-display font-black text-xs tracking-widest uppercase animate-pulse">
                                  ESPERANDO SUA RESPOSTA
                                </h3>
                                <p className="text-zinc-300 font-mono text-[9px] max-w-[280px] leading-relaxed">
                                  Fale um dos comandos sintonizados ou digite ao lado para continuar a jornada!
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <button
                                    onClick={() => {
                                      setVideoFinished(false);
                                      if (videoRef.current) {
                                        videoRef.current.currentTime = 0;
                                        const playPromise = videoRef.current.play();
                                        if (playPromise !== undefined) {
                                          playPromise.catch(err => console.warn("Failed to play: ", err));
                                        }
                                      }
                                    }}
                                    className="px-3 py-1 bg-zinc-900 w-full hover:bg-zinc-800 text-zinc-200 font-mono text-[9px] font-bold uppercase rounded border border-zinc-700 transition-all cursor-pointer shadow-md"
                                  >
                                    Reassistir Vídeo
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center max-w-sm flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md text-zinc-300">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pulse">
                          <Video className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-1 text-center">
                          <h4 className="font-bold text-sm text-white uppercase tracking-wider">Nenhum Vídeo Carregado nesta Rota</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                            Carregue seu vídeo diretamente do computador (.mp4 / .mov). O arquivo fica salvo no seu navegador e não depende do Google Drive.
                          </p>
                        </div>

                        <label className="mt-2 px-4 py-2 bg-white text-black font-mono text-[10px] font-bold uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] cursor-pointer flex items-center gap-1.5 hover:bg-zinc-200 transition-all select-none">
                          <Upload className="w-3.5 h-3.5 text-black" />
                          <span>Carregar Vídeo do Computador</span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileChange(activeVideoSlot, file);
                            }}
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={() => setActiveTab("settings")}
                          className="text-[10px] text-zinc-400 hover:text-white underline font-mono cursor-pointer transition-colors"
                        >
                          Ou gerenciar todos os canais nas Configurações
                        </button>
                      </div>
                    )}

                    {/* Sub-system Alerts inside screen */}
                    {videoPlayError && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-5 text-center z-10 border-2 border-black">
                        <AlertTriangle className="w-8 h-8 text-black mb-1" />
                        <span className="text-[10px] font-mono font-bold text-black block">FALHA DE CARREGAMENTO</span>
                        <p className="text-[11px] text-zinc-600 max-w-xs mt-1 leading-normal font-sans">
                          {videoPlayError}
                        </p>
                        <button
                          onClick={() => setVideoPlayError("")}
                          className="mt-3 px-3 py-1 bg-black text-white hover:bg-zinc-800 text-[10px] font-mono font-bold rounded-lg transition-all border border-black cursor-pointer"
                        >
                          IGNORAR
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Dedicated Channel & Playback Control Bar - Completely Hidden when Ocultar is active */}
                  {!hidePanels && (
                    <div className="mt-3 bg-[#132247] border-2 border-blue-900/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-950 text-sky-300 text-[10px] font-mono px-2.5 py-1 rounded-md flex items-center gap-2 border border-blue-800 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          <span className="font-bold">
                            {getActiveVideoUrl() ? "MÍDIA LOCAL ATIVA" : "SEM MÍDIA NO CANAL"}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-sky-300/80 font-bold hidden sm:inline">
                          ROTAS / CANAIS:
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setActiveVideoSlot("intro")}
                          disabled={!introUrl}
                          className={`px-3 py-1 rounded-lg font-bold font-mono text-[10px] transition-all cursor-pointer border-2 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[1px] hover:shadow-none active:translate-y-[1.5px] disabled:opacity-30 disabled:pointer-events-none ${
                            activeVideoSlot === "intro"
                              ? "bg-blue-600 text-white border-blue-400"
                              : "bg-[#1c3061] text-sky-100 hover:text-white hover:bg-blue-600 border-blue-800"
                          }`}
                          title="Ir para o vídeo de apresentação (Intro)"
                        >
                          Intro
                        </button>
                        {questions.map((q, idx) => (
                          <button
                            key={q.id}
                            onClick={() => setActiveVideoSlot(q.id)}
                            disabled={!q.videoUrl}
                            className={`px-3 py-1 rounded-lg font-bold font-mono text-[10px] transition-all cursor-pointer border-2 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[1px] hover:shadow-none active:translate-y-[1.5px] disabled:opacity-30 disabled:pointer-events-none ${
                              activeVideoSlot === q.id
                                ? "bg-blue-600 text-white border-blue-400"
                                : "bg-[#1c3061] text-sky-100 hover:text-white hover:bg-blue-600 border-blue-800"
                            }`}
                            title={`Canal da Pergunta ${idx + 1}`}
                          >
                            Q{idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Seamless Voice Chat Companion Control & Suggested Questions - A PARTE DO CHAT AZUL CLARO */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  
                  {/* Chat / Voice Input Box in Light Blue */}
                  <div className="bg-[#e0f2fe] border-2 border-[#7dd3fc] rounded-2xl p-4 flex flex-col gap-3.5 shadow-[3px_3px_0px_0px_rgba(11,19,43,0.3)] text-slate-900">
                    
                    <div className="flex flex-col items-center text-center py-1">
                      
                      {/* Large Speak Button */}
                      <button
                        onClick={toggleListening}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 cursor-pointer ${
                          isListening
                            ? "bg-red-600 text-white border-red-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] animate-pulse"
                            : "bg-blue-700 text-white border-blue-950 shadow-[3px_3px_0px_0px_rgba(11,19,43,0.35)] hover:bg-blue-800 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(11,19,43,0.35)] active:translate-y-[2px] active:shadow-none"
                        }`}
                        title={isListening ? "Desativar escuta de voz" : "Ativar assistente para ouvir"}
                      >
                        {isListening ? <MicOff className="w-5.5 h-5.5" /> : <Mic className="w-5.5 h-5.5" />}
                      </button>

                      <div className="mt-2.5">
                        {isListening ? (
                          <div className="space-y-1.5">
                            <span className="text-xs font-mono font-bold text-blue-950 uppercase tracking-wider block animate-pulse">
                              OPERAÇÃO DE ESCUTA ATIVA...
                            </span>
                            
                            {/* Interactive audio lightbars */}
                            <div className="flex items-end justify-center gap-1 h-4 pt-0.5">
                              <div className="w-1 bg-blue-900 rounded-full v-wave-1" />
                              <div className="w-1 bg-blue-600 rounded-full border border-blue-900 v-wave-2" />
                              <div className="w-1 bg-blue-600 rounded-full border border-blue-900 v-wave-3" />
                              <div className="w-1 bg-blue-900 rounded-full v-wave-4" />
                            </div>
                          </div>
                        ) : isAnalyzing ? (
                          <span className="text-xs font-bold text-blue-900 animate-pulse block font-display">
                            Analisando frequências de áudio...
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-sky-900 block font-display">
                            Clique no microfone acima e fale para interagir
                          </span>
                        )}
                      </div>

                      {speechError && (
                        <div className="mt-2.5 w-full p-2 bg-red-100 border border-red-300 text-[10px] text-red-900 rounded font-mono font-bold">
                          {speechError}
                        </div>
                      )}

                    </div>

                    {/* Subtitles & Real-time Matching Dialog Box */}
                    <div className="bg-white border-2 border-sky-300 rounded-xl p-3.5 text-xs shadow-sm">
                      <div>
                        <span className="text-[9px] text-sky-700 font-mono block uppercase font-bold tracking-wider">
                          {isListening ? "Transcrição em Tempo Real:" : "Você perguntou:"}
                        </span>
                        <p className={`font-display font-extrabold italic text-sm mt-0.5 transition-all ${isListening ? "text-blue-950 bg-sky-50 border border-dashed border-sky-400 px-2 py-1.5 rounded animate-pulse" : "text-slate-900"}`}>
                          {isListening 
                            ? (realtimeSpeech ? `"${realtimeSpeech}"` : "Ouvindo atentamente... fale algo") 
                            : (lastSpeechDetected ? `"${lastSpeechDetected}"` : "Aguardando transmissão de voz...")
                          }
                        </p>
                      </div>
                    </div>

                    {/* Manual input backup box if mic is denied in frame */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleIncomingCommand(inputText);
                      }}
                      className="relative"
                    >
                      <input
                        type="text"
                        className="w-full bg-white border-2 border-sky-400 focus:ring-0 focus:border-blue-600 rounded-xl pl-3.5 pr-11 py-2 text-xs text-slate-900 placeholder:text-sky-700/60 font-mono shadow-sm focus:outline-none transition-all"
                        placeholder="Escreva sua pergunta ou comando aqui..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isAnalyzing}
                      />
                      <button
                        type="submit"
                        disabled={isAnalyzing || !inputText.trim()}
                        className="absolute right-1.5 top-1.5 w-7 h-7 rounded-lg bg-blue-600 border border-blue-800 text-white hover:bg-blue-700 transition-all flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-40"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </form>

                  </div>

                  {/* PERGUNTAS SUGERIDAS (em azul claro elegante) */}
                  <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(11,19,43,0.25)] text-left flex flex-col gap-2.5 text-slate-900">
                    <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                        <h3 className="font-display font-extrabold text-xs text-blue-950 uppercase tracking-wider">
                          Perguntas Sugeridas
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono text-sky-800 font-bold uppercase">
                        Fale ou Toque
                      </span>
                    </div>

                    <p className="text-[11px] text-sky-900 font-mono leading-relaxed">
                      Diga ao microfone ou clique em uma das opções abaixo:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {suggestedQuestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => {
                            setHasStarted(true);
                            setVideoFinished(false);
                            if (sug.targetSlotId) {
                              setActiveVideoSlot(sug.targetSlotId);
                              setLastSpeechDetected(sug.text);
                              const targetName = sug.targetSlotId === "intro" 
                                ? "Apresentação Inicial" 
                                : (questions.find(q => q.id === sug.targetSlotId)?.phrase || sug.text);
                              setAiResponseText(`[Sintonia] Transmitindo canal correspondente: "${targetName}"`);
                            } else {
                              handleIncomingCommand(sug.text);
                            }
                          }}
                          className="group flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-600 text-blue-950 hover:text-white border-2 border-sky-300 rounded-xl text-xs font-mono font-bold tracking-tight shadow-sm hover:translate-y-[1px] hover:shadow-none active:translate-y-[1.5px] transition-all cursor-pointer"
                          title={`Perguntar: "${sug.text}"`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 group-hover:bg-white shrink-0 transition-colors" />
                          <span>"{sug.text}"</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Micro Quick Reference Hint box */}
            {!hidePanels && (
              <div className="bg-[#0f1b3d] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between border-2 border-dashed border-blue-900/80 gap-4 text-left text-sky-200">
                <div className="flex gap-2.5 items-start">
                  <div className="bg-[#172752] border border-blue-700 text-[10px] h-6 px-2 rounded-lg py-0.5 font-mono text-sky-200 font-bold flex items-center shrink-0">
                    GATILHOS ATIVOS
                  </div>
                  <p className="text-[11px] text-sky-200/90 leading-relaxed">
                    Fale um de seus gatilhos configurados:{" "}
                    {questions.map((q, idx) => (
                      <span key={q.id}>
                        <strong className="text-white">"{q.phrase}"</strong>
                        {idx < questions.length - 1 ? " ou " : ""}
                      </span>
                    ))}
                    .
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="bg-[#132247] hover:bg-blue-600 border border-blue-700 rounded-lg px-3 py-1 font-mono text-[9px] font-bold text-sky-100 hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    MODIFICAR FRASES / ADICIONAR MAIS
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: AJUSTES DA CENTRAL (The dedicated config window requested by the user) */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-black text-white border border-black px-2.5 py-0.5 rounded uppercase">
                    Janela de Configurações
                  </span>
                  <h2 className="text-md font-display font-black text-black uppercase tracking-wider mt-1">
                    Gatilhos de Voz & Upload de Vídeos Locais
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 leading-normal">
                    Carregue nesta janela os arquivos correspondentes aos vídeos locais e configure quais perguntas acionam sua exibição.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAllTriggers}
                    className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black text-[11px] font-bold px-3 py-1.5 rounded-lg border border-zinc-300 transition-all cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Redefinir Tudo</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center gap-1 bg-black text-white hover:bg-zinc-800 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <span>Voltar ao Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic UI holding uploader for intro and custom triggers list */}
              <div className="space-y-8">

                {/* GOOGLE DRIVE INTEGRATION SYSTEM */}
                <div id="google-drive-system" className="border-3 border-black rounded-2xl p-6 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-black flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                        <Cloud className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h3 className="font-display font-extrabold text-sm text-black uppercase tracking-wide flex items-center gap-2">
                          Sincronização com Google Drive
                          <span className="text-[8px] bg-zinc-200 text-black border border-black font-mono px-2 py-0.5 rounded tracking-wider leading-none">OPCIONAL</span>
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Opcional: use apenas se quiser puxar vídeos de uma pasta do Drive. O carregamento direto de arquivos (.mp4/.mov) funciona 100% offline e persiste no seu navegador.
                        </p>
                      </div>
                    </div>

                    {googleAccessToken && (
                      <button
                        onClick={handleGoogleLogout}
                        className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-black text-[10px] font-bold font-mono uppercase px-3 py-1.5 rounded-lg border border-zinc-300 transition-all cursor-pointer shadow-sm ml-auto sm:ml-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Desconectar Conta</span>
                      </button>
                    )}
                  </div>

                  {!googleAccessToken ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {/* Connection Setup panel */}
                      <div className="bg-white border-2 border-black rounded-xl p-5 flex flex-col justify-between gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">OPÇÃO A • CONEXÃO VIA CLIENT ID</span>
                          <p className="text-xs text-zinc-600 leading-normal mt-2">
                            Insira seu <strong>Google OAuth Client ID</strong> para logar diretamente com sua conta e obter o token de stream.
                          </p>

                          <div className="mt-4 space-y-2">
                            <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase block">Google Client ID:</label>
                            <input
                              type="text"
                              value={googleClientId}
                              onChange={(e) => setGoogleClientId(e.target.value)}
                              placeholder="ex: 1234567-abcdef.apps.googleusercontent.com"
                              className="w-full bg-slate-50 border border-zinc-200 focus:border-black rounded-lg px-2.5 py-2 text-xs text-black focus:outline-none font-mono placeholder-zinc-400 transition-all"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleGoogleLogin}
                          disabled={!googleClientId}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-black text-white border-2 border-black rounded-xl font-bold font-mono text-[11px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1.5px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2.5px] active:shadow-none transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer hover:bg-zinc-800"
                        >
                          <Chrome className="w-4 h-4" />
                          <span>Autenticar com Google</span>
                        </button>
                      </div>

                      {/* Manual/Direct setup or tutorial help */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex flex-col justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">OPÇÃO B • CARREGAMENTO DE TOKEN MANUAL / SUPORTE</span>
                          
                          <form onSubmit={handleManualTokenSubmit} className="mt-4 space-y-2">
                            <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase block">Colar Token Google temporário (Access Token):</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                placeholder="Coloque o token aqui..."
                                className="flex-1 bg-white border border-zinc-250 focus:border-black rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none font-mono"
                              />
                              <button
                                type="submit"
                                disabled={!tokenInput}
                                className="bg-black text-white hover:bg-zinc-800 hover:border-black border border-black font-mono text-[10px] font-bold uppercase px-3 rounded-lg transition-all disabled:opacity-40"
                              >
                                Ativar
                              </button>
                            </div>
                          </form>
                        </div>

                        <div className="border-t border-zinc-200 pt-3">
                          <button
                            type="button"
                            onClick={() => setShowGuide(prev => !prev)}
                            className="text-zinc-600 hover:text-black font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-zinc-700" />
                            <span>{showGuide ? "Ocultar tutorial passo a passo" : "Como configurar seu Client ID no Google Cloud? (Mostrar)"}</span>
                          </button>

                          {showGuide && (
                            <div className="mt-2 bg-white rounded-lg p-3 text-[10.5px] text-zinc-650 leading-relaxed space-y-1.5 border border-zinc-200 max-h-[150px] overflow-y-auto">
                              <p><strong>Para começar, crie as credenciais:</strong></p>
                              <ol className="list-decimal pl-4 space-y-0.5 font-sans">
                                <li>Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-black underline font-bold">Google Cloud Console</a>.</li>
                                <li>Crie um projeto e pesquise por <strong>Drive API</strong> na barra ou menu lateral. Ative a API.</li>
                                <li>Acesse a tela de permissão OAuth e configure um escopo externo (básico / teste).</li>
                                <li>Vá em <strong>Credenciais</strong> &gt; <strong>Criar Credenciais</strong> &gt; <strong>ID do cliente OAuth</strong>.</li>
                                <li>Selecione <strong>Aplicativo da Web</strong> sob tipo de aplicativo.</li>
                                <li>Em <strong>Origens JavaScript autorizadas</strong> adicione: <code className="bg-zinc-100 font-mono px-1 py-0.5 rounded text-black text-[9.5px]">{window.location.origin}</code></li>
                                <li>Em <strong>URIs de redirecionamento autorizados</strong> adicione: <code className="bg-zinc-100 font-mono px-1 py-0.5 rounded text-black text-[9.5px]">{window.location.origin}</code></li>
                                <li>Clique em criar, copie o <strong>Client ID</strong> gerado e cole no campo ao lado!</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Authenticated State: Google Drive File Explorer Component */
                    <div className="space-y-4">
                      {/* Explorer Control Bar: Folder Breadcrumbs & Search bar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-100 p-3 rounded-xl border border-zinc-200">
                        {/* Folder Breadcrumbs */}
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold flex-wrap text-zinc-600 w-full sm:w-auto">
                          <Database className="w-4 h-4 text-zinc-700 shrink-0 mr-1" />
                          {folderHistory.map((folder, index) => (
                            <React.Fragment key={folder.id}>
                              {index > 0 && <span className="text-zinc-400 mx-0.5">/</span>}
                              <button
                                onClick={() => handleBreadcrumbClick(index)}
                                className={`hover:text-black underline transition-colors cursor-pointer ${index === folderHistory.length - 1 ? "text-black underline font-black" : ""}`}
                              >
                                {folder.name}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Search in Google Drive */}
                        <div className="relative w-full sm:w-64 shrink-0">
                          <input
                            type="text"
                            placeholder="Buscar vídeos no Drive..."
                            className="w-full bg-white border border-zinc-300 focus:border-black rounded-lg pl-3 pr-8 py-1.5 text-xs text-black focus:outline-none"
                            value={driveSearchQuery}
                            onChange={(e) => {
                              setDriveSearchQuery(e.target.value);
                              fetchGoogleDriveFiles(currentFolderId, e.target.value);
                            }}
                          />
                          <button
                            onClick={() => fetchGoogleDriveFiles(currentFolderId, driveSearchQuery)}
                            className="absolute right-2 top-2 hover:text-black text-zinc-400 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Folder Content Loader / List */}
                      {driveError && (
                        <div className="p-4 bg-zinc-100 border border-zinc-300 rounded-xl text-center text-xs text-black font-mono">
                          {driveError}
                          <button
                            onClick={() => fetchGoogleDriveFiles(currentFolderId, driveSearchQuery)}
                            className="ml-3 underline hover:text-zinc-700 font-bold font-sans cursor-pointer"
                          >
                            TENTAR NOVAMENTE
                          </button>
                        </div>
                      )}

                      {isDriveLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 rounded-full border-3 border-zinc-300 border-t-black animate-spin" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Lendo arquivos na nuvem do Google...</span>
                        </div>
                      ) : googleFiles && googleFiles.length === 0 ? (
                        <div className="py-12 bg-white border-2 border-dashed border-zinc-200 rounded-xl text-center max-w-sm mx-auto flex flex-col items-center gap-2">
                          <Cloud className="w-8 h-8 text-zinc-300" />
                          <div className="space-y-1">
                            <h5 className="text-[11px] font-mono font-bold text-zinc-650 uppercase">Nenhum diretório ou vídeo localizado</h5>
                            <p className="text-[10px] text-zinc-400 leading-normal px-4">
                              Não encontramos pastas ou vídeos correspondentes nesta pasta. Verifique as restrições ou altere sua pasta raiz.
                            </p>
                          </div>
                        </div>
                      ) : googleFiles ? (
                        <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-h-[350px] overflow-y-auto w-full">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-zinc-50 border-b border-black font-mono font-bold text-[10px] text-zinc-500 uppercase">
                                <th className="p-3 pl-4">Tipo / Nome do Item</th>
                                <th className="p-3 hidden sm:table-cell">MimeType</th>
                                <th className="p-3 text-right pr-4">Ação de Sintonia</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                              {/* Sub-Folders lists first */}
                              {/* Back folder option if path helper indicates */}
                              {currentFolderId !== "root" && (
                                <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleBreadcrumbClick(folderHistory.length - 2)}>
                                  <td className="p-3 pl-4 flex items-center gap-2 font-semibold">
                                    <FolderOpen className="w-4 h-4 text-zinc-800 shrink-0" />
                                    <span>.. [Voltar uma pasta]</span>
                                  </td>
                                  <td className="p-3 hidden sm:table-cell font-mono text-[10px] text-zinc-400">Diretório Pai</td>
                                  <td className="p-3 text-right pr-4">
                                    <span className="text-[10px] text-zinc-400 font-mono italic">Navegar acima</span>
                                  </td>
                                </tr>
                              )}

                              {googleFiles.map((file) => {
                                const isFolder = file.mimeType === "application/vnd.google-apps.folder";

                                return (
                                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 pl-4">
                                      {isFolder ? (
                                        <button
                                          onClick={() => handleFolderClick(file)}
                                          className="flex items-center gap-2 text-left font-semibold text-black hover:underline cursor-pointer"
                                        >
                                          <Folder className="w-4 h-4 text-zinc-800 shrink-0" />
                                          <span>{file.name}</span>
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-2 text-zinc-700">
                                          <Video className="w-4 h-4 text-zinc-800 shrink-0" />
                                          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                                        </div>
                                      )}
                                    </td>
                                    
                                    <td className="p-3 hidden sm:table-cell font-mono text-[10px] text-zinc-400">
                                      {file.mimeType.replace("application/vnd.google-apps.folder", "Diretório")}
                                    </td>

                                    <td className="p-3 text-right pr-4">
                                      {isFolder ? (
                                        <button
                                          onClick={() => handleFolderClick(file)}
                                          className="px-2.5 py-1 bg-black text-white hover:bg-zinc-800 font-mono text-[10px] font-bold rounded-md border border-black cursor-pointer transition-colors"
                                        >
                                          ABRIR PASTA
                                        </button>
                                      ) : (
                                        <div className="flex items-center justify-end gap-1">
                                          {/* Options triggers for videos matchings */}
                                          <button
                                            onClick={() => {
                                              setIntroDriveId(file.id);
                                              setIntroUrl(""); // Override browser local file
                                              setIntroName(`[Drive] ${file.name}`);
                                              setActiveVideoSlot("intro");
                                              alert(`Vídeo de apresentação sintonizado com sucesso em "${file.name}" do Drive!`);
                                            }}
                                            className="px-2 py-1 bg-white hover:bg-zinc-100 text-black border border-black text-[9px] font-mono font-bold rounded-md transition-all shrink-0 cursor-pointer shadow-sm active:translate-y-0.5"
                                          >
                                            🎯 INTRO
                                          </button>

                                          {questions.map((q, qidx) => (
                                            <button
                                              key={q.id}
                                              onClick={() => {
                                                setQuestions(prev => prev.map(item => {
                                                  if (item.id === q.id) {
                                                    return { ...item, googleDriveId: file.id, videoUrl: "", videoName: `[Drive] ${file.name}` };
                                                  }
                                                  return item;
                                                }));
                                                setActiveVideoSlot(q.id);
                                                alert(`Pergunta #${qidx + 1} sintonizada com o vídeo "${file.name}" do Drive!`);
                                              }}
                                              className="px-2 py-1 bg-zinc-100 hover:bg-black hover:text-white text-[9px] text-black font-mono font-bold rounded-md border border-black transition-all shrink-0 cursor-pointer shadow-sm active:translate-y-0.5"
                                              title={`Sintonizar canal de Pergunta ${qidx + 1}`}
                                            >
                                              Q{qidx + 1}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* 1. APRESENTAÇÃO INICIAL */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    1. Fluxo de Boas-Vindas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-zinc-50 border-2 border-black rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div>
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                          <span className="text-xs font-mono font-bold text-black uppercase tracking-wide">
                            Vídeo Principal (Intro)
                          </span>
                          {introUrl && (
                            <span className="text-[9px] bg-zinc-200 text-black px-1.5 py-0.5 rounded-md font-extrabold font-mono border border-zinc-400">
                              SALVO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-normal mt-2">
                          Vídeo exibido na inicialização e quando solicitado o retorno ao início do portal ("iniciar", "voltar").
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="border-2 border-dashed border-zinc-300 hover:border-black bg-white rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-[11px] min-h-[100px]">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileChange("intro", file);
                            }}
                            className="hidden"
                          />
                          <Upload className="w-4.5 h-4.5 text-zinc-400 mb-1" />
                          {introName ? (
                            <span className="text-black font-extrabold max-w-full truncate block px-1 text-[10px] font-mono">
                              {introName}
                            </span>
                          ) : (
                            <span className="text-zinc-400">Escolha o arquivo (.mp4/.mov)</span>
                          )}
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (introUrl) {
                                setActiveVideoSlot("intro");
                                setActiveTab("chat");
                              }
                            }}
                            disabled={!introUrl}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white hover:bg-zinc-50 active:bg-zinc-100 border border-black rounded-lg text-zinc-700 hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold font-mono text-[9.5px] uppercase shadow-sm"
                          >
                            Testar Intro
                          </button>
                          {(introUrl || introName) && (
                            <button
                              type="button"
                              onClick={() => clearVideo("intro")}
                              className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 border border-black rounded-lg text-black font-mono text-[9.5px] font-bold uppercase transition-all cursor-pointer shadow-sm"
                              title="Remover vídeo de introdução"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-2xl p-6 flex flex-col justify-center text-left">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white mb-3">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-black text-black text-sm uppercase">Como funciona a Sintonia de Vídeo?</h4>
                      <p className="text-xs text-zinc-650 leading-relaxed mt-2">
                        A Assistente Virtual associa transições de tela a comandos falados. Ao pronunciar a frase cadastrada de qualquer canal, o player alterna instantaneamente a visualização para o vídeo local programado.
                      </p>
                      <p className="text-xs text-zinc-650 leading-relaxed mt-1">
                        Utilizamos um modelo de inteligência artificial de casamento aproximado ("fuzzy matching") que funciona de forma 100% offline se você estiver sem internet, e opcionalmente estende a inteligência semântica caso a chave Gemini API esteja configurada.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. GATILHOS PERSONALIZADOS */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-2 mb-4">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        2. Perguntas e Gatilhos de Voz Personalizados
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Cadastre novas perguntas e clique para subir vídeos correspondentes. O céu é o limite!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center justify-center gap-1.5 bg-black text-white hover:bg-zinc-800 font-bold text-xs uppercase px-4 py-2 rounded-xl border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none cursor-pointer"
                    >
                      <span>+ Adicionar Pergunta</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="bg-zinc-50 border-2 border-black rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group relative text-left"
                      >
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                          <span className="text-xs font-mono font-bold text-black uppercase tracking-wide">
                            Gatilho #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {q.videoUrl && (
                              <span className="text-[9px] bg-zinc-200 text-black px-1.5 py-0.5 rounded-md font-extrabold font-mono border border-zinc-400">
                                ATIVO
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="text-zinc-400 hover:text-black transition-colors p-1"
                              title="Excluir Pergunta"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">Comando de voz (Frase Exata):</span>
                            <input
                              type="text"
                              className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none font-semibold font-mono"
                              value={q.phrase}
                              onChange={(e) => updateQuestionPhrase(q.id, e.target.value)}
                              placeholder="Ex: nova frase de ativação"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">Arquivo de Vídeo local:</span>
                            <label className="border-2 border-dashed border-zinc-300 hover:border-black bg-white rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-[11px] min-h-[70px]">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileChange(q.id, file);
                                }}
                                className="hidden"
                              />
                              <Upload className="w-4 h-4 text-zinc-400" />
                              {q.videoName ? (
                                <span className="text-black font-extrabold max-w-full truncate block px-1 text-[10px] font-mono">
                                  {q.videoName}
                                </span>
                              ) : (
                                <span className="text-zinc-400">Escolha o arquivo (.mp4/.mov)</span>
                              )}
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (q.videoUrl) {
                                  setActiveVideoSlot(q.id);
                                  setActiveTab("chat");
                                }
                              }}
                              disabled={!q.videoUrl}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white hover:bg-zinc-50 active:bg-zinc-100 border border-black rounded-lg text-zinc-700 hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold font-mono text-[9.5px] uppercase shadow-sm"
                            >
                              Testar Canal #{idx + 1}
                            </button>
                            {(q.videoUrl || q.videoName) && (
                              <button
                                type="button"
                                onClick={() => clearVideo(q.id)}
                                className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 border border-black rounded-lg text-black font-mono text-[9.5px] font-bold uppercase transition-all cursor-pointer shadow-sm"
                                title="Remover vídeo deste canal"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Botão de adicionar atalho na lista */}
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="border-2 border-dashed border-zinc-300 hover:border-black rounded-2xl p-6 flex flex-col justify-center items-center gap-3 hover:bg-zinc-50 transition-all cursor-pointer text-zinc-400 hover:text-zinc-700 min-h-[250px]"
                    >
                      <div className="w-12 h-12 rounded-full border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 group-hover:border-black">
                        <span className="text-xl leading-none font-bold">+</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-wider font-mono block">Criar Novo Gatilho</span>
                        <span className="text-[10px] text-zinc-400 mt-1 max-w-[200px] block mx-auto leading-normal">
                          Adicione mais um vídeo e sua respectiva frase de ativação de voz local.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. GERENCIADOR DE PERGUNTAS SUGERIDAS PARA O USUÁRIO */}
                <div>
                  <div className="border-3 border-black rounded-2xl p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-sm text-black uppercase tracking-wide flex items-center gap-2">
                            3. Perguntas Sugeridas para o Usuário
                            <span className="text-[8px] bg-black text-white font-mono px-2 py-0.5 rounded tracking-wider">PERSONALIZÁVEL</span>
                          </h3>
                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            Escreva aqui as perguntas que devem aparecer como sugestão no player para os visitantes falarem ou clicarem.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={syncSuggestionsWithChannels}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-[10px] font-bold uppercase rounded-lg border border-zinc-300 transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
                          title="Gerar sugestões automaticamente a partir dos canais e frases cadastradas"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Puxar Frases dos Canais</span>
                        </button>

                        <button
                          type="button"
                          onClick={addSuggestedQuestion}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white font-mono text-[10px] font-bold uppercase rounded-lg border border-black transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
                        >
                          <span>+ Adicionar Pergunta</span>
                        </button>
                      </div>
                    </div>

                    {/* Lista de Perguntas Sugeridas */}
                    <div className="space-y-3">
                      {suggestedQuestions.map((sug, index) => (
                        <div
                          key={sug.id}
                          className="bg-zinc-50 border-2 border-zinc-300 hover:border-black rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-all"
                        >
                          <div className="flex items-center gap-2.5 flex-1">
                            <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1 space-y-1">
                              <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">
                                Pergunta que aparecerá para o usuário:
                              </label>
                              <input
                                type="text"
                                value={sug.text}
                                onChange={(e) => updateSuggestedQuestionText(sug.id, e.target.value)}
                                placeholder="Ex: Como funciona a floresta?"
                                className="w-full bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-1.5 text-xs text-black font-mono font-semibold focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="space-y-1 min-w-[220px]">
                              <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">
                                Vídeo correspondente sintonizado:
                              </label>
                              <select
                                value={sug.targetSlotId || "intro"}
                                onChange={(e) => updateSuggestedQuestionTarget(sug.id, e.target.value)}
                                className="w-full bg-white border border-zinc-300 focus:border-black rounded-lg px-2.5 py-1.5 text-xs text-black font-mono focus:outline-none cursor-pointer"
                              >
                                <option value="intro">Intro (Apresentação Inicial)</option>
                                {questions.map((q, qIdx) => (
                                  <option key={q.id} value={q.id}>
                                    Canal #{qIdx + 1} - "{q.phrase || 'Sem frase'}" {q.videoName ? `(${q.videoName})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSuggestedQuestion(sug.id)}
                              className="p-2 text-zinc-400 hover:text-black transition-colors rounded-lg hover:bg-zinc-200 cursor-pointer self-end md:self-center"
                              title="Excluir pergunta sugerida"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      {suggestedQuestions.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50">
                          <p className="text-xs text-zinc-500 font-mono">Nenhuma pergunta sugerida configurada.</p>
                          <button
                            type="button"
                            onClick={addSuggestedQuestion}
                            className="mt-2 text-xs font-mono font-bold text-black underline cursor-pointer"
                          >
                            Clique aqui para adicionar sua primeira pergunta sugerida
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preview box */}
                    <div className="mt-5 pt-3 border-t border-zinc-200">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block mb-2">
                        Pré-visualização dos botões no player:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((sug) => (
                          <span
                            key={sug.id}
                            className="px-3 py-1.5 bg-zinc-100 text-black border border-black rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-black" />
                            "{sug.text}"
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Clean Aesthetic Footer */}
      {!hidePanels && (
        <footer id="ecobot-footer" className="mt-auto py-6 border-t border-blue-900/60 bg-[#0e1a3a]/80">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-sky-300/60 gap-2">
            <span>WIT ASSISTENTE VIRTUAL — CONSOLE LOCAL DE TRANSMISSÃO</span>
            <span>© SINTONIA DIRETA E SEGURA</span>
          </div>
        </footer>
      )}

      {/* Floating Action Button to Restore Panels & Restart (Visible only when panels are hidden) */}
      {hidePanels && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-24 bg-transparent flex items-end pb-4 justify-center pointer-events-auto z-50 group select-none">
          <div className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setHidePanels(false)}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-blue-600 text-white hover:bg-blue-500 font-display font-black text-xs uppercase tracking-widest rounded-full border-2 border-blue-400 shadow-[4px_4px_0px_0px_rgba(11,19,43,0.8)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(11,19,43,0.8)] active:translate-y-[2px] active:shadow-none transition-all duration-300 cursor-pointer"
              title="Mostrar Chat, Configurações e todos os controles de volta"
            >
              <Eye className="w-4 h-4 animate-pulse" />
              <span>Retornar com o Painel</span>
            </button>

            <button
              onClick={() => {
                setHasStarted(false);
                setHidePanels(false);
              }}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-[#132247] text-sky-100 hover:bg-blue-600 hover:text-white font-display font-black text-xs uppercase tracking-widest rounded-full border-2 border-blue-800 shadow-[4px_4px_0px_0px_rgba(11,19,43,0.8)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(11,19,43,0.8)] active:translate-y-[2px] active:shadow-none transition-all duration-300 cursor-pointer"
              title="Reiniciar toda a experimentação e voltar para a tela inicial"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Experimentação</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
