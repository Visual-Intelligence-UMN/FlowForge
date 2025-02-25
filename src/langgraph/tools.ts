import { z } from "zod";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { tool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";


const loader_tool = tool(async (input) => {
    const re = await new PDFLoader (input.input, {splitPages: false, parsedItemSeparator: ""}).load()
    const pageContents = re.map(page => page.pageContent).join("");
    return pageContents
  }, {
    name: "PDFloader",
    description: "Load a PDF file",
    schema: z.object({
      input: z.string(),
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

export { toolsMap, loader_tool, search_tool };