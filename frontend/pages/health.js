import { useEffect, useState } from "react";

export default function HealthPage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch health status from the backend
    fetch("https://curly-tribble-x55xx776wqqgfpxp6-8000.app.github.dev/health")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ error: "Backend not reachable" }));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Frontend Health Check</h1>
      {status ? (
        <pre>{JSON.stringify(status, null, 2)}</pre>
      ) : (
        <p>Loading backend status...</p>
      )}
    </div>
  );
}
