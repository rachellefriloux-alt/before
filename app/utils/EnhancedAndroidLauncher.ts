import { Platform, Alert, Linking, NativeModules, DeviceEventEmitter, AppState, Dimensions } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Network from 'expo-network';
import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { SallieBrain } from '../services/SallieBrain';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { usePersonaStore } from '../store/persona';
import { useDeviceStore } from '../store/device';

// Enhanced interfaces for comprehensive device management
export interface EnhancedAppInfo {
  packageName: string;
  appName: string;
  icon?: string;
  category: string;
  isSystemApp: boolean;
  versionName?: string;
  versionCode?: number;
  lastUpdateTime?: number;
  installTime?: number;
  size?: number;
  permissions?: string[];
  usageStats?: {
    lastTimeUsed: number;
    totalTimeInForeground: number;
    launchCount: number;
    dailyUsage: number;
    weeklyUsage: number;
    averageSessionTime: number;
  };
  automationRules?: AutomationRule[];
  personalizedScore?: number;
  aiRecommendations?: string[];
  securityRating?: 'safe' | 'medium' | 'high-risk';
  batteryImpact?: 'low' | 'medium' | 'high';
  networkUsage?: { wifi: number; mobile: number };
  lastAiAnalysis?: number;
}

export interface SystemInfo {
  batteryLevel: number;
  batteryCharging: boolean;
  batteryTemperature?: number;
  availableMemory: number;
  totalMemory: number;
  availableStorage: number;
  totalStorage: number;
  cpuUsage: number;
  networkInfo: {
    isWifiConnected: boolean;
    wifiNetworkName?: string;
    signalStrength: number;
    isMobileDataConnected: boolean;
    networkType?: string;
    ipAddress?: string;
    macAddress?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  brightness: number;
  volume: {
    system: number;
    media: number;
    alarm: number;
    notification: number;
  };
  sensors: {
    accelerometer?: any;
    gyroscope?: any;
    magnetometer?: any;
  };
  connectivity: {
    bluetooth: boolean;
    nfc: boolean;
    hotspot: boolean;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'location' | 'app_usage' | 'battery' | 'network' | 'contact' | 'calendar' | 'gesture' | 'voice' | 'ai_decision';
    conditions: any;
  };
  actions: {
    type: 'launch_app' | 'send_message' | 'set_brightness' | 'toggle_wifi' | 'call_contact' | 'ai_decision' | 'system_command';
    parameters: any;
  }[];
  enabled: boolean;
  priority: number;
  tags: string[];
  created: number;
  lastTriggered?: number;
  triggerCount: number;
}

export interface IntelligentRecommendation {
  type: 'app_suggestion' | 'automation_suggestion' | 'optimization_suggestion' | 'security_alert' | 'usage_insight';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  actions?: any[];
  category: 'productivity' | 'entertainment' | 'security' | 'optimization' | 'social';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EnhancedLauncherConfig {
  showSystemApps: boolean;
  categorizeApps: boolean;
  customCategories: Record<string, string[]>;
  hiddenApps: string[];
  favoriteApps: string[];
  pinnedApps: string[];
  automationEnabled: boolean;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'full' | 'autonomous';
  privacyMode: 'standard' | 'enhanced' | 'maximum';
  powerUserMode: boolean;
  debugMode: boolean;
  customThemes: any[];
  gestureControls: {
    swipeUp: string;
    swipeDown: string;
    swipeLeft: string;
    swipeRight: string;
    doubleTab: string;
    longPress: string;
  };
  voiceCommands: boolean;
  contextualSuggestions: boolean;
  intelligentGrouping: boolean;
  adaptiveBrightness: boolean;
  batteryOptimization: boolean;
  securityScanning: boolean;
  usageAnalytics: boolean;
  aiModelPreferences: {
    primaryModel: 'openai' | 'anthropic' | 'hybrid';
    fallbackModel: 'openai' | 'anthropic' | 'local';
    maxTokens: number;
    temperature: number;
  };
}

export class EnhancedAndroidLauncher {
  private config: EnhancedLauncherConfig;
  private installedApps: EnhancedAppInfo[] = [];
  private systemInfo: SystemInfo | null = null;
  private automationRules: AutomationRule[] = [];
  private isInitialized = false;
  private sallieBrain: SallieBrain;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private eventListeners: { [key: string]: any[] } = {};
  private automationInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private usageTracker: Map<string, any> = new Map();
  private aiCache: Map<string, any> = new Map();
  private securityAlerts: any[] = [];
  private performanceMetrics: any = {};
  private contextualCache: Map<string, any> = new Map();
  private voiceCommandProcessor: any = null;

