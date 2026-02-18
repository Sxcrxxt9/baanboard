const baseApiUrl = "https://baanboard-api.onrender.com";

const Configs = {
  version: "V.1.0.0",
  api: {
    baseApiUrl: baseApiUrl,
    auth: {
      login: "/login",
      register: "/register",
    },
    get: {
      post: "/getpost",
    },
  },

  storage: {
    token: "access_token",
    user: "user_data",
  },
};

export default Configs;
