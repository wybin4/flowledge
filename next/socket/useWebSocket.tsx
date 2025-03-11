// "use client";
// import { useContext } from "react";
// import { WebSocketContextType, WebSocketContext } from "./WebSocketContext";

// export const useWebSocket = (): WebSocketContextType => {
//     const context = useContext(WebSocketContext);
//     if (!context) {
//         throw new Error("useWebSocket must be used within a WebSocketProvider");
//     }
//     return context;
// };