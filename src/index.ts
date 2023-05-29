import { Context, Logger, z } from 'koishi'
import { DataService } from '@koishijs/plugin-console'
import { resolve } from 'path'
import { mkdir, readdir, readFile } from 'fs/promises'
import { FSWatcher, watch } from 'chokidar'
import { debounce } from 'throttle-debounce'

declare module '@koishijs/plugin-console' {
  namespace Console {
    interface Services {
      wallpaper: Wallpaper
    }
  }
}

const logger = new Logger('wallpaper')

class Wallpaper extends DataService<string[]> {
  private task: Promise<string[]>
  private watcher: FSWatcher

  public root: string

  constructor(ctx: Context, private config: Wallpaper.Config) {
    super(ctx, 'wallpaper')

    this.root = resolve(this.ctx.baseDir, this.config.root)

    const update = debounce(500, () => {
      logger.info('wallpaper updated')
      delete this.task
      this.refresh()
    })

    this.watcher = watch('*', { cwd: this.root })
    this.watcher.on('ready', () => {
      this.watcher.on('all', update)
    })

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
