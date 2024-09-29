import mongoose from "mongoose";

const protocol = process.env.DATABASE_PROTOCOL;
const hostname = process.env.DATABASE_HOSTNAME;
const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const dbname = "Charity";

// export const url = `mongodb://0.0.0.0:27017/${dbname}?retryWrites=true&w=majority`;
const url = `${protocol}://${username}:${password}@${hostname}/${dbname}?retryWrites=true&w=majority`;

export const connectMongoose = () => {
  mongoose.connect(url, {
    authSource: "admin",
  });
};

export const authIsValid = (password: string, res: any) => {
  if (password !== process.env.POST_PASSWORD) {
    res.status(401).json("Ugyldig passord :'(");
    return false;
  }
  return true;
};