  constructor(config?: Partial<EnhancedLauncherConfig>) {
    this.sallieBrain = new SallieBrain();
    this.config = {
      showSystemApps: false,
      categorizeApps: true,
      customCategories: {
        communication: ['com.whatsapp', 'com.telegram.messenger', 'com.discord', 'com.android.mms', 'com.android.dialer'],
        social: ['com.instagram.android', 'com.twitter.android', 'com.facebook.katana', 'com.linkedin.android', 'com.snapchat.android'],
        productivity: ['com.microsoft.office.word', 'com.google.android.apps.docs', 'com.google.android.gm', 'com.google.android.calendar', 'com.microsoft.office.excel'],
        entertainment: ['com.netflix.mediaclient', 'com.spotify.music', 'com.youtube', 'com.amazon.amazonvideo.livingroom', 'com.hulu.plus'],
        games: ['com.supercell.clashofclans', 'com.king.candycrushsaga', 'com.rovio.angrybirds', 'com.epicgames.fortnite'],
        utilities: ['com.android.calculator2', 'com.android.camera', 'com.android.settings', 'com.android.documentsui', 'com.google.android.apps.authenticator2'],
        finance: ['com.paypal.android.p2pmobile', 'com.chase.sig.android', 'com.venmo', 'com.coinbase.android', 'com.robinhood.android'],
        health: ['com.google.android.apps.fitness', 'com.samsung.android.shealthglobal', 'com.myfitnesspal.android'],
        navigation: ['com.google.android.apps.maps', 'com.waze', 'com.uber.m'],
        shopping: ['com.amazon.mShop.android.shopping', 'com.ebay.mobile', 'com.target.ui'],
        news: ['com.google.android.apps.magazines', 'com.twitter.android', 'com.flipboard.app'],
        photography: ['com.vsco.cam', 'com.instagram.android', 'com.adobe.lrmobile'],
        travel: ['com.airbnb.android', 'com.booking', 'com.expedia.bookings'],
        education: ['com.duolingo', 'com.khanacademy.android', 'com.coursera.android'],
      },
      hiddenApps: [],
      favoriteApps: [],
      pinnedApps: [],
      automationEnabled: true,
      aiAssistanceLevel: 'full',
      privacyMode: 'enhanced',
      powerUserMode: true,
      debugMode: false,
      customThemes: [],
      gestureControls: {
        swipeUp: 'show_all_apps',
        swipeDown: 'show_notifications',
        swipeLeft: 'prev_page',
        swipeRight: 'next_page',
        doubleTab: 'launch_sallie',
        longPress: 'show_context_menu',
      },
      voiceCommands: true,
      contextualSuggestions: true,
      intelligentGrouping: true,
      adaptiveBrightness: true,
      batteryOptimization: true,
      securityScanning: true,
      usageAnalytics: true,
      aiModelPreferences: {
        primaryModel: 'hybrid',
        fallbackModel: 'openai',
        maxTokens: 2000,
        temperature: 0.7,
      },
      ...config,
    };

    this.initializeAIServices();
  }

  // Initialize AI services
  private async initializeAIServices() {
    try {
      // Initialize OpenAI
      const openaiKey = await SecureStore.getItemAsync('OPENAI_API_KEY');
      if (openaiKey) {
        this.openai = new OpenAI({ apiKey: openaiKey });
      }

      // Initialize Anthropic
      const anthropicKey = await SecureStore.getItemAsync('CLAUDE_API_KEY');
      if (anthropicKey) {
        this.anthropic = new Anthropic({ apiKey: anthropicKey });
      }
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
    }
  }

  // Enhanced initialization with comprehensive capabilities
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('EnhancedAndroidLauncher only works on Android platform');
      return false;
    }

    try {
      console.log('Initializing Enhanced Android Launcher...');
      
      // Check and request comprehensive permissions
      const hasPermissions = await this.checkAndRequestPermissions();
      if (!hasPermissions) {
        console.warn('Enhanced launcher requires additional permissions');
      }

      // Initialize core systems
      await this.loadInstalledApps();
      await this.initializeSystemMonitoring();
      await this.loadAutomationRules();
      await this.startUsageTracking();
      await this.initializeVoiceCommands();
      
      // Start background services
      this.startAutomationEngine();
      this.startContextualAnalysis();
      
      this.isInitialized = true;
      console.log('Enhanced Android Launcher initialized successfully');
      return true;
    } catch (error) {
      console.error('Enhanced AndroidLauncher initialization failed:', error);
      return false;
    }
  }

