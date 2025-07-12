import "dotenv/config";
import "./paths";
import app from "./app/instance";  // <-- gunakan ini!
import { displayAsciiArt } from "$utils/ascii_art.utils";
import { REST_ASCII_ART } from './utils/ascii_art.utils';

const serviceEnv = process.env.NODE_SERVICE;
console.log("NODE_SERVICE:", serviceEnv);

if (serviceEnv === "rest") {
  displayAsciiArt(REST_ASCII_ART);
  app.restApp();
}
