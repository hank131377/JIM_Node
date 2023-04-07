const express = require("express");
const router = express.Router();
const upload = require("./upload");
const db = require("./db_connect");
const bcrypt = require("bcrypt");
const fs = require("fs");

router.get("/", async (req, res) => {
  const { litim } = req.query;
  const gamesql = `SELECT * FROM games 
    JOIN gamesFeature01 on gamesFeature01 = gamesFeature01.gamesFeatureSid 
    JOIN gamesFeature02 on  gamesFeature02 = gamesFeature02.gamesFeatureSid 
    JOIN gamestime on gamesTime = gamestime.gamesTimeSid
    JOIN store on games.storeSid= store.storeSid
    WHERE gamesColse = 1
    ORDER BY gamesSid ASC
    limit ${litim}`;
  const [game] = await db.query(gamesql);
  const games = game.map((v, i) => {
    if (v.gamesImages.length > 20) {
      local_img = `./public/uploads/${v.gamesImages}`;
      let bitmap = fs.readFileSync(local_img);
      let base64str = Buffer.from(bitmap, "kai").toString("base64");
      return { ...v, gamesImages: `data:image/png;base64,${base64str}` };
    } else {
      return { ...v };
    }
  });
  res.json(games);
});

module.exports = router;
