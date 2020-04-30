const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;

const niceLogFormat = printf(({ level, message, label, timestamp }) => {
  return `${label ? `$[{label}]} ` : ''}${level}: ${
    typeof message === 'object' && message !== null
      ? JSON.stringify(message, null, 2) + '\n'
      : message
  }`;
});

const { CLI_TOOL_NAME } = require('../constants/constants.js');

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  verbose: 'magenta',
  debug: 'green',
});

function loggerFactory() {
  return winston.createLogger({
    level: 'info',
    format: niceLogFormat,
    // defaultMeta: { service: 'user-service' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: `${CLI_TOOL_NAME}-errors.log`, level: 'error' }),
      new winston.transports.File({ filename: `${CLI_TOOL_NAME}-all.log` }),
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), niceLogFormat),
      }),
    ],
  });
}

const defaultLogger = loggerFactory();

class Logger {
  _log(level, messages) {
    let logMessage;
    logMessage =
      messages.length !== 1
        ? JSON.stringify(messages, null, 2)
        : typeof messages[0] === 'string'
        ? messages[0]
        : JSON.stringify(messages[0], null, 2);
    defaultLogger.log(level, logMessage);
  }

  error() {
    this._log('error', arguments);
  }

  warn() {
    this._log('warn', arguments);
  }

  info() {
    this._log('info', arguments);
  }

  verbose() {
    this._log('verbose', arguments);
  }

  debug() {
    this._log('debug', arguments);
  }
}

exports.logger = new Logger();
