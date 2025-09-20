/*
 * Sallie Sovereign - Device Context
 * React context for managing device control and automation
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSallieSystem } from '../../../core/init';
import { DeviceController, DeviceCapability, PhoneControlAction } from '../../../core/device/DeviceController';

interface DeviceContextType {
  // Device capabilities
  availableCapabilities: DeviceCapability[];
  permissionStatus: Record<string, boolean>;
  
  // Device control actions
  makeCall: (phoneNumber: string) => Promise<boolean>;
  sendSMS: (phoneNumber: string, message: string) => Promise<boolean>;
  launchApp: (packageName: string) => Promise<boolean>;
  toggleSystemSetting: (setting: string, value: boolean) => Promise<boolean>;
  
  // Information queries
  getInstalledApps: () => Promise<any[]>;
  getDeviceInfo: () => Promise<Record<string, any>>;
  
  // Natural language processing
  processCommand: (command: string) => Promise<{ action?: PhoneControlAction; response: string }>;
  
  // Permission management
  requestPermissions: (capabilities: string[]) => Promise<boolean>;
  canPerformAction: (capability: string) => boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const [deviceController, setDeviceController] = useState<DeviceController | null>(null);
  const [availableCapabilities, setAvailableCapabilities] = useState<DeviceCapability[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    initializeDeviceController();
  }, []);

  const initializeDeviceController = async () => {
    try {
      const sallieSystem = getSallieSystem();
      const device = sallieSystem.getDeviceController();
      
      setDeviceController(device);
      setAvailableCapabilities(device.getAvailableCapabilities());
      setPermissionStatus(device.getPermissionStatus());

      // Listen for permission updates
      device.on('permissionsUpdated', (updatedPermissions: Set<string>) => {
        const statusMap: Record<string, boolean> = {};
        availableCapabilities.forEach(cap => {
          statusMap[cap.name] = updatedPermissions.has(cap.name);
        });
        setPermissionStatus(statusMap);
      });

      device.on('actionPerformed', (actionData: any) => {
        console.log('Device action performed:', actionData);
      });

    } catch (error) {
      console.error('Failed to initialize device controller:', error);
    }
  };

  const makeCall = async (phoneNumber: string): Promise<boolean> => {
    if (!deviceController) {
      throw new Error('Device controller not initialized');
    }
    
    return await deviceController.makeCall(phoneNumber, true);
  };

  const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
    if (!deviceController) {
      throw new Error('Device controller not initialized');
    }
    
    return await deviceController.sendSMS(phoneNumber, message);
  };

  const launchApp = async (packageName: string): Promise<boolean> => {
    if (!deviceController) {
      throw new Error('Device controller not initialized');
    }
    
    return await deviceController.launchApp(packageName);
  };

  const toggleSystemSetting = async (setting: string, value: boolean): Promise<boolean> => {
    if (!deviceController) {
      throw new Error('Device controller not initialized');
    }
    
    return await deviceController.toggleSystemSetting(setting, value);
  };

  const getInstalledApps = async (): Promise<any[]> => {
    if (!deviceController) {
      return [];
    }
    
    return await deviceController.getInstalledApps();
  };

  const getDeviceInfo = async (): Promise<Record<string, any>> => {
    if (!deviceController) {
      return {};
    }
    
    return await deviceController.getDeviceInfo();
  };

  const processCommand = async (command: string): Promise<{ action?: PhoneControlAction; response: string }> => {
    if (!deviceController) {
      return { response: 'Device controller not available' };
    }
    
    return await deviceController.processNaturalLanguageCommand(command);
  };

  const requestPermissions = async (capabilities: string[]): Promise<boolean> => {
    if (!deviceController) {
      return false;
    }
    
    return await deviceController.requestPermissions(capabilities);
  };

  const canPerformAction = (capability: string): boolean => {
    if (!deviceController) {
      return false;
    }
    
    return deviceController.canPerformAction(capability);
  };

  const contextValue: DeviceContextType = {
    availableCapabilities,
    permissionStatus,
    makeCall,
    sendSMS,
    launchApp,
    toggleSystemSetting,
    getInstalledApps,
    getDeviceInfo,
    processCommand,
    requestPermissions,
    canPerformAction,
  };

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}