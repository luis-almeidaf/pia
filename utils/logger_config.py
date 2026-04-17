import os
from datetime import datetime


class Logger:
    LOG_DIR = "logs"
    LOG_FILE = "erros.log"

    @staticmethod
    def escreve_mensagem_log(mensagem: str) -> None:
        """
        Escreve uma linha de erro no arquivo de log.
        """
        os.makedirs(Logger.LOG_DIR, exist_ok=True)

        log_path = os.path.join(Logger.LOG_DIR, Logger.LOG_FILE)

        timestamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        with open(log_path, "a", encoding="utf-8") as arquivo:
            arquivo.write(f"{timestamp} - ERROR - {mensagem}\n")
