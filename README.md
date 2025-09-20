# Sallie 1.0

## Overview

Sallie 1.0 is an AI companion application designed to help users align their digital habits with their core values. Built with a "tough love meets soul care" philosophy, Sallie provides supportive but accountable guidance through intelligent conversation, memory-based context awareness, and values-driven interaction patterns. The application combines emotional intelligence, persistent memory systems, and personalized responses to create a meaningful digital companion experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla JavaScript using ES6 modules for a clean, dependency-free frontend
- **Component-based UI**: Modular interface components managed through `SallieInterface.js` for separation of concerns
- **Real-time Chat Interface**: Dynamic conversation management with typing indicators and status updates
- **Values Management Panel**: Interactive UI for users to define and manage their core values
- **Responsive Design**: CSS Grid and Flexbox-based layout with custom CSS variables for consistent theming

### Backend Architecture
- **Express.js Server**: Lightweight Node.js server for serving static files and providing health check endpoints
- **Modular Core Systems**: Organized into distinct modules for memory, values, persona, and AI integration
