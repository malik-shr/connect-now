"use client";

import Link from "next/link";
import { use } from "react";
import { useAuth } from "~/app/_context/AuthContext";

interface MenuItem {
  href: string;
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
}

export default function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { user } = useAuth();

  // Dynamic support card texts based on logged-in persona role
  let supportTitle = "Request help";
  let supportDesc = "Ask the installer or grid operator a question.";

  if (user?.role === "installer") {
    supportTitle = "Open customer chat";
    supportDesc = "Open the chat history to help the customer with documents.";
  } else if (user?.role === "admin") {
    supportTitle = "View support chat";
    supportDesc = "Review the ticket history between customer and installer.";
  }

  const menu: MenuItem[] = [
    {
      href: `/orders/${orderId}/details`,
      icon: "📝",
      title: "Grid connection data",
      description:
        "Capture the 50+ mandatory fields of the connection request digitally.",
    },
    {
      href: `/orders/${orderId}/metering`,
      icon: "🔗",
      title: "Metering concept builder",
      description:
        "Assemble the right metering concept via a guided no-code wizard.",
    },
    {
      href: `/orders/${orderId}/documents`,
      icon: "📄",
      title: "Documents (AI check)",
      description:
        "Upload your documents and have them verified by AI before submission.",
    },
    {
      href: `/orders/${orderId}/status`,
      icon: "📊",
      title: "Status portal",
      description:
        "View real-time processing status, timeline and missing documents.",
    },
    {
      href: `/orders/${orderId}/support`,
      icon: "💬",
      title: supportTitle,
      description: supportDesc,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            ConnectNow · Order
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Order ID:{" "}
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
              {orderId}
            </span>
          </p>
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menu.map((item, i) =>
            item.disabled ? (
              <div
                key={i}
                className="flex cursor-not-allowed flex-col rounded-2xl border border-slate-200 bg-white p-6 opacity-50 shadow-sm"
                aria-disabled
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="mt-3 text-base font-bold text-slate-800">
                  {item.title}
                </span>
                <span className="mt-1 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </span>
                <span className="mt-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Coming soon
                </span>
              </div>
            ) : (
              <Link
                key={i}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-lg"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="mt-3 text-base font-bold text-slate-800 group-hover:text-blue-700">
                  {item.title}
                </span>
                <span className="mt-1 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </span>
                <span className="mt-3 text-sm font-semibold text-blue-600">
                  Open →
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
