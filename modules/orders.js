const express = require('express')
const router = express.Router()
const upload = require('./upload')
const db = require('./db_connect')
const bcrypt = require('bcrypt')
const fs = require('fs')

router.get('/', async (req, res) => {
  const { sid } = req.query
  const orderSql = `SELECT * FROM games
    JOIN gamesdifficulty on gamesDifficulty = gamesdifficulty.gamesDifficultySid
    JOIN gamesfeature01 on gamesFeature01 = gamesFeature01.gamesFeatureSid
    JOIN gamesfeature02 on gamesFeature02 = gamesFeature02.gamesFeatureSid
    JOIN gamestime on gamesTime = gamestime.gamesTimeSid
    JOIN gamessort on gamesSort = gamessort.gamesSortSid
    JOIN store on games.storeSid= store.storeSid
    WHERE gamesSid = ${sid}`
  const [orderData] = await db.query(orderSql)
  // const ordersData = orderData.map((v, i) => {
  //   if (v.gamesImages.length > 20) {
  //     local_img = `./public/uploads/${v.gamesImages}`;
  //     let bitmap = fs.readFileSync(local_img);
  //     let base64str = Buffer.from(bitmap, "kai").toString("base64");
  //     return { ...v, gamesImages: `data:image/png;base64,${base64str}` };
  //   } else {
  //     return { ...v };
  //   }
  // });
  res.json(orderData)
})

router.get('/ordercomplete', async (req, res) => {
  const { orderSid } = req.query
  const ordercompleteSql = `SELECT * FROM order_summary WHERE orderSid = ${orderSid}`
  const [ordercomplete] = await db.query(ordercompleteSql)
  res.json(ordercomplete)
})

router.get('/discount', async (req, res) => {
  const { sid } = req.query
  const memberBirtherSql = `SELECT memBirth FROM member WHERE membersid = ${sid}`
  const [memberBirther] = await db.query(memberBirtherSql)
  discountSql = `SELECT * FROM discount_detail WHERE 1`
  const [discount] = await db.query(discountSql)
  const discountPersona = discount.filter((v, i) => {
    if (i > 0 && i <= 12) {
      if (
        i == new Date().getMonth() + 1 &&
        i == new Date(memberBirther[0].memBirth).getMonth() + 1
      ) {
        return v
      }
    }
    if (i == 0) {
      return v
    }
  })

  const getCouponSql = `SELECT * FROM discount JOIN discount_detail ON discount_detail.discountID = discount.discountID WHERE membersid = '${sid}' AND discountState = '未使用'`
  const [getCoupon] = await db.query(getCouponSql)
  for (let i = 0; i < getCoupon.length; i++) {
    discountPersona.push(getCoupon[i])
  }
  res.json(discountPersona)
})

router.get('/gameover/:rand', async (req, res, next) => {
  const { rand } = req.params
  console.log(rand)

  const sql = ` INSERT INTO discount(
    discountRand,
    discountID,
    discountState,
    discountRelease)
    VALUES('${rand}', '20', '未使用', NOW())`

  const [data] = await db.query(sql)
  res.json(data)
})

module.exports = router
