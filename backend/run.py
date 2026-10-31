import uvicorn
import os
import sys

# Ensure root directory is on PYTHONPATH
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting SiteGen Backend API on http://{host}:{port}")
    print(f"Interactive API Docs available at: http://localhost:{port}/docs")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)

