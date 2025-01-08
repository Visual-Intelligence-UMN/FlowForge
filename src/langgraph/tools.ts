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

const search_tool = new TavilySearchResults({ maxResults: 3, apiKey: import.meta.env.VITE_TAVILY_API_KEY });
// const search_tool = [new TavilySearchResults({ maxResults: 3, })]

const toolsMap = {
  "tool_PDFLoader": loader_tool,
  "tool_search": search_tool,
}

export { toolsMap, loader_tool, search_tool };