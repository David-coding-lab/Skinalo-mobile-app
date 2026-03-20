import { Account, Client, Databases } from "react-native-appwrite";
const client = new Client()
  .setEndpoint(
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT_URL ||
      "https://fra.cloud.appwrite.io/v1",
  )
  .setProject(
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "69babb040018e21dd179",
  )
  .setPlatform("com.ideaTeam.Skinalo");

export const account = new Account(client);
export const databases = new Databases(client);
