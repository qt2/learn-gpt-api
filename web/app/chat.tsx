"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import axios from "axios";

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
        <div className="grow overflow-y-auto flex flex-col">
          {messages.map((msg, i) => (
            <Item msg={msg} key={i} />
          ))}
          <div className="grow" />
          <div ref={chatBottom} className="" />
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

function Item({ msg }: { msg: Message }) {
  if (msg.emoji) {
    return (
      <div className={`mt-4 mb-6 text-8xl font-emoji`}>
        {Array.from(msg.content)[0]}
      </div>
    );
  }
  return (
    <div className={`chat ${msg.right ? "chat-end" : "chat-start"}`}>
      <div className={`chat-bubble ${msg.right && "chat-bubble-primary"}`}>
        <span className={`${msg.loading && "animate-pulse"}`}>
          {msg.content}
        </span>
      </div>
    </div>
  );
}
