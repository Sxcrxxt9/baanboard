import client from "./client";
import Configs from "../config";

export const getMyPostsApi = async () => {
  const response = await client.get("/mypost");
  return response.data;
};
