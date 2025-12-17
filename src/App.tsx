import { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import { motion } from "framer-motion";
import { Bell, Bot, FileText, Home, Settings } from "lucide-react";


// Minimal local UI components to avoid external shadcn/ui dependencies
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, onClick, variant = "default", className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: "default" | "outline"; className?: string }) {
  const base = "px-3 py-1.5 rounded-md text-sm transition border";
  const styles = variant === "outline" ? "border-gray-300 bg-white hover:bg-gray-50" : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${className}`}>{children}</span>;
}

function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition ${checked ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${checked ? "left-5" : "left-1"}`}
      />
    </button>
  );
}

const mockTickets = [
  { id: 1, title: "VPN Issue", name: "User 1", date: "2025-12-01", description: "VPN connection fails on startup.", severity: "Critical" },
  { id: 2, title: "Mail Sync", name: "User 2", date: "2025-12-02", description: "Outlook does not sync correctly.", severity: "Warning" },
  { id: 3, title: "Printer Error", name: "User 3", date: "2025-12-03", description: "Office printer shows error 404.", severity: "Info" },
  { id: 4, title: "Access Rights", name: "User 4", date: "2025-12-04", description: "No access to shared drive.", severity: "Info" },
  { id: 5, title: "VPN Login Timeout", name: "User 5", date: "2025-12-05", description: "VPN login times out after entering credentials.", severity: "Critical" },
  { id: 6, title: "VPN Random Disconnects", name: "User 6", date: "2025-12-05", description: "VPN disconnects every few minutes.", severity: "Warning" },
  { id: 7, title: "VPN Profile Missing", name: "User 7", date: "2025-12-06", description: "VPN profile disappeared after client update.", severity: "Critical" },
  { id: 8, title: "VPN Very Slow", name: "User 8", date: "2025-12-06", description: "VPN connection is established but extremely slow.", severity: "Warning" },
  { id: 9, title: "VPN Certificate Error", name: "User 9", date: "2025-12-07", description: "VPN client reports an invalid certificate error.", severity: "Critical" }
];

interface HotbarProps {
  onOpenNotifications: () => void;
  onResetDemo: () => void;
  setShowAutomatedOutage: (value: boolean) => void;
}

