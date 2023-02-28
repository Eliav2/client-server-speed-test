import { useEffect, useRef, useState } from "react";
import { asyncEmit, useSocketIOEvent } from "./hooks/useSocketIOEvent";
import { useSocketIOServer } from "./hooks/useSocketIOServer";

type SpeedMeasurement = {
  fileSizeInBytes: number;
  downloadTimeInSecs: number;
};

const MAX_FILE_SIZE_IN_MB = 128;

const calcDownloadSpeedInMbps = (
  fileSizeInBytes: number,
  downloadTimeInSecs: number
) => {
  const fileSizeInMBits = (fileSizeInBytes * 8) / 2 ** 20;
  return fileSizeInMBits / downloadTimeInSecs;
};

const SpeedTest = ({ downloadFileStartSizeInBits = 1024 }) => {
  const socket = useSocketIOServer();
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [downloadSpeedInMbps, setDownloadSpeedInMbps] = useState<null | number>(
    null
  );

  const [downloadMeasurements, setDownloadMeasurements] = useState<
    SpeedMeasurement[]
  >([]);

  const [fileSizeInBytes, setFileSizeInBytes] = useState(
    downloadFileStartSizeInBits
  );

  const [downloadTestInProgress, setDownloadTestInProgress] = useState(false);

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

  const emitSpeedTest = asyncEmit({
    socket,
    startEvent: "start-speed-test",
    endEvent: "speed-test",
  });

  const downloadTest = async () => {
    const { time: startTime } = await emitSpeedTest({
      time: performance.now(),
      fileSize: fileSizeInBytes,
    });
    const end = performance.now();
    const latency = end - startTime;
    const measuredDownloadSpeedInMbps = calcDownloadSpeedInMbps(
      fileSizeInBytes,
      latency / 1000
    );
    if (
      !downloadSpeedInMbps ||
      measuredDownloadSpeedInMbps > downloadSpeedInMbps
    )
      setDownloadSpeedInMbps(measuredDownloadSpeedInMbps);
    else {
      console.log("set false");
      setDownloadTestInProgress(false);
      return;
    }

    setDownloadMeasurements([
      ...downloadMeasurements,
      { downloadTimeInSecs: latency / 1000, fileSizeInBytes },
    ]);

    const curSpeed = calcDownloadSpeedInMbps(fileSizeInBytes, latency / 1000);
    const prevSpeed =
      downloadMeasurements.at(-1) &&
      calcDownloadSpeedInMbps(
        downloadMeasurements.at(-1)!.fileSizeInBytes,
        downloadMeasurements.at(-1)!.downloadTimeInSecs
      );
    if (
      latency < 50 ||
      downloadMeasurements.length < 2 ||
      curSpeed > prevSpeed!
    ) {
      if (fileSizeInBytes < MAX_FILE_SIZE_IN_MB * 2 ** 20)
        setFileSizeInBytes(fileSizeInBytes * 2);
    }
  };
  const startTest = async () => {
    console.log("test!");
    if (!waitingForPing) emitPing(performance.now());
    setDownloadTestInProgress(true);
    // downloadTest();
  };

  useEffect(() => {
    if (downloadTestInProgress) downloadTest();
  }, [fileSizeInBytes, downloadTestInProgress]);

  return (
    <div>
      <h1>Speed test</h1>
      <button onClick={startTest}>Start Test</button>

      <p>fileSize: {fileSizeInBytes / 2 ** 20}MB </p>
      {pingTime && <p>ping: {pingTime.toFixed(2)}ms</p>}
      {downloadSpeedInMbps && (
        <p>
          {downloadSpeedInMbps.toFixed(3)}Mbps (
          {(downloadSpeedInMbps / 8).toFixed(3)}MB/sec)
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
