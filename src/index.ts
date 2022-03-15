/* eslint-disable no-console */
import chalk from 'chalk'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import PrettyError from 'pretty-error'
import { startServer } from './server'

const pe = new PrettyError()

const HOST = process.env.HOST || '0.0.0.0'
const PORT = Number.parseInt(process.env.PORT ?? '8080', 10)

if (process.env.NODE_ENV === 'development') {
  startServer(PORT, HOST)
} else {
  // eslint-disable-next-line no-unused-expressions
  yargs(hideBin(process.argv))
    .command(
      'start [port] [host]',
      'start the server',
      (yargs) => {
        return yargs
          .positional('port', {
            describe: 'port to bind on',
            default: PORT,
          })
          .positional('host', {
            describe: 'host to bind on',
            default: HOST,
          })
      },
      (argv) => {
        console.log(chalk.blue('Trying to start the server'))
        try {
          startServer(argv.port, argv.host)
        } catch (error) {
          console.error(chalk.red('Failed to start server:'))
          if (error instanceof Error) console.log(pe.render(error))
          else console.error(error)

          process.exit(1)
        }
      }
    )
    .demandCommand()
    .help()
    .wrap(72).argv
}