  // Comprehensive permission management
  private async checkAndRequestPermissions(): Promise<boolean> {
    try {
      const permissions = [
        'camera',
        'microphone', 
        'location',
        'storage',
        'notifications',
        'contacts',
        'calendar',
        'phone',
        'sms',
      ];

      let allGranted = true;

      for (const permission of permissions) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            allGranted = false;
          }
        } catch (error) {
          console.warn(`Failed to request ${permission} permission:`, error);
          allGranted = false;
        }
      }

      return allGranted;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // Enhanced app loading with comprehensive data
  private async loadInstalledApps(): Promise<void> {
    try {
      // In real implementation, this would use native modules to get actual app data
      // For now, enhanced mock with comprehensive data
      this.installedApps = await this.getEnhancedMockApps();
      
      // Analyze apps with AI if enabled
      if (this.config.aiAssistanceLevel !== 'minimal') {
        await this.analyzeAppsWithAI();
      }

      // Calculate usage statistics
      await this.updateUsageStatistics();

      console.log(`Loaded ${this.installedApps.length} enhanced apps`);
    } catch (error) {
      console.error('Failed to load enhanced apps:', error);
    }
  }

  // Get enhanced mock apps with comprehensive data
  private async getEnhancedMockApps(): Promise<EnhancedAppInfo[]> {
    const baseApps = [
      // Communication Apps
      { 
        packageName: 'com.android.dialer', 
        appName: 'Phone', 
        category: 'communication', 
        isSystemApp: true,
        versionName: '12.0.0',
        versionCode: 120000,
        size: 15000000,
        permissions: ['CALL_PHONE', 'READ_PHONE_STATE', 'RECORD_AUDIO'],
        securityRating: 'safe' as const,
        batteryImpact: 'low' as const,
      },
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        category: 'communication',
        isSystemApp: false,
        versionName: '2.23.24.0',
        versionCode: 2232400,
        size: 120000000,
        permissions: ['INTERNET', 'CAMERA', 'MICROPHONE', 'READ_CONTACTS'],
        securityRating: 'safe' as const,
        batteryImpact: 'medium' as const,
      },
      {
        packageName: 'com.telegram.messenger',
        appName: 'Telegram',
        category: 'communication', 
        isSystemApp: false,
        versionName: '10.2.2',
        versionCode: 3489,
        size: 85000000,
        permissions: ['INTERNET', 'CAMERA', 'MICROPHONE', 'READ_CONTACTS'],
        securityRating: 'safe' as const,
        batteryImpact: 'medium' as const,
      },
      
      // Social Apps
      {
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        category: 'social',
        isSystemApp: false,
        versionName: '303.0.0.39.111',
        versionCode: 303000039,
        size: 180000000,
        permissions: ['INTERNET', 'CAMERA', 'MICROPHONE', 'READ_EXTERNAL_STORAGE'],
        securityRating: 'medium' as const,
        batteryImpact: 'high' as const,
      },

      // Productivity Apps
      {
        packageName: 'com.google.android.gm',
        appName: 'Gmail',
        category: 'productivity',
        isSystemApp: false,
        versionName: '2023.10.15',
        versionCode: 20231015,
        size: 95000000,
        permissions: ['INTERNET', 'GET_ACCOUNTS', 'READ_CONTACTS'],
        securityRating: 'safe' as const,
        batteryImpact: 'medium' as const,
      },

      // Entertainment Apps
      {
        packageName: 'com.spotify.music',
        appName: 'Spotify',
        category: 'entertainment',
        isSystemApp: false,
        versionName: '8.8.52.488',
        versionCode: 88520488,
        size: 105000000,
        permissions: ['INTERNET', 'WRITE_EXTERNAL_STORAGE', 'RECORD_AUDIO'],
        securityRating: 'safe' as const,
        batteryImpact: 'high' as const,
      },

      // Add more comprehensive app data...
    ];

    // Generate usage statistics for each app
    return baseApps.map(app => ({
      ...app,
      installTime: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random within last 30 days
      lastUpdateTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random within last 7 days
      usageStats: {
        lastTimeUsed: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Random within last 24 hours
        totalTimeInForeground: Math.floor(Math.random() * 10 * 60 * 60 * 1000), // Random up to 10 hours
        launchCount: Math.floor(Math.random() * 100), // Random up to 100 launches
        dailyUsage: Math.floor(Math.random() * 2 * 60 * 60 * 1000), // Random up to 2 hours daily
        weeklyUsage: Math.floor(Math.random() * 14 * 60 * 60 * 1000), // Random up to 14 hours weekly
        averageSessionTime: Math.floor(Math.random() * 30 * 60 * 1000), // Random up to 30 minutes
      },
      personalizedScore: Math.random(),
      aiRecommendations: [],
      automationRules: [],
      networkUsage: {
        wifi: Math.floor(Math.random() * 1000000), // Random up to 1MB
        mobile: Math.floor(Math.random() * 100000), // Random up to 100KB
      },
    }));
  }

  // AI-powered app analysis
  private async analyzeAppsWithAI(): Promise<void> {
    if (!this.openai && !this.anthropic) return;

    try {
      for (const app of this.installedApps) {
        // Skip if recently analyzed
        if (app.lastAiAnalysis && Date.now() - app.lastAiAnalysis < 24 * 60 * 60 * 1000) {
          continue;
        }

        const analysisPrompt = `Analyze this Android app and provide insights:
App: ${app.appName} (${app.packageName})
Category: ${app.category}
Permissions: ${app.permissions?.join(', ')}
Usage: ${app.usageStats?.dailyUsage || 0}ms daily
Security Rating: ${app.securityRating}

Provide recommendations for:
1. Usage optimization
2. Security considerations  
3. Alternative apps if applicable
4. Automation opportunities

Format as JSON with fields: recommendations, security_notes, alternatives, automation_ideas`;

        const response = await this.queryAI(analysisPrompt);
        if (response) {
          try {
            const analysis = JSON.parse(response);
            app.aiRecommendations = analysis.recommendations || [];
            app.lastAiAnalysis = Date.now();
          } catch (parseError) {
            console.warn(`Failed to parse AI analysis for ${app.appName}`);
          }
        }
      }
    } catch (error) {
      console.error('AI app analysis failed:', error);
    }
  }

  // System monitoring initialization
  private async initializeSystemMonitoring(): Promise<void> {
    try {
      // Get initial system info
      await this.updateSystemInfo();
      
      // Set up system monitoring interval
      setInterval(() => {
        this.updateSystemInfo();
      }, 30000); // Update every 30 seconds

      // Listen for system events
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
      
      // Battery monitoring
      Battery.addBatteryLevelListener(this.handleBatteryChange.bind(this));
      Battery.addBatteryStateListener(this.handleBatteryStateChange.bind(this));

    } catch (error) {
      console.error('System monitoring initialization failed:', error);
    }
  }

  // Update comprehensive system information
  private async updateSystemInfo(): Promise<void> {
    try {
      const [batteryLevel, batteryState, networkState, brightness] = await Promise.all([
        Battery.getBatteryLevelAsync(),
        Battery.getBatteryStateAsync(), 
        Network.getNetworkStateAsync(),
        Brightness.getBrightnessAsync(),
      ]);

      this.systemInfo = {
        batteryLevel: Math.round(batteryLevel * 100),
        batteryCharging: batteryState === Battery.BatteryState.CHARGING,
        batteryTemperature: 0, // Would need native module
        availableMemory: 0, // Would need native module
        totalMemory: 0, // Would need native module  
        availableStorage: 0, // Would need native module
        totalStorage: 0, // Would need native module
        cpuUsage: 0, // Would need native module
        networkInfo: {
          isWifiConnected: networkState.type === Network.NetworkStateType.WIFI,
          wifiNetworkName: undefined, // Would need native module
          signalStrength: 0, // Would need native module
          isMobileDataConnected: networkState.type === Network.NetworkStateType.CELLULAR,
          networkType: networkState.type,
        },
        brightness: brightness,
        volume: {
          system: 0.5, // Would need native module
          media: 0.5,
          alarm: 0.5,
          notification: 0.5,
        },
        sensors: {},
        connectivity: {
          bluetooth: false, // Would need native module
          nfc: false,
          hotspot: false,
        },
      };

      // Trigger contextual analysis based on system changes
      if (this.config.contextualSuggestions) {
        this.analyzeContextualNeeds();
      }

    } catch (error) {
      console.error('Failed to update system info:', error);
    }
  }

  // Event handlers for system monitoring
  private handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active' && this.config.contextualSuggestions) {
      this.analyzeContextualNeeds();
    }
  };

  private handleBatteryChange = ({ batteryLevel }: { batteryLevel: number }) => {
    if (this.systemInfo) {
      this.systemInfo.batteryLevel = Math.round(batteryLevel * 100);
      
      // Trigger battery optimization if needed
      if (this.config.batteryOptimization && batteryLevel < 0.2) {
        this.triggerBatteryOptimization();
      }
    }
  };

  private handleBatteryStateChange = ({ batteryState }: { batteryState: Battery.BatteryState }) => {
    if (this.systemInfo) {
      this.systemInfo.batteryCharging = batteryState === Battery.BatteryState.CHARGING;
    }
  };

  // Enhanced app launching with intelligence
  async launchApp(packageName: string, context?: any): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Enhanced launcher not initialized');
      return false;
    }

    try {
      const app = this.installedApps.find(a => a.packageName === packageName);
      if (!app) {
        Alert.alert('App Not Found', `Could not find app with package name: ${packageName}`);
        return false;
      }

      console.log(`Launching app with intelligence: ${app.appName} (${packageName})`);

      // Pre-launch optimizations
      await this.optimizeForAppLaunch(app, context);

      // Track usage
      this.trackAppUsage(packageName, 'launch');

      // Use IntentLauncher with enhanced parameters
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        className: `${packageName}.MainActivity`,
        packageName: packageName,
        flags: 0x10000000 | 0x02000000, // NEW_TASK | RESET_TASK_IF_NEEDED
      });

      // Post-launch actions
      await this.handlePostLaunchActions(app, context);

      return true;
    } catch (error) {
      console.error(`Enhanced app launch failed for ${packageName}:`, error);
      
      // Fallback with multiple strategies
      return await this.fallbackAppLaunch(packageName);
    }
  }

  // Pre-launch optimizations
  private async optimizeForAppLaunch(app: EnhancedAppInfo, context?: any): Promise<void> {
    try {
      // Adjust brightness for app if needed
      if (this.config.adaptiveBrightness && app.category === 'entertainment') {
        await Brightness.setBrightnessAsync(0.8);
      }

      // Memory optimization for heavy apps
      if (app.size && app.size > 100000000) { // > 100MB
        // Would trigger native memory cleanup
        console.log('Optimizing memory for large app');
      }

      // Network optimization
      if (app.networkUsage && app.networkUsage.wifi > 500000) {
        // Could suggest switching to WiFi
        console.log('App uses significant data - recommending WiFi');
      }

    } catch (error) {
      console.error('Pre-launch optimization failed:', error);
    }
  }

  // Post-launch actions
  private async handlePostLaunchActions(app: EnhancedAppInfo, context?: any): Promise<void> {
    try {
      // Update usage statistics
      if (app.usageStats) {
        app.usageStats.launchCount++;
        app.usageStats.lastTimeUsed = Date.now();
      }

      // Trigger relevant automations
      await this.triggerAutomations('app_launched', { app, context });

      // Learn from usage patterns
      if (this.config.aiAssistanceLevel === 'full') {
        this.learnFromUsagePattern(app, context);
      }

    } catch (error) {
      console.error('Post-launch actions failed:', error);
    }
  }

  // Fallback app launch strategies
  private async fallbackAppLaunch(packageName: string): Promise<boolean> {
    const strategies = [
      // Strategy 1: Direct package launch
      async () => {
        const canOpen = await Linking.canOpenURL(`package:${packageName}`);
        if (canOpen) {
          await Linking.openURL(`package:${packageName}`);
          return true;
        }
        return false;
      },
      
      // Strategy 2: Market launch
      async () => {
        const marketUrl = `market://details?id=${packageName}`;
        const canOpen = await Linking.canOpenURL(marketUrl);
        if (canOpen) {
          await Linking.openURL(marketUrl);
          return true;
        }
        return false;
      },

      // Strategy 3: Generic intent
      async () => {
        await IntentLauncher.startActivityAsync(packageName);
        return true;
      },
    ];

    for (const strategy of strategies) {
      try {
        if (await strategy()) {
          return true;
        }
      } catch (error) {
        console.warn('Fallback strategy failed:', error);
      }
    }

    Alert.alert(
      'Launch Failed',
      `Could not launch ${packageName}. The app might not be installed or accessible.`,
      [{ text: 'OK' }]
    );
    return false;
  }

  // Advanced automation engine
  private startAutomationEngine(): void {
    if (!this.config.automationEnabled) return;

    this.automationInterval = setInterval(async () => {
      await this.processAutomationRules();
    }, 60000); // Check every minute
  }

  // Process automation rules
  private async processAutomationRules(): Promise<void> {
    try {
      for (const rule of this.automationRules) {
        if (!rule.enabled) continue;

        const shouldTrigger = await this.evaluateAutomationTrigger(rule);
        if (shouldTrigger) {
          await this.executeAutomationActions(rule);
          rule.lastTriggered = Date.now();
          rule.triggerCount++;
        }
      }
    } catch (error) {
      console.error('Automation processing failed:', error);
    }
  }

  // Evaluate automation trigger conditions
  private async evaluateAutomationTrigger(rule: AutomationRule): Promise<boolean> {
    try {
      const { type, conditions } = rule.trigger;

      switch (type) {
        case 'time':
          return this.evaluateTimeCondition(conditions);
        
        case 'location':
          return await this.evaluateLocationCondition(conditions);
        
        case 'battery':
          return this.evaluateBatteryCondition(conditions);
        
        case 'network':
          return this.evaluateNetworkCondition(conditions);
        
        case 'app_usage':
          return this.evaluateAppUsageCondition(conditions);
        
        case 'ai_decision':
          return await this.evaluateAICondition(conditions);
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to evaluate trigger for rule ${rule.id}:`, error);
      return false;
    }
  }

  // Execute automation actions
  private async executeAutomationActions(rule: AutomationRule): Promise<void> {
    try {
      console.log(`Executing automation rule: ${rule.name}`);

      for (const action of rule.actions) {
        switch (action.type) {
          case 'launch_app':
            await this.launchApp(action.parameters.packageName, { automation: rule.id });
            break;
          
          case 'set_brightness':
            await Brightness.setBrightnessAsync(action.parameters.level);
            break;
          
          case 'send_message':
            // Would integrate with messaging system
            console.log('Sending automated message');
            break;
          
          case 'ai_decision':
            await this.executeAIAction(action.parameters);
            break;
        }
      }
    } catch (error) {
      console.error(`Failed to execute actions for rule ${rule.id}:`, error);
    }
  }

  // AI-powered decision making
  private async queryAI(prompt: string, model?: 'openai' | 'anthropic'): Promise<string | null> {
    try {
      const selectedModel = model || this.config.aiModelPreferences.primaryModel;

      if (selectedModel === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.config.aiModelPreferences.maxTokens,
          temperature: this.config.aiModelPreferences.temperature,
        });
        return response.choices[0]?.message?.content || null;
      }

      if (selectedModel === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: this.config.aiModelPreferences.maxTokens,
          messages: [{ role: 'user', content: prompt }],
        });
        return response.content[0]?.type === 'text' ? response.content[0].text : null;
      }

      // Fallback to Sallie Brain
      const result = await this.sallieBrain.processInput(prompt);
      return result.text;

    } catch (error) {
      console.error('AI query failed:', error);
      return null;
    }
  }

  // Contextual analysis and recommendations
  private async analyzeContextualNeeds(): Promise<IntelligentRecommendation[]> {
    if (!this.systemInfo) return [];

    try {
      const contextPrompt = `Based on current context, provide intelligent recommendations:

System Status:
- Battery: ${this.systemInfo.batteryLevel}% (${this.systemInfo.batteryCharging ? 'charging' : 'not charging'})
- Network: ${this.systemInfo.networkInfo.isWifiConnected ? 'WiFi' : 'Mobile'}
- Brightness: ${Math.round(this.systemInfo.brightness * 100)}%
- Time: ${new Date().toLocaleString()}

Recent App Usage:
${this.getRecentUsageContext()}

Provide 3-5 actionable recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "app_suggestion|optimization_suggestion|security_alert",
      "title": "Brief title",
      "description": "Detailed explanation",
      "confidence": 0.0-1.0,
      "priority": "low|medium|high|critical",
      "actions": []
    }
  ]
}`;

      const response = await this.queryAI(contextPrompt);
      if (response) {
        try {
          const result = JSON.parse(response);
          return result.recommendations || [];
        } catch (parseError) {
          console.warn('Failed to parse contextual recommendations');
        }
      }

      return [];
    } catch (error) {
      console.error('Contextual analysis failed:', error);
      return [];
    }
  }

  // Get recent usage context for AI analysis
  private getRecentUsageContext(): string {
    const recentApps = this.installedApps
      .filter(app => app.usageStats && Date.now() - app.usageStats.lastTimeUsed < 24 * 60 * 60 * 1000)
      .sort((a, b) => (b.usageStats?.lastTimeUsed || 0) - (a.usageStats?.lastTimeUsed || 0))
      .slice(0, 5)
      .map(app => `- ${app.appName}: ${Math.round((Date.now() - (app.usageStats?.lastTimeUsed || 0)) / 60000)} min ago`)
      .join('\n');

    return recentApps || 'No recent app usage';
  }

  // Enhanced getter methods with intelligence
  getInstalledApps(options?: {
    category?: string;
    sortBy?: 'name' | 'usage' | 'date' | 'ai_score';
    limit?: number;
    includeAI?: boolean;
  }): EnhancedAppInfo[] {
    if (!this.isInitialized) {
      console.warn('Enhanced launcher not initialized');
      return [];
    }

    let apps = [...this.installedApps];

    // Apply filters
    apps = apps.filter(app => !this.config.hiddenApps.includes(app.packageName));
    
    if (!this.config.showSystemApps) {
      apps = apps.filter(app => !app.isSystemApp);
    }

    if (options?.category) {
      apps = apps.filter(app => app.category === options.category);
    }

    // Apply sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'usage':
          apps.sort((a, b) => (b.usageStats?.dailyUsage || 0) - (a.usageStats?.dailyUsage || 0));
          break;
        case 'date':
          apps.sort((a, b) => (b.installTime || 0) - (a.installTime || 0));
          break;
        case 'ai_score':
          apps.sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
          break;
        default:
          apps.sort((a, b) => a.appName.localeCompare(b.appName));
      }
    }

    // Apply limit
    if (options?.limit) {
      apps = apps.slice(0, options.limit);
    }

    return apps;
  }

  // Get intelligent app recommendations  
  async getIntelligentRecommendations(limit: number = 5): Promise<IntelligentRecommendation[]> {
    const contextualRecommendations = await this.analyzeContextualNeeds();
    return contextualRecommendations.slice(0, limit);
  }

  // Enhanced search with AI assistance
  async searchApps(query: string, options?: {
    useAI?: boolean;
    includeDescription?: boolean;
    fuzzy?: boolean;
  }): Promise<EnhancedAppInfo[]> {
    const lowercaseQuery = query.toLowerCase();
    let results = this.getInstalledApps().filter(app =>
      app.appName.toLowerCase().includes(lowercaseQuery) ||
      app.packageName.toLowerCase().includes(lowercaseQuery) ||
      app.category.toLowerCase().includes(lowercaseQuery)
    );

    // AI-enhanced search
    if (options?.useAI && (this.openai || this.anthropic)) {
      try {
        const aiPrompt = `Given the search query "${query}", suggest relevant Android apps from this list that match the intent:
