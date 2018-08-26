const fs = require('fs')
fs.writeFileSync('./.env', `ACCESS_TOKEN=${process.env.ACCESS_TOKEN}\nPERSONAL=${process.env.PERSONAL}\nSPACE_ID=${process.env.SPACE_ID}\n`)
