import { OpenAI } from "openai";

export const saveKey = (storageKey: string, key: string) => {
  localStorage.setItem(storageKey, key.trim());
};

export const loadKey = (storageKey: string): string => {
  return localStorage.getItem(storageKey) ?? "";
};

export const clearKey = (storageKey: string) => {
  localStorage.removeItem(storageKey);
};


export const saveEnvVal = (key: string, value: string) => {
    import.meta.env[key] = value;
  };
  
  export const getEnvVal = (key: string): string => {
    // console.log("getEnvVal", import.meta.env[key]);
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
  