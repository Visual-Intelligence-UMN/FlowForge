import { z } from "zod";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { tool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { selectedTaskAtom } from "../patterns/GlobalStates";
import { useAtom, useAtomValue } from "jotai";

const loader_tool = tool(async (input) => {
    const re = await new PDFLoader (input.path, {splitPages: false, parsedItemSeparator: ""}).load()
    const pageContents = re.map(page => page.pageContent).join("");
    return pageContents
  }, {
    name: "PDFLoader",
    description: "Load a PDF file",
    schema: z.object({
      path: z.string(),
    }),
});

const search_tool = tool(async (input) => {
    const search = new TavilySearchResults({ maxResults: 3, apiKey: import.meta.env.VITE_TAVILY_API_KEY });
    const result = await search.invoke(input);
    return result;
}, {
    name: "WebSearch",
    description: "Search the web for information",
    schema: z.object({
        query: z.string(),
    }),
});

const toolsMap = {
  "tool_PDFLoader": loader_tool,
  "tool_WebSearch": search_tool,
}

const TavilySearchTool = (async (input) => {
  const {query} = input;
  const search = new TavilySearchResults({ maxResults: 3, apiKey: import.meta.env.VITE_TAVILY_API_KEY });
  const result = await search.invoke(query);
  return result;
})

const PDFLoaderTool = (async (input) => {
  const selectedTask = useAtomValue(selectedTaskAtom);
  const file = selectedTask["uploadedFile"];
  console.log("file to load", file);
  const {path} = file;

  const re = await new PDFLoader (path, {splitPages: false, parsedItemSeparator: ""}).load()
  const pageContents = re.map(page => page.pageContent).join("");
  return pageContents
})


export { toolsMap, TavilySearchTool, PDFLoaderTool };