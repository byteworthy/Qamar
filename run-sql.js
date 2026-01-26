const { Client } = require("pg");
const fs = require("fs");
const client = new Client({ connectionString: process.env.DATABASE_URL });
client
  .connect()
  .then(() => {
    const sql = fs.readFileSync("create-tables.sql", "utf8");
    return client.query(sql);
  })
  .then(() => {
    console.log("✅ Tables created successfully!");
    client.end();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
