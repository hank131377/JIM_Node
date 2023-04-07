const express = require("express");
const router = express.Router();
const upload = require("./upload");
const db = require("./db_connect");
const bcrypt = require("bcrypt");
const fs = require("fs");

router.get("/", async (req, res) => {
  const {
    searchKey = "",
    city = "",
    minLimit = 12,
    difficulty = "",
    type = "",
    cash = 83727,
    time = "",
    other = "",
    order = "gamesPrice",
    searchSwitch = "ASC",
  } = req.query;

  const gamesql = `SELECT * FROM games
      JOIN gamesdifficulty on gamesDifficulty = gamesdifficulty.gamesDifficultySid
      JOIN gamesfeature01 on gamesFeature01 = gamesFeature01.gamesFeatureSid
      JOIN gamesfeature02 on gamesFeature02 = gamesFeature02.gamesFeatureSid
      JOIN gamestime on gamesTime = gamestime.gamesTimeSid
      JOIN gamessort on gamesSort = gamessort.gamesSortSid
      JOIN store on games.storeSid= store.storeSid
      WHERE gamesName LIKE '%${searchKey}%' AND store.storeCity LIKE '%${city}%'
      AND gamesPeopleMin <= ${minLimit} AND gamesdifficulty.difficulty LIKE '%${difficulty}%'
      AND gamesPrice <= ${cash} AND gamesfeature01.feature01 LIKE '%${type}%'
      AND gamestime.Time LIKE '%${time}%'  AND gamessort.Sort LIKE '%${other}%' 
      AND gamesColse = 1
      ORDER BY ${order} ${searchSwitch}`;
    
  const [game] = await db.query(gamesql);

  const games = game
    .map((v, i) => {
      if (v.gamesImages.length > 20) {
        local_img = `./public/uploads/${v.gamesImages}`;
        let bitmap = fs.readFileSync(local_img);
        let base64str = Buffer.from(bitmap, "kai").toString("base64");
        return { ...v, gamesImages: `data:image/png;base64,${base64str}` };
      } else {
        return { ...v };
      }
    })


  res.json(games);
});

router.get("/getGameSelect/:target", async (req, res) => {
  const { target } = req.params;
  const getGameSelectSql = `SELECT * FROM ${target} WHERE 1`;
  const [getGameSelectInfo] = await db.query(getGameSelectSql);
  res.json(getGameSelectInfo);
});

router.get("/gameSingle", async (req, res) => {
  const { sid } = req.query;
  const gameSingleSql = `SELECT * FROM games
        JOIN gamesdifficulty on gamesDifficulty = gamesdifficulty.gamesDifficultySid
        JOIN gamesfeature01 on gamesFeature01 = gamesFeature01.gamesFeatureSid
        JOIN gamesfeature02 on gamesFeature02 = gamesFeature02.gamesFeatureSid
        JOIN gamestime on gamesTime = gamestime.gamesTimeSid
        JOIN gamessort on gamesSort = gamessort.gamesSortSid
        JOIN store on games.storeSid= store.storeSid
        WHERE gamesSid = ${sid}
        `;

  const [gameSingleInfo] = await db.query(gameSingleSql);
  const getGameSelectSql = `
        SELECT games.gamesSid, sum(rate)/count(rate) AS rate, count(*) AS rateNum FROM comment 
        JOIN order_summary ON comment.ordersid = order_summary.orderSid 
        JOIN games ON order_summary.gameSid = games.gamesSid 
        WHERE games.gamesSid = ${sid}
        GROUP BY games.gamesSid;
        `;
  const [getGameSelectInfo] = await db.query(getGameSelectSql);
  const gamesSingle = gameSingleInfo
    .map((v, i) => {
      if (v.gamesImages.length > 20) {
        local_img = `./public/uploads/${v.gamesImages}`;
        let bitmap = fs.readFileSync(local_img);
        let base64str = Buffer.from(bitmap, "kai").toString("base64");
        return { ...v, gamesImages: `data:image/png;base64,${base64str}` };
      } else {
        return { ...v };
      }
    })
    .map((v, i) => {
      return getGameSelectInfo[i]?.gamesSid == v.gamesSid
        ? {
            ...v,
            rateNum: getGameSelectInfo[i].rateNum,
            rate: getGameSelectInfo[i].rate,
          }
        : { ...v, rateNum: 0, rate: 0 };
    });
  res.json(gamesSingle);
});

router.get("/filterDate", async (req, res) => {
  const { sid, date } = req.query;
  const filterDateSql = `SELECT * FROM order_summary WHERE 
        gameSid = ${sid} AND orderDate LIKE '${date}'
        `;
  const [filterDate] = await db.query(filterDateSql);
  res.json(filterDate);
});

router.get("/getCollect/:gameSid", async (req, res) => {
  const { gameSid } = req.params;
  const { sid } = req.query;

  const searchAddCollectSql = `
    SELECT * FROM gamecollect WHERE meberSid = ${sid} AND gameSid = ${gameSid}
    `;
  const [searchCollectDate] = await db.query(searchAddCollectSql);

  res.json(searchCollectDate);
});

router.get("/addCollect/:gameSid", async (req, res) => {
  const { gameSid } = req.params;
  const { sid } = req.query;

  const searchAddCollectSql = `
  SELECT * FROM gamecollect WHERE meberSid = ${sid} AND gameSid = ${gameSid}
  `;
  const [searchCollectDate] = await db.query(searchAddCollectSql);
  if (searchCollectDate.length !== 0) return res.end();

  const addCollectSql = `INSERT INTO gamecollect(meberSid, gameSid) VALUES (${sid},${gameSid})
        `;
  const [addCollectDate] = await db.query(addCollectSql);
  res.json(addCollectDate);
});

router.delete("/delCollect/:gameSid", async (req, res) => {
  const { gameSid } = req.params;
  const { sid } = req.query;
  const delCollectSql = `
  DELETE FROM gamecollect WHERE meberSid = ${sid} AND gameSid = ${gameSid}
  `;
  const [addCollectDate] = await db.query(delCollectSql);
  res.json(addCollectDate);
});

router.get("/getGameComment/:sid", async (req, res) => {
  const { sid } = req.params;
  const getGameCommentSql = `
    SELECT * FROM games
    JOIN order_summary ON gamesSid  = order_summary.gameSid
    JOIN member ON order_summary.memberSid = member.membersid
    JOIN comment ON order_summary.orderSid = comment.ordersid
    WHERE  gamesSid = ${sid}
    ORDER BY order_summary.create_at DESC
    `;
  const [getGameCommentInfo] = await db.query(getGameCommentSql);
  const getGameCommentInfoData = getGameCommentInfo
  .map((v, i) => {
    if (v.memHeadshot.length > 20) {
      local_img = `./public/uploads/${v.memHeadshot}`;
      let bitmap = fs.readFileSync(local_img);
      let base64str = Buffer.from(bitmap, "kai").toString("base64");
      return { ...v, memHeadshot: `data:image/png;base64,${base64str}` };
    } else {
      return { ...v };
    }
  })
  res.json(getGameCommentInfoData);
});

module.exports = router;
