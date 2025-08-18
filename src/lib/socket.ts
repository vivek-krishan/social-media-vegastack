import { Server } from "socket.io";
import { createServer } from "http";

let io: Server | null = null;

export function setIO(socketIO: Server) {
  io = socketIO;
}

export async function getIO() {
  if (!io) {
    console.log(
      "Socket.IO not initialized, attempting to initialize via /api/socket"
    );

    // Create a fake HTTP server for Socket.IO
    const httpServer = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Socket.IO server");
    });

    io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // Trigger /api/socket to set up authentication and rooms
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/socket`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initialize Socket.IO via /api/socket");
      }

      setIO(io);
      httpServer.listen(0); // Random port for serverless
    } catch (error) {
      console.error("Error initializing Socket.IO:", error);
      throw new Error("Socket.IO initialization failed");
    }
  }

  return io;
}
