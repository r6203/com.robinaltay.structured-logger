import { Middleware } from "koa";
import winston from "winston";

export interface ILogData {
  duration?: number;
  method: string;
  status?: number;
  isRequest: boolean;
  isResponse: boolean;
  url: string;
}

export interface ILoggerTransport {
  info: (data: ILogData) => void;
  error: (data: ILogData) => void;
}

export const standardLogMessage = ({
  duration,
  isRequest,
  isResponse,
  method,
  status,
  url,
}: ILogData) => {
  if (isRequest) {
    return `⇐ ${method} ${url}`;
  } else if (isResponse) {
    return `⇒ ${method} ${url} ${status} ${duration}ms`;
  }
};

export const consoleTransport = (): ILoggerTransport => {
  return {
    info: (data) => console.log(standardLogMessage(data)),
    error: (data) => console.error(standardLogMessage(data)),
  };
};

export const winstonTransport = (logger: winston.Logger): ILoggerTransport => {
  return {
    info: (data) => log(data, logger.info),
    error: (data) => log(data, logger.warn),
  };
};

export function structuredLogger(
  transport: ILoggerTransport = consoleTransport(),
): Middleware {
  return async (ctx, next) => {
    transport.info({
      method: ctx.method,
      url: ctx.originalUrl,
      isRequest: true,
      isResponse: false,
    });

    const started = Date.now();
    await next();
    const finished = Date.now();
    const duration = new Date(finished - started).getMilliseconds();

    const data: ILogData = {
      method: ctx.method,
      url: ctx.originalUrl,
      isRequest: false,
      isResponse: true,
      status: ctx.status,
      duration,
    };

    if (ctx.status < 400) {
      transport.info(data);
    } else {
      transport.error(data);
    }
  };
}

function log(data: ILogData, logFn: winston.LeveledLogMethod) {
  const message = standardLogMessage(data);

  if (message) {
    logFn(message);
  }
}
