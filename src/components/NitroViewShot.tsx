import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PropsWithChildren,
} from 'react'
import type { NitroViewShotCaptureMode, ViewShotOptions } from '../specs/nitro-view-shot.nitro'
import { InteractionManager, View } from 'react-native'
import { captureRef, captureRefAsync, NitroViewShotFactory } from '../nitro-view-shot-factory'
import { getReactNativeTag } from '../utils'

export interface NitroViewShotProps {
  onCapture: (result: string) => void
  captureMode?: NitroViewShotCaptureMode
  options: ViewShotOptions
}

export interface NitroViewShotRef {
  captureAsync: (options?: ViewShotOptions) => Promise<string>
  capture: (options?: ViewShotOptions) => string
}

const NitroViewShot = forwardRef<
  NitroViewShotRef,
  PropsWithChildren<NitroViewShotProps>
>((props, ref) => {
  const viewRef = useRef<View>(null)

  useImperativeHandle(
    ref,
    () => ({
      captureAsync: async (options?: ViewShotOptions) => {
        const result = await captureRefAsync(viewRef, options || props.options)
        if (props.onCapture) {
          props.onCapture(result)
        }
        return result
      },
      capture: (options?: ViewShotOptions) => {
        const result = captureRef(viewRef, options || props.options)
        if (props.onCapture) {
          props.onCapture(result)
        }
        return result
      },
    }),
    [props.onCapture, props.options]
  )

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      // Wait one more frame to ensure view is registered
      requestAnimationFrame(async () => {
        if (props.captureMode === 'mount') {
          const tag = getReactNativeTag(viewRef)
          const result = await NitroViewShotFactory.captureAsync(
            tag,
            props.options
          )
          if (props.onCapture) {
            props.onCapture(result)
          }
        }
      })
    })

    return () => task.cancel()
  }, [props.captureMode])

  return (
    <View ref={viewRef} collapsable={false}>
      {props.children}
    </View>
  )
})

export default NitroViewShot
