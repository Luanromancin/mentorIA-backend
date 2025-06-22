import { Request, Response } from 'express';

export type ResultMessageCode = string | number | symbol;
export type ResultData = unknown;

export abstract class Result {
  msg: string;
  msgCode: ResultMessageCode;
  code: number;

  constructor({
    msg,
    msgCode,
    code,
  }: {
    msg: string;
    msgCode: ResultMessageCode;
    code: number;
  }) {
    this.msg = msg;
    this.msgCode = msgCode;
    this.code = code;
  }

  static transformRequestOnMsg(req: Request): string {
    return `${req.method} ${req?.originalUrl}`;
  }
}

export class SuccessResult extends Result {
  data?: ResultData;

  constructor({
    msg,
    msgCode,
    code,
    data,
  }: {
    msg: string;
    msgCode?: ResultMessageCode;
    code?: number;
    data?: ResultData;
  }) {
    super({ msg, msgCode: msgCode || 'success', code: code || 200 });
    this.data = data;
  }

  handle(res: Response): Response {
    return res.status(this.code).send(this);
  }
}

export class FailureResult extends Result {
  constructor({
    msg,
    msgCode,
    code,
  }: {
    msg: string;
    msgCode?: ResultMessageCode;
    code?: number;
  }) {
    super({ msg, msgCode: msgCode || 'failure', code: code || 500 });
  }

  handle(res: Response): Response {
    return res.status(this.code).send(this);
  }
}
