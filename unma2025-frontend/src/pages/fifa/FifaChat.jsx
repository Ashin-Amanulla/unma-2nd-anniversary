import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Send, Trophy, MessageCircle } from "lucide-react";
import fifaApi from "../../api/fifaApi";
import { fifaKeys } from "../../hooks/useFifa";
import { readSavedParticipant } from "../../utils/fifaParticipant";
import FifaOrganizerCredit from "../../components/fifa/FifaOrganizerCredit";

function getErrorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.message || err?.message || fallback;
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SignInGate() {
  return (
    <div className="fifa-page min-h-screen">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="mb-8 text-center space-y-2">
          <div className="text-5xl mb-3">💬</div>
          <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">Join the chat</h1>
          <p className="text-gray-600 text-sm max-w-xs mx-auto">
            Sign in to the contest with your FIFA code to talk with the group.
          </p>
        </div>
        <div className="fifa-card p-7 space-y-4 text-center">
          <Link to="/fifa/play" className="fifa-btn-primary w-full py-3 text-base inline-block">
            Sign in to chat ⚽
          </Link>
        </div>
        <FifaOrganizerCredit className="mt-8" />
      </div>
    </div>
  );
}

export default function FifaChat() {
  const creds = readSavedParticipant();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);

  const { data, isLoading } = useQuery({
    queryKey: fifaKeys.chat,
    queryFn: () => fifaApi.getChatMessages(),
    refetchInterval: 4000,
    enabled: !!creds,
  });

  const messages = data?.messages ?? [];
  const myName = creds?.name;

  // Track whether the user is scrolled to the bottom so we only auto-scroll
  // when they're already following the conversation.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (payload) => fifaApi.sendChatMessage(payload),
    onSuccess: () => {
      setText("");
      atBottomRef.current = true;
      queryClient.invalidateQueries({ queryKey: fifaKeys.chat });
    },
    onError: (err) => toast.error(getErrorMessage(err, "Couldn't send your message")),
  });

  if (!creds) return <SignInGate />;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMutation.mutate({ email: creds.email, code: creds.code, text: trimmed });
  };

  return (
    <div className="fifa-page min-h-screen flex flex-col">
      <div className="fifa-header relative overflow-hidden">
        <div className="relative mx-auto max-w-2xl px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h1 className="text-xl font-bold drop-shadow">Group Chat</h1>
              <p className="text-white/60 text-xs">⚽ FIFA WC 2026 · everyone's here</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/fifa/leaderboard"
              className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold shadow-sm transition-all hover:brightness-105 active:scale-95"
              style={{ background: "#e0a431", color: "#1a1a1a" }}
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5 inline" />
              Leaderboard
            </Link>
            <Link
              to="/fifa/play"
              className="text-xs text-white/60 underline hover:text-white/90 transition-colors"
            >
              Back to play
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4"
          style={{ maxHeight: "calc(100vh - 260px)" }}
        >
          {isLoading && (
            <p className="py-10 text-center text-sm text-gray-500">Loading messages…</p>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderName === myName;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-[var(--fifa-green)] text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {!isMe && (
                    <div className="mb-0.5 flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-[var(--fifa-green)]">
                        {msg.senderName}
                      </span>
                      {msg.jnvSchool && (
                        <span className="text-[10px] text-gray-500">{msg.jnvSchool}</span>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p>
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-gray-400">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="Type a message…"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="fifa-btn-primary flex items-center justify-center px-4 py-2.5"
            disabled={sendMutation.isPending || !text.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
