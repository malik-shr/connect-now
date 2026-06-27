"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import BackButton from "~/app/_components/BackButton";

interface Message {
  id: string;
  sender: "user" | "installer" | "system";
  text: string;
  timestamp: string;
  file?: {
    name: string;
    size: string;
    type: string;
  };
}

const TOPICS = [
  {
    id: "docs",
    title: "Unterlagen & Vollmachten",
    icon: "📄",
    description: "Hilfe bei fehlenden Dokumenten wie der Betreibervollmacht.",
    defaultText: "Hallo, mir fehlt noch die 'Vollmacht des Anlagenbetreibers'. Können Sie mir helfen, diese auszufüllen und hochzuladen?",
  },
  {
    id: "metering",
    title: "Messkonzept & Zähler",
    icon: "🔌",
    description: "Rückfragen zum Messkonzept-Builder oder Zählerplatz.",
    defaultText: "Hallo, ich bin mir unsicher, welches Messkonzept für meine PV-Anlage mit Speicher am besten geeignet ist.",
  },
  {
    id: "technical",
    title: "Technische Parameter",
    icon: "📋",
    description: "Klärung von Datenblatt-Werten, Wechselrichter oder NA-Schutz.",
    defaultText: "Hallo, ich habe Fragen zum Datenblatt des Wechselrichters (E.8) und den geforderten Angaben.",
  },
  {
    id: "general",
    title: "Sonstige Rückfragen",
    icon: "❓",
    description: "Allgemeine Fragen zum Ablauf oder Terminen der Inbetriebnahme.",
    defaultText: "Hallo, ich wollte mich erkundigen, wie lange die Prüfung durch den Netzbetreiber in der Regel dauert.",
  },
];

const MATCHING_STEPS = [
  "Übermittle Anfrage-Details...",
  "Analysiere Dokumenten- und Anlagenstatus...",
  "Suche qualifizierten Installateur in Ihrer Region...",
  "Max Weber (Weber Solartechnik GmbH) gefunden!",
  "Initialisiere sichere Chatverbindung...",
];

