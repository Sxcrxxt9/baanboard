const baseApiUrl = "https://baanboard.onrender.com";

const Configs = {
  version: "V.1.0.0",
  api: {
    baseApiUrl: baseApiUrl,
    auth: {
        login: "/login",
    },
    get: {
        post: "/getpost"
    }
  },

  storage: {
    token: "access_token",
    user: "user_data",
  },
};

export default Configs;