/**
 * logger.ts — Sistema de Logging Estructurado Nativo
 * 
 * Cumple con la directiva Zero-Trust: 0 dependencias externas (sin winston/pino).
 * Convierte los registros a formato JSON puro para una óptima ingesta en
 * sistemas de observabilidad (Datadog, Vercel Logs, AWS CloudWatch).
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

class StructuredLogger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      payload.context = context;
    }

    if (error instanceof Error) {
      payload.error = error.message;
      payload.stack = error.stack;
    } else if (error !== undefined) {
      payload.error = String(error);
    }

    // Convertir a string JSON en una sola línea de manera segura
    try {
      const logString = JSON.stringify(payload);
      // Usamos stdout para INFO/WARN y stderr para ERROR garantizando pureza de streams
      if (level === 'ERROR') {
        process.stderr.write(logString + '\n');
      } else {
        process.stdout.write(logString + '\n');
      }
    } catch (stringifyError) {
      // Fallback a prueba de fallas si el context tiene dependencias circulares
      process.stdout.write(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          message: `${message} [Logger Error: Failed to stringify context]`,
        }) + '\n'
      );
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log('INFO', message, context);
  }

  public warn(message: string, context?: Record<string, unknown>, error?: unknown) {
    this.log('WARN', message, context, error);
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log('ERROR', message, context, error);
  }
}

export const Logger = new StructuredLogger();
