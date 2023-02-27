import { useState, useEffect } from "react";

const minTests = 3;
export default function SpeedTestPage() {
  const [downloadSpeeds, setDownloadSpeeds] = useState<string[]>([]);
  const [uploadSpeeds, setUploadSpeeds] = useState<string[]>([]);
  const [averageDownloadSpeed, setAverageDownloadSpeed] = useState<
    string | null
  >(null);
  const [averageUploadSpeed, setAverageUploadSpeed] = useState<string | null>(
    null
  );
  const [isMeasuring, setIsMeasuring] = useState(false);

  const handleSpeedTest = () => {
    setIsMeasuring(true);
    setDownloadSpeeds([]);
    setUploadSpeeds([]);
  };

  useEffect(() => {
    const fileSizeInBytes = 1048576; // 1MB
    const fileUrl = "/api/speedtest?size=" + fileSizeInBytes;

    let downloadSpeedTimeout: NodeJS.Timeout | null = null;
    let uploadSpeedTimeout: NodeJS.Timeout | null = null;

    const measureDownloadSpeed = () => {
      const downloadStartTime = performance.now();
      fetch(fileUrl)
        .then((response) => {
          const downloadEndTime = performance.now();
          const downloadSpeedInMbps = (
            ((fileSizeInBytes / (downloadEndTime - downloadStartTime)) * 8) /
            1000000
          ).toFixed(2);
          setDownloadSpeeds((prevDownloadSpeeds) => [
            ...prevDownloadSpeeds,
            downloadSpeedInMbps,
          ]);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          // downloadSpeedTimeout = setTimeout(measureDownloadSpeed, 500);
        });
    };

    const measureUploadSpeed = () => {
      const uploadStartTime = performance.now();
      fetch(fileUrl, {
        method: "POST",
        body: new Blob([new Uint8Array(fileSizeInBytes)]),
      })
        .then((response) => {
          const uploadEndTime = performance.now();
          const uploadSpeedInMbps = (
            ((fileSizeInBytes / (uploadEndTime - uploadStartTime)) * 8) /
            1000000
          ).toFixed(2);
          setUploadSpeeds((prevUploadSpeeds) => [
            ...prevUploadSpeeds,
            uploadSpeedInMbps,
          ]);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          // uploadSpeedTimeout = setTimeout(measureUploadSpeed, 500);
        });
    };

    if (isMeasuring) {
      measureDownloadSpeed();
      measureUploadSpeed();
    } else {
      // clearTimeout(downloadSpeedTimeout!);
      // clearTimeout(uploadSpeedTimeout!);
    }

    console.log(isMeasuring);
    return () => {
      clearTimeout(downloadSpeedTimeout!);
      clearTimeout(uploadSpeedTimeout!);
    };
  }, [isMeasuring]);
  console.log(isMeasuring);

  useEffect(() => {
    if (downloadSpeeds.length > 0) {
      const curAverageDownloadSpeed =
        downloadSpeeds.reduce((acc, curr) => acc + parseFloat(curr), 0) /
        downloadSpeeds.length;
      const roundedAverageDownloadSpeed = curAverageDownloadSpeed.toFixed(3);
      if (roundedAverageDownloadSpeed != averageDownloadSpeed) {
        setAverageDownloadSpeed(roundedAverageDownloadSpeed);
      }
    } else {
      setAverageDownloadSpeed(null);
    }
  }, [downloadSpeeds]);

  useEffect(() => {
    if (uploadSpeeds.length > 0) {
      const averageUploadSpeed =
        uploadSpeeds.reduce((acc, curr) => acc + parseFloat(curr), 0) /
        uploadSpeeds.length;
      setAverageUploadSpeed(averageUploadSpeed.toFixed(2));
    } else {
      setAverageUploadSpeed(null);
    }
  }, [uploadSpeeds]);

  useEffect(() => {
    if (averageDownloadSpeed && averageUploadSpeed) {
      setIsMeasuring(false);
    }
  }, [averageDownloadSpeed, averageUploadSpeed]);

  console.log(
    "render",
    downloadSpeeds,
    averageDownloadSpeed,
    averageUploadSpeed
  );

  return (
    <div>
      <button onClick={handleSpeedTest}>Speed Test</button>
      <p>
        Download Speed:{" "}
        {averageDownloadSpeed ? `${averageDownloadSpeed} Mbps` : "Measuring..."}
      </p>
      <p>
        Upload Speed:{" "}
        {averageUploadSpeed ? `${averageUploadSpeed} Mbps` : "Measuring..."}
      </p>
    </div>
  );
}
