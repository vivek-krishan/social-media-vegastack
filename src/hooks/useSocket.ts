"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
import { toast } from "sonner";

export function useSocket() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = io("/", {
      path: "/api/socket",
      query: { userId: session.user._id },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("notification", (data) => {
      // Display toast notification
      //   toast.success(data.message, {
      //     duration: 5000,
      //     position: "top-right",
      //   });
      console.log({ SocketData: data });
      toast.success(data.message);

      // Optionally, update UI (e.g., increment like/comment count in real-time)
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  return socket;
}
