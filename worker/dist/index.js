"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: "redis://localhost:6379"
});
function processSubmission(submission) {
    return __awaiter(this, void 0, void 0, function* () {
        const { problemId, userId, language, code } = JSON.parse(submission);
        yield new Promise((resolve) => setTimeout(resolve, 3000));
        // throw new Error("Simulated processing error")
        console.log(`Processed submission for problem ${problemId} by user ${userId} in language ${language}`);
        yield redisClient.publish("processed_submissions", JSON.stringify({ problemId, userId, status: "write good code " }));
    });
}
function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisClient.connect();
            while (true) {
                let solution;
                try {
                    solution = yield redisClient.brPop("submissions", 0);
                    yield processSubmission(solution.element);
                    console.log(solution);
                }
                catch (err) {
                    console.error("Error processiong submission", err);
                    // put the submission back to the queue 
                    if (solution && solution.element) {
                        try {
                            yield redisClient.lPush("submissions", solution.element);
                        }
                        catch (err) {
                            console.error("Failed to requeue submission", err);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error("Failed to connect to redis ", err);
        }
    });
}
startWorker();
