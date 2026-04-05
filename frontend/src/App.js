import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Send,
  User,
  Bot,
  Loader2,
  Plus,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);

  // Hiperparaméterek (0,3 pont)
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1.0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ide került az új state
  const [fileBase64, setFileBase64] = useState(null);

  const scrollRef = useRef(null);

  // Ide kerültek a függvények
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFileBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 1. Beszélgetések betöltése a Sidebarba (0,5 pont)
  const fetchConversations = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Hiba a listázásnál:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Egy korábbi beszélgetés megnyitása
  const loadConversation = async (id) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/conversations/${id}/messages`,
      );
      const formattedMsgs = res.data.map((m) => ({
        role: m.role === "assistant" ? "bot" : "user",
        content: m.content,
      }));
      setMessages(formattedMsgs);
      setCurrentConvId(id);
    } catch (err) {
      console.error("Hiba a betöltésnél:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Új beszélgetés indítása
  const startNewChat = () => {
    setMessages([]);
    setCurrentConvId(null);
    setInput("");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Üres bot üzenet előkészítése a streaminghez
    setMessages((prev) => [...prev, { role: "bot", content: "" }]);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // A sendMessage függvényen belül módosítsd ezt a részt:
        body: JSON.stringify({
          message: input,
          conv_id: currentConvId,
          temperature: temperature,
          top_p: topP,
          file_data: fileBase64, // <--- Itt küldjük el a beolvasott fájlt!
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // A FastAPI 'data: ' prefixszel küldi a töredékeket
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.replace("data: ", "");
            fullContent += content;

            // Itt történik a varázslat: folyamatosan frissítjük az utolsó üzenetet
            setMessages((prev) => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1] = {
                role: "bot",
                content: fullContent,
              };
              return newMsgs;
            });
          }
        }
      }

// A sendMessage vége felé, a stream lefutása után:
if (!currentConvId) {
    // Lekérjük a friss listát
    const res = await axios.get("http://127.0.0.1:8000/conversations");
    setConversations(res.data);
    if (res.data.length > 0) {
        // A legfrissebb beszélgetés ID-ját beállítjuk aktuálisnak
        setCurrentConvId(res.data[0].id);
    }
} else {
    fetchConversations();
}
} catch (error) {
      console.error("Streaming hiba:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Hiba történt a stream során!" },
      ]);
    } finally {
      setIsLoading(false);
      setFileBase64(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      {/* SIDEBAR (Bal oldal) */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-0"} bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors border border-blue-500 shadow-lg"
          >
            <Plus size={18} /> Új beszélgetés
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <p className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
            Korábbiak
          </p>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${currentConvId === conv.id ? "bg-slate-700" : "hover:bg-slate-800"}`}
            >
              <MessageSquare size={16} className="text-gray-400" />
              <span className="truncate text-sm">{conv.title}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT TERÜLET (Közép) */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg text-slate-700">
            LLM Projektmunka{" "}
            <span className="text-xs font-normal text-gray-400">v1.0.4</span>
          </h1>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 hover:bg-gray-100 rounded-md text-blue-600"
          >
            <Settings size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="bg-white p-6 rounded-full shadow-sm">
                <Bot size={48} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Üdvözöllek az LLM alkalmazásban!
                </h2>
                <p className="max-w-md">
                  Kérdezz bátran, vagy állítsd be a modell paramétereit a jobb
                  felső sarokban.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2"}`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border rounded-tl-none"}`}
              >
                {/* Fejléc (Ikon + Név) */}
                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase">
                  {msg.role === "user" ? (
                    <>
                      <User size={12} /> Te
                    </>
                  ) : (
                    <>
                      <Bot size={12} /> Gemini
                    </>
                  )}
                </div>

                {/* Üzenet szövege */}
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>

                {/* ÚJ: Fájl ikon megjelenítése CSAK a felhasználó üzeneténél, ha épp küldtünk egyet */}
                {msg.role === "user" &&
                  fileBase64 &&
                  i === messages.length - 2 && (
                    <div className="mt-2 pt-2 border-t border-blue-400 flex items-center gap-2 text-xs italic">
                      <div className="bg-blue-500 p-1 rounded text-white">
                        📎
                      </div>
                      <span>Média csatolva</span>
                    </div>
                  )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={18} />
                <span className="text-sm text-gray-500">
                  Gemini gondolkodik...
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <footer className="p-4 bg-white border-t">
          <form
            onSubmit={sendMessage}
            className="max-w-4xl mx-auto flex flex-col gap-2"
          >
            {/* ÚJ: Fájl indikátor, ha van kiválasztott fájl */}
            {fileBase64 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg w-fit ml-12 animate-in fade-in zoom-in-95">
                <span className="text-xs font-medium text-green-700">
                  Fájl csatolva
                </span>
                <button
                  type="button"
                  onClick={() => setFileBase64(null)}
                  className="text-green-700 hover:text-red-500 font-bold text-lg"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
              <label
                htmlFor="file-upload"
                className={`p-3 rounded-xl cursor-pointer transition-colors ${fileBase64 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                <Plus size={20} />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Írj egy üzenetet..."
                className="flex-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`p-3 rounded-xl transition-colors ${
                  isLoading
                    ? "bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </footer>

        {/* BEÁLLÍTÁSOK PANEL (Jobb oldal) (0,3 pont) */}
        {isSettingsOpen && (
          <div className="absolute right-4 top-20 w-72 bg-white border rounded-2xl shadow-2xl p-5 z-50 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-700">Modell paraméterek</h3>
              <button onClick={() => setIsSettingsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600">
                    Temperature
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Alacsonyabb: pontosabb, Magasabb: kreatívabb.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600">
                    Top P
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {topP}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
