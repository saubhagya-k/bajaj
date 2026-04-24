const express = require("express");
const cors = require("cors");
const bfhlRoute = require("./routes/bfhl");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/bfhl", bfhlRoute);

app.get("/", (req, res) => {
    res.send("BFHL API Running 🚀");
});

app.listen(3009, () => {
    console.log("Server running on port 3009");
});