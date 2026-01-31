import type { HybridObject } from 'react-native-nitro-modules'

export type NitroViewShotOutputType = 'file' | 'base64';
export type NitroViewShotFormat = 'png' | 'jpg' | 'webp';
export type NitroViewShotCaptureMode = 'mount' | 'none';

export interface ViewShotOptions {
  fileName: string
  /**
   * The format of the image to capture.
   * `webp` is not supported on iOS.
   * Defaults to `png`.
   */
  format?: NitroViewShotFormat 
  /**
   * The quality of the image to capture. 
   * Value between `0.0` and `1.0`.
   * Defaults to `1.0`.
   */
  quality?: number
  /**
   * The type of output to return. 
   * Defaults to `file`.
   */
  output?: NitroViewShotOutputType
}

export interface NitroViewShot extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
  captureAsync(tag: number, options: ViewShotOptions): Promise<string>
  capture(tag: number, options: ViewShotOptions): string
}