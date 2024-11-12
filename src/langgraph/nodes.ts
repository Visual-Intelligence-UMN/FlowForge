import { InputAnnotation } from "./states";
import { create_agent_node } from "./utils";
import type { RunnableConfig } from "@langchain/core/runnables"
import { agent_test, agent_outline_writer, agent_section_writer, agent_script_writer } from "./agents";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { loader_tool } from "./tools";

export const agent_test_node = async (
    state: typeof InputAnnotation.State, 
    config?: RunnableConfig
) => {
    return create_agent_node({
        state: state,
        agent: await agent_test(),
        name: "agent_test",
        config: config,
    });
}

export const agent_section_writer_node = async (
    state: typeof InputAnnotation.State, 
    config?: RunnableConfig
) => {
    return create_agent_node({
        state: state,
        agent: await agent_section_writer(),
        name: "agent_section_writer",
        config: config,
    });
}
export const agent_script_writer_node = async (
    state: typeof InputAnnotation.State, 
    config?: RunnableConfig
) => {
    return create_agent_node({
        state: state,
        agent: await agent_script_writer(),
        name: "agent_script_writer",
        config: config,
    });
}

export const agent_outline_writer_node = async (
    state: typeof InputAnnotation.State, 
    config?: RunnableConfig
) => {
    return create_agent_node({
        state: state,
        agent: await agent_outline_writer(),
        name: "agent_outline_writer",
        config: config,
    });
}

export const loader_toolNode = new ToolNode([loader_tool]);
