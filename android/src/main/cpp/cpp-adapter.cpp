#include <jni.h>
#include "NitroViewShotOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitroviewshot::initialize(vm);
}
