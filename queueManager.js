class QueueManager {
    constructor() {
        this.fifoQueue = [];
        this.priorityQueue = [];
        this.roundRobinQueue = [];
        this.currentRoundRobinIndex = 0;
    }

    addToFifoQueue(request) {
        this.fifoQueue.push(request);
    }

    addToPriorityQueue(request, priority) {
        this.priorityQueue.push({ request, priority });
        this.priorityQueue.sort((a, b) => a.priority - b.priority);
    }

    getNextFromFifoQueue() {
        return this.fifoQueue.shift();
    }

    getNextFromPriorityQueue() {
        return this.priorityQueue.shift().request;
    }
}

module.exports = QueueManager;
