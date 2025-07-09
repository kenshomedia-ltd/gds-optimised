"use client";

import { useEffect, useState } from "react";
import type { TUserMessage } from "@/types/user.types";
import type { TranslationData } from "@/types/strapi.types";
import Link from "next/link";
import DOMPurify from "dompurify";
import { Spinner } from "../ui/Spinner";
import { useUser, useUserActions } from "@/contexts/UserContext";

export default function Messages({
  translations,
}: {
  translations: TranslationData;
}) {
  const { state } = useUser();
  const { setReadMessages } = useUserActions();
  const [messages, setMessages] = useState<TUserMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<TUserMessage | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState<{ [key: number]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/messages/`
        );
        const data = await res.json();
        setMessages(data);
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const handleRead = async (id: number) => {
    if (!state.readMessages.includes(id)) {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/message-action/`,
        {
          method: "POST",
          body: JSON.stringify({ message_id: id, action: "READ" }),
        }
      );
      setReadMessages([...state.readMessages, id]);
    }
  };

  const handleDelete = async (message: TUserMessage) => {
    setDeleteLoader((prev) => ({ ...prev, [message.id]: true }));

    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/message-action/`,
      {
        method: "POST",
        body: JSON.stringify({ message_id: message.id, action: "DELETE" }),
      }
    );

    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    setDeleteLoader((prev) => ({ ...prev, [message.id]: false }));

    if (selectedMessage?.id === message.id) setSelectedMessage(null);
  };

  const handleSelectMessage = (message: TUserMessage) => {
    handleRead(message.id);
    setSelectedMessage(message);
  };

  return (
    <div>
      {!selectedMessage ? (
        <h1 className="text-xl text-white font-bold mb-4">
          {translations.message}
        </h1>
      ) : (
        <div className="flex justify-between items-center gap-x-3 mb-4">
          <button
            onClick={() => setSelectedMessage(null)}
            className="flex gap-x-2 items-center text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 8H1M1 8L8 15M1 8L8 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold">
              Back to {translations.message}
            </span>
          </button>

          <button
            onClick={() => handleDelete(selectedMessage)}
            disabled={deleteLoader[selectedMessage.id]}
            className="hidden md:block btn-secondary px-4 py-2 text-sm font-semibold text-white uppercase"
          >
            {deleteLoader[selectedMessage.id] ? (
              <Spinner />
            ) : (
              translations.delete
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : messages.length ? (
        <div className="dashboard-glass-wrapper p-3">
          {!selectedMessage ? (
            <div className="bg-white border rounded-md py-4 px-6">
              <table>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="flex items-center cursor-pointer"
                    >
                      <td
                        className="flex items-center basis-42 pr-8"
                        onClick={() => handleSelectMessage(msg)}
                      >
                        {!state.readMessages.includes(msg.id) && (
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        )}
                        <span
                          className={`line-clamp-1 ${
                            !state.readMessages.includes(msg.id)
                              ? "font-bold"
                              : ""
                          }`}
                        >
                          {msg.title}
                        </span>
                      </td>
                      <td className="hidden md:flex flex-auto">
                        <span
                          className="line-clamp-1 text-base"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(msg.content),
                          }}
                        />
                      </td>
                      <td className="hidden md:block whitespace-nowrap">
                        <div className="flex gap-x-2">
                          <button
                            className="btn btn-misc text-white px-4 py-2 text-sm"
                            onClick={() => handleSelectMessage(msg)}
                          >
                            {translations.readMessage}
                          </button>
                          <button
                            className="btn-secondary text-white px-4 py-2 text-sm"
                            onClick={() => handleDelete(msg)}
                            disabled={deleteLoader[msg.id]}
                          >
                            {deleteLoader[msg.id] ? (
                              <Spinner />
                            ) : (
                              translations.delete
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-blue-100 rounded-[6px] py-4 px-6">
              <h2 className="text-lg font-bold">{selectedMessage.title}</h2>
              <div
                className="prose max-w-full"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedMessage.content),
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 px-8">
          <p className="text-center text-white">
            {translations.emptyUserMessages}
            <Link href="/contact-us" className="text-misc underline ml-1">
              {translations.contactUsHere}
            </Link>
          </p>
        </div>
      )}

      {selectedMessage && (
        <button
          className="md:hidden w-full mt-6 btn-secondary px-4 py-2 text-sm font-semibold text-white"
          onClick={() => handleDelete(selectedMessage)}
          disabled={deleteLoader[selectedMessage.id]}
        >
          {deleteLoader[selectedMessage.id] ? <Spinner /> : translations.delete}
        </button>
      )}
    </div>
  );
}
