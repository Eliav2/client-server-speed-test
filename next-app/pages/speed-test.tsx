import { useState } from "react";

export default function SpeedTestPage() {
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");

  const handleSpeedTest = () => {
    const fileSizeInBytes = 1048576; // 1MB
    const fileUrl = "/api/speedtest?size=" + fileSizeInBytes;

    const downloadStartTime = performance.now();
    let measureTime: null | number = null;
    fetch(fileUrl)
      .then((response) => {
        const downloadEndTime = performance.now();
        measureTime = downloadEndTime - downloadStartTime;
        console.log(measureTime);
        const downloadSpeedInMbps = (
          fileSizeInBytes /
          8 /
          2 ** 20 /
          (measureTime / 1000)
        ).toFixed(2);
        setDownloadSpeed(downloadSpeedInMbps);
      })
      .catch((error) => {
        console.error(error);
      });

    //   const uploadStartTime = performance.now();
    //   fetch(fileUrl, {
    //     method: "POST",
    //     body: new Blob([new Uint8Array(fileSizeInBytes)]),
    //   })
    //     .then((response) => {
    //       const uploadEndTime = performance.now();
    //       const uploadSpeedInMbps = (
    //         ((fileSizeInBytes / (uploadEndTime - uploadStartTime)) * 8) /
    //         1000000
    //       ).toFixed(2);
    //       setUploadSpeed(uploadSpeedInMbps);
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
  };

  return (
    <div>
      <h1>Speed Test</h1>
      <p>
        Download Speed:{" "}
        {downloadSpeed ? `${downloadSpeed} Mbps` : "Measuring..."}
      </p>
      {/*<p>*/}
      {/*  Upload Speed: {uploadSpeed ? `${uploadSpeed} Mbps` : "Measuring..."}*/}
      {/*</p>*/}
      <button onClick={handleSpeedTest}>Run Speed Test</button>
    </div>
  );
}
