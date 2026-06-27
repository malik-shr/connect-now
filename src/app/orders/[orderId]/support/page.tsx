"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import BackButton from "~/app/_components/BackButton";
import { useProjects } from "~/app/_context/ProjectContext";
import { useAuth } from "~/app/_context/AuthContext";

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
    title: "Documents & Authorization",
    icon: "📄",
    description: "Help with missing documents like the power of attorney.",
    defaultText: "Hello, I am missing the 'Operator Power of Attorney'. Can you help me fill out and upload this document?",
  },
  {
    id: "metering",
    title: "Metering Concept & Meters",
    icon: "🔌",
    description: "Questions regarding the Metering Concept Builder or panel setup.",
    defaultText: "Hello, I am unsure which metering concept is best suited for my PV system with storage.",
  },
  {
    id: "technical",
    title: "Technical Parameters",
    icon: "📋",
    description: "Clarifications on inverter datasheet specs, grid protection, etc.",
    defaultText: "Hello, I have questions about the E.8 inverter datasheet specs and required grid parameters.",
  },
  {
    id: "general",
    title: "General Questions",
    icon: "❓",
    description: "General questions about grid connection timelines and milestones.",
    defaultText: "Hello, I wanted to ask how long the grid validation check typically takes with local operators.",
  },
];

const MATCHING_STEPS = [
  "Transmitting connection request details...",
  "Analyzing document and asset status...",
  "Searching certified installer in your postal code region...",
  "Max Weber (Weber Solar Technology GmbH) matched!",
  "Initializing secure direct chat...",
];

