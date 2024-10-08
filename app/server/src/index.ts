import express from "express"
import { createClient } from "redis"

const app = express()


app.use(express.json())

const client = createClient()


app.post("/submit" , async(req,res)=>{
            const {problemId , code , language} = req.body  ; 
            try{
                        await client.lPush("problems" , JSON.stringify({
                                    problemId , code , language 
                        }))
                        res.status(200).json({
                                    "message" : "Submission received successfully" , 
                                    "status" : "success"
                        })
            }
            catch(e){
                        res.status(500).json({
                                    "status" : "failure" , 
                                    "message" : "Error in pushing to queue " 
                        })
            }
})



async function startserver(){
            try{
                        await client.connect() ; 
                        console.log("connected to redis")
                        app.listen(3000)
            }
            catch(e){
                        console.log("Error starting server" , e)
            }
}

startserver() ; 