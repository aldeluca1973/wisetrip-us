export async function llmJSON(system: string, user: unknown) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) }
      ]
    })
  });
  
  if (!r.ok) {
    throw new Error(`OpenAI API error: ${r.status} ${r.statusText}`);
  }
  
  const data = await r.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content received from OpenAI API");
  }
  
  return JSON.parse(content);
}
