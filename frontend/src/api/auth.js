import client from "./client";
import Configs from "../config";

export const loginApi = async (email, password) => {
  const response = await client.post(
    Configs.api.auth.login,
    {
      email,
      password,
    }
  );

  return response.data;
};