function Hotbar({ onOpenNotifications, onResetDemo, setShowAutomatedOutage }: HotbarProps) {
  useEffect(() => {
    const confirmed = sessionStorage.getItem("outageConfirmed") === "true";

    if (!confirmed) {
      const timer = setTimeout(() => {
        setShowAutomatedOutage(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [setShowAutomatedOutage]);

  return (
    <div className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between mb-6">
      <Link to="/" onClick={onResetDemo} className="font-bold text-lg hover:underline">SYSTEMNAME</Link>
      <div className="flex gap-6 text-sm text-gray-600 items-center">
        <Link to="/" className="flex items-center gap-1 hover:text-black">
          <Home className="w-4 h-4" />Dashboard
        </Link>
        <button onClick={onOpenNotifications} className="flex items-center gap-1 hover:text-black">
          <Bell className="w-4 h-4" /> Notification
        </button>
        <Link to="/settings" className="flex items-center gap-1 hover:text-black">
          <Settings className="w-4 h-4" />Settings
        </Link>
      </div>
    </div>
  );
}

function TicketListView({ resetToken }: { resetToken: number }) {
  useEffect(() => {
    const initialized = sessionStorage.getItem("unreadInit") === "true";

    if (!initialized) {
      mockTickets.forEach((t) => sessionStorage.removeItem(`unread-${t.id}`));
      mockTickets.slice(0, 2).forEach((t) => sessionStorage.setItem(`unread-${t.id}`, "true"));
      sessionStorage.setItem("unreadInit", "true");
    }
  }, [resetToken]);

  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
      <Card className="rounded-2xl shadow-md col-span-12">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Tickets</h2>
          <div className="grid gap-2">
            {mockTickets.map((ticket) => {
              const hasUnread = sessionStorage.getItem(`unread-${ticket.id}`) === "true";

              return (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                  className="p-3 rounded-lg cursor-pointer border text-sm transition bg-white hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {ticket.title}
                      {hasUnread && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ticket.name} – {ticket.date}
                    </div>
                  </div>
                  <Badge>{ticket.severity}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getDefaultSolution(ticket: typeof mockTickets[number]) {
  return ticket.title.toLowerCase().includes("vpn")
    ? `Possible solution (VPN):
1) Re-import the VPN profile
2) Check or renew the certificate
3) Reset the network adapter
4) Re-authenticate the user`
    : `Possible solution:
1) Perform standard troubleshooting
2) Restart the system
3) Verify the configuration`;
}

function TicketDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = mockTickets.find((t) => t.id === Number(id));
  const [showSolution, setShowSolution] = useState(false);

  if (!ticket) {
    return <div className="text-center text-gray-500">Ticket not found.</div>;
  }

  

  const getAiSummary = () => {
    if (ticket.title.toLowerCase().includes("vpn")) {
      return "The incident is classified as a VPN-related connectivity issue. Based on similar historical cases, the root cause is likely a corrupted client profile, an expired certificate, or network instability. A profile reset and credential re-authentication resolves the majority of such incidents.";
    }

    if (ticket.title.toLowerCase().includes("mail")) {
      return "The issue indicates a synchronisation problem between the mail client and the mail server. Typical causes include outdated client configuration, temporary server-side latency, or authentication token errors.";
    }

    if (ticket.title.toLowerCase().includes("printer")) {
      return "This case matches a known printer service malfunction. Previous incidents were caused by offline spooler services or unreachable network printers.";
    }

    if (ticket.title.toLowerCase().includes("access")) {
      return "The ticket suggests a missing permission configuration. In comparable cases, user group assignments were not correctly synchronised with the directory service.";
    }

    return "No comparable historical cases found. Manual analysis is recommended.";
  };

  const defaultSolution = getDefaultSolution(ticket);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-12 gap-8 max-w-[1400px] mx-auto">
      <Card className="col-span-8 rounded-2xl shadow-md h-full">
        <CardContent className="p-6 grid gap-3">
          <h2 className="font-semibold mb-2">Ticket: {ticket.title}</h2>
          <p><strong>Name:</strong> {ticket.name}</p>
          <p><strong>Date:</strong> {ticket.date}</p>
          <p className="text-sm text-gray-600 mt-2"><strong>Description:</strong> {ticket.description}</p>
          <Button variant="outline" onClick={() => window.history.back()} className="w-fit mt-4">Back to Ticket List</Button>
        </CardContent>
      </Card>

      <Card className="col-span-4 rounded-2xl shadow-md h-full">
        <CardContent className="p-6 grid gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h2 className="font-semibold">AI Services</h2>
          </div>

          <Badge className="w-fit">Ticket</Badge>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Incident Summary</h3>
          </div>
          <p className="text-sm text-gray-700">{getAiSummary()}</p>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                navigate("/chat", {
                  state: {
                    initialMessage: ticket.id <= 2 ? defaultSolution : "",
                    ticketId: ticket.id,
                  },
                });
              }}
            >
              Open Chat
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
            <FileText className="w-4 h-4" />
            <span>Automatic documentation will be generated after resolution</span>
          </div>
        </CardContent>
      </Card>

      {showSolution && (
        <SolutionPopup onClose={() => setShowSolution(false)} defaultText={defaultSolution} />
      )}
    </motion.div>
  );
}

function ChatView() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = location.state?.initialMessage ?? "";
  const ticketId = location.state?.ticketId as number | undefined;
  const [showSolution, setShowSolution] = useState(false);
  const ticket = mockTickets.find((t) => t.id === Number(ticketId));
  const defaultSolution = ticket ? ticket : mockTickets[0];
  const [messages, setMessages] = useState<{
    id: number;
    role: "system" | "user";
    text: string;
    sender: "AI" | "User";
    timestamp: string;
  }[]>(() => {
    if (!initialMessage) return [];

    const now = new Date().toLocaleTimeString();

    return [
      { id: 1, role: "system", sender: "AI", text: initialMessage, timestamp: now },
      { id: 2, role: "user", sender: "User", text: "I am still experiencing issues with the VPN connection. The proposed steps only partially helped.", timestamp: now },
      { id: 3, role: "system", sender: "AI", text: "Please note: The VPN incident currently affects multiple users. We are analysing the root cause and will keep you updated.", timestamp: now }
    ];
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    if (ticketId) sessionStorage.removeItem(`unread-${ticketId}`);
  }, [ticketId]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      role: "user" as const,
      sender: "User" as const,
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 grid gap-4">
          <h2 className="font-semibold text-lg">Chat</h2>

          <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto border rounded-md p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm p-2 rounded-lg max-w-[80%] ${msg.role === "system" ? "bg-gray-100 self-start" : "bg-blue-500 text-white self-end"}`}
              >
                <div className="text-[10px] text-gray-500 mb-1">{msg.sender} • {msg.timestamp}</div>
                <div>{msg.text}</div>
              </div>
            ))}
          </div>

          <textarea className="w-full p-3 border rounded-md text-sm" rows={3} value={input} onChange={(e) => setInput(e.target.value)} />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            <Button onClick={() => setShowSolution(true)}>Get Draft Solution</Button>
            <Button onClick={handleSend}>Send</Button>
          </div>
        </CardContent>
      </Card>
      {showSolution && (
        <SolutionPopup onClose={() => setShowSolution(false)} defaultText={getDefaultSolution(defaultSolution)} />
      )}
    </motion.div>
  );
}

function SettingsView() {
  const [features, setFeatures] = useState([
    { key: "proactive-outage", label: "Proactive Outage Detection", enabled: true },
    { key: "ai-summary", label: "AI Ticket Summary", enabled: true },
    { key: "auto-doc", label: "Automatic Documentation", enabled: true },
    
    { key: "proactive-suggestions", label: "Proactive Agent Suggestions", enabled: true },
    { key: "chat-assistance", label: "AI Chat Assistance", enabled: true },
    
    { key: "solution-prep", label: "Prepare Solution Feature", enabled: true }
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 grid gap-6">
          <h2 className="font-semibold text-xl">AI Concierge – Feature Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                <span className="text-sm font-medium">{feature.label}</span>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={(val) => setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, enabled: val } : f))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface NotificationListPopupProps {
  onClose: () => void;
  onOpenOutage: () => void;
  outageConfirmed: boolean;
}

function NotificationListPopup({ onClose, onOpenOutage, outageConfirmed }: NotificationListPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">🔔 Recent System Incidents</h2>
        <div className="grid gap-3">
          <div className="p-3 border rounded-lg flex justify-between items-center">
            <div>
              <div className="font-medium text-sm">Global Incident(Automatically Detected)</div>
              <div className="text-xs text-gray-500">12:43</div>
            </div>
            <div className="flex items-center gap-2">
              {outageConfirmed && (<Badge className="bg-green-100 text-green-700 border border-green-300">Confirmed</Badge>)}
              <Button variant="outline" onClick={onOpenOutage}>Open</Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6"><Button variant="outline" onClick={onClose}>Close</Button></div>
      </motion.div>
    </div>
  );
}

interface AutomatedOutagePopupProps {
  onClose: () => void;
  onConfirm: () => void;
}

function AutomatedOutagePopup({ onClose, onConfirm }: AutomatedOutagePopupProps) {
  const [message, setMessage] = useState(
    "Dear users, we are currently experiencing a disruption in the VPN infrastructure. Connections may be unstable or unavailable at this time. Our IT service team is already working on resolving the issue. Thank you for your understanding."
  );
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="font-semibold text-lg mb-2 text-red-700 flex items-center gap-2">🔔 System Outage Detected</h2>
        <p className="text-sm text-gray-700 mb-3">The AI Concierge has detected a potential system outage. Services are currently not responding as expected.</p>
        <p className="text-xs text-gray-500 mb-4">Timestamp: 12:43</p>
        {!sent ? (
          <>
            <label className="text-sm font-medium">Automatic User Notification</label>
            <textarea className="w-full mt-1 p-2 border rounded-md text-sm" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => { setSent(true); onConfirm(); }}>Send Message</Button>
            </div>
          </>
        ) : (
          <div className="text-center text-green-700 text-sm font-medium mt-4">
            ✅ The message has been successfully sent to users.
            <div className="mt-4"><Button variant="outline" onClick={onClose}>Close</Button></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface SolutionPopupProps {
  onClose: () => void;
  defaultText: string;
}

function SolutionPopup({ onClose, defaultText }: SolutionPopupProps) {
  const [text, setText] = useState(defaultText);
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">🛠️ Possible Solution</h2>
        {!sent ? (
          <>
            <textarea className="w-full mt-2 p-2 border rounded-md text-sm" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setSent(true)}>Send Message</Button>
            </div>
          </>
        ) : (
          <div className="text-center text-green-700 text-sm font-medium mt-4">
            ✅ Solution prepared and submitted.
            <div className="mt-4"><Button variant="outline" onClick={onClose}>Close</Button></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AIConciergePrototype() {
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [showAutomatedOutage, setShowAutomatedOutage] = useState(false);
  const [outageConfirmed, setOutageConfirmed] = useState<boolean>(() => sessionStorage.getItem("outageConfirmed") === "true");
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    const confirmed = sessionStorage.getItem("outageConfirmed") === "true";

    if (!confirmed) {
      const timer = setTimeout(() => {
        setShowAutomatedOutage(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirmOutage = () => {
    sessionStorage.setItem("outageConfirmed", "true");
    setOutageConfirmed(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-8">
        <Hotbar
          onOpenNotifications={() => setShowNotificationList(true)}
          onResetDemo={() => {
            sessionStorage.clear();
            setShowNotificationList(false);
            setShowAutomatedOutage(false);
            setOutageConfirmed(false);
            setResetToken((v) => v + 1);
          }}
          setShowAutomatedOutage={setShowAutomatedOutage}
        />

        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-center mb-6">AI Concierge Prototype</motion.h1>

        <Routes>
          <Route path="/" element={<TicketListView resetToken={resetToken} />} />
          <Route path="/ticket/:id" element={<TicketDetailView />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>

        {showNotificationList && (
          <NotificationListPopup
            onClose={() => setShowNotificationList(false)}
            onOpenOutage={() => {
              setShowNotificationList(false);
              setShowAutomatedOutage(true);
            }}
            outageConfirmed={outageConfirmed}
          />
        )}

        {showAutomatedOutage && (
          <AutomatedOutagePopup onClose={() => {
              sessionStorage.setItem("outageConfirmed", "true");
              setShowAutomatedOutage(false);
            }} onConfirm={handleConfirmOutage} />
        )}

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-gray-500 mt-14">Prototype for Bachelor Thesis Evaluation – No Backend Functionality</motion.footer>
      </div>
    </Router>
  );
}
