const express = require("express");
const router = express.Router();
const upload = require("./upload");
const db = require("./db_connect");
const bcrypt = require("bcrypt");
const fs = require("fs");

router.get("/getStoreOrderData/:sid", async (req, res) => {
  const { sid } = req.params;
  const getStoreOrderDataSql = `
    SELECT * FROM order_summary 
  JOIN games ON gameSid = games.gamesSid
  WHERE games.storeSid = ${sid}
  `;
  const [getStoreOrderDataInfo] = await db.query(getStoreOrderDataSql);
  res.json(getStoreOrderDataInfo);
});

router.put("/storeOredrSwitch/:orderSid", async (req, res) => {
  const { orderSid } = req.params;
  const { state } = req.query;
  const storeOredrSwitchSql = `
      UPDATE order_summary SET orderState=${state} WHERE orderSid=${orderSid}`;
  const [storeOredrSwitchInfo] = await db.query(storeOredrSwitchSql);
  res.json(storeOredrSwitchInfo);
});

router.delete("/delstoredata/:gameSid", async (req, res) => {
  const { gameSid } = req.params;
  const delStoreDataSql = `
        DELETE FROM games WHERE gamesSid = ${gameSid}
        `;
  const [delStoreDataInfo] = await db.query(delStoreDataSql);
  res.json(delStoreDataInfo);
});

router.put("/gameswitch/:gameSid", async (req, res) => {
  const { gameSid } = req.params;
  const { close } = req.query;
  const gameSwitchSql = `
        UPDATE games SET gamesColse=${close} WHERE gamesSid=${gameSid}`;
  const [gameSwitchInfo] = await db.query(gameSwitchSql);
  res.json(gameSwitchInfo);
});

router.get("/getstoredata/:sid", async (req, res) => {
  const { sid } = req.params;
  const StoreDataSql = `
        SELECT * FROM store 
        JOIN games ON store.storeSid  = games.storeSid
        WHERE store.storeSid = ${sid}
        `;
  const [StoreDataInfo] = await db.query(StoreDataSql);
  res.json(StoreDataInfo);
});

router.post("/editStoreInfo/:storeSid", async (req, res) => {
  const { storeSid } = req.params;
  const {
    account,
    password,
    leader,
    mobile,
    county,
    address,
    email,
    time,
    website,
    LogoImg,
    remark,
  } = req.body;
  const editStoreSql = `
        UPDATE store SET storeAccount='${account}',storePassword='${password}',storeLeader='${leader}',storeMobile='${mobile}',storeCity='${county}',storeAddress='${address}',storeEmail='${email}',storeTime='${time}',storeWebsite='${website}',storeLogo='${LogoImg}',storeNews='${remark}',storeEditAt=now() WHERE storeSid = ${storeSid}
        `;
  const [editStoreInfo] = await db.query(editStoreSql);

  res.json(editStoreInfo);
});

router.get("/storeInfo/:storeSid", async (req, res) => {
  const { storeSid } = req.params;
  const storeInfoSql = `
            SELECT * FROM store WHERE storeSid = ${storeSid}
            `;
  const [storeInfoInfo] = await db.query(storeInfoSql);
  const storeInfoData = storeInfoInfo.map((v, i) => {
    if (v.storeLogo.length > 20) {
      local_img = `./public/uploads/${v.storeLogo}`;
      let bitmap = fs.readFileSync(local_img);
      let base64str = Buffer.from(bitmap, "kai").toString("base64");
      return { ...v, storeLogo: `data:image/png;base64,${base64str}` };
    } else {
      return { ...v };
    }
  });
  res.json(storeInfoData);
});

router.get("/storeOredrData/:orderSid", async (req, res) => {
  const { orderSid } = req.params;
  const storeOredrDataSql = `
            SELECT * FROM order_summary 
            JOIN games ON gameSid = games.gamesSid 
            JOIN discount_detail ON orderDiscount = discount_detail.discountID
            WHERE orderSid = ${orderSid}
            `;
  const [storeOredrDataInfo] = await db.query(storeOredrDataSql);
  res.json(storeOredrDataInfo);
});

router.put("/editData/:sid", async (req, res) => {
  const { sid } = req.params;
  const {
    name,
    LogoImg,
    min,
    max,
    difficulty,
    feature01,
    feature02,
    price,
    other,
    time,
    put,
    remark,
  } = req.body;
  const editDataSql = `
          UPDATE games SET gamesName='${name}',gamesImages='${LogoImg}',gamesPeopleMin='${min}',gamesPeopleMax='${max}',gamesDifficulty='${difficulty}',gamesFeature01='${feature01}',gamesFeature02='${feature02}',gamesPrice='${price}',gamesSort='${other}',gamesTime='${time}',gamesColse='${put}',gamesContent='${remark}',up_date=now() WHERE gamesSid = ${sid}
          `;
  const [editDataInfo] = await db.query(editDataSql);
  res.json(editDataInfo);
});

router.get("/getEditData/:sid", async (req, res) => {
  const { sid } = req.params;
  const getEditDataSql = `
            SELECT * FROM games WHERE gamesSid = ${sid}
            `;
  const [getEditDataInfo] = await db.query(getEditDataSql);
  const getEditDataInfos = getEditDataInfo.map((v, i) => {
    if (v.gamesImages.length > 20) {
      local_img = `./public/uploads/${v.gamesImages}`;
      let bitmap = fs.readFileSync(local_img);
      let base64str = Buffer.from(bitmap, "kai").toString("base64");
      return { ...v, gamesImages: `data:image/png;base64,${base64str}` };
    } else {
      return { ...v };
    }
  });
  res.json(getEditDataInfos);
});

router.post("/putgame", async (req, res) => {
  const {
    sid,
    name,
    LogoImg,
    min,
    max,
    difficulty,
    feature01,
    feature02,
    price,
    other,
    time,
    put,
    remark,
    originalLogos
  } = req.body;
  const putGameSql = `
            INSERT INTO games( gamesName, gamesImages, gamesPeopleMin, gamesPeopleMax, gamesDifficulty, gamesFeature01, gamesFeature02, gamesPrice, gamesSort, gamesTime, gamesOpen, gamesColse, gamesContent, storeSid, create_at, up_date) VALUES ('${name}','${originalLogos}',${min},${max},${difficulty},${feature01},${feature02},${price},${other},${time},now(),${put},'${remark}','${sid}',now(),now())`;
  const [putgameInfo] = await db.query(putGameSql);
  res.json(putgameInfo);
});
module.exports = router;
