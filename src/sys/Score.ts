export class Score {
    pts = 0;
    shots = 0;
    hits = 0;
    reactionTimes: number[] = [];

    recordShot(hit: boolean,reactionTime: number) {
        this.shots++;

        if (hit) {
            this.hits++;
            this.pts++;
            this.reactionTimes.push(reactionTime);
        }
    }

    get accuracy() {
        if (this.shots === 0) {
            return 0;
        }

        return this.hits / this.shots;
    }

    get averageReactionTime() {
        if (this.reactionTimes.length === 0) {
            return 0;
        }

        const total = this.reactionTimes.reduce((sum, time) => sum + time, 0);

        return total / this.reactionTimes.length;
    }
    
    get bestReactionTime() {
        if (this.reactionTimes.length === 0) {
            return 0;
        }
        return Math.min(...this.reactionTimes);
    }

    reset() {
        this.pts = 0;
        this.shots = 0;
        this.hits = 0;
        this.reactionTimes = [];
    }
}