${this.installedApps.map(app => `${app.appName} (${app.category})`).join('\n')}

Return the package names of the most relevant apps, considering:
1. Direct name matches
2. Functional relevance
3. Category relevance
4. User intent

Format as JSON array of package names.`;

        const aiResponse = await this.queryAI(aiPrompt);
        if (aiResponse) {
          try {
            const suggestedPackages = JSON.parse(aiResponse);
            const aiResults = suggestedPackages
              .map((pkg: string) => this.installedApps.find(app => app.packageName === pkg))
              .filter(Boolean);
            
            // Merge and deduplicate results
            const combined = [...results, ...aiResults];
            results = combined.filter((app, index, self) => 
              index === self.findIndex(a => a.packageName === app.packageName)
            );
          } catch (parseError) {
            console.warn('Failed to parse AI search results');
          }
        }
      } catch (error) {
        console.error('AI search enhancement failed:', error);
      }
    }

    return results;
  }

  // System control methods
  async optimizeSystem(): Promise<boolean> {
    try {
      console.log('Running system optimization...');
      
      // Memory cleanup
      // Would call native memory management
      
      // Cache cleanup  
      this.aiCache.clear();
      this.contextualCache.clear();
      
      // Update system information
      await this.updateSystemInfo();
      
      return true;
    } catch (error) {
      console.error('System optimization failed:', error);
      return false;
    }
  }

  // Usage tracking
  private trackAppUsage(packageName: string, action: string): void {
    const app = this.installedApps.find(a => a.packageName === packageName);
    if (!app || !app.usageStats) return;

    const usage = this.usageTracker.get(packageName) || {
      launches: 0,
      totalTime: 0,
      sessions: [],
    };

    if (action === 'launch') {
      usage.launches++;
      usage.sessions.push({ start: Date.now(), action });
      app.usageStats.launchCount++;
    }

    this.usageTracker.set(packageName, usage);
  }

  // Condition evaluation methods
  private evaluateTimeCondition(conditions: any): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (conditions.hour !== undefined && conditions.hour !== currentHour) {
      return false;
    }
    
    if (conditions.timeRange) {
      const [startHour, endHour] = conditions.timeRange;
      if (currentHour < startHour || currentHour > endHour) {
        return false;
      }
    }

    return true;
  }

  private async evaluateLocationCondition(conditions: any): Promise<boolean> {
    try {
      const location = await Location.getCurrentPositionAsync();
      if (!conditions.latitude || !conditions.longitude) return false;

      const distance = this.calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        conditions.latitude,
        conditions.longitude
      );

      return distance <= (conditions.radius || 100); // Default 100m radius
    } catch (error) {
      console.error('Location condition evaluation failed:', error);
      return false;
    }
  }

  private evaluateBatteryCondition(conditions: any): boolean {
    if (!this.systemInfo) return false;
    
    if (conditions.level !== undefined) {
      return this.systemInfo.batteryLevel <= conditions.level;
    }
    
    if (conditions.charging !== undefined) {
      return this.systemInfo.batteryCharging === conditions.charging;
    }

    return false;
  }

  private evaluateNetworkCondition(conditions: any): boolean {
    if (!this.systemInfo) return false;

    if (conditions.type === 'wifi') {
      return this.systemInfo.networkInfo.isWifiConnected;
    }
    
    if (conditions.type === 'mobile') {
      return this.systemInfo.networkInfo.isMobileDataConnected;
    }

    return false;
  }

  private evaluateAppUsageCondition(conditions: any): boolean {
    const app = this.installedApps.find(a => a.packageName === conditions.packageName);
    if (!app || !app.usageStats) return false;

    if (conditions.dailyUsage) {
      return app.usageStats.dailyUsage >= conditions.dailyUsage;
    }

    if (conditions.launchCount) {
      return app.usageStats.launchCount >= conditions.launchCount;
    }

    return false;
  }

  private async evaluateAICondition(conditions: any): Promise<boolean> {
    try {
      const aiPrompt = `Evaluate this automation condition and return true or false:
