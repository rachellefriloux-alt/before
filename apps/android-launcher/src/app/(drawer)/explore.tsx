import { StyleSheet } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { HelloWave } from '@/components/HelloWave';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WorkingQRCode } from '@/components/WorkingQRCode';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1BBF6', dark: '#35323a' }}
      headerImage={
        <HelloWave
          style={{
            width: '100%',
            height: 200,
            transform: [{ translateY: -100 }],
          }}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it yourself!</ThemedText>
        <ThemedText>
          See <ThemedText type="defaultSemiBold">core/configs/navigation.ts</ThemedText> for
          navigation details.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Customize the UI</ThemedText>
        <ThemedText>
          Share or explore your favorite clips with your friends.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get started</ThemedText>
        <ThemedText>
          Tap the Explore tab to see the articles.
        </ThemedText>
      </ThemedView>

      <ThemedText type="subtitle">This app includes example code to help you get started.</ThemedText>

      <ThemedView style={{ marginVertical: 20 }}>
        <WorkingQRCode />
      </ThemedView>

      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: '30%',
    width: '30%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});