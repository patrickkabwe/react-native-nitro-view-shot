import { NitroModules } from 'react-native-nitro-modules'
import type {
  NitroViewShot as NitroViewShotSpec,
  ViewShotOptions,
} from './specs/nitro-view-shot.nitro'
import { getReactNativeTag } from './utils'

export const NitroViewShotFactory =
  NitroModules.createHybridObject<NitroViewShotSpec>('NitroViewShot')

export const captureRefAsync = async (
  ref: React.RefObject<any | null>,
  options: ViewShotOptions
) => {
  const tag = getReactNativeTag(ref)
  const result = await NitroViewShotFactory.captureAsync(tag, options)
  return result
}

export const captureRef = (
  ref: React.RefObject<any | null>,
  options: ViewShotOptions
) => {
  const tag = getReactNativeTag(ref)
  const result = NitroViewShotFactory.capture(tag, options)
  return result
}