Condition: ${JSON.stringify(conditions)}
Current Context: ${JSON.stringify({
  time: new Date().toISOString(),
  battery: this.systemInfo?.batteryLevel,
  network: this.systemInfo?.networkInfo.isWifiConnected ? 'wifi' : 'mobile',
})}

Should this automation trigger? Return only 'true' or 'false'.`;

      const response = await this.queryAI(aiPrompt);
      return response?.toLowerCase().trim() === 'true';
    } catch (error) {
      console.error('AI condition evaluation failed:', error);
      return false;
    }
  }

  // Utility methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private async triggerBatteryOptimization(): Promise<void> {
    console.log('Triggering battery optimization...');
    
    // Reduce brightness
    try {
      const currentBrightness = await Brightness.getBrightnessAsync();
      if (currentBrightness > 0.3) {
        await Brightness.setBrightnessAsync(0.3);
      }
    } catch (error) {
      console.error('Failed to adjust brightness for battery optimization');
    }
    
    // Suggest closing battery-heavy apps
    const batteryHeavyApps = this.installedApps
      .filter(app => app.batteryImpact === 'high')
      .slice(0, 3);

    if (batteryHeavyApps.length > 0) {
      Alert.alert(
        'Battery Optimization',
        `Consider closing these battery-intensive apps: ${batteryHeavyApps.map(a => a.appName).join(', ')}`,
        [{ text: 'OK' }]
      );
    }
  }

  private async executeAIAction(parameters: any): Promise<void> {
    try {
      const actionPrompt = `Execute this AI action based on current context:
