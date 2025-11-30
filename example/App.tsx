import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  Platform,
  Image,
} from 'react-native';
import NitroViewShot, {
  type NitroViewShotRef,
  captureRef,
} from 'react-native-nitro-view-shot';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getPngDimensionsFromBase64 } from 'utils';

type OutputType = 'file' | 'base64' | null;


function AppContent(): React.JSX.Element {
  const mountCaptureRef = useRef<NitroViewShotRef>(null);
  const asyncCaptureRef = useRef<NitroViewShotRef>(null);
  const syncCaptureRef = useRef<NitroViewShotRef>(null);
  const refCaptureRef = useRef<View>(null);

  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastOutputType, setLastOutputType] = useState<OutputType>(null);
  const [lastLabel, setLastLabel] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleCapture =
    (label: string, output: OutputType) => (result: string) => {
      console.log(`[${label}] capture result:`, result);
      setLastLabel(label);
      setLastOutputType(output);
      setLastResult(result);
    };

  useEffect(() => {
    if (!lastResult) {
      setImageDimensions(null);
      return;
    }

    if (lastOutputType === 'file') {
      const getImageSize = async () => {
        try {
          const uri = `file://${lastResult}`;
          const { width, height } = await new Promise<{
            width: number;
            height: number;
          }>((resolve, reject) => {
            Image.getSize(
              uri,
              (width, height) => resolve({ width, height }),
              reject,
            );
          });
          setImageDimensions({ width, height });
        } catch (error) {
          console.warn('Failed to get image dimensions', error);
        }
      };

      getImageSize();
    } else if (lastOutputType === 'base64') {
      const dimensions = getPngDimensionsFromBase64(lastResult);
      if (dimensions) {
        console.log('Base64 image dimensions:', dimensions);
        setImageDimensions(dimensions);
      } else {
        console.warn('Could not decode base64 image dimensions');
      }
    }
  }, [lastResult, lastOutputType]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        <Text style={styles.heading}>NitroViewShot Example</Text>

        <Text style={styles.sectionTitle}>1. Capture on mount</Text>
        <Text style={styles.sectionDescription}>
          The content wrapped in this component will be captured automatically
          when it is mounted. Output is a file path.
        </Text>
        <NitroViewShot
          ref={mountCaptureRef}
          options={{ fileName: 'mount-capture' }}
          captureMode="mount"
          onCapture={handleCapture('mount', 'file')}
        >
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Auto mount capture</Text>
            <Text style={styles.boxText}>This view is captured on mount.</Text>
          </View>
        </NitroViewShot>

        <Text style={styles.sectionTitle}>2. Manual async capture</Text>
        <Text style={styles.sectionDescription}>
          Use the ref&apos;s <Text style={styles.code}>captureAsync</Text>{' '}
          method to trigger a capture manually. Output is a base64 string.
        </Text>
        <NitroViewShot
          ref={asyncCaptureRef}
          options={{ fileName: 'async-capture', output: 'base64' }}
          onCapture={handleCapture('async', 'base64')}
        >
          <View style={[styles.box, styles.blueBox]}>
            <Text style={styles.boxTitle}>Async capture</Text>
            <Text style={styles.boxText}>
              Press the button below to capture this view asynchronously.
            </Text>
          </View>
        </NitroViewShot>
        <View style={styles.buttonRow}>
          <Button
            title="Capture async"
            onPress={async () => {
              if (asyncCaptureRef.current) {
                await asyncCaptureRef.current.captureAsync({
                  fileName: 'async-capture-override',
                  output: 'base64',
                });
              }
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>3. Manual sync capture</Text>
        <Text style={styles.sectionDescription}>
          Use the ref&apos;s <Text style={styles.code}>capture</Text> method to
          trigger a synchronous capture. Output is a file path.
        </Text>
        <NitroViewShot
          ref={syncCaptureRef}
          options={{ fileName: 'sync-capture' }}
          onCapture={handleCapture('sync', 'file')}
        >
          <View style={[styles.box, styles.greenBox]}>
            <Text style={styles.boxTitle}>Sync capture</Text>
            <Text style={styles.boxText}>
              Press the button below to capture this view synchronously.
            </Text>
          </View>
        </NitroViewShot>
        <View style={styles.buttonRow}>
          <Button
            title="Capture sync"
            onPress={() => {
              if (syncCaptureRef.current) {
                syncCaptureRef.current.capture({
                  fileName: 'sync-capture-override',
                });
              }
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>4. Capture ref</Text>
        <Text style={styles.sectionDescription}>
          Use the <Text style={styles.code}>captureRef</Text> function to
          capture a view. Output is a file path.
        </Text>
        <View style={styles.box} ref={refCaptureRef} collapsable={false}>
          <Text style={styles.boxTitle}>Ref capture</Text>
          <Text style={styles.boxText}>
            Press the button below to capture this view using the ref.
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <Button
            title="Capture sync"
            onPress={() => {
              if (refCaptureRef.current) {
                const result = captureRef(refCaptureRef, {
                  fileName: 'ref-capture-override',
                });
                handleCapture('ref', 'file')(result);
              }
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>Last capture result</Text>
        {lastResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              Last capture source: {lastLabel}
            </Text>
            <Text style={styles.resultText}>Output type: {lastOutputType}</Text>
            {lastOutputType === 'file' ? (
              <>
                <Text style={styles.resultMonospace}>
                  File path: {lastResult}
                </Text>
                <Image
                  source={{ uri: `file://${lastResult}` }}
                  style={[
                    styles.previewImage,
                    imageDimensions && {
                      aspectRatio:
                        imageDimensions.width / imageDimensions.height,
                    },
                  ]}
                  resizeMode="contain"
                />
              </>
            ) : (
              <>
                <Text style={styles.resultMonospace}>
                  Base64 length: {lastResult.length}
                </Text>
                <Image
                  source={{
                    uri: lastResult.startsWith('data:')
                      ? lastResult
                      : `data:image/png;base64,${lastResult}`,
                  }}
                  style={[
                    styles.previewImage,
                    imageDimensions && {
                      aspectRatio:
                        imageDimensions.width / imageDimensions.height,
                    },
                  ]}
                  resizeMode="contain"
                  onError={error => {
                    console.warn('Failed to load base64 image', error);
                    console.warn('Base64 string length:', lastResult.length);
                    console.warn(
                      'Base64 string preview:',
                      lastResult.substring(0, 50),
                    );
                  }}
                  onLoad={e => {
                    console.log('Base64 image loaded successfully');
                    // Fallback: try to get dimensions from onLoad event if not already set
                    if (!imageDimensions) {
                      try {
                        const source = e.nativeEvent.source;
                        if (source?.width && source?.height) {
                          console.log('Got dimensions from onLoad:', {
                            width: source.width,
                            height: source.height,
                          });
                          setImageDimensions({
                            width: source.width,
                            height: source.height,
                          });
                        }
                      } catch (err) {
                        console.warn(
                          'Could not get dimensions from onLoad',
                          err,
                        );
                      }
                    }
                  }}
                />
              </>
            )}
          </View>
        ) : (
          <Text style={styles.sectionDescription}>
            No captures yet. Trigger one of the examples above.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 13,
    color: '#e5e7eb',
  },
  box: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  blueBox: {
    backgroundColor: '#0f172a',
    borderColor: '#1d4ed8',
  },
  greenBox: {
    backgroundColor: '#022c22',
    borderColor: '#16a34a',
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  boxText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  buttonRow: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  resultBox: {
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  resultMonospace: {
    fontSize: 12,
    color: '#e5e7eb',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    marginTop: 8,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    maxWidth: '100%',
    minHeight: 100,
    borderRadius: 8,
  },
});

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

export default App;
