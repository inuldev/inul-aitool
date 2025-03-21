import Exa from "exa-js";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const exa = new Exa(process.env.EXA_SEARCH_API_KEY || "");

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});
