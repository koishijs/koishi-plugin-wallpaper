<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button @click="showDialog = true">{{ config || '选择图片' }}</el-button>
      <el-dialog class="wallpaper-picker" destroy-on-close v-model="showDialog">
        <template #header>
          选择图片
        </template>

        <el-scrollbar>
          <div class="container">
            <div class="item" v-for="src in store.wallpaper" :key="src" @click="config = src">
              <div class="image" :style="{ backgroundImage: `url('/wallpaper/${src}')` }"></div>
              <el-radio v-model="config" :label="src"></el-radio>
            </div>
          </div>
        </el-scrollbar>
      </el-dialog>
    </template>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType, ref } from 'vue'
import { Schema, SchemaBase, store } from '@koishijs/client'
import {} from 'koishi'
import {} from 'koishi-plugin-wallpaper'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<string>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

const config = SchemaBase.useModel<string>()

const showDialog = ref(false)

defineEmits(['update:modelValue'])

</script>

<style lang="scss">

$width: 240px;
$height: 180px;

.el-dialog.wallpaper-picker {
  width: 66%;
  max-height: 66%;
  display: flex;
  flex-direction: column;

  .el-dialog__body {
    flex: 1 1 auto;
    overflow: auto;
  }

  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .item {
    overflow: hidden;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: var(--color-transition);

    &:hover {
      background-color: var(--k-hover-bg);
    }
  }

  .el-radio {
    margin-top: 0.5rem;
  }

  .image {
    width: $width;
    height: $height;
    background-size: cover;
    background-position: center;
  }
}

</style>