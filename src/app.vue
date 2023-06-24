<script lang="ts" setup>
const SHAKE_THRESHOLD = 30;

const isPermissionGranted = ref(false);
const shakeCount = ref(0);
const resetShakeTimerId = ref<number|null>(null);

const lastAcceleration = ref({ x: 0, y: 0, z: 0 });
const { acceleration } = useDeviceMotion();

onMounted(async () => {
  if ((window.DeviceMotionEvent as any)?.requestPermission) {
    isPermissionGranted.value = await (window.DeviceMotionEvent as any).requestPermission() === "granted";
  } else {
    isPermissionGranted.value = true;
  }
});

watchThrottled(acceleration, () => {
  const { x, y, z } = acceleration.value ?? { x: 0, y: 0, z: 0 };

  if (
    Math.sqrt((x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2) > SHAKE_THRESHOLD
  ) {
    if (
      Math.sign(x ?? 0) !== Math.sign(lastAcceleration.value.x ?? 0)
      || Math.sign(y ?? 0) !== Math.sign(lastAcceleration.value.y ?? 0)
      || Math.sign(z ?? 0) !== Math.sign(lastAcceleration.value.z ?? 0)
    ) {
      shakeCount.value++;

      if (resetShakeTimerId.value) window.clearTimeout(resetShakeTimerId.value);

      resetShakeTimerId.value = window.setTimeout(() => {
        shakeCount.value = 0;
        resetShakeTimerId.value = null;
      }, 3000);
    }
  }
  lastAcceleration.value = { x: x ?? 0, y: y ?? 0, z: z ?? 0 };
}, { throttle: 100 });

const requestPermission = async () => {
  const result = await (DeviceMotionEvent as any).requestPermission();
  isPermissionGranted.value = result === "granted";
};

const clipPath = computed(() => {
  const ratio = (1 - Math.min(1, shakeCount.value / 20)) * 100;
  return `polygon(0 ${ratio}%, 100% ${ratio}%, 100% 100%, 0 100%)`;
});
</script>

<template>
  <main class="relative w-screen h-screen">
    <div class="z-0 absolute w-full h-full transition-all" :style="{ backgroundColor: '#EE8000', clipPath }" />
    <div class="z-10 absolute w-full h-full flex flex-col items-center justify-center">
      <div v-if="isPermissionGranted" class="flex flex-col gap-4 items-center">
        <h1 class="text-2xl">
          加速度
        </h1>
        <table>
          <tbody>
            <tr>
              <th class="px-4">
                X
              </th>
              <td class="px-4">
                {{ acceleration?.x }}
              </td>
            </tr>
            <tr>
              <th class="px-4">
                Y
              </th>
              <td class="px-4">
                {{ acceleration?.y }}
              </td>
            </tr>
            <tr>
              <th class="px-4">
                Z
              </th>
              <td class="px-4">
                {{ acceleration?.z }}
              </td>
            </tr>
          </tbody>
        </table>
        <p class="text-4xl top-1/2 left-1/2">
          {{ shakeCount }}
        </p>
      </div>
      <button v-else class="px-4 py-2 border border-orange-700 text-orange-700 rounded hover:bg-orange-50 select-none" @click="requestPermission">
        &quot;動作と方向&quot;へのアクセスを許可する
      </button>
    </div>
  </main>
</template>
