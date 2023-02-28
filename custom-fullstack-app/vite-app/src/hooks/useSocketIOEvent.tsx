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

  const emitPromise = (
    ...args: Parameters<ClientToServerEvents[StartEvent]>
  ) => {
    console.log("emitPromise");
    return new Promise<Parameters<ServerToClientEvents[EndEvent]>[0]>(
      (resolve = () => {}, reject) => {
        console.log("inner emitPromise", waitingForResponse);
        if (waitingForResponse) {
          const errMsg = `socketIO: ${startEvent}->${endEvent} has not finished yet, emit aborted`;
          console.warn(errMsg);
          reject(errMsg);
          return;
        }
        socket.emit(startEvent, ...args);
        setWaitingForResponse(true);
        // @ts-ignore
        socket.on(endEvent, (...args) => {
          // @ts-ignore
          onEnd(...args);
          setWaitingForResponse(false);
          resolve(...args);
        });
      }
    );
  };

  return { waitingForResponse, emit, emitPromise };
};

// const useSocketIOPromise = () => {
//   return new Promise((resolve, reject) => {
//     useEffect(() => {});
//   });
// };

export const useAsyncEmit = <
  StartEvent extends keyof ClientToServerEvents,
  EndEvent extends keyof ServerToClientEvents
>({
  socket,
  startEvent,
  endEvent,
}: {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  startEvent: StartEvent;
  endEvent: EndEvent;
}) => {
  useEffect(() => {
    // @ts-ignore
    socket.on(endEvent, (...args) => {
      // @ts-ignore
      resolve(...args);
    });
    return () => {
      socket.off(endEvent);
    };
  });

  const emit = (emitArgs: Parameters<ClientToServerEvents[StartEvent]>[0]) =>
    new Promise<Parameters<ServerToClientEvents[EndEvent]>[0]>(
      (resolve, reject) => {
        socket.emit(startEvent, emitArgs);
      }
    );
  return (args: Parameters<ClientToServerEvents[StartEvent]>[0]) => emit(args);
};

export const asyncEmit = <
  StartEvent extends keyof ClientToServerEvents,
  EndEvent extends keyof ServerToClientEvents
>({
  socket,
  startEvent,
  endEvent,
}: {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  startEvent: StartEvent;
  endEvent: EndEvent;
}) => {
  const emit = (emitArgs: Parameters<ClientToServerEvents[StartEvent]>[0]) =>
    new Promise<Parameters<ServerToClientEvents[EndEvent]>[0]>(
      (resolve, reject) => {
        socket.emit(startEvent, emitArgs);
        socket.on(endEvent, (...args) => {
          resolve(...args);
          socket.off(endEvent);
        });
      }
    );
  return (args: Parameters<ClientToServerEvents[StartEvent]>[0]) => emit(args);
};
