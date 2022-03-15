import { NextFunction, Request, Response } from 'express'

export default function (req: Request, res: Response, next: NextFunction) {
  res.removeHeader('x-powered-by')
  next()
}
