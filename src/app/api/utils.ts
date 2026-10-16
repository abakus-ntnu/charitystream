import mongoose from "mongoose";
import { createHash, timingSafeEqual } from "node:crypto";

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

const sha256 = (value: string) => createHash("sha256").update(value).digest();

export const secretMatches = (value: unknown, expected: string | undefined) =>
  typeof value === "string" &&
  !!value &&
  !!expected &&
  timingSafeEqual(sha256(value), sha256(expected));

export const authIsValid = (password: string) =>
  secretMatches(password, process.env.POST_PASSWORD);
