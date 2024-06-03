import { Context, Schema, store, useConfig } from '@koishijs/client'
import { watchEffect } from 'vue'
import {} from 'koishi-plugin-wallpaper'
import Picker from './picker.vue'

import './index.scss'

declare module '@koishijs/client' {
  interface Config {
    wallpaper?: {
      image?: string
      opacity?: number
    }
  }
}

export default function (ctx: Context) {
  ctx.on('ready', () => {
    const config = useConfig()
    const body = window.document.querySelector('body')

    watchEffect(() => {
      config.value.wallpaper ||= {}
      body.style.backgroundImage = config.value.wallpaper.image ? `url('/wallpaper/${config.value.wallpaper.image}')` : ''
      body.style.opacity = '' + (config.value.wallpaper.opacity ?? 0.9)
    })

    ctx.on('dispose', () => {
      body.style.backgroundImage = ''
      body.style.opacity = ''
    })
  })

  ctx.schema.component({
    type: 'string',
    role: 'wallpaper',
    component: Picker,
  })

  ctx.settings({
    id: 'appearance',
    disabled: () => !store.wallpaper,
    schema: Schema.object({
      wallpaper: Schema.object({
        image: Schema.string().role('wallpaper').description('要使用的背景图片。'),
        opacity: Schema.percent().min(0.5).default(0.9).description('前景的不透明度。'),
      }).description('壁纸设置'),
    }),
  })
}
