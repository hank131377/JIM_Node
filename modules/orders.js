const express = require("express");
const router = express.Router();
const upload = require("./upload");
const db = require("./db_connect");
const bcrypt = require("bcrypt");
const fs = require("fs");

router.get("/", async (req, res) => {
  const { sid } = req.query;
  const orderSql = `SELECT * FROM games
    JOIN gamesdifficulty on gamesDifficulty = gamesdifficulty.gamesDifficultySid
    JOIN gamesfeature01 on gamesFeature01 = gamesFeature01.gamesFeatureSid
    JOIN gamesfeature02 on gamesFeature02 = gamesFeature02.gamesFeatureSid
    JOIN gamestime on gamesTime = gamestime.gamesTimeSid
    JOIN gamessort on gamesSort = gamessort.gamesSortSid
    JOIN store on games.storeSid= store.storeSid
    WHERE gamesSid = ${sid}`;
  const [orderData] = await db.query(orderSql);
  const ordersData = orderData.map((v, i) => {
    if (v.gamesImages.length > 20) {
      local_img = `./public/uploads/${v.gamesImages}`;
      let bitmap = fs.readFileSync(local_img);
      let base64str = Buffer.from(bitmap, "kai").toString("base64");
      return { ...v, gamesImages: `data:image/png;base64,${base64str}` };
    } else {
      return { ...v };
    }
  });
  res.json(ordersData);
});

router.get("/ordercomplete", async (req, res) => {
  const { orderSid } = req.query;
  const ordercompleteSql = `SELECT * FROM order_summary WHERE orderSid = ${orderSid}`;
  const [ordercomplete] = await db.query(ordercompleteSql);
  res.json(ordercomplete);
});

router.get("/discount", async (req, res) => {
  discountSql = `SELECT * FROM discount_detail WHERE 1`;
  const [discount] = await db.query(discountSql);
  res.json(discount);
});
module.exports = router;
