const express = require("express");
const router = express.Router();
const upload = require("./upload");
const db = require("./db_connect");
const bcrypt = require("bcrypt");
const fs = require("fs");

router.get("/getMemberOrderData/:memberSid", async (req, res) => {
  console.log(req.params);
  const { memberSid } = req.params;
  const memberOredrDataSql = `
    SELECT * FROM order_summary 
    JOIN games ON gameSid = games.gamesSid 
    JOIN discount_detail ON orderDiscount = discount_detail.discountID
    WHERE memberSid = ${memberSid}
    `;
  const [memberOredrDataInfo] = await db.query(memberOredrDataSql);
  res.json(memberOredrDataInfo);
});

router.get("/gameCollect/:memberId", async (req, res) => {
  const { memberId } = req.params;
  const gameCollectSql = `
SELECT * FROM gamecollect
JOIN games ON gamecollect.gameSid = games.gamesSid 
 WHERE meberSid = ${memberId}
`;
  const [gameCollectInfo] = await db.query(gameCollectSql);
  res.json(gameCollectInfo);
});

router.delete("/gameCollect/:memberId", async (req, res) => {
  const { memberId } = req.params;
  const { gameSid } = req.query;
  const gameCollectSql = `
  DELETE FROM gamecollect WHERE meberSid =${memberId} AND gameSid =${gameSid}
  `;
  const [gameCollectInfo] = await db.query(gameCollectSql);
  res.json(gameCollectInfo);
});

router.put("/editMember/:orderSid", async (req, res) => {
  const { orderSid } = req.params;
  const { rate, comment } = req.body;
  const editMemberSql = `
    UPDATE comment SET rate=${rate},content='${comment}',date=now() WHERE ordersid = ${orderSid}
    `;
  const [editMemberInfo] = await db.query(editMemberSql);
  res.json(editMemberInfo);
});

router.post("/setMemberOrderData/:orderSid", async (req, res) => {
  const { orderSid } = req.params;
  const { rate, comment } = req.body;
  const setMemberOrderDataSql = `
  INSERT INTO comment( ordersid, rate, content, date) VALUES (${orderSid},${rate},'${comment}',now())
  `;
  const [setMemberOrderDataInfo] = await db.query(setMemberOrderDataSql);
  res.json(setMemberOrderDataInfo);
});
router.get("/editMemberData/:orderSid", async (req, res) => {
  const { orderSid } = req.params;
  const editMemberDataSql = `
   SELECT * FROM comment WHERE ordersid = ${orderSid}
   `;
  const [editMemberDataInfo] = await db.query(editMemberDataSql);
  res.json(editMemberDataInfo);
});

router.post("/memberInfo/:memberSid", async (req, res) => {
  const { memberSid } = req.params;
  const {
    nick,
    password,
    user,
    gender,
    birther,
    email,
    phone,
    identity,
    LogoImg,
    remark,
    originalLogos
  } = req.body;
  const editMemberSql = `
    UPDATE member SET memNickName='${nick}',memHeadshot='${originalLogos}',memPassword='${password}',memName='${user}',memGender='${gender}',memBirth='${birther}',memEmail='${email}',memMobile='${phone}',memIdentity='${identity}',memEditAt=now() WHERE membersid  = ${memberSid}
    `;
  const [editMemberInfo] = await db.query(editMemberSql);
  res.json(editMemberInfo);
});

router.get("/memberInfo/:memberSid", async (req, res) => {
  const { memberSid } = req.params;
  const memberInfoSql = `
    SELECT * FROM member WHERE membersid  = ${memberSid}
    `;
  const [memberInfoInfo] = await db.query(memberInfoSql);
  const memberInfoData = memberInfoInfo.map((v, i) => {
    if (v.memHeadshot.length > 20) {
      local_img = `./public/uploads/${v.memHeadshot}`;
      let bitmap = fs.readFileSync(local_img);
      let base64str = Buffer.from(bitmap, "kai").toString("base64");
      return { ...v, memHeadshot: `data:image/png;base64,${base64str}` };
    } else {
      return { ...v };
    }
  });

  res.json(memberInfoData);
});

module.exports = router;
