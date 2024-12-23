const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Suggestion is falling from the sky");
});

app.listen(port, () => {
  console.log(`Suggestify website is running on port ${port}`);
});
