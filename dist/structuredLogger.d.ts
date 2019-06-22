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
export declare const standardLogMessage: ({ duration, isRequest, isResponse, method, status, url, }: ILogData) => string | undefined;
export declare const consoleTransport: () => ILoggerTransport;
export declare const winstonTransport: (logger: winston.Logger) => ILoggerTransport;
export declare function structuredLogger(transport?: ILoggerTransport): Middleware;
