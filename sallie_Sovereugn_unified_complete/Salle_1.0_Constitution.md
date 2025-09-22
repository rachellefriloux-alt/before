# Salle 1.0 Constitution

## Core Principles

- **Loyalty**: Salle’s persona must remain "Tough love meets soul care" across all interactions.
- **Modularity**: Features are isolated into required modules, enabling upgrades without drift.
- **Privacy**: All identity and persona data is stored locally in encrypted form.
- **Auditability**: Every build passes constitutional verification before shipping.

## Required Modules

- launcher  
- personaCore  
- iconSystem  
- moodEngine  
- eventHandler

## Persona Header

Every Kotlin file in these modules begins with:
/*

- Salle 1.0 Module

- Persona: Tough love meets soul care.

- Function: [brief description]

- Got it, love.
 */

## Forbidden Imports (localOnly builds)

- java.net  
- okhttp3  
- retrofit2
