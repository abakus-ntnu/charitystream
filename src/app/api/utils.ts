import mongoose from "mongoose";

const protocol = process.env.DATABASE_PROTOCOL;
const hostname = process.env.DATABASE_HOSTNAME;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const dbname = process.env.DATABASE_NAME;

const url = `${protocol}://${username}:${password}@${hostname}/${dbname}?retryWrites=true&w=majority`;

export const connectMongoose = () => {
  mongoose.connect(url, {
    authSource: "admin",
  });
};

export const authIsValid = (password: string) => {
  return password === process.env.POST_PASSWORD;
};
