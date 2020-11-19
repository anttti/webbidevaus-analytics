require("dotenv").config();

import admin from "firebase-admin";
import fetch from "node-fetch";
import { format } from "date-fns";
import qs from "querystring";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  ),
});

const db = admin.firestore();

module.exports = async () => {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

  const collectionRef = db.collection("hits");
  const hits = await collectionRef
    .where("timestamp", ">", start)
    .where("timestamp", "<=", end)
    .get();

  const text = `${hits.size} vierailua välillä ${format(
    start,
    "d.MM.yyyy"
  )} - ${format(end, "d.MM.yyyy")}`;
  const url = `https://api.telegram.org/bot${
    process.env.BOT_TOKEN
  }/sendMessage?chat_id=${process.env.CHAT_ID}&text=${qs.escape(text)}`;
  await fetch(url);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ result: "ok" }),
  };
};
