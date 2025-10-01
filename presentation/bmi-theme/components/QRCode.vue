<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { QRCodeSVG } from "@cheprasov/qrcode";

const url = window.location.href.endsWith("/1")
  ? window.location.href.slice(0, -2)
  : window.location.href;

interface Props {
  /**
   * the qr code width in pixels
   * @default 128
   */
  width?: number | string;
  /**
   * the qr code  height in pixels
   * @default number
   */
  height?: number | string;
  /**
   * the background color for the qr code
   * @default "#ffffff"
   */
  bgColor?: string;
  /**
   * the foreground color for the qr code
   * @default "#000000"
   */
  fgColor?: string;
  /**
   * the correct level?
   * @default "Q"
   */
  level?: string;
  /**
   * optional image properties to use
   */
  imageProperties?: any;
}

const {
  // url,
  level = "Q",
  width = "20%",
  height = "20%",
  fgColor = "#000000",
  bgColor = "#ffffff",
  imageProperties,
} = defineProps<Props>();

const qrId = `qrcode-${new Date().getTime()}`;

const tripod = new URL("../images/circle-tripod-color.png", import.meta.url)
  .href;

const imageProps = computed(() => ({
  x: "center",
  y: "center",
  source: tripod,
  width,
  height,
  ...imageProperties,
}));

const qrCodeElm = ref<null | SVGElement>(null);

const qrCode = ref<string>(
  new QRCodeSVG(url, {
    level,
    fgColor,
    bgColor,
    image: imageProps.value,
  }).toString()
);

onMounted(() => {
  if (!qrCodeElm.value) return;
  qrCodeElm.value.innerHTML = qrCode.value;
});
</script>

<template>
  <div :id="qrId" style="display: flex; justify-content: center">
    <svg :path="qrCode" alt="" ref="qrCodeElm"></svg>
  </div>
  <a :href="url">{{ url }}</a>
</template>
