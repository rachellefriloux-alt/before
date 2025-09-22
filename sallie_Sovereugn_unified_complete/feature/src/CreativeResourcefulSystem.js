
class CreativeResourcefulSystem {
    constructor() {
        this.ideas = [];
        this.resources = [];
    }

    generateIdea(topic) {
        const idea = `Creative idea for ${topic}: Combine unexpected elements for a novel solution.`;
        this.ideas.push({ topic, idea, timestamp: Date.now() });
        return idea;
    }

    addResource(resource) {
        this.resources.push(resource);
        return `Resource '${resource}' added.`;
    }

    getResources() {
        return [...this.resources];
    }

    getIdeas() {
        return [...this.ideas];
    }
}

module.exports = CreativeResourcefulSystem;
