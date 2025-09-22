# Sallie Sovereign 🚀

A beautiful, owner-only, offline-first React Native + Android launcher hybrid with advanced AI capabilities and emotional intelligence.

## ✨ Features

### 🧠 Core AI Capabilities
- **Emotional Intelligence Engine** - Real-time emotion analysis and adaptive responses
- **OpenAI Integration** - GPT-4o, GPT-5, Perplexity, Gemini, Claude, Copilot support
- **Persona Engine** - Dynamic personality adaptation based on user interaction
- **Memory System** - Short-term, episodic, semantic, and emotional memory
- **Voice Interaction** - ASR (Automatic Speech Recognition) and TTS (Text-to-Speech)

### 📱 Android Launcher Functionality
- **Home Screen Replacement** - Full Android launcher with app grid
- **App Management** - Launch, organize, and categorize installed applications
- **Quick Actions** - Fast access to common functions (calls, messages, camera, maps)
- **Customizable Interface** - Personalized home screen experience

### 🎯 Advanced Features
- **Camera Integration** - Photo/video capture, gallery access, media management
- **Enhanced Contacts** - Smart contact management with grouping and search
- **Notification System** - Comprehensive notification management with categories
- **Location Services** - GPS tracking, geofencing, location-based reminders
- **System Monitoring** - Battery, network, performance, and device health monitoring

### 🎨 User Experience
- **Dynamic Avatar** - Emotion-responsive visual representation
- **Emotion Meter** - Real-time emotional state visualization
- **Floating Overlay** - Always-accessible interaction button
- **Modern UI/UX** - Beautiful, intuitive interface design
- **Responsive Design** - Optimized for all screen sizes

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React Native + Expo
- **State Management**: Zustand
- **Storage**: react-native-mmkv
- **Navigation**: React Navigation
- **Type Safety**: TypeScript
- **Build System**: Metro + Babel

### Project Structure
```
app/
├── ai/                    # AI modules and intelligence systems
├── components/            # Reusable UI components
├── screens/              # Main application screens
├── store/                # Zustand state stores
├── types/                # TypeScript type definitions
├── utils/                # Utility functions and services
└── assets/               # Images, fonts, and other assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sallie_sovereign
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on device/emulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web (for testing)
   npm run web
   ```

### Environment Setup

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure API keys**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   CLAUDE_API_KEY=your_claude_api_key_here
   ```

## 🔧 Configuration

### Android Launcher Setup
The app is configured to act as an Android home launcher. Key configurations in `app.config.ts`:

- **Package Name**: `com.sallie.sovereign`
- **Intent Filters**: Home launcher, boot completion
- **Permissions**: System alerts, contacts, camera, microphone, location

### AI Configuration
- **Emotional Intelligence**: Configurable emotion thresholds and response patterns
- **Memory System**: Adjustable memory retention and categorization
- **Voice Processing**: Configurable ASR and TTS settings

## 📱 Screens

### Home Launcher Screen
- Current time and date display
- Dynamic Sallie avatar with emotional state
- Quick action buttons
- App grid with categorization
- Recent memories summary

### Sallie Panel Screen
- Conversational AI interface
- Voice input and text input
- Real-time emotion analysis
- Memory integration

### Memories Screen
- Memory categorization and search
- Emotional memory tracking
- Memory statistics and insights

### Settings Screen
- App configuration
- Permission management
- Theme and language settings
- System preferences

### Debug Console Screen
- System monitoring
- Performance metrics
- Debug information
- Log viewing

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ComponentName.test.tsx
```

## 📦 Building

### Android
```bash
# Prebuild
npm run prebuild

# Build release
npm run build:android
```

### iOS
```bash
# Prebuild
npm run prebuild

# Build release
npm run build:ios
```

## 🔒 Security & Privacy

- **Offline-First**: Core functionality works without internet
- **Local Storage**: Sensitive data stored locally using MMKV
- **Permission Management**: Granular permission control
- **Data Encryption**: Secure storage for sensitive information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT integration
- Expo team for the amazing development platform
- React Native community for continuous improvements
- All contributors and supporters

## 📞 Support

For support, questions, or contributions:
- Create an issue in the repository
- Join our community discussions
- Contact the development team

---

**Sallie Sovereign** - Your intelligent, emotional, and sovereign AI companion. 🚀✨
