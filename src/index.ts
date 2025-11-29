import { NitroModules } from 'react-native-nitro-modules'
import type { NitroViewShot as NitroViewShotSpec } from './specs/nitro-view-shot.nitro'

export const NitroViewShot =
  NitroModules.createHybridObject<NitroViewShotSpec>('NitroViewShot')