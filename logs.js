/* eslint-disable no-console */
/* eslint-disable no-shadow */
import { createLogger, format, transports } from 'winston';
import { guiInfoStatusTypes } from './constants/constants.js';

const { combine, timestamp, printf } = format;

// Sample output
// {"timestamp":"2020-11-25 17:29:07","level":"error","message":"hello world"}
const logFormat = printf(({ timestamp, level, message }) => {
  const log = {
    timestamp: `${timestamp}`,
    level: `${level}`,
    message: `${message}`,
  };

  return JSON.stringify(log);
});

// transport: storage device for logs
// Enabled for console and storing into files; Files are overwritten each time
// All logs in combined.txt, error in errors.txt

const consoleLogger = createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [new transports.Console()],
});

// No display in consoles, this will mostly be used within the interactive script to avoid disrupting the flow
// Also used in common functions to not link internal information
const silentLogger = createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new transports.File({ filename: 'errors.txt', level: 'warn', handleExceptions: true }),
  ],
});

// guiInfoLogger feeds the gui information via console log and is mainly used for scanning process
export const guiInfoLog = (status, data) => {
  if (process.env.RUNNING_FROM_PH_GUI) {
    switch (status) {
      case guiInfoStatusTypes.COMPLETED:
        console.log('Electron scan completed');
        break;
      case guiInfoStatusTypes.SCANNED:
      case guiInfoStatusTypes.SKIPPED:
      case guiInfoStatusTypes.ERROR:
        console.log(
          `Electron crawling::${data.numScanned || 0}::${status}::${
            data.urlScanned || 'no url provided'
          }`,
        );
        break;
      default:
        console.log(`Status provided to gui info log not recognized: ${status}`);
        break;
    }
  }
};

export { logFormat, consoleLogger, silentLogger };
