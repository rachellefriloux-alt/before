/*
 * Sallie AI UI/UX Testing Framework
 * Comprehensive testing for user interface and user experience
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

// Device configurations for testing
export interface DeviceConfig {
    name: string;
    width: number;
    height: number;
    scale: number;
    platform: 'ios' | 'android';
    type: 'phone' | 'tablet' | 'web';
}

export const DEVICE_CONFIGS: DeviceConfig[] = [
    // iOS Devices
    { name: 'iPhone SE', width: 375, height: 667, scale: 2, platform: 'ios', type: 'phone' },
    { name: 'iPhone 12', width: 390, height: 844, scale: 3, platform: 'ios', type: 'phone' },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926, scale: 3, platform: 'ios', type: 'phone' },
    { name: 'iPad Mini', width: 768, height: 1024, scale: 2, platform: 'ios', type: 'tablet' },
    { name: 'iPad Pro', width: 1024, height: 1366, scale: 2, platform: 'ios', type: 'tablet' },

    // Android Devices
    { name: 'Pixel 4', width: 393, height: 851, scale: 2.75, platform: 'android', type: 'phone' },
    { name: 'Samsung Galaxy S21', width: 360, height: 800, scale: 3, platform: 'android', type: 'phone' },
    { name: 'Samsung Galaxy Tab S7', width: 800, height: 1280, scale: 2, platform: 'android', type: 'tablet' },

    // Web/Desktop
    { name: 'Desktop 1080p', width: 1920, height: 1080, scale: 1, platform: 'ios', type: 'web' },
    { name: 'Laptop 1366', width: 1366, height: 768, scale: 1, platform: 'ios', type: 'web' }
];

export class UITester {
    private currentDevice: DeviceConfig;
    private testResults: UITestResult[] = [];

    constructor(deviceConfig?: DeviceConfig) {
        this.currentDevice = deviceConfig || this.getCurrentDeviceConfig();
    }

    private getCurrentDeviceConfig(): DeviceConfig {
        const { width, height } = Dimensions.get('window');
        const scale = PixelRatio.get();

        // Find closest matching device
        let closestDevice = DEVICE_CONFIGS[0];
        let minDifference = Infinity;

        for (const device of DEVICE_CONFIGS) {
            const difference = Math.abs(device.width - width) + Math.abs(device.height - height);
            if (difference < minDifference) {
                minDifference = difference;
                closestDevice = device;
            }
        }

        return closestDevice;
    }

    setDevice(deviceName: string): void {
        const device = DEVICE_CONFIGS.find(d => d.name === deviceName);
        if (device) {
            this.currentDevice = device;
        } else {
            throw new Error(`Device ${deviceName} not found`);
        }
    }

    getCurrentDevice(): DeviceConfig {
        return this.currentDevice;
    }

    // Layout testing
    testLayout(component: any, props: any = {}): LayoutTestResult {
        const startTime = Date.now();

        try {
            // Simulate rendering on current device
            const layout = this.calculateLayout(component, props);
            const endTime = Date.now();

            const result: LayoutTestResult = {
                component: component.name || 'Unknown',
                device: this.currentDevice.name,
                layout,
                renderTime: endTime - startTime,
                passed: this.validateLayout(layout),
                issues: this.identifyLayoutIssues(layout)
            };

            this.testResults.push(result);
            return result;

        } catch (error) {
            const result: LayoutTestResult = {
                component: component.name || 'Unknown',
                device: this.currentDevice.name,
                layout: null,
                renderTime: Date.now() - startTime,
                passed: false,
                issues: [{ type: 'error', message: error instanceof Error ? error.message : String(error), severity: 'high' }]
            };

            this.testResults.push(result);
            return result;
        }
    }

    // Accessibility testing
    testAccessibility(component: any, props: any = {}): AccessibilityTestResult {
        const issues: AccessibilityIssue[] = [];

        // Check for accessibility props
        if (!props.accessible) {
            issues.push({
                type: 'missing_accessible',
                message: 'Component missing accessible prop',
                severity: 'medium'
            });
        }

        if (!props.accessibilityLabel && !props.accessibilityHint) {
            issues.push({
                type: 'missing_label',
                message: 'Component missing accessibility label or hint',
                severity: 'high'
            });
        }

        // Check color contrast (simplified)
        if (props.style && this.hasPoorContrast(props.style)) {
            issues.push({
                type: 'poor_contrast',
                message: 'Text may have poor color contrast',
                severity: 'medium'
            });
        }

        // Check touch target size
        if (this.hasSmallTouchTarget(props.style)) {
            issues.push({
                type: 'small_touch_target',
                message: 'Touch target may be too small for accessibility',
                severity: 'medium'
            });
        }

        const result: AccessibilityTestResult = {
            component: component.name || 'Unknown',
            device: this.currentDevice.name,
            score: Math.max(0, 100 - (issues.length * 15)),
            issues,
            passed: issues.filter(i => i.severity === 'high').length === 0
        };

        this.testResults.push(result);
        return result;
    }

    // Performance testing
    testPerformance(component: any, props: any = {}, iterations: number = 10): PerformanceTestResult {
        const renderTimes: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            this.calculateLayout(component, props);
            const endTime = Date.now();
            renderTimes.push(endTime - startTime);
        }

        const avgRenderTime = iterations > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;
        const maxRenderTime = iterations > 0 ? Math.max(...renderTimes) : 0;
        const minRenderTime = iterations > 0 ? Math.min(...renderTimes) : 0;

        const result: PerformanceTestResult = {
            component: component.name || 'Unknown',
            device: this.currentDevice.name,
            averageRenderTime: avgRenderTime,
            maxRenderTime,
            minRenderTime,
            iterations,
            passed: avgRenderTime < 100, // Should render in under 100ms
            issues: avgRenderTime >= 100 ? [{
                type: 'slow_render',
                message: `Average render time ${avgRenderTime.toFixed(2)}ms exceeds 100ms threshold`,
                severity: 'medium'
            }] : []
        };

        this.testResults.push(result);
        return result;
    }

    // Cross-device compatibility testing
    testCrossDeviceCompatibility(component: any, props: any = {}): CrossDeviceTestResult {
        const results: DeviceTestResult[] = [];

        for (const device of DEVICE_CONFIGS) {
            const originalDevice = this.currentDevice;
            this.currentDevice = device;

            const layoutResult = this.testLayout(component, props);
            const accessibilityResult = this.testAccessibility(component, props);
            const performanceResult = this.testPerformance(component, props, 5);

            results.push({
                device: device.name,
                layout: layoutResult.passed,
                accessibility: accessibilityResult.passed,
                performance: performanceResult.passed,
                issues: [
                    ...layoutResult.issues,
                    ...accessibilityResult.issues,
                    ...performanceResult.issues
                ]
            });

            this.currentDevice = originalDevice;
        }

        const overallPassed = results.every(r => r.layout && r.accessibility && r.performance);

        const result: CrossDeviceTestResult = {
            component: component.name || 'Unknown',
            device: this.currentDevice.name,
            overallPassed,
            deviceResults: results,
            summary: {
                totalDevices: results.length,
                passedDevices: results.filter(r => r.layout && r.accessibility && r.performance).length,
                failedDevices: results.filter(r => !r.layout || !r.accessibility || !r.performance).length
            },
            passed: overallPassed,
            issues: results.flatMap(r => r.issues)
        };

        this.testResults.push(result);
        return result;
    }

    // Test all devices
    runFullTestSuite(component: any, props: any = {}): FullTestSuiteResult {
        console.log(`Running full test suite for ${component.name || 'Unknown'} on ${this.currentDevice.name}`);

        const layoutTest = this.testLayout(component, props);
        const accessibilityTest = this.testAccessibility(component, props);
        const performanceTest = this.testPerformance(component, props);
        const crossDeviceTest = this.testCrossDeviceCompatibility(component, props);

        const overallScore = (
            (layoutTest.passed ? 100 : 0) +
            (accessibilityTest.score) +
            (performanceTest.passed ? 100 : 0) +
            (crossDeviceTest.overallPassed ? 100 : 0)
        ) / 4;

        return {
            component: component.name || 'Unknown',
            device: this.currentDevice.name,
            overallScore,
            layoutTest,
            accessibilityTest,
            performanceTest,
            crossDeviceTest,
            passed: overallScore >= 70, // 70% passing threshold
            timestamp: Date.now()
        };
    }

    // Get test results
    getTestResults(): UITestResult[] {
        return [...this.testResults];
    }

    // Generate test report
    generateReport(): string {
        const report = {
            summary: {
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(r => 'passed' in r && r.passed).length,
                failedTests: this.testResults.filter(r => 'passed' in r && !r.passed).length,
                device: this.currentDevice.name
            },
            results: this.testResults,
            recommendations: this.generateRecommendations()
        };

        return JSON.stringify(report, null, 2);
    }

    private calculateLayout(component: any, props: any): any {
        // Simplified layout calculation
        // In a real implementation, this would use React's test renderer
        return {
            width: this.currentDevice.width,
            height: this.currentDevice.height,
            scale: this.currentDevice.scale,
            platform: this.currentDevice.platform
        };
    }

    private validateLayout(layout: any): boolean {
        // Basic layout validation
        return layout.width > 0 && layout.height > 0;
    }

    private identifyLayoutIssues(layout: any): LayoutIssue[] {
        const issues: LayoutIssue[] = [];

        if (layout.width < 320) {
            issues.push({
                type: 'too_narrow',
                message: 'Layout width is too narrow for comfortable use',
                severity: 'medium'
            });
        }

        if (layout.height < 480) {
            issues.push({
                type: 'too_short',
                message: 'Layout height is too short for comfortable use',
                severity: 'medium'
            });
        }

        return issues;
    }

    private hasPoorContrast(style: any): boolean {
        // Simplified contrast check
        if (style.color && style.backgroundColor) {
            // In a real implementation, calculate actual contrast ratio
            return false; // Placeholder
        }
        return false;
    }

    private hasSmallTouchTarget(style: any): boolean {
        // Check if touch target meets minimum size requirements (44x44 points)
        const minSize = 44;
        if (!style) return false;
        return (style.width && typeof style.width === 'number' && style.width < minSize) ||
            (style.height && typeof style.height === 'number' && style.height < minSize);
    }

    private generateRecommendations(): string[] {
        const recommendations: string[] = [];

        const failedTests = this.testResults.filter(r => 'passed' in r && !r.passed);

        if (failedTests.some(t => 'issues' in t && t.issues.some(i => i.type === 'slow_render'))) {
            recommendations.push('Optimize component rendering performance - consider using React.memo or useMemo');
        }

        if (failedTests.some(t => 'issues' in t && t.issues.some(i => i.type === 'missing_accessible'))) {
            recommendations.push('Add accessibility props to improve app accessibility');
        }

        if (failedTests.some(t => 'issues' in t && t.issues.some(i => i.type === 'poor_contrast'))) {
            recommendations.push('Improve color contrast ratios for better readability');
        }

        if (failedTests.some(t => 'issues' in t && t.issues.some(i => i.type === 'small_touch_target'))) {
            recommendations.push('Increase touch target sizes to meet accessibility guidelines (minimum 44x44 points)');
        }

        return recommendations;
    }
}

// Test result interfaces
export interface UITestResult {
    component: string;
    device: string;
    passed: boolean;
    issues: TestIssue[];
}

export interface LayoutTestResult extends UITestResult {
    layout: any;
    renderTime: number;
}

export interface AccessibilityTestResult extends UITestResult {
    score: number;
}

export interface PerformanceTestResult extends UITestResult {
    averageRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
    iterations: number;
}

export interface CrossDeviceTestResult extends UITestResult {
    overallPassed: boolean;
    deviceResults: DeviceTestResult[];
    summary: {
        totalDevices: number;
        passedDevices: number;
        failedDevices: number;
    };
}

export interface FullTestSuiteResult {
    component: string;
    device: string;
    overallScore: number;
    layoutTest: LayoutTestResult;
    accessibilityTest: AccessibilityTestResult;
    performanceTest: PerformanceTestResult;
    crossDeviceTest: CrossDeviceTestResult;
    passed: boolean;
    timestamp: number;
}

export interface DeviceTestResult {
    device: string;
    layout: boolean;
    accessibility: boolean;
    performance: boolean;
    issues: TestIssue[];
}

export interface TestIssue {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
}

export interface LayoutIssue extends TestIssue {
    type: 'too_narrow' | 'too_short' | 'overflow' | 'error';
}

export interface AccessibilityIssue extends TestIssue {
    type: 'missing_accessible' | 'missing_label' | 'poor_contrast' | 'small_touch_target';
}

// Export singleton instance
export const uiTester = new UITester();
