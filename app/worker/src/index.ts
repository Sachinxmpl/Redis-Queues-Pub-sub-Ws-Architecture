import { createClient } from "redis";

const client = createClient() ; 

async function Handlesubmission(submission : string){
            const {problemId , code , language} = JSON.parse(submission) ; 

            console.log("Procesing the code")

            await new Promise(resolve => setTimeout(resolve , 1000)) 
            console.log(`Finished processing the problem for problemid ${problemId}`)

}


async function startserver(){
            try{
                        await client.connect();
                        console.log("Worker connected ")
                        while(true){
                                    try{
                                                const code = await client.brPop("problems" , 10) ; 
                                                console.log(code) ; 
                                                await Handlesubmission(code.element)
                                    }catch(e){
                                                console.log("Error submitting problem  ")
                                    }
                        }
            }
            catch(e){
                        console.log("Error starting server" , e)
            }
}

startserver();