export default function SupportPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  // States
  const [viewState, setViewState] = useState<"intake" | "matching" | "chat">("intake");
  const [selectedTopic, setSelectedTopic] = useState("docs");
  const [description, setDescription] = useState(TOPICS[0]!.defaultText);
  const [matchingIndex, setMatchingIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [ticketStatus, setTicketStatus] = useState<"Aktiv" | "Gelöst">("Aktiv");
  
  // File upload simulation
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle Topic Change
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = TOPICS.find((t) => t.id === topicId);
    if (topic) {
      setDescription(topic.defaultText);
    }
  };

  // Start Matching Simulation
  const startMatching = (e: React.FormEvent) => {
    e.preventDefault();
    setViewState("matching");
    setMatchingIndex(0);
  };

  // Step through matching phases
  useEffect(() => {
    if (viewState !== "matching") return;

    if (matchingIndex < MATCHING_STEPS.length) {
      const timer = setTimeout(() => {
        setMatchingIndex((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      // Initialize Chat
      const topicObj = TOPICS.find((t) => t.id === selectedTopic);
      const initialMsgs: Message[] = [
        {
          id: "sys-1",
          sender: "system",
          text: `Support-Ticket #SR-8492 wurde erstellt. Kategorie: ${topicObj?.title}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "sys-2",
          sender: "system",
          text: "Installateur Max Weber ist dem Chat beigetreten.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "msg-init-user",
          sender: "user",
          text: description,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];

      setMessages(initialMsgs);
      setViewState("chat");
      
      // Delay installer's first response
      const timer = setTimeout(() => {
        setIsTyping(true);
        const typingTimer = setTimeout(() => {
          setIsTyping(false);
          let replyText = "Hallo! Ich bin Max, Ihr zugeordneter Installateur für dieses Anschlussbegehren. Ich helfe Ihnen gerne dabei, Ihre Unterlagen fertigzustellen.";
          if (selectedTopic === "docs") {
            replyText += " Ich sehe gerade im Status-Portal, dass Ihnen noch die 'Vollmacht des Anlagenbetreibers' fehlt. Haben Sie das Dokument bereits vorliegen oder benötigen Sie das Formular zum Unterschreiben?";
          } else if (selectedTopic === "metering") {
            replyText += " Für eine PV-Anlage mit Speicher empfehle ich meistens ein Überschusseinspeisung-Messkonzept mit separater Erfassung. Haben Sie schon einen bestimmten Zählerplatz im Auge?";
          } else {
            replyText += " Lassen Sie uns das kurz gemeinsam ansehen. Wo genau hängen Sie gerade fest?";
          }

          setMessages((prev) => [
            ...prev,
            {
              id: "msg-reply-1",
              sender: "installer",
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }, 1500);
        return () => clearTimeout(typingTimer);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [viewState, matchingIndex]);

  // Send Message
  const handleSendMessage = (textToSend?: string, attachedFile?: Message["file"]) => {
    const text = textToSend || inputValue;
    if (!text && !attachedFile) return;

    if (!textToSend) setInputValue("");

    const newMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: attachedFile,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Handle automated flow replies
    setIsTyping(true);
    const nextStep = chatStep + 1;
    setChatStep(nextStep);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";

      if (attachedFile) {
        // User uploaded a document!
        replyText = "Hervorragend, vielen Dank! Das Dokument 'Vollmacht_unterschrieben.pdf' sieht absolut vollständig aus: Name, Adresse und Unterschrift passen.";
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-installer-${Date.now()}`,
            sender: "installer",
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);

        // Trigger double-response: submission confirmation!
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-installer-sub-${Date.now()}`,
                sender: "installer",
                text: "Da nun alle Pflichtdokumente vorliegen, habe ich Ihr Netzanschlussbegehren soeben offiziell an den Netzbetreiber übermittelt! Ihr Status im Portal wurde auf 'In Prüfung' aktualisiert. Sie können den Fortschritt live im Status-Portal mitverfolgen. Kann ich sonst noch etwas für Sie tun?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]);
          }, 1500);
        }, 1200);
        return;
      }

      // Text replies based on step/keywords
      const userText = text.toLowerCase();
      if (userText.includes("vollmacht") || userText.includes("dokument") || userText.includes("vorlage") || userText.includes("formular")) {
        replyText = "Sie können die offizielle Vorlage der Betreibervollmacht direkt ausfüllen, unterschreiben und mir hier im Chat hochladen. Ziehen Sie die PDF-Datei einfach in dieses Chatfenster oder klicken Sie auf das Büroklammer-Symbol unten links.";
      } else if (userText.includes("danke") || userText.includes("super") || userText.includes("perfekt") || userText.includes("erledigt")) {
        replyText = "Sehr gerne! Ich schließe dieses Support-Ticket hiermit. Falls noch etwas sein sollte, können Sie jederzeit einen neuen Support-Request starten. Viel Erfolg weiterhin und einen schönen Tag! ☀️";
        setTicketStatus("Gelöst");
      } else {
        if (nextStep === 1) {
          replyText = "Alles klar, verstanden. Laden Sie am besten die entsprechende Datei oder ein Foto hoch, damit ich die Details direkt mit den technischen Anforderungen im Portal abgleichen kann. Ich bin hier, um das für Sie zu regeln.";
        } else {
          replyText = "Kein Problem, das kriegen wir hin. Haben Sie noch weitere Fragen dazu, oder wollen wir das Thema direkt für Sie einreichen?";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-installer-${Date.now()}`,
          sender: "installer",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1500);
  };

  // Simulate file upload
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSendMessage(`Ich habe das Dokument hochgeladen: ${file.name}`, {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type || "application/pdf",
      });
    }
  };

  // Helper shortcut to upload document during demo
  const uploadMockVollmacht = () => {
    handleSendMessage("Ich habe die unterschriebene Vollmacht ausgefüllt.", {
      name: "Vollmacht_Betreiber_signiert.pdf",
      size: "1.2 MB",
      type: "application/pdf",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Context Breadcrumbs */}
        <div className="flex items-center justify-between">
          <BackButton href={`/orders/${orderId}`} />
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
            Vorgangs-ID: {orderId}
          </span>
        </div>

        {/* --- VIEW 1: INTAKE FORM --- */}
        {viewState === "intake" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 transition-all duration-300">
            <header className="border-b border-slate-200 pb-5 mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                Expertenservice · Installateur-Hilfe
              </span>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Hilfe anfordern
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Wählen Sie einen Bereich aus. Wir matchen Sie direkt mit einem zertifizierten Elektroinstallateur, der Ihnen per Live-Chat hilft.
              </p>
            </header>

            <form onSubmit={startMatching} className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-3">
                  Wobei benötigen Sie Unterstützung?
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicSelect(topic.id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                        selectedTopic === topic.id
                          ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-2xl mb-2">{topic.icon}</span>
                      <span className="text-sm font-bold text-slate-800">{topic.title}</span>
                      <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {topic.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-bold text-slate-700 block mb-2">
                  Beschreiben Sie Ihr Anliegen
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50"
                  required
                />
              </div>

              {/* Mock Upload Zone */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Dokument anhängen (Optional)
                </label>
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-500 cursor-pointer bg-slate-50/30 transition"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf,image/*"
                  />
                  <span className="text-2xl block mb-2">📤</span>
                  <span className="text-sm font-semibold text-slate-600 block">
                    Datei per Drag & Drop hier ablegen oder durchsuchen
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    PDF, PNG oder JPG bis 10 MB
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5 cursor-pointer"
                >
                  ⚡ Support-Anfrage starten
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- VIEW 2: MATCHING ANIMATION --- */}
        {viewState === "matching" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl text-center min-h-[450px] flex flex-col justify-center items-center transition-all duration-300">
            {/* Pulsing loading ring */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute h-24 w-24 rounded-full border-4 border-blue-500/30 animate-ping" />
              <div className="relative h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-extrabold text-blue-600 shadow-md">
                ⚡
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Verbinde mit Partner-Installateur
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              Wir ermitteln einen zertifizierten Elektro-Fachpartner für Ihren Netzanschluss.
            </p>

            {/* Displaying active matching progress */}
            <div className="mt-8 space-y-3 w-full max-w-md">
              {MATCHING_STEPS.map((step, idx) => {
                const isActive = idx === matchingIndex;
                const isCompleted = idx < matchingIndex;
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-300 ${
                      isActive
                        ? "border-blue-200 bg-blue-50/50 text-blue-800 font-semibold"
                        : isCompleted
                          ? "border-emerald-100 bg-emerald-50/30 text-emerald-800 opacity-80"
                          : "border-slate-100 bg-slate-50/10 text-slate-400 opacity-40"
                    }`}
                  >
                    <span className="text-sm shrink-0">
                      {isCompleted ? "✓" : isActive ? "📡" : "○"}
                    </span>
                    <span className="text-xs">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW 3: CHAT VIEW --- */}
        {viewState === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start transition-all duration-300">
            
            {/* Sidebar with Profile & Details */}
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-amber-100 text-2xl flex items-center justify-center border border-amber-200">
                      👨‍🔧
                    </div>
                    {/* Pulsing online status indicator */}
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Max Weber</h3>
                    <p className="text-xs text-slate-400">Zertifizierter Partner</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-slate-600">Weber Solartechnik</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Bewertung:</span>
                    <span className="font-bold text-slate-700">⭐️ 4.9 (142)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Erfahrungsgrad:</span>
                    <span className="font-bold text-slate-700">Senior Elektro-Meister</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Registriert bei VNB:</span>
                    <span className="font-bold text-slate-700 text-right">Mitnetz, Netze BW, etc.</span>
                  </div>
                </div>
              </div>

              {/* Ticket Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ticket-Details
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      ticketStatus === "Aktiv"
                        ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {ticketStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kategorie:</span>
                    <span className="font-semibold text-slate-800">
                      {TOPICS.find((t) => t.id === selectedTopic)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Vorgangs-Nr.:</span>
                    <span className="font-mono font-bold text-slate-700">#{orderId}</span>
                  </div>
                </div>

                {/* Helper actions box for Hackathon demo */}
                {selectedTopic === "docs" && ticketStatus === "Aktiv" && (
                  <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-700 block mb-1">
                      💡 Hackathon Demo Helfer
                    </span>
                    <p className="text-[10px] text-blue-600 leading-normal mb-2">
                      Klicken Sie hier, um das Unterschreiben und Hochladen der Betreibervollmacht direkt zu simulieren.
                    </p>
                    <button
                      type="button"
                      onClick={uploadMockVollmacht}
                      className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs py-2 shadow-sm transition cursor-pointer"
                    >
                      📄 Vollmacht hochladen
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col h-[550px]">
              
              {/* Chat Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    Live-Chat mit Max Weber
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ihr Vorgang wird direkt bearbeitet.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600">Verbunden</span>
                </div>
              </div>

              {/* Chat Message Logs */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {messages.map((msg) => {
                  if (msg.sender === "system") {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full font-medium border border-slate-200">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isUser = msg.sender === "user";

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm border ${
                        isUser 
                          ? "bg-blue-100 border-blue-200" 
                          : "bg-amber-100 border-amber-200"
                      }`}>
                        {isUser ? "👤" : "👨‍🔧"}
                      </div>

                      {/* Bubble content */}
                      <div>
                        <div className={`rounded-2xl p-4 shadow-sm text-sm ${
                          isUser
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          
                          {/* File preview attachment block if present */}
                          {msg.file && (
                            <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 ${
                              isUser 
                                ? "bg-blue-700/50 border-blue-500/30 text-white" 
                                : "bg-slate-50 border-slate-100 text-slate-800"
                            }`}>
                              <span className="text-2xl">📄</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{msg.file.name}</p>
                                <p className="text-[10px] opacity-75">{msg.file.size}</p>
                              </div>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                ✓ Geprüft
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] text-slate-400 mt-1 block ${isUser ? "text-right" : "text-left"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Installer Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">
                      👨‍🔧
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="border-t border-slate-200 p-4 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf,image/*"
                  />
                  
                  {/* File attach button */}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={ticketStatus === "Gelöst"}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Datei anhängen"
                  >
                    📎
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={ticketStatus === "Gelöst"}
                    placeholder={
                      ticketStatus === "Gelöst" 
                        ? "Dieser Chat ist geschlossen." 
                        : "Schreiben Sie eine Nachricht..."
                    }
                    className="flex-1 h-10 rounded-xl border border-slate-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />

                  <button
                    type="submit"
                    disabled={(!inputValue.trim() && !isTyping) || ticketStatus === "Gelöst"}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ➔
                  </button>
                </form>

                {ticketStatus === "Gelöst" && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <span className="text-xs font-bold text-emerald-800 block">
                      ✓ Dieses Ticket wurde als gelöst markiert
                    </span>
                    <p className="text-[11px] text-emerald-600 leading-normal mt-0.5">
                      Vielen Dank! Die Betreibervollmacht wurde erfolgreich übermittelt.
                    </p>
                    <Link
                      href={`/orders/${orderId}/status`}
                      className="inline-flex mt-2 text-xs font-semibold text-blue-600 underline hover:text-blue-700"
                    >
                      Zum Status-Portal wechseln
                    </Link>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
