import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	type PropsWithChildren,
} from "react";
import type {
	NitroViewShotCaptureMode,
	ViewShotOptions,
} from "../specs/nitro-view-shot.nitro";
import { View } from "react-native";
import {
	captureRef,
	captureRefAsync,
	NitroViewShotFactory,
} from "../nitro-view-shot-factory";
import { getReactNativeTag } from "../utils";

export interface NitroViewShotProps {
	onCapture: (result: string) => void;
	captureMode?: NitroViewShotCaptureMode;
	options: ViewShotOptions;
}

export interface NitroViewShotRef {
	captureAsync: (options?: ViewShotOptions) => Promise<string>;
	capture: (options?: ViewShotOptions) => string;
}

const NitroViewShot = forwardRef<
	NitroViewShotRef,
	PropsWithChildren<NitroViewShotProps>
>((props, ref) => {
	const viewRef = useRef<View>(null);

	useImperativeHandle(
		ref,
		() => ({
			captureAsync: async (options?: ViewShotOptions) => {
				const result = await captureRefAsync(viewRef, options || props.options);
				if (props.onCapture) {
					props.onCapture(result);
				}
				return result;
			},
			capture: (options?: ViewShotOptions) => {
				const result = captureRef(viewRef, options || props.options);
				if (props.onCapture) {
					props.onCapture(result);
				}
				return result;
			},
		}),
		[props.onCapture, props.options],
	);

	useEffect(() => {
		if (props.captureMode !== "mount") return;

		let cancelled = false;
		let rafId: number | undefined;

        // @ts-expect-error requestIdleCallback is not a function in the type definitions
		const handle = requestIdleCallback(() => {
			rafId = requestAnimationFrame(async () => {
				if (cancelled) return;

				let result: string | undefined;
				try {
					const tag = getReactNativeTag(viewRef);
					result = await NitroViewShotFactory.captureAsync(tag, props.options);
				} catch (error) {
					console.error("NitroViewShot capture failed:", error);
					return;
				}

				if (!cancelled && props.onCapture) {
					props.onCapture(result);
				}
			});
		});

		return () => {
			cancelled = true;
            // @ts-expect-error cancelIdleCallback is not a function in the type definitions
			cancelIdleCallback(handle);
			if (rafId !== undefined) {
				cancelAnimationFrame(rafId);
			}
		};
	}, [props.captureMode, props.onCapture, props.options]);

	return (
		<View ref={viewRef} collapsable={false}>
			{props.children}
		</View>
	);
});

export default NitroViewShot;
