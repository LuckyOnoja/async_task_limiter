const fs = require('fs');

const tasks = JSON.parse(fs.readFileSync('task_batch.json', 'utf8'));
const MAX_CONCURRENCY = 2;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTask(task) {
    console.log(`[START] Task ${task.id} running...`);
    await sleep(task.duration);
    console.log(`[DONE] Task ${task.id} finished.`);
}

async function processQueue(taskList, limit) {
    console.log(`Starting Concurrency Queue (Limit: ${limit})`);
    const executing = [];

    for(const task of taskList) {
        const p = runTask(task).then(()=> {
            executing.splice(executing.indexOf(p), 1);
        });

        executing.push(p);
        if(executing.length >= limit){
            console.log(`[QUEUE] Limit reached. Waiting for a slot to free up...`);
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);
    console.log("All Tasks Completed Successfully");
}

processQueue(tasks, MAX_CONCURRENCY);