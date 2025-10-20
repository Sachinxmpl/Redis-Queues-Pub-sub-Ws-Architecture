import { createClient } from "redis";

const redisClient = createClient ({
    url: "redis://localhost:6379"
})

async function processSubmission(submission: string){
    const {problemId , userId , language , code} = JSON.parse(submission) ;
    await new Promise((resolve) => setTimeout(resolve , 3000))
    // throw new Error("Simulated processing error")
    console.log(`Processed submission for problem ${problemId} by user ${userId} in language ${language}`)

    await redisClient.publish("processed_submissions" , JSON.stringify({problemId , userId ,  status :"Write good code or face the consequences!"}))
}

async function startWorker(){
    try {
        await redisClient.connect()
        
        while(true){
            let solution;
            try {
                solution = await redisClient.brPop("submissions" , 0) ;
                await processSubmission(solution.element) ; 
                console.log(solution)
            }catch(err){
                console.error("Error processiong submission" , err) 
                // put the submission back to the queue 
                if (solution && solution.element) {
                    try {
                        await redisClient.lPush("submissions" , solution.element) ;
                    }catch(err){
                        console.error("Failed to requeue submission" , err)
                    }
                }
            }

        }

    }catch(err){
        console.error("Failed to connect to redis " , err)
    }
}   

startWorker()