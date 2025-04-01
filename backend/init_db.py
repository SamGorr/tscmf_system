import os
import sys
import subprocess
import time

def init_database():
    try:
        # Ensure we're in the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        print("Creating initial migration...")
        
        # Generate the initial migration
        subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "initial_schema"],
            check=True
        )
        
        print("Initial migration created successfully!")
        
        # Apply the migration
        print("Applying migration...")
        subprocess.run(
            ["alembic", "upgrade", "head"],
            check=True
        )
        
        print("Database initialized successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database() 