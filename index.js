import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  database:"permalist",
  host:"localhost",
  password:"root",
  port:5432,
  user:"postgres"
});
db.connect();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

async function getAllItems(){
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  return items;
}

async function updateItemById(id,title){
  await db.query("UPDATE items SET title = $1 WHERE id = $2",[title,id])
}

async function deleteItemById(id){
  await db.query("DELETE FROM items WHERE id = $1", [id])
}

async function addItem(title){
  await db.query("INSERT INTO items (title) VALUES ($1)",[title])
}

app.get("/", async (req, res) => {
  try {
    items = await getAllItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
  });
} catch (err) {
  console.log(err)
}
});

app.post("/add",async (req, res) => {
  const item = req.body.newItem;
  try {
    await addItem(item);
    res.redirect("/");
  } catch (err) {
    console.log(err)
  }
});

app.post("/edit",async (req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  try {
    await updateItemById(id,title);
    res.redirect("/");
  } catch(err) {
    console.log(err)
  }  
});

app.post("/delete",async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await deleteItemById(id);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
