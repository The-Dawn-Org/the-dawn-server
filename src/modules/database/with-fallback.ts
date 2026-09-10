export async function withFallback<T>(
    dbCall: () => Promise<T>,
    fallback: () => T | Promise<T>,
  ): Promise<T> {
    try {
      return await dbCall();
    } catch (err) {
      console.error("DB call failed, using fallback:", (err as Error).message);
      return await fallback();
    }
  }