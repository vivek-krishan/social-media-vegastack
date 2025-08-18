import { Server } from "socket.io";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { getIO, setIO } from "@/lib/socket";
import { NextApiRequest, NextApiResponse } from "next";
import { createServer } from "http";

export async function GET(req: Request) {
  // Check if Socket.IO is already initialized
  try {
    const io = await getIO();
    console.log("Socket.IO already initialized");
    return new Response("Socket.IO already running", { status: 200 });
  } catch (error) {
    // Not initialized yet, proceed to set up
    console.log("Initializing Socket.IO");

    const httpServer = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Socket.IO server");
    });

    const io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // Authentication middleware
    io.use(async (socket, next) => {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error("No session cookie"));
      }

      const fakeReq = {
        headers: { cookie: cookies },
      } as unknown as NextApiRequest;

      const session = await getServerSession(
        fakeReq,
        {} as NextApiResponse,
        authOptions
      );
      if (!session || !session.user) {
        return next(new Error("Unauthorized"));
      }

      socket.data.userId = session.user._id;
      next();
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.data.userId);
      socket.join(socket.data.userId.toString());

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.data.userId);
      });
    });

    // Store IO instance
    setIO(io);
    httpServer.listen(0);

    return new Response("Socket.IO initialized", { status: 200 });
  }
}
