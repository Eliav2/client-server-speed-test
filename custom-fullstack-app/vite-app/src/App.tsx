import { useEffect, useRef, useState } from "react";
import { useSocketIOEvent } from "./hooks/useSocketIOEvent";
import { useSocketIOServer } from "./hooks/useSocketIOServer";

type SpeedMeasurement = {
  fileSizeInBytes: number;
  downloadTimeInSecs: number;
};
// const calcAvgDownloadSpeedInMbps = (arr: SpeedMeasurement[]) => {
//   const totalDownloadTimeInSecs = arr.reduce(
//     (a, b) => a + b.downloadTimeInSecs,
//     0
//   );
//
//   const totalDownloadSizeInBytes = arr.reduce(
//     (a, b) => a + b.fileSizeInBytes,
//     0
//   );
//   const totalDownloadSizeInMBits = (totalDownloadSizeInBytes * 8) / 2 ** 20;
//   arr.forEach((a) => {
//     console.log((a.fileSizeInBytes * 8) / 2 ** 20 / a.downloadTimeInSecs);
//   });
//   console.log(totalDownloadSizeInMBits, totalDownloadTimeInSecs);
//   return totalDownloadSizeInMBits / totalDownloadTimeInSecs;
// };

const MAX_FILE_SIZE_IN_MB = 128;

const SpeedTest = ({ downloadFileStartSizeInBits = 1024 }) => {
  const socket = useSocketIOServer();
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [downloadTimeInSecs, setDownloadTimeInSecs] = useState<number | null>(
    null
  );

  const [downloadMeasurements, setDownloadMeasurements] = useState<
    SpeedMeasurement[]
  >([]);

  const [fileSizeInBytes, setFileSizeInBytes] = useState(
    downloadFileStartSizeInBits
  );

  // useLayoutEffect(() => {
  //   if (downloadTimeInSecs)
  //     setDownloadTimesInSecs([
  //       ...downloadMeasurements,
  //       { downloadTimeInSecs, fileSizeInBytes },
  //     ]);
  // }, [downloadTimeInSecs]);

  const { emit: emitPing, waitingForResponse: waitingForPing } =
    useSocketIOEvent({
      socket,
      startEvent: "ping",
      endEvent: "pong",
      onEnd: (start) => {
        const end = performance.now();
        const latency = end - start;
        setPingTime(latency);
      },
    });

  const {
    emit: emitDownloadSpeedTest,
    waitingForResponse: waitingForDownloadSpeedTest,
  } = useSocketIOEvent({
    socket,
    startEvent: "start-speed-test",
    endEvent: "speed-test",
    onEnd: ({ time: startTime }) => {
      const end = performance.now();
      const latency = end - startTime;
      setDownloadTimeInSecs(latency / 1000);
      setDownloadMeasurements([
        ...downloadMeasurements,
        { downloadTimeInSecs: latency / 1000, fileSizeInBytes },
      ]);
    },
  });

  const startTest = () => {
    if (!waitingForPing) emitPing(performance.now());
    if (!waitingForDownloadSpeedTest)
      emitDownloadSpeedTest({
        time: performance.now(),
        fileSize: fileSizeInBytes,
      });
  };

  const fileSizeInBits = fileSizeInBytes * 8;
  const fileSizeInMBits = fileSizeInBits / 2 ** 20;
  const downloadSpeedInMbps =
    downloadTimeInSecs && fileSizeInMBits / downloadTimeInSecs;

  const prevDownloadSpeedInMbps = useRef<number | null>(null);

  // const avgDownloadSpeedInMbps =
  //   calcAvgDownloadSpeedInMbps(downloadMeasurements);
  // console.log(downloadMeasurements);

  // console.log(waitingForDownloadSpeedTest);
  useEffect(() => {
    // if we are waiting for a response, do nothing
    if (waitingForDownloadSpeedTest) {
      return;
    }

    // at least 3 measurements
    if (
      downloadMeasurements.length < 3 ||
      !downloadSpeedInMbps ||
      !prevDownloadSpeedInMbps.current
    ) {
      startTest();
      setFileSizeInBytes(fileSizeInBytes * 2);
      return;
    }
    console.log(downloadMeasurements.at(-1)?.downloadTimeInSecs);
    console.log(
      `downloadSpeedInMbps: ${downloadSpeedInMbps}Mbps, prevDownloadSpeedInMbps: ${prevDownloadSpeedInMbps.current}Mbps`
    );
    // as long as the measured speed increases, trigger another measurement
    if (downloadSpeedInMbps > prevDownloadSpeedInMbps.current) {
      // double the file size
      if (fileSizeInBytes < MAX_FILE_SIZE_IN_MB * 2 ** 20)
        setFileSizeInBytes(fileSizeInBytes * 2);
      startTest();
      // setFinalDownloadSpeedInMbps(avgDownloadSpeedInMbps);
    }
  }, [waitingForDownloadSpeedTest]);

  useEffect(() => {
    if (downloadSpeedInMbps) {
      prevDownloadSpeedInMbps.current = downloadSpeedInMbps;
    }
  }, [downloadSpeedInMbps]);

  console.log("123");
  // useLayoutEffect(() => {
  //   // console.log(downloadTimeSecs, downloadSpeedWaitingForResponse);
  //   if (
  //       downloadTimeInSecs &&
  //       !waitingForDownloadSpeedTest &&
  //       downloadTimeInSecs < 0.5
  //   ) {
  //     console.log(`${downloadTimeInSecs}secs is lower then 0.1Secs, So twice!`);
  //     // console.log("twice!", downloadTimeSecs, downloadSpeedWaitingForResponse);
  //     setFileSizeInBytes(fileSizeInBytes * 2);
  //   } else {
  //     console.log("speed");
  //   }
  // }, [waitingForDownloadSpeedTest]);

  return (
    <div>
      <h1>Speed test</h1>
      <button onClick={startTest}>Start Test</button>

      <p>fileSize: {fileSizeInMBits / 8}MB </p>
      <p>Download time: {downloadTimeInSecs?.toFixed(3)}Secs </p>
      {pingTime && <p>ping: {pingTime.toFixed(2)}ms</p>}
      {downloadTimeInSecs && (
        <p>
          {(fileSizeInMBits / downloadTimeInSecs).toFixed(3)}Mbps (
          {(fileSizeInMBits / downloadTimeInSecs / 8).toFixed(3)}MB/sec)
        </p>
      )}
    </div>
  );
};

function App() {
  // console.log(navigator.connection);
  // const resources = performance.getEntriesByType("resource");
  // console.log(resources);
  // for (const resource of resources) {
  //   console.log(`Resource ${resource.name} loaded in ${resource.duration}ms`);
  // }
  return <SpeedTest />;
}

export default App;
