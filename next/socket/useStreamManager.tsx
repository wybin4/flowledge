// // sdk.ts
// import { WebSocketContext, WebSocketContextType } from "./WebSocketClient";
// import { useContext } from "react";

// export const useStreamManager = () => {
//     const context = useContext(WebSocketContext);
//     if (!context) {
//         throw new Error("useStreamManager must be used within a WebSocketProvider");
//     }

//     const { subscribeToStream, unsubscribeFromStream } = context;

//     const stream = <T extends string>(event: T, callback: (data: any) => void) => {
//         subscribeToStream(event, callback);

//         return () => {
//             unsubscribeFromStream(event);
//         };
//     };

//     return { stream };
// };
