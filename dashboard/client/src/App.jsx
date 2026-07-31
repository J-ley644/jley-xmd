import { useEffect, useState } from "react";
import { apiGet } from "./services/api";

function App() {
const [status, setStatus] = useState(null);
const [error, setError] = useState("");

useEffect(() => {
apiGet("/api/status")
.then((data) => {
setStatus(data);
})
.catch((err) => {
setError(err.message);
});
}, []);

return (
<div style={{ padding: "40px", fontFamily: "Arial" }}> <h1>JLEY-XMD Dashboard</h1>


  {error && <p>API Error: {error}</p>}

  {status && (
    <div>
      <p>Bot: <strong>{status.bot}</strong></p>
      <p>Version: <strong>{status.version}</strong></p>
      <p>Mode: <strong>{status.mode}</strong></p>
      <p>Status: <strong>{status.status}</strong></p>
    </div>
  )}
</div>


);
}

export default App;
