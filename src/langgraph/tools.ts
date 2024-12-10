import { z } from "zod";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { tool } from "@langchain/core/tools";

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

export { loader_tool };