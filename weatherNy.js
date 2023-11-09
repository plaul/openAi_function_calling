import OpenAI from "openai";
import dotenv from "dotenv";
import { getWeatherForCity } from "./utils/utils.js"
dotenv.config();
const model = "gpt-3.5-turbo-1106"
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

async function callGpt(model, systemPrompt, userPrompt) {
  // Step 1: send the conversation and available functions to the model
  const messages = [
    { role: "system", content: systemPrompt} ,
    //{ role: "user", content: "hvor blæser det mest lige nu og hvor meget, i Århus, København eller Stockholm" },
    { role: "user", content: userPrompt },
  ];
  const tools = [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            // unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model,
    messages: messages,
    tools: tools,
    tool_choice: "auto", // auto is actually default
  });
  const responseMessage = response.choices[0].message;

  const toolCalls = responseMessage.tool_calls;
  if (responseMessage.tool_calls) {
    // Step 3: call the function
    // Note: the JSON response may not always be valid; be sure to handle errors
    const availableFunctions = {
      get_weather: getWeatherForCity,
    }; // only one function in this example, but you can have multiple
    messages.push(responseMessage); // extend conversation with assistant's reply
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionResponse = await functionToCall(
        functionArgs.location,
        //functionArgs.unit
      );
      messages.push({
        tool_call_id: toolCall.id,
        //toolCall,
        role: "tool",
        name: functionName,
        content: JSON.stringify(functionResponse),
      });
    }
    const secondResponse = await openai.chat.completions.create({
      model,
      messages: messages,
    });
    return secondResponse.choices;
  }
}
callGpt(model,
  "Give short answers, in Danish or English depending on the user language. Make sure to provide answer to all sub-questions given",
  "hvordan er vejret i danmark, norge og sverige lige nu"
  )
  .then(console.log)
  .catch(e =>console.error(e.error));