import { useState } from "react";

export default function PingPage() {
  const [pingTime, setPingTime] = useState<string | null>(null);

  const handlePing = () => {
    const startTime = performance.now();

    fetch("/api/ping")
      .then(() => {
        const endTime = performance.now();
        const ping = endTime - startTime;
        setPingTime(ping.toFixed(2));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Ping Test</h1>
      <p>Delay Time: {pingTime ? `${pingTime} ms` : "Measuring..."}</p>
      <button onClick={handlePing}>Ping Server</button>
    </div>
  );
}
