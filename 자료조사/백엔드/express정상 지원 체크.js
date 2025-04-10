//참고 문서
// https://expressjs.com/ko/starter/installing.html
// https://expressjs.com/ko/starter/hello-world.html

// 실행 전 설치해야 할것
// npm i express

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
