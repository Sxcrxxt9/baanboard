import client from "./client";
import Configs from "../config";
import axios from "axios";
export const loginApi = async (email, password) => {
  const response = await client.post(Configs.api.auth.login, {
    email,
    password,
  });

  return response.data;
};

export const registerApi = async (payload) => {
  console.log("Mock register payload:", payload);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const email = payload.email.trim().toLowerCase();

      if (email === "test@test.com") {
        reject({
          response: {
            data: {
              message: "Email already exists",
            },
          },
        });
        return;
      }

      resolve({
        token: "mock_token_123",
        fullname: payload.fullname,
        email: payload.email,
        tel: payload.tel,
      });
    }, 1000);
  });
};
// export const registerApi = async (payload) => {
//   const response = await client.post(
//     Configs.api.auth.register, // 👈 ต้องมี path นี้ใน config
//     payload,
//   );

//   return response.data;
// };