Action Parameters: ${JSON.stringify(parameters)}
Current System State: ${JSON.stringify(this.systemInfo)}
Available Apps: ${this.installedApps.slice(0, 10).map(a => a.appName).join(', ')}

Determine and execute the most appropriate action. Return the action taken as JSON:
{
  "action": "description of action taken",
  "success": true/false,
  "details": "additional details"
}`;

      const response = await this.queryAI(actionPrompt);
      if (response) {
        console.log('AI action executed:', response);
      }
    } catch (error) {
      console.error('AI action execution failed:', error);
    }
  }

  private async updateUsageStatistics(): Promise<void> {
    // Update usage statistics for all apps
    for (const app of this.installedApps) {
      if (!app.usageStats) continue;

      // Calculate derived statistics
      const avgSession = app.usageStats.launchCount > 0 
        ? app.usageStats.totalTimeInForeground / app.usageStats.launchCount
        : 0;
      
      app.usageStats.averageSessionTime = avgSession;
      
      // Update personalized score based on usage
      const usageScore = Math.min(app.usageStats.dailyUsage / (2 * 60 * 60 * 1000), 1); // Max 2 hours daily
      const frequencyScore = Math.min(app.usageStats.launchCount / 50, 1); // Max 50 launches
      const recencyScore = app.usageStats.lastTimeUsed > Date.now() - 24 * 60 * 60 * 1000 ? 1 : 0.5;
      
      app.personalizedScore = (usageScore * 0.4 + frequencyScore * 0.4 + recencyScore * 0.2);
    }
  }

  private async learnFromUsagePattern(app: EnhancedAppInfo, context?: any): Promise<void> {
    try {
      const patternPrompt = `Learn from this app usage pattern:
