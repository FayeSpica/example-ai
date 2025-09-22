#!/usr/bin/env python3
"""
ChatBI Server Runner
"""

import uvicorn
from config.settings import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        workers=1
    )