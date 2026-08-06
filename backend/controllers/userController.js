const fs = require("fs");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const DB = "./db.json";

function readDB(){
  if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({users:[]}));
  return JSON.parse(fs.readFileSync(DB));
}

function writeDB(data){
  fs.writeFileSync(DB, JSON.stringify(data,null,2));
}

exports.signup = async (req,res)=>{
  const {name,username,password} = req.body;
  const db = readDB();

  if(db.users.find(u=>u.username===username))
    return res.json({error:"User exists"});

  const hash = await bcrypt.hash(password,10);

  const user = {id:uuidv4(),name,username,password:hash};
  db.users.push(user);
  writeDB(db);

  res.json({user});
};

exports.login = async (req,res)=>{
  const {username,password} = req.body;
  const db = readDB();

  const user = db.users.find(u=>u.username===username);
  if(!user) return res.json({error:"No user"});

  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.json({error:"Wrong password"});

  res.json({user});
};

exports.saveProfile = (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.body.userId);

  Object.assign(user, req.body);
  writeDB(db);

  res.json({user});
};