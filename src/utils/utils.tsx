export const saveEnvVal = (key: string, value: string) => {
    import.meta.env[key] = value;
  };
  
  export const getEnvVal = (key: string): string => {
    return import.meta.env[key];
  }