import OpenAI from "openai";
import dotenv from "dotenv";
import {getWeatherForCity} from "./utils/utils.js"
dotenv.config();
const model = "gpt-3.5-turbo"
const temperature = 0.0
let calls = 1

async function callGpt(model, systemPrompt, userPrompt) {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
  
    let messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
  
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
    };
  
    async function makeGptRequest() {
      while (true) {
        const response = await openai.chat.completions.create({
          model,
          temperature: 0.0,
          messages,
          functions: [weatherFuncSpec],
        });
  
        const responseMessage = response.choices[0].message;
        console.log("---------- Response Message -------------");
        console.log(responseMessage);
  
        if (responseMessage.function_call?.name === "weather") {
          const args = JSON.parse(responseMessage.function_call.arguments);
          const city = args.city;
          console.log("GPT asked to call getWeather for city", city);
          const weather = await getWeatherForCity(city);
          messages.push({ role: "function", name: "getWeather", content: JSON.stringify(weather) });
        } else if (response.choices[0].finish_reason === 'stop') {
          // If the finish reason is 'stop', log the final message and return
          console.log("--------------- Final Message -----------------");
          console.log(responseMessage.content);
          return responseMessage.content;
        }
      }
    }
  
    // Start the GPT API calling process
    await makeGptRequest();
  }
  
 
  
  // Example usage of the function
  callGpt("gpt-3.5-turbo", 
  "Give short answers, in Danish or English depending on the user language. Make sure to provide answer to all sub-questions given", 
  "hvor blæser det mest lige nu og hvor meget, i Århus, København eller Stockholm");
  

/*
async function callGpt(model, systemPrompt, userPrompt) {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
  
    let messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
  
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
    };
  
    // Function to handle the GPT API calls
    async function makeGptRequest() {
      const response = await openai.chat.completions.create({
        model,
        temperature,
        messages,
        functions: [weatherFuncSpec],
      });
  
      let responseMessage = response.choices[0].message;
      console.log(`---------- Response Message (${calls++})-------------`);
      console.log(responseMessage);
  
      if (responseMessage.function_call?.name === "weather") {
        const args = JSON.parse(responseMessage.function_call.arguments);
        const city = args.city;
        console.log("GPT asked to call getWeather for city", city);
        const weather = await getWeatherForCity(city);
        messages.push({ role: "function", name: "getWeather", content: JSON.stringify(weather) });
      } else if (response.choices[0].finish_reason === 'stop') {
        // If the finish reason is 'stop', log the final message and return
        console.log("--------------- Final Message -----------------");
        console.log(responseMessage.content);
        return responseMessage.content;
      }
  
      // If not finished, make another GPT request
      await makeGptRequest();
    }
  
    // Start the recursive GPT API calling process
    await makeGptRequest();
  }
  
  
  
  // Example usage of the function
  callGpt("gpt-3.5-turbo", 
  "Give short answers, in Danish or English depending on the user language. Make sure to provide answer to all sub-questions given", 
  "Vis temperaturene lige nu for byerne Odense, Århus, København");
  */