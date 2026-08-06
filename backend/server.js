const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const dietRoutes = require("./routes/dietRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>res.send("Backend running"));

app.use("/api", userRoutes);
app.use("/api", dietRoutes);

app.listen(5000, ()=>console.log("Server running on 5000"));