export default function SupportPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  
  // Connect to Contexts
  const { 
    orders, 
    installers, 
    updateOrderStatus, 
    assignInstaller, 
    updateOrderDocumentStatus 
  } = useProjects();
  const { user } = useAuth();

  const order = orders.find((o) => o.id === orderId);

  // Check active perspective: are we logged in as the installer?
  const isInstallerPerspective = user?.role === "installer";

  // Force direct chat view for installer perspective (installer doesn't need to match him/herself)
  const initialViewState = (isInstallerPerspective || order?.assignedInstallerId) ? "chat" : "intake";

  // States
  const [viewState, setViewState] = useState<"intake" | "matching" | "chat">(initialViewState);
  const [selectedTopic, setSelectedTopic] = useState("docs");
  const [description, setDescription] = useState(TOPICS[0]!.defaultText);
  const [matchingIndex, setMatchingIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [ticketStatus, setTicketStatus] = useState<"Active" | "Resolved">("Active");
  
  // File upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load chat messages based on perspective
  useEffect(() => {
    if (messages.length > 0) return;

    if (isInstallerPerspective) {
      // Seed ticket history from the installer's perspective (Customer opened a request)
      const initialMsgs: Message[] = [
        {
          id: "sys-1",
          sender: "system",
          text: "Support Ticket #SR-8492 loaded. Category: Documents & Authorization.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "msg-cust-init",
          sender: "user",
          text: "Hello, I am missing the 'Operator Power of Attorney'. Can you help me fill out and upload this document?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "msg-inst-reply",
          sender: "installer",
          text: "Hello! I am Max Weber. I see your request. Do you have the document template ready?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
      setMessages(initialMsgs);
    } else if (order?.assignedInstallerId) {
      // Seed details for customer perspective if already matched
      const topicObj = TOPICS[0];
      const initialMsgs: Message[] = [
        {
          id: "sys-1",
          sender: "system",
          text: `Support Ticket #SR-8492 loaded. Category: ${topicObj?.title}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "sys-2",
          sender: "system",
          text: "Installer Max Weber is active in the chat.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "msg-reply-1",
          sender: "installer",
          text: "Hello! I see your workspace project has been assigned to me. How can I help you complete your operator documents?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
      setMessages(initialMsgs);
    }
  }, [order, messages.length, isInstallerPerspective]);

  // Handle Topic Change
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = TOPICS.find((t) => t.id === topicId);
    if (topic) {
      setDescription(topic.defaultText);
    }
  };

  // Start Matching Simulation (Customer view only)
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
      // Save assignment to ProjectContext
      assignInstaller(orderId, "inst-1");

      const topicObj = TOPICS.find((t) => t.id === selectedTopic);
      const initialMsgs: Message[] = [
        {
          id: "sys-1",
          sender: "system",
          text: `Support Ticket #SR-8492 was created. Category: ${topicObj?.title}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "sys-2",
          sender: "system",
          text: "Installer Max Weber joined the chat.",
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
      
      const timer = setTimeout(() => {
        setIsTyping(true);
        const typingTimer = setTimeout(() => {
          setIsTyping(false);
          let replyText = "Hello! I am Max, your assigned technician for this grid connection. Let's work together to complete your files.";
          if (selectedTopic === "docs") {
            replyText += " I see in the status portal that you are still missing the 'Operator Power of Attorney'. Do you have the document ready, or do you need a template to sign?";
          } else if (selectedTopic === "metering") {
            replyText += " For a PV system with storage, I usually recommend an excess feed-in concept with separate solar generation tracking. Let's inspect your panel setup.";
          } else {
            replyText += " Let's look at this together. Where exactly are you stuck?";
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
  }, [viewState, matchingIndex, assignInstaller, orderId, selectedTopic, description]);

  // Send Message
  const handleSendMessage = (textToSend?: string, attachedFile?: Message["file"], forceSender?: "user" | "installer") => {
    const text = textToSend || inputValue;
    if (!text && !attachedFile) return;

    if (!textToSend) setInputValue("");

    const activeSender = forceSender || (isInstallerPerspective ? "installer" : "user");

    const newMsg: Message = {
      id: `msg-${activeSender}-${Date.now()}`,
      sender: activeSender,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: attachedFile,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    const nextStep = chatStep + 1;
    setChatStep(nextStep);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";

      // --- CUSTOMER PERSPECTIVE TYPING SIMULATION ---
      if (!isInstallerPerspective) {
        if (attachedFile) {
          updateOrderDocumentStatus(orderId, "vollmacht", "complete");
          replyText = "Excellent, thank you! The document 'Operator_Power_of_Attorney_signed.pdf' looks fully complete. The signature and address coordinates match.";
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-installer-${Date.now()}`,
              sender: "installer",
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);

          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              updateOrderStatus(orderId, "In Review");
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg-installer-sub-${Date.now()}`,
                  sender: "installer",
                  text: "Since all required files are now complete, I have officially submitted your grid connection application to the local utility grid operator! Your project status has updated to 'In Review' in the portal. You can follow the progress live in the Status Portal.",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]);
            }, 1500);
          }, 1200);
          return;
        }

        const userText = text.toLowerCase();
        if (userText.includes("vollmacht") || userText.includes("document") || userText.includes("template") || userText.includes("attorney")) {
          replyText = "You can fill out and sign the official Power of Attorney template, then upload the PDF here in the chat. Verwenden Sie dazu einfach das Büroklammer-Symbol unten links.";
        } else if (userText.includes("thank") || userText.includes("great") || userText.includes("done") || userText.includes("thanks")) {
          replyText = "You are very welcome! I am closing this ticket. If you need anything else, feel free to open a new support request. Have a sunny day! ☀️";
          setTicketStatus("Resolved");
        } else {
          replyText = "No problem, we'll get this sorted out. Do you have any other questions, or should we submit this technical section?";
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
      } 
      // --- INSTALLER PERSPECTIVE TYPING SIMULATION ---
      else {
        // Customer answers the installer
        const userText = text.toLowerCase();
        if (userText.includes("hello") || userText.includes("looks") || userText.includes("ok")) {
          replyText = "Great, thanks! I will sign the document and upload it here in the chat right away.";
        } else if (userText.includes("submit") || userText.includes("review") || userText.includes("status")) {
          replyText = "Awesome! Thank you for the quick support. I will follow the status updates in the portal.";
          setTicketStatus("Resolved");
        } else {
          replyText = "Thanks for the information, Mr. Weber. I will check that immediately.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-user-ans-${Date.now()}`,
            sender: "user",
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    }, 1500);
  };

  // Simulate file upload (Customer view)
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSendMessage(`I have uploaded the file: ${file.name}`, {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type || "application/pdf",
      });
    }
  };

  // Mock Upload Shortcuts (For Hackathon Demos)
  const uploadMockVollmacht = () => {
    // Customer uploads
    handleSendMessage("I have filled out the operator authorization form.", {
      name: "Operator_Power_of_Attorney_signed.pdf",
      size: "1.2 MB",
      type: "application/pdf",
    }, "user");
  };

  const activeInstaller = installers.find(i => i.id === order?.assignedInstallerId) || installers[0]!;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Context Breadcrumbs */}
        <div className="flex items-center justify-between">
          <BackButton href={isInstallerPerspective ? "/orders" : `/orders/${orderId}`} />
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
            Order-ID: {orderId}
          </span>
        </div>

        {/* --- INTAKE FORM (Customer only) --- */}
        {viewState === "intake" && !isInstallerPerspective && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 transition-all duration-300">
            <header className="border-b border-slate-200 pb-5 mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                Expert Service · Installer Support
              </span>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Request Support
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Choose a category below. We will match you directly with a certified electrical technician for live collaboration.
              </p>
            </header>

            <form onSubmit={startMatching} className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-3">
                  What do you need assistance with?
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
                  Describe your request
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

              {/* Upload Zone */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Attach Document (Optional)
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
                    Drag & drop a file here, or browse files
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    PDF, PNG or JPG up to 10 MB
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5 cursor-pointer"
                >
                  ⚡ Start Support Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- MATCHING ANIMATION (Customer only) --- */}
        {viewState === "matching" && !isInstallerPerspective && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl text-center min-h-[450px] flex flex-col justify-center items-center transition-all duration-300">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute h-24 w-24 rounded-full border-4 border-blue-500/30 animate-ping" />
              <div className="relative h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-extrabold text-blue-600 shadow-md">
                ⚡
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Connecting with certified Partner
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              We are matching you with an active electrician certified by the local network grid operator.
            </p>

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

        {/* --- CHAT VIEW --- */}
        {viewState === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start transition-all duration-300">
            
            {/* Sidebar Profile & Details */}
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-slate-100 text-2xl flex items-center justify-center border border-slate-200">
                      {isInstallerPerspective ? "👤" : "👨‍🔧"}
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      {isInstallerPerspective ? "Customer One" : activeInstaller.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isInstallerPerspective ? "Operator / Customer" : "Certified Partner"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-slate-600">
                        {isInstallerPerspective ? "Zip Code: 06108" : activeInstaller.company}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-slate-700">Online</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Connection Power:</span>
                    <span className="font-bold text-slate-700">
                      {order?.power || "9.8 kWp"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ticket Details
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      ticketStatus === "Active"
                        ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {ticketStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-800">
                      Documents & Authorization
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Project-ID:</span>
                    <span className="font-mono font-bold text-slate-700">#{orderId}</span>
                  </div>
                </div>

                {/* Helper action box for Hackathon demo */}
                {ticketStatus === "Active" && (
                  <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-700 block mb-1">
                      💡 Hackathon Demo Helper
                    </span>
                    <p className="text-[10px] text-blue-600 leading-normal mb-2">
                      {isInstallerPerspective 
                        ? "Simulate the customer uploading their signed operator authorization form."
                        : "Upload the signed Operator Power of Attorney form as the customer."
                      }
                    </p>
                    <button
                      type="button"
                      onClick={uploadMockVollmacht}
                      className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs py-2 shadow-sm transition cursor-pointer"
                    >
                      {isInstallerPerspective ? "📄 Simulate Customer Upload" : "📄 Upload Power of Attorney"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat View Container */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col h-[550px]">
              
              {/* Chat Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    {isInstallerPerspective 
                      ? "Live Chat with Customer One" 
                      : `Live Chat with ${activeInstaller.name}`
                    }
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isInstallerPerspective ? "Support request regarding authorization." : "Your application is being reviewed."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600">Connected</span>
                </div>
              </div>

              {/* Chat logs */}
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

                  const isRightSide = isInstallerPerspective 
                    ? msg.sender === "installer" 
                    : msg.sender === "user";

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        isRightSide ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm border ${
                        isRightSide 
                          ? "bg-blue-100 border-blue-200" 
                          : "bg-amber-100 border-amber-200"
                      }`}>
                        {msg.sender === "user" ? "👤" : "👨‍🔧"}
                      </div>

                      {/* Bubble content */}
                      <div>
                        <span className="block text-[10px] text-slate-400 mb-1 ml-1">
                          {msg.sender === "user" ? "Customer" : "Installer"} {isRightSide && "(Me)"}
                        </span>
                        <div className={`rounded-2xl p-4 shadow-sm text-sm ${
                          isRightSide
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          
                          {msg.file && (
                            <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 ${
                              isRightSide 
                                ? "bg-blue-700/50 border-blue-500/30 text-white" 
                                : "bg-slate-50 border-slate-100 text-slate-800"
                            }`}>
                              <span className="text-2xl">📄</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{msg.file.name}</p>
                                <p className="text-[10px] opacity-75">{msg.file.size}</p>
                              </div>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                ✓ Verified
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] text-slate-400 mt-1 block ${isRightSide ? "text-right" : "text-left"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing simulation */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">
                      {isInstallerPerspective ? "👤" : "👨‍🔧"}
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

              {/* Chat Input */}
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
                  
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={ticketStatus === "Resolved"}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Attach File"
                  >
                    📎
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={ticketStatus === "Resolved"}
                    placeholder={
                      ticketStatus === "Resolved" 
                        ? "This chat session has been closed." 
                        : "Type a message..."
                    }
                    className="flex-1 h-10 rounded-xl border border-slate-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />

                  <button
                    type="submit"
                    disabled={(!inputValue.trim() && !isTyping) || ticketStatus === "Resolved"}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ➔
                  </button>
                </form>

                {ticketStatus === "Resolved" && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <span className="text-xs font-bold text-emerald-800 block">
                      ✓ This ticket has been marked as resolved
                    </span>
                    <p className="text-[11px] text-emerald-600 leading-normal mt-0.5">
                      The Operator Power of Attorney has been successfully uploaded and checked.
                    </p>
                    <Link
                      href={isInstallerPerspective ? "/orders" : `/orders/${orderId}/status`}
                      className="inline-flex mt-2 text-xs font-semibold text-blue-600 underline hover:text-blue-700"
                    >
                      {isInstallerPerspective ? "Back to Dashboard" : "Go to Status Portal"}
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
