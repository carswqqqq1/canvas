"use client";

import { useCompletion } from "@ai-sdk/react";
import {
  openaiAuthHeaders,
  useSignInWithChatGPT
} from "@openai-oauth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CanvasMark,
  ChatIcon,
  CloseIcon,
  ExternalIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon
} from "./icons";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const history = [
  ["Explain this repository", "10:23 AM"],
  ["Codex app-server overview", "May 20"],
  ["Local backend design", "May 19"],
  ["OAuth security notes", "May 18"],
  ["Prompting best practices", "May 16"],
  ["Project roadmap", "May 15"]
];

const seedMessages: Message[] = [
  {
    id: "seed-user",
    role: "user",
    text: "Explain this repository in plain language."
  },
  {
    id: "seed-assistant",
    role: "assistant",
    text: "Canvas is a focused web client that sends your prompt through a server route backed by openai-oauth."
  }
];

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function AuthPanel({
  onClose
}: {
  onClose: () => void;
}) {
  const login = useSignInWithChatGPT({ openMode: "popup" });
  const [mobileBrowser, setMobileBrowser] = useState<boolean | null>(null);
  const busy =
    mobileBrowser === null ||
    login.status === "checking" ||
    login.status === "starting" ||
    login.status === "redirecting";

  useEffect(() => {
    setMobileBrowser(isMobileBrowser());
  }, []);

  return (
    <aside className="authPanel" aria-label="ChatGPT sign in">
      <button
        className="iconButton authClose"
        type="button"
        aria-label="Close sign-in panel"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      <div className="authPanelContent">
        <h2>Connect your ChatGPT plan</h2>
        <p>
          Sign in securely with your own ChatGPT account. Your encrypted
          session stays on this device.
        </p>

        {mobileBrowser ? (
          <div className="mobileAuthNotice" role="status">
            <strong>Continue on a computer</strong>
            <p>
              ChatGPT plan sign-in requires desktop Chrome or Firefox and the
              Sign in with ChatGPT extension. Mobile browsers cannot complete
              this OAuth flow.
            </p>
          </div>
        ) : login.isSignedIn ? (
          <div className="signedInBlock">
            <div className="signedInLine">
              <span className="statusDot" />
              ChatGPT connected
            </div>
            <button className="primaryButton" type="button" onClick={login.logout}>
              Disconnect
            </button>
          </div>
        ) : (
          <>
            <button
              className="primaryButton"
              disabled={busy}
              type="button"
              onClick={login.login}
            >
              <CanvasMark />
              {busy ? "Preparing sign-in…" : "Sign in with ChatGPT"}
            </button>

            {login.status === "needs-extension" ? (
              <a
                className="extensionLink"
                href={login.installUrl}
                rel="noreferrer"
                target="_blank"
              >
                Install the required browser extension
                <ExternalIcon />
              </a>
            ) : (
              <span className="authNote">
                Chrome or Firefox extension may be required
              </span>
            )}

            {login.status === "error" ? (
              <p className="authError" role="alert">
                {login.error.message}
              </p>
            ) : null}
          </>
        )}

        <a
          className="howLink"
          href="https://github.com/EvanZhouDev/openai-oauth#react-component"
          rel="noreferrer"
          target="_blank"
        >
          How sign-in works
        </a>
      </div>
    </aside>
  );
}

export function CanvasApp() {
  const login = useSignInWithChatGPT({ openMode: "popup" });
  const [showAuth, setShowAuth] = useState(!login.isSignedIn);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [prompt, setPrompt] = useState("");
  const [search, setSearch] = useState("");
  const { complete, isLoading, error, setCompletion } = useCompletion({
    api: "/api/chat",
    streamProtocol: "text"
  });

  const visibleHistory = useMemo(
    () =>
      history.filter(([title]) =>
        title.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = prompt.trim();
    if (!text || isLoading) return;

    if (!login.isSignedIn) {
      setShowAuth(true);
      return;
    }

    setPrompt("");
    setCompletion("");
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text }
    ]);

    try {
      const response = await complete(text, {
        headers: await openaiAuthHeaders()
      });
      if (response) {
        setMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: "assistant", text: response }
        ]);
      }
    } catch {
      // useCompletion exposes the user-facing error below the composer.
    }
  }

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="brandRow">
          <div className="brand">
            <CanvasMark />
            <span>Canvas</span>
          </div>
          <button className="iconButton newButton" type="button" aria-label="New chat">
            <PlusIcon />
          </button>
        </div>

        <label className="searchBox">
          <SearchIcon />
          <input
            aria-label="Search conversations"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            value={search}
          />
          <kbd>⌘K</kbd>
        </label>

        <nav className="conversationList" aria-label="Conversations">
          <span className="sectionLabel">Today</span>
          {visibleHistory.map(([title, date], index) => (
            <button
              className={`conversationRow ${index === 0 ? "active" : ""}`}
              key={title}
              type="button"
            >
              <ChatIcon />
              <span>{title}</span>
              <time>{date}</time>
            </button>
          ))}
        </nav>

        <button className="settingsButton" type="button">
          <SettingsIcon />
          Settings
        </button>
      </aside>

      <section
        className={`workspace ${
          showAuth && !login.isSignedIn ? "authOpen" : ""
        }`}
      >
        <header className="topbar">
          <div className="accountStatus">
            <span className={login.isSignedIn ? "statusDot" : "statusDot muted"} />
            <span>{login.isSignedIn ? "Connected" : "Not connected"}</span>
            <span className="topDivider" />
            <span>Plan: {login.isSignedIn ? "ChatGPT" : "—"}</span>
            {login.isSignedIn ? (
              <button className="secondaryButton" type="button" onClick={login.logout}>
                Sign out
              </button>
            ) : (
              <button
                className="secondaryButton"
                type="button"
                onClick={() => setShowAuth(true)}
              >
                Connect
              </button>
            )}
          </div>
        </header>

        <div className="chatArea">
          <div className="messages" aria-live="polite">
            {messages.map((message) => (
              <article className="message" key={message.id}>
                <div className={`avatar ${message.role}`}>
                  {message.role === "user" ? "You" : <CanvasMark />}
                </div>
                <div className="messageBody">
                  <div className="messageMeta">
                    <strong>{message.role === "user" ? "You" : "Canvas"}</strong>
                    <time>now</time>
                  </div>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
            {isLoading ? (
              <article className="message">
                <div className="avatar assistant">
                  <CanvasMark />
                </div>
                <div className="messageBody">
                  <div className="messageMeta">
                    <strong>Canvas</strong>
                    <span className="thinking">Thinking</span>
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          <form className="composer" onSubmit={submit}>
            <textarea
              aria-label="Message"
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={
                login.isSignedIn
                  ? "Ask anything…"
                  : "Connect your ChatGPT plan to start…"
              }
              rows={3}
              value={prompt}
            />
            <button
              className="sendButton"
              disabled={!prompt.trim() || isLoading}
              type="submit"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
          {error ? (
            <p className="requestError" role="alert">
              {error.message}
            </p>
          ) : null}
        </div>

        {showAuth && !login.isSignedIn ? (
          <AuthPanel onClose={() => setShowAuth(false)} />
        ) : null}
      </section>
    </main>
  );
}
