import express from "express";
import { createClient } from "redis";
import cors from "cors"

const redistClent = createClient({
  url: "redis://localhost:6379",
});
const app = express();

app.use(cors())
app.use(express.json())

app.get("/" , (req , res) => {
    res.send("server up ")
})


app.post("/submit"  , async (req , res) => {
    const {problemId , userId , language , code} = req.body ; 

    try {
        await redistClent.lPush("submissions" , JSON.stringify({
            problemId , userId , language , code
        }))
        res.status(200).json({
          message : "Submission received"
        })
    }catch(err){
        console.error(err)
        res.status(500).send("Internal server error ")
    }

})



async function startServer() {
  try {
    await redistClent.connect();
    console.log("Connect to redis ");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Failed to connect to redis", error);
  }
}

startServer() ; 