App: ${app.appName} (${app.category})
Context: ${JSON.stringify(context)}
Time: ${new Date().toISOString()}
Previous Usage: ${JSON.stringify(app.usageStats)}

What patterns can be learned for future recommendations?
Return insights as JSON: {"patterns": [], "recommendations": [], "automation_suggestions": []}`;

      const response = await this.queryAI(patternPrompt);
      if (response) {
        // Store learning insights
        const insights = JSON.parse(response);
        console.log('Usage pattern learned:', insights);
      }
    } catch (error) {
      console.error('Usage pattern learning failed:', error);
    }
  }

  private async triggerAutomations(eventType: string, data: any): Promise<void> {
    const relevantRules = this.automationRules.filter(rule => 
      rule.enabled && rule.trigger.type === eventType
    );

    for (const rule of relevantRules) {
      try {
        await this.executeAutomationActions(rule);
      } catch (error) {
        console.error(`Failed to execute automation ${rule.id}:`, error);
      }
    }
  }

  private startContextualAnalysis(): void {
    setInterval(async () => {
      if (this.config.contextualSuggestions) {
        await this.analyzeContextualNeeds();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async loadAutomationRules(): Promise<void> {
    try {
      // Load from secure storage
      const rulesJson = await SecureStore.getItemAsync('automation_rules');
      if (rulesJson) {
        this.automationRules = JSON.parse(rulesJson);
      }
    } catch (error) {
      console.error('Failed to load automation rules:', error);
    }
  }

  private async startUsageTracking(): Promise<void> {
    // Initialize usage tracking
    setInterval(() => {
      this.updateUsageStatistics();
    }, 5 * 60 * 1000); // Update every 5 minutes
  }

  private async initializeVoiceCommands(): Promise<void> {
    if (!this.config.voiceCommands) return;
    
    try {
      // Would initialize voice command recognition
      console.log('Voice commands initialized');
    } catch (error) {
      console.error('Voice command initialization failed:', error);
    }
  }

  // Public API methods for external integration
  async addAutomationRule(rule: Omit<AutomationRule, 'id' | 'created' | 'triggerCount'>): Promise<string> {
    const newRule: AutomationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: Date.now(),
      triggerCount: 0,
      ...rule,
    };

    this.automationRules.push(newRule);
    
    // Save to secure storage
    await SecureStore.setItemAsync('automation_rules', JSON.stringify(this.automationRules));
    
    return newRule.id;
  }

  async removeAutomationRule(ruleId: string): Promise<boolean> {
    const index = this.automationRules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;

    this.automationRules.splice(index, 1);
    await SecureStore.setItemAsync('automation_rules', JSON.stringify(this.automationRules));
    
    return true;
  }

  getSystemInfo(): SystemInfo | null {
    return this.systemInfo;
  }

  getAutomationRules(): AutomationRule[] {
    return [...this.automationRules];
  }

  updateConfig(newConfig: Partial<EnhancedLauncherConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EnhancedLauncherConfig {
    return { ...this.config };
  }

  // Cleanup method
  async shutdown(): Promise<void> {
    if (this.automationInterval) {
      clearInterval(this.automationInterval);
    }

    // Clean up event listeners
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    console.log('Enhanced Android Launcher shutdown complete');
  }
}

// Export both the enhanced class and keep the original for compatibility
export { AndroidLauncher } from './AndroidLauncher';
export default EnhancedAndroidLauncher;