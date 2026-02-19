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
      post: "/post",
      profile: "/profile",
      likedpost: "/likedpost",
      commentedpost: "/commentedpost"
    },
    post: {
      newPost: "/post",
      like: "/post/",
      comment: "/post/"
    },
    put: {
      updateProfile: "/profile",
      updatePost: "/post/"
    },
    del: {
      delete: "/deletepost/"
    }
  },

  storage: {
    token: "access_token",
    user: "user_data",
  },
};

export default Configs;
