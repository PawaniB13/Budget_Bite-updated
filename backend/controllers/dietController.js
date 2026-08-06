const fs = require("fs");
const { generateDietPlan } = require("../dietLogic");

function readDB(){
  return JSON.parse(fs.readFileSync("./db.json"));
}

exports.generatePlan = (req,res)=>{
  const {userId,budget,period} = req.body;

  const db = readDB();
  const user = db.users.find(u=>u.id===userId);

  const daily = period==="weekly"? Math.round(budget/7):budget;

  const plan = generateDietPlan(user,daily,true);

  res.json({plan});
};