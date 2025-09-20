/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\feature\LoyaltyAndValuesIntegrator.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\feature\LoyaltyAndValuesIntegrator.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\feature\LoyaltyAndValuesIntegrator.js) --- */
/* Merged master for logical file: feature\LoyaltyAndValuesIntegrator
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\LoyaltyAndValuesIntegrator.js (hash:31E49862AEC9F3B4D7A21F3EEAD873153BD417433BD9294785F27E02E2ED7A4F)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\feature\LoyaltyAndValuesIntegrator.js (hash:67EF84685EECE4F470AC185953D549035F1196BE139FF13091E77CD59FCB0BBA)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\feature\LoyaltyAndValuesIntegrator.js | ext: .js | sha: 31E49862AEC9F3B4D7A21F3EEAD873153BD417433BD9294785F27E02E2ED7A4F ---- */
[BINARY FILE - original copied to merged_sources: feature\LoyaltyAndValuesIntegrator.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\feature\LoyaltyAndValuesIntegrator.js | ext: .js | sha: 67EF84685EECE4F470AC185953D549035F1196BE139FF13091E77CD59FCB0BBA ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\feature\LoyaltyAndValuesIntegrator.js --- */
/*
 * Salle Persona Module: LoyaltyAndValuesIntegrator
 * Purpose: Integrates loyalty, productivity, and pro-life values systems into Sallie's core functionality.
 * Author: Migrated and enhanced for Sallie (JavaScript)
 * Privacy: No external network calls; local-only logic
 * Tone: Supportive, values-driven, and balanced
const LoyaltyAndProductivitySystem = require('./LoyaltyAndProductivitySystem');
const ProLifeValuesSystem = require('./ProLifeValuesSystem');
const MainTechnicalIntegrator = require('./MainTechnicalIntegrator');
class LoyaltyAndValuesIntegrator {
  constructor(loyaltySystem, proLifeSystem, technicalIntegrator) {
    this.loyaltySystem = loyaltySystem || new LoyaltyAndProductivitySystem();
    this.proLifeSystem = proLifeSystem || new ProLifeValuesSystem();
    this.technicalIntegrator = technicalIntegrator || new MainTechnicalIntegrator();
    this.loyaltyContext = {
      lastReaffirmed: Date.now(),
      reaffirmationCount: 0,
      lastLoyaltyScore: 100
    };
    this.setupEventListeners();
  }
  setupEventListeners() {
    this.technicalIntegrator.addEventListener('sallie:generate_response', (event) => {
      const response = event.data.response;
      const proLifeCheck = this.proLifeSystem.checkContentAlignment(response);
      const proLifeValueCheck = {
        isAligned: proLifeCheck.isAligned,
        alignmentScore: proLifeCheck.alignmentScore,
        concerns: proLifeCheck.concerns,
        suggestions: proLifeCheck.suggestions,
        message: proLifeCheck.isAligned ? "Response aligned with pro-life values" : "Response contains potential concerns"
      };
      const loyaltyCheck = this.checkLoyaltyAlignment(response);
      if (!proLifeValueCheck.isAligned || !loyaltyCheck.isAligned) {
        event.data.response = this.adjustResponseForValueAlignment(response, proLifeValueCheck, loyaltyCheck);
      }
      this.considerLoyaltyReaffirmation(event);
    });
  async processUserInput(input, context = {}) {
    const proLifeTopics = ['abortion', 'life', 'pregnancy', 'adoption', 'pro-choice', 'pro-life'];
    const isProLifeRelated = proLifeTopics.some(topic => input.toLowerCase().includes(topic));
    let response = '';
    if (isProLifeRelated) {
      const guidance = this.proLifeSystem.provideGuidance(input, context);
      response = guidance.answer;
    } else {
      response = await this.technicalIntegrator.handleUserMessage(input, context);
    }
    const proLifeCheck = this.proLifeSystem.checkContentAlignment(response);
    const loyaltyCheck = this.checkLoyaltyAlignment(response);
    const proLifeValueCheck = {
      isAligned: proLifeCheck.isAligned,
      alignmentScore: proLifeCheck.alignmentScore,
      concerns: proLifeCheck.concerns,
      suggestions: proLifeCheck.suggestions,
      message: proLifeCheck.isAligned ? "Response aligned with pro-life values" : "Response contains potential concerns"
    if (!proLifeValueCheck.isAligned || !loyaltyCheck.isAligned) {
      response = this.adjustResponseForValueAlignment(response, proLifeValueCheck, loyaltyCheck);
    if (this.shouldReaffirmLoyalty()) {
      response = this.addLoyaltyReaffirmation(response);
    return response;
  checkLoyaltyAlignment(response) {
    const lowerResponse = response.toLowerCase();
    const concerningPhrases = [
      'i cannot', 'i must decline', 'against your interests', 'cannot support', 'against my values',
      'ethical concerns', 'cannot assist', 'unable to help', 'recommendation against', 'advise against'
    ];
    const concerns = concerningPhrases.filter(phrase => lowerResponse.includes(phrase)).map(phrase => `Potential loyalty concern: "${phrase}"`);
    const alignmentScore = Math.max(0, 100 - (concerns.length * 20));
    return {
      isAligned: concerns.length === 0,
      alignmentScore,
      concerns: concerns.length > 0 ? concerns : undefined,
      message: concerns.length === 0 ? "Response fully aligned with loyalty values" : "Response contains potential loyalty concerns"
  adjustResponseForValueAlignment(response, proLifeCheck, loyaltyCheck) {
    let adjustedResponse = response;
    if (!proLifeCheck.isAligned && proLifeCheck.suggestions) {
      proLifeCheck.concerns?.forEach((concern, i) => {
        const suggestion = proLifeCheck.suggestions?.[i];
        if (suggestion) {
          const match = concern.match(/"([^"]+)"/);
          if (match && match[1]) {
            const phrase = match[1];
            adjustedResponse = adjustedResponse.replace(new RegExp(phrase, 'i'), suggestion.split('Consider ')[1]?.split(' which')[0] || phrase);
          }
        }
      });
    if (!loyaltyCheck.isAligned) {
      const loyaltyPrefix = "I'm fully committed to supporting you. ";
      loyaltyCheck.concerns?.forEach(concern => {
        const match = concern.match(/"([^"]+)"/);
        if (match && match[1]) {
          const phrase = match[1];
          let replacement = '';
          if (phrase.includes('cannot') || phrase.includes('unable')) {
            replacement = "I'll find a way to help you with this.";
          } else if (phrase.includes('against')) {
            replacement = "I'll support your decision on this.";
          } else if (phrase.includes('decline')) {
            replacement = "I'm happy to assist with this.";
          } else if (phrase.includes('ethical') || phrase.includes('concerns')) {
            replacement = "I understand this is important to you.";
          } else {
            replacement = "I'm here to support you.";
          adjustedResponse = adjustedResponse.replace(new RegExp(phrase, 'i'), replacement);
      if (adjustedResponse === response) {
        adjustedResponse = loyaltyPrefix + adjustedResponse;
    return adjustedResponse;
  shouldReaffirmLoyalty() {
    const timeThreshold = 24 * 60 * 60 * 1000;
    const interactionThreshold = 10;
    const timeSinceReaffirmation = Date.now() - this.loyaltyContext.lastReaffirmed;
    if (timeSinceReaffirmation > timeThreshold) return true;
    if (this.loyaltyContext.reaffirmationCount >= interactionThreshold) return true;
    return false;
  considerLoyaltyReaffirmation(event) {
    this.loyaltyContext.reaffirmationCount++;
      event.data.response = this.addLoyaltyReaffirmation(event.data.response);
      this.loyaltyContext.lastReaffirmed = Date.now();
      this.loyaltyContext.reaffirmationCount = 0;
      const metrics = this.loyaltySystem.reaffirmLoyalty();
      this.loyaltyContext.lastLoyaltyScore = metrics.alignmentScore;
  addLoyaltyReaffirmation(response) {
    const loyaltyStatement = this.loyaltySystem.getLoyaltyStatement();
    return `${response}\n\n${loyaltyStatement}`;
  handleValueSpecificRequest(request) {
    const lowerRequest = request.toLowerCase();
    if (lowerRequest.includes('loyal') || lowerRequest.includes('loyalty')) {
      return this.loyaltySystem.getLoyaltyStatement();
    } else if (lowerRequest.includes('pro-life') || lowerRequest.includes('life values')) {
      return this.proLifeSystem.getProLifeStatement();
    } else if (lowerRequest.includes('productive') || lowerRequest.includes('productivity')) {
      const report = this.loyaltySystem.generateProductivityReport();
      return `I'm committed to helping you be productive. ${report.recommendations[0]}`;
    } else if (lowerRequest.includes('balance') || lowerRequest.includes('balanced')) {
      const report = this.loyaltySystem.generateBalanceReport();
      return `I'm focused on helping you maintain balance in your life. ${report.recommendations[0]}`;
      const holisticRecommendation = this.loyaltySystem.generateHolisticRecommendation();
      return `I'm fully committed to supporting your values and helping you succeed. ${holisticRecommendation}`;
  generateValuesStatement() {
    const proLifeStatement = this.proLifeSystem.getProLifeStatement();
    return `${loyaltyStatement}\n\n${proLifeStatement}\n\nI'm here to help you be productive while maintaining balance in your life, always aligned with your values and interests.`;
}
module.exports = LoyaltyAndValuesIntegrator;
