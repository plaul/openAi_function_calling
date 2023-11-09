import OpenAI from "openai";
import dotenv from "dotenv";
import { getWeatherForCity } from "./utils/utils.js"
dotenv.config();
const model = "gpt-3.5-turbo-1106"
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

const messages = [
  { role: "system", content: "Give short answers, in danish or english depending on the user language" },
  { role: "user", content: "Skinner solen i Odense" },
  //{ role: "user", content: "Does the the sun shine in odense" },
]

const weatherFuncSpec = {
  "name": "weather",
  "description": "Get current weather in a city",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "City to get weather for"
      }
    },
    required: ["city"]
  },
}
console.log("--------------- First Request -----------------")
const response = await openai.chat.completions.create({
  model,
  temperature: 0.7,
  messages,
  //functions: [weatherFuncSpec],
  tools: [{ type: "function", function: weatherFuncSpec }],
  tool_choice: "auto"
});

let responseMessage = response.choices[0].message;
//messages.push(responseMessage)
console.log("---------- Response Message From First Request -------------")
//console.log(responseMessage)
const toolCalls = responseMessage.tool_calls
if (toolCalls) {
  const availableFunctions = {
    weather: getWeatherForCity
  }
  messages.push(responseMessage)
  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const functionToCall = availableFunctions[functionName];
    const functionArgs = JSON.parse(toolCall.function.arguments);
    const functionResponse = await functionToCall(
      functionArgs.city,
      //functionArgs.unit
    );
    messages.push({
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: functionResponse,
    }); // extend conversation with function response
  }
}
try {
  console.log(messages)
  const second_response = await openai.chat.completions.create({
    model,
    temperature: 0,
    messages: messages,
    // tools: [{type:"function",function:weatherFuncSpec}]  //Is this neccesary here?
  })
  console.log(second_response.choices)
} catch (err) {
  console.error(err.message)
}






