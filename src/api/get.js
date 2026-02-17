import client from "./client"
import Configs from "../config"

export const getPostsApi = async () => {
  const response = await client.get(Configs.api.get.post)
  return response.data
}