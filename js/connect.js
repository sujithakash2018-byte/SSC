async function sendToAI(summaryData) {
  const res = await fetch("http://127.0.0.1:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(summaryData)
  });

  const data = await res.json();
  console.log("AI Insight:", data.insight);

  alert(data.insight); // temporary UI
}