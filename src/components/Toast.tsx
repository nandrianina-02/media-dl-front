"use client";
import clsx from "clsx";

interface Props {
  message: string;
  type: "ok" | "err";
}

export default function Toast({ message, type }: Props) {
  return (
    <div
      className={clsx(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl font-mono text-sm",
        "border backdrop-blur-md shadow-xl animate-fade-in",
        type === "ok"
          ? "bg-green/10 border-green/30 text-green"
          : "bg-red/10 border-red/30 text-orange"
      )}
    >
      {message}
    </div>
  );
}
