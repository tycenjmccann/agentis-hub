export const handler = async (event: unknown): Promise<{ statusCode: number; body: string }> => {
  return {
    statusCode: 501,
    body: JSON.stringify({ message: 'Not implemented' }),
  };
};
