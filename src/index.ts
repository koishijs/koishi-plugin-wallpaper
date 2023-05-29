import { Context, z } from 'koishi'
import { DataService } from '@koishijs/plugin-console'
import { resolve } from 'path'
import { mkdir, readdir, readFile } from 'fs/promises'

declare module '@koishijs/plugin-console' {
  namespace Console {
    interface Services {
      wallpaper: Wallpaper
    }
  }
}

class Wallpaper extends DataService<string[]> {
  private _task: Promise<string[]>

  public root: string

  constructor(ctx: Context, private config: Wallpaper.Config) {
    super(ctx, 'wallpaper')

    this.root = resolve(this.ctx.baseDir, this.config.root)

    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })

    ctx.router.get('/wallpaper/:name', async (ctx) => {
      const { name } = ctx.params
      const filename = resolve(this.root, name)
      if (!filename.startsWith(this.root)) return ctx.status = 403
      ctx.body = await readFile(filename)
    })
  }

  async _get() {
    await mkdir(this.root, { recursive: true })
    return readdir(this.root)
  }

  async get() {
    return this._task ||= this._get()
  }
}

namespace Wallpaper {
  export interface Config {
    root: string
  }

  export const Config: z<Config> = z.object({
    root: z.path({
      filters: ['directory'],
      allowCreate: true,
    }).default('data/wallpaper').description('存放壁纸的目录。'),
  })
}

export default Wallpaper
