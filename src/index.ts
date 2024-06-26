import { Context, z } from 'koishi'
import {} from '@koishijs/plugin-server'
import { DataService } from '@koishijs/plugin-console'
import { resolve } from 'path'
import { mkdir, readdir, readFile } from 'fs/promises'
import { FSWatcher, watch } from 'chokidar'

declare module '@koishijs/console' {
  namespace Console {
    interface Services {
      wallpaper: Wallpaper
    }
  }
}

class Wallpaper extends DataService<string[]> {
  static inject = ['console', 'server']

  private task: Promise<string[]>
  private watcher: FSWatcher

  public root: string

  constructor(ctx: Context, public config: Wallpaper.Config) {
    super(ctx, 'wallpaper')

    this.root = resolve(this.ctx.baseDir, this.config.root)

    const update = ctx.debounce(() => {
      this.ctx.logger.info('wallpaper updated')
      delete this.task
      this.refresh()
    }, 500)

    this.watcher = watch('*', { cwd: this.root })
    this.watcher.on('ready', () => {
      this.watcher.on('all', update)
    })

    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })

    ctx.server.get('/wallpaper/:name', async (ctx) => {
      const { name } = ctx.params
      const filename = resolve(this.root, name)
      if (!filename.startsWith(this.root)) return ctx.status = 403
      ctx.body = await readFile(filename)
    })
  }

  stop() {
    this.watcher.close()
  }

  async _get() {
    await mkdir(this.root, { recursive: true })
    const dirents = await readdir(this.root, { withFileTypes: true })
    return dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name)
  }

  async get() {
    return this.task ||= this._get()
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
