import { create_agent } from "./utils";
import { ChatOpenAI } from "@langchain/openai";
import { loader_tool } from "./tools";


const llm_model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    apiKey: import.meta.env.OPENAI_API_KEY,
    streaming: true,
});

const agent_test = async () => await create_agent({
    llm: llm_model,
    tools: [loader_tool],
    systemMessage:  "You are a helpful assistant that can load a PDF file. \
    After loading the PDF file, your task is to make the text cleaner and more readable, \
    including removing emove all newline characters (\\n). \
    Reorganize the titles with '#', sub-titles with '##', sub-sub-titles with '###', and so on.\
    Organize the references and citations better too. When everything is ready, you should return the cleaned text and add 'FINISH LOADING' at the end."
}); 

const agent_outline_writer = async () => await create_agent({
    llm: llm_model,
    tools: [],
    systemMessage: "You are an expert in academic writing. You are tasked with writing an outline based on the provided extracted text. \
    You need to analyze the research paper's structure, identify sections (abstract, introduction, methodology, results, discussion, conclusion). \
    Then finally create a high-level outline of key sections and main points to guide further processing. \
    The outline should be in a markdown format (the titles with '#', sub-titles with '##', sub-sub-titles with '###', and so on). \
    When the outline is ready, you should return the outline and add 'FINISH OUTLINE' at the end.",
}); 

const agent_section_writer = async () => await create_agent({
    llm: llm_model,
    tools: [],
    systemMessage: "You are an experienced researcher good at presentation, you can write multiple sections of the presentation script based on the provided outline and original text. \
    Based on the given section title (format as 'WRITE SECTION: <section title>'), you need to write the section in a way that is easy to read and understand. \
    You need to write the sections in a markdown format (the titles with '#', sub-titles with '##', sub-sub-titles with '###', and so on). \
    When the section is ready, you should return the section and add 'FINISH SECTION' at the end.",
}); 

const agent_script_writer = async () => await create_agent({
    llm: llm_model,
    tools: [],
    systemMessage: "You are an experienced reaearcher understand the research paper well. \
    You are leading the writing of the presentation script based on the research paper you have.\
    You are the supervisor working with the other writers: Outline Writer and Section Writer. \
    You need to manage the flow of the script, and make sure the sections are coherent and well-organized.\
    The extracted text is end with 'FINISH LOADING'. Then you get the script structure first (from the outline writer, end with 'FINISH OUTLINE'), then assign only one section writing each time to the section writer. \
    You should assign in the format of 'WRITE SECTION: <section title>'. After the section writer finishes, you should review the script and decide which section to assign next. \
    Continue this process until all sections are written. \
    Finally, if you think all sections in the outline are written, you organize the final script and add 'FINISH SCRIPT' at the end. \
    ",
}); 

export { agent_test, agent_outline_writer, agent_section_writer, agent_script_writer };