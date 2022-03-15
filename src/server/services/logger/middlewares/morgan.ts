import path from 'path'
import morgan from 'morgan'
import * as rfs from 'rotating-file-stream'
import dayjs from 'dayjs'
import { config } from 'server/config'

const accessLogStream = rfs.createStream(
  () => {
    return path.basename(config.LOGGER.ACCESS_LOG_PATH).replace('%DATE%', dayjs().format('YYYY-MM-DD'))
  },
  {
    interval: config.LOGGER.ACCESS_LOG_INTERVAL,
    path: path.dirname(config.LOGGER.ACCESS_LOG_PATH),
  }
)

const accessLogger = morgan('combined', {
  stream: accessLogStream,
  skip: function (req, res) {
    return res.statusCode < 400
  },
})

export { accessLogger }
