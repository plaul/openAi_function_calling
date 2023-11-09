import OpenAI from "openai";
import dotenv from "dotenv";
import {getWeatherForCity} from "./utils/utils.js"
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
//const model = "gpt-3.5-turbo-1106"
const model = "gpt-3.5-turbo"
const temperature = 0.0

const messages= [
  { role: "system", content: `Give short answers, in danish or english depending on the 
   user language. Make sure to provide answer to all sub-questions given`
    },
   { role: "user", content: "Vis temperaturene lige nu for byerne Århus København og Stockholm" },
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
  temperature,
  messages,
  functions: [weatherFuncSpec],
});

let responseMessage =  response.choices[0].message;
messages.push(responseMessage)
console.log("---------- Response Message From First Request -------------")
console.log(responseMessage)

if(responseMessage.function_call?.name==="weather"){
  const args = JSON.parse(responseMessage.function_call.arguments);
  const city = args.city;
  console.log("GPT asked me to call getWeather for city", city);
  const weather = await getWeatherForCity(city);
  //console.log("result from weather", weather);
  messages.push({role:"function", name:"getWeather", content: JSON.stringify(weather)})
  console.log("--------------- Second Request -----------------")
  //console.log(messages)
}
const second_response = await openai.chat.completions.create({
  model,
  temperature,
  messages:messages,
  functions: [weatherFuncSpec] 
}) 
console.log(second_response)
console.log(second_response.choices[0].message)