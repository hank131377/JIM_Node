const express = require("express");
const router = express.Router();
const upload = require("./upload");
const db = require("./db_connect");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");

router.post("/store", upload.none(), async (req, res) => {
  const output = {
    success: false,
    error: "帳號或密碼錯誤",
    code: 0,
    postData: req.body,
  };

  loginSql = "SELECT * FROM store WHERE storeAccount=?";

  const [rows] = await db.query(loginSql, [req.body.account]);
  if (!rows.length) {
    output.code = 401;
    return res.json(output);
  }
  if (rows[0].storePassword !== req.body.password) {
    output.code = 402;
    return res.json(output);
  } else {
    output.token = jwt.sign(
      {
        sid: rows[0].storeSid,
        account: rows[0].storeAccount,
        store: rows[0].storeName,
        target: "store",
      },
      process.env.JWT_SECRET_KEY
    );
  }
  output.success = true;
  output.code = 200;
  output.error = "";
  (output.sid = rows[0].storeSid),
    (output.account = rows[0].storeAccount),
    (output.store = rows[0].storeName),
    (output.target = "store");
  if (rows[0].storeLogo.length > 20) {
    local_img = `./public/uploads/${rows[0].storeLogo}`;
    let bitmap = fs.readFileSync(local_img);
    let base64str = Buffer.from(bitmap, "kai").toString("base64");
    output.logo = `data:image/png;base64,${base64str}`;
  } else {
    output.logo = rows[0].storeLogo;
  }
  // const sql = "SELECT * FROM admins WHERE account=?";
  // const [rows] = await db.query(sql, [req.body.account]);
  // if (!rows.length) {
  //   output.code = 401;
  //   return res.json(output);
  // }
  // if (!(await bcrypt.compare(req.body.password, rows[0].password_hash))) {
  //   output.code = 402;
  // } else {
  //   output.token = jwt.sign(
  //     {
  //       sid: rows[0].sid,
  //       account: rows[0].account,
  //     },
  //     process.env.JWT_SECRET_KEY
  //   );
  //   output.success = true;
  //   output.code = 200;
  //   output.error = "";
  //   output.accountId = rows[0].sid;
  //   (output.account = rows[0].account),
  //     (req.session.admin = {
  //       sid: rows[0].sid,
  //       account: rows[0].account,
  //     });
  // }
  // res.json(output);
  res.json(output);
});

router.post("/member", upload.none(), async (req, res) => {
  const output = {
    success: false,
    error: "帳號或密碼錯誤",
    code: 0,
    postData: req.body,
  };

  loginSql = "SELECT * FROM member WHERE memAccount=?";

  const [rows] = await db.query(loginSql, [req.body.account]);
  if (!rows.length) {
    output.code = 401;
    return res.json(output);
  }
  if (rows[0].memPassword !== req.body.password) {
    output.code = 402;
    return res.json(output);
  } else {
    output.token = jwt.sign(
      {
        sid: rows[0].membersid,
        account: rows[0].memAccount,
        store: rows[0].memName,
        target: "member",
      },
      process.env.JWT_SECRET_KEY
    );
  }
  output.success = true;
  output.code = 200;
  output.error = "";
  (output.sid = rows[0].membersid),
    (output.account = rows[0].memAccount),
    (output.store = rows[0].memName),
    (output.target = "member");
  if (rows[0].memHeadshot.length > 20) {
    local_img = `./public/uploads/${rows[0].memHeadshot}`;
    let bitmap = fs.readFileSync(local_img);
    let base64str = Buffer.from(bitmap, "kai").toString("base64");
    output.logo = `data:image/png;base64,${base64str}`;
  } else {
    output.logo = rows[0].memHeadshot;
  }
  res.json(output);
});

router.post("/setmemberinfo/:target", async (req, res) => {
  let setInfoSql = "";
  const { target } = req.params;
  if (target == "store") {
    const {
      store,
      account,
      password,
      leader,
      identity,
      mobile,
      county,
      address,
      email,
      time,
      website,
      LogoImg,
      remark,
      originalLogos
    } = req.body;
    setInfoSql = `
      INSERT INTO store( storeName, storeAccount, storePassword, storeLeader, storeLeaderId, storeMobile, storeCity, storeAddress, storelat, storelon, storeEmail, storeTime, storeRest, storeWebsite, storeLogo, storeNews, storeCreatedAt, storeEditAt) VALUES ('${store}','${account}','${password}','${leader}','${identity}','${mobile}','${county}','${address}','','','${email}','${time}','','${website}','${  originalLogos}','${remark}',now(),now())`;
  } else if (target == "member") {
    const {
      nick,
      LogoImg,
      account,
      password,
      user,
      gender,
      birther,
      email,
      phone,
      identity,
      originalLogos
    } = req.body;
    setInfoSql = `
      INSERT INTO member( memNickName, memHeadshot, memAccount, memPassword, memName, memGender, memBirth, memEmail, memMobile, memIdentity, memCreatAt, memEditAt) VALUES ('${nick}','${  originalLogos}','${account}','${password}','${user}','${gender}','${birther}','${email}','${phone}','${identity}',now(),now())
      `;
  } else {
    res.json("參數錯誤");
  }
  const [setInfo] = await db.query(setInfoSql);
  res.json(setInfo);
});

router.get("/storeformcheck/:query", async (req, res) => {
  let formCheckSql = "";
  const { query } = req.params;
  const { search } = req.query;
  if (query == "account") {
    formCheckSql = `SELECT * FROM store WHERE storeAccount = '${search}'`;
  } else if (query == "store") {
    formCheckSql = `SELECT * FROM store WHERE storeName = '${search}'`;
  } else if (query == "identity") {
    formCheckSql = `SELECT * FROM store WHERE storeLeaderId = '${search}'`;
  } else {
    res.json("參數錯誤");
  }
  const [formCheck] = await db.query(formCheckSql);
  res.json(formCheck);
});
router.get("/memberformcheck/:query", async (req, res) => {
  let formCheckSql = "";
  const { query } = req.params;
  const { search } = req.query;
  if (query == "account") {
    formCheckSql = `SELECT * FROM member WHERE memAccount = '${search}'`;
  } else if (query == "identity") {
    formCheckSql = `SELECT * FROM member WHERE memIdentity  = '${search}'`;
  } else {
    res.json("參數錯誤");
  }
  const [formCheck] = await db.query(formCheckSql);
  res.json(formCheck);
});

module.exports = router;
