import client from "./client";

export const getMyPostsApi = async () => {
  const response = await client.get("/mypost");
  return response.data;
};
