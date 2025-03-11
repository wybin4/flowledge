// "use client";
// import { useEffect } from "react";
// import { useWebSocket } from "./useWebSocket";

// const useWebSocketSubscription = (channel: string, callback: (payload: any) => void) => {
//     const { subscribeToChannel, unsubscribeFromChannel } = useWebSocket();

//     useEffect(() => {
//         subscribeToChannel(channel, callback);

//         return () => {
//             unsubscribeFromChannel(channel);
//         };
//     }, [channel, subscribeToChannel, unsubscribeFromChannel, callback]);
// };

// export default useWebSocketSubscription;
