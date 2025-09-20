/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\src\PersonalizationModule.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\src\PersonalizationModule.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\src\PersonalizationModule.js) --- */
/* Merged master for logical file: feature\src\PersonalizationModule
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\src\PersonalizationModule.js (hash:CEA9D4C3BABE1B313879740F460D87B949CD92D797CB05B9B009A876D4598DB8)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\src\PersonalizationModule.js (hash:68EE5B95085F64BE0E5E056635944C08479B388B1759E49B58CA758FFE6E1F79)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\src\PersonalizationModule.js | ext: .js | sha: CEA9D4C3BABE1B313879740F460D87B949CD92D797CB05B9B009A876D4598DB8 ---- */
[BINARY FILE - original copied to merged_sources: feature\src\PersonalizationModule.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\src\PersonalizationModule.js | ext: .js | sha: 68EE5B95085F64BE0E5E056635944C08479B388B1759E49B58CA758FFE6E1F79 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\src\PersonalizationModule.js --- */
/*
Salle Persona Module: PersonalizationModule
Learns and personalizes responses based on ongoing user interaction, builds memory, and evolves helpfulness.
Follows Salle architecture, modularity, and privacy rules.
*/
class PersonalizationModule {
    constructor() {
        this.profiles = {};
    }
    updateProfile(userId, preference, value) {
        if (!this.profiles[userId]) {
            this.profiles[userId] = { userId, preferences: {}, interactionHistory: [] };
        }
        this.profiles[userId].preferences[preference] = value;
    logInteraction(userId, interaction) {
        this.profiles[userId].interactionHistory.push(interaction);
    personalizeResponse(userId, input) {
        const profile = this.profiles[userId];
        if (!profile) return "Hello! How can I help you today?";
        if (profile.preferences['tone'] === 'friendly') {
            return `Hey ${userId}, great to see you! ${input}`;
        if (profile.preferences['tone'] === 'formal') {
            return `Greetings ${userId}. ${input}`;
        return `Hi ${userId}, ${input}`;
    evolveHelpfulness(userId) {
        if (!profile) return "I'm here to help however I can.";
        const count = profile.interactionHistory.length;
        if (count > 20) return "I've learned a lot from our conversations!";
        if (count > 5) return "I'm getting to know your preferences better.";
        return "Let's keep working together!";
}
module.exports = PersonalizationModule;
