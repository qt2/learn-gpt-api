"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { Noto_Emoji } from "next/font/google";

const notoEmoji = Noto_Emoji({ weight: "variable", subsets: ["emoji"] });

async function talk(message: string): Promise<string | null> {
  try {
    let res = await axios.post("https://emotalk.d.qrtz.it/talk", { message });
    return res.data.message;
  } catch (error) {
    return null;
  }
}

interface Message {
  right: boolean;
  content: string;
  loading?: boolean;
  emoji?: boolean;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      right: false,
      content: "Hi! I'll reply to you with an emoji 😊",
    },
  ]);
  const [sendable, setSendable] = useState(false);
  const [editable, setEditable] = useState(true);
  const input = useRef<HTMLInputElement>(null);
  const chatBottom = useRef<HTMLDivElement>(null);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (input.current) {
      const content = input.current.value;
      if (!sendable || !editable) {
        return;
      }
      setMessages((messages) => [...messages, { content, right: true }]);
      input.current.value = "";
      setSendable(false);
      setEditable(false);
      await new Promise((s) => setTimeout(s, 1000));
      setMessages((messages) => [
        ...messages,
        { content: "● ● ●", right: false, loading: true },
      ]);
      const reply = await talk(content);
      setMessages((messages) => {
        messages.pop();
        return [
          ...messages,
          {
            content: reply ?? "Oops! Failed to recieve a message 😭",
            right: false,
            emoji: reply ? true : false,
          },
        ];
      });
      setEditable(true);
    }
  };

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.trim().length == 0 || text.length >= 60) {
      setSendable(false);
    } else {
      setSendable(true);
    }
  };

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="h-screen p-4 md:p-8 flex justify-center items-stretch">
      <main className="w-full sm:max-w-screen-sm flex flex-col items-stretch">
        <div className="grow overflow-y-auto">
          {messages.map((msg, i) => {
            if (msg.emoji) {
              return (
                <div
                  key={i}
                  className={`mt-4 mb-6 text-8xl ${notoEmoji.className}`}
                >
                  {msg.content}
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`chat ${msg.right ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble ${
                    msg.right && "chat-bubble-primary"
                  }`}
                >
                  <span
                    className={`${msg.loading && "animate-pulse"} ${
                      msg.emoji && `my-4 text-6xl ${notoEmoji.className}`
                    }`}
                  >
                    {msg.content}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatBottom} />
        </div>
        <form onSubmit={send} className="form-control mt-4">
          <div className="input-group">
            <input
              ref={input}
              onChange={change}
              type="text"
              placeholder="Type message here..."
              autoFocus
              className="w-full input input-bordered focus:outline-none"
            />
            <button
              type="submit"
              className={`btn btn-circle ${
                (!sendable || !editable) && "btn-disabled"
              }`}
            >
              <IoSend />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
