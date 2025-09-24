import os
import logging

__all__ = [
    "logger",
]

# setup loggers
logging_conf = os.path.abspath('app/logging.conf')
logging.config.fileConfig(logging_conf, disable_existing_loggers=False)

# get root logger
logger = logging.getLogger(__name__)