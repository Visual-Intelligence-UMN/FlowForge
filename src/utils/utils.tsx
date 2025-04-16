import { OpenAI } from "openai";

export const saveEnvVal = (key: string, value: string) => {
    import.meta.env[key] = value;
  };
  
  export const getEnvVal = (key: string): string => {
    return import.meta.env[key];
  }

  export const checkAPIKey = async (apiKey: string) => {
    const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
    try {
      const models = await openai.models.list();
      if (models.data.length > 0) {
        return true;
      } else {
          return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  