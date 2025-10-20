import { useEffect, useState } from "react";
import "./App.css";

const connectToWSServer = (
  setWsinstance: (ws: WebSocket) => void,
  onMessageReceived: (data: object) => void
) => {
  const ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => {
    console.log("Client connected to websocket");
    setWsinstance(ws);
    ws.send(JSON.stringify({ type: "test", message: "Hello from client!" }));
  };

  ws.onmessage = (event) => {
    console.log("Websocket message is : ", event.data);
    try {
      const data = JSON.parse(event.data);
      console.log(data);
      onMessageReceived(data);
    } catch (e) {
      console.error("Failed to parse wsssssssssssssssssssssss message", e);
    }
  };

  ws.onerror = (error) => {
    console.error("Websocket error", error);
  };

  ws.onclose = () => {
    console.log("Websocket connection closed");
  };

  return ws;
};

function App() {
  const [submitapiResponse, setSubmitapiResponse] = useState<null | object>(
    null
  );
  const [wsinstance, setWsinstance] = useState<WebSocket | null>(null);
  const [submissionResult, setSubmissionResult] = useState<null | object>(null);

  const demoSubmission = {
    userId: 2,
    problemId: 100,
    code: "for int i = 0 ",
    language: "java",
  };

  useEffect(() => {
    const wsinstance = connectToWSServer(setWsinstance, setSubmissionResult);

    return () => {
      if (wsinstance) {
        wsinstance.close();
      }
    };
  }, []);

  const handleSubmission = async () => {
    try {
      const response = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(demoSubmission),
      });
      const data = await response.json();
      setSubmitapiResponse(data);
    } catch (error) {
      console.log("faile dto sent post request", error);
    }
  };

  if (!wsinstance) {
    return <div>Connecting to ws server ....</div>;
  }

  return (
    <div>
      <div>
        I am going to post request server with this body <br />
        {JSON.stringify(demoSubmission)}
      </div>
      <br />
      <div>
        <button onClick={handleSubmission}>
          Make Submission post request{" "}
        </button>
      </div>
      <br />
      <div className="border p-10 m-10">
        <p className="text-2xl"> Message from primary server</p>
        {submitapiResponse && JSON.stringify(submitapiResponse)}
      </div>
      <div className="border p-10 m-5">
        <h1>This is event from ws server published by worker</h1>
        <div>{submissionResult && JSON.stringify(submissionResult)}</div>
      </div>
    </div>
  );
}

export default App;
