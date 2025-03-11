package eduflow.common.logging

import org.slf4j.LoggerFactory

enum class LogLevel {
    LOG, DEBUG, INFO, STARTUP, SUCCESS, WARN, ERROR, FATAL
}

class MainLogger(private val loggerLabel: String) {

    private val logger = LoggerFactory.getLogger(loggerLabel)

    fun log(message: String) = log(LogLevel.LOG, message)
    fun debug(message: String) = log(LogLevel.DEBUG, message)
    fun info(message: String) = log(LogLevel.INFO, message)
    fun startup(message: String) = log(LogLevel.STARTUP, message)
    fun success(message: String) = log(LogLevel.SUCCESS, message)
    fun warn(message: String) = log(LogLevel.WARN, message)
    fun error(message: String) = log(LogLevel.ERROR, message)
    fun fatal(message: String) = log(LogLevel.FATAL, message)

    private fun log(level: LogLevel, message: String) {
        val formattedMessage = "[$loggerLabel] [$level] $message"
        when (level) {
            LogLevel.LOG, LogLevel.SUCCESS -> logger.info(formattedMessage)
            LogLevel.DEBUG -> logger.debug(formattedMessage)
            LogLevel.INFO, LogLevel.STARTUP -> logger.info(formattedMessage)
            LogLevel.WARN -> logger.warn(formattedMessage)
            LogLevel.ERROR, LogLevel.FATAL -> logger.error(formattedMessage)
        }
    }
}
