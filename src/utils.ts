import { findNodeHandle, View } from 'react-native'

export const getReactNativeTag = (ref: React.RefObject<View | null>) => {
  if (!ref.current) {
    throw new Error('View ref is not available')
  }
  const tag = findNodeHandle(ref.current)
  if (!tag) {
    throw new Error('Tag is not a valid React component')
  }
  return tag
}
