import client from "./client";
import Configs from "../config";

export const loginApi = async (email, password) => {
  const response = await client.post(Configs.api.auth.login, {
    email,
    password,
  });

  return response.data;
};

export const registerApi = async (payload) => {
  const response = await client.post(Configs.api.auth.register, {
    fullname: payload.fullname,
    email: payload.email,
    tel: payload.tel,
    password: payload.password,
  });

  return response.data;
};
