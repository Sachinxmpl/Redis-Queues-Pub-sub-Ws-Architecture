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
const client = (0, redis_1.createClient)();
function Handlesubmission(submission) {
    return __awaiter(this, void 0, void 0, function* () {
        const { problemId, code, language } = JSON.parse(submission);
        console.log("Procesing the code");
        yield new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Finished processing the problem for problemid ${problemId}`);
        client.publish("problemSolved", JSON.stringify({ problemId, code, language }));
    });
}
function startserver() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Worker connected ");
            while (true) {
                try {
                    const code = yield client.brPop("problems", 10);
                    console.log(code);
                    yield Handlesubmission(code.element);
                }
                catch (e) {
                    console.log("Error submitting problem  ");
                }
            }
        }
        catch (e) {
            console.log("Error starting server", e);
        }
    });
}
startserver();
