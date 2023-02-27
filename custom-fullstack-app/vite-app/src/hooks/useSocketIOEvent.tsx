import { ClientToServerEvents, ServerToClientEvents } from "speed-test-backend";
import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";

export const useSocketIOEvent = <
  StartEvent extends keyof ClientToServerEvents,
  EndEvent extends keyof ServerToClientEvents
>({
  socket,
  startEvent,
  // onStart,
  endEvent,
  onEnd,
}: {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  startEvent: StartEvent;
  // onStart: ClientToServerEvents[StartEvent];
  endEvent: EndEvent;
  onEnd: ServerToClientEvents[EndEvent];
}) => {
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const emit = (...args: Parameters<ClientToServerEvents[StartEvent]>) => {
    if (waitingForResponse) {
      console.warn(
        `socketIO: ${startEvent}->${endEvent} has not finished yet, emit aborted`
      );
      return;
    }
    socket.emit(startEvent, ...args);
    setWaitingForResponse(true);
  };

  useEffect(() => {
    // @ts-ignore
    socket.on(endEvent, (...args) => {
      // @ts-ignore
      onEnd(...args);
      setWaitingForResponse(false);
    });
    return () => {
      socket.off(endEvent);
    };
  });

  return { waitingForResponse, emit };
};
