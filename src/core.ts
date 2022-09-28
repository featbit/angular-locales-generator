#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import winston, { format } from 'winston';
import { generate } from './index';
import path from "path";

const { combine, timestamp, printf, colorize, align } = format;

const myFormat = printf( (info) => {
    return `${info.level} ${info.timestamp}: ${info.message}`;
  });

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    format.errors({ stack: true }),
    colorize(),
	timestamp(),
    align(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    //new winston.transports.File({ filename: 'ffc-code-refs.log' }),
  ],
});

interface IConfig {
    locales: string[],
    basePath: string
}

let defaultConfig: IConfig = {
    locales: [],
    basePath: ''
};


async function buildConfig() {
    try {
        const argv = yargs(hideBin(process.argv))
            .option('locales', {
                alias: 'l',
                type: 'string',
                description: 'the targeting locales, seperated by comma'
            })
            .option('base-path', {
                alias: 'bp',
                type: 'string',
                description: 'the directory where the translation files are stored'
            })
            .help()
            .alias('help', 'h').argv;

        const locales: string = argv['locales'];
        if (!locales) {
            logger.log({ level: 'error', message: 'locales not provided'});
            return false;
        }

        const basePath = path.join(process.cwd(), argv['basePath']);

        if (!basePath) {
            logger.log({ level: 'error', message: 'base-path not provided'});
            return false;
        }

        defaultConfig = Object.assign({}, defaultConfig, {
            locales: [...defaultConfig.locales, ...locales.split(',')],
            basePath: defaultConfig.basePath || basePath
        });
      
        return true;
    } catch (err: any) {
        logger.log({ level: 'error', message: err.message});
    }

    return false;
}

export default async function start (): Promise<any> {
    if (!await buildConfig()) {
        return;
    }

    generate(defaultConfig.locales, defaultConfig.basePath, logger);
}
