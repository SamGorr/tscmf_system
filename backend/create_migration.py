import os
import sys
import subprocess

def create_initial_migration():
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
        print("To apply the migration, run: alembic upgrade head")
        
    except subprocess.CalledProcessError as e:
        print(f"Error creating migration: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

def create_transaction_relations_migration():
    try:
        # Ensure we're in the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        print("Creating transaction relations migration...")
        
        # Generate the migration for transaction_entity and transaction_goods tables
        subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "add_transaction_entity_and_goods_tables"],
            check=True
        )
        
        print("Transaction relations migration created successfully!")
        print("To apply the migration, run: alembic upgrade head")
        
    except subprocess.CalledProcessError as e:
        print(f"Error creating migration: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Choose which migration to create based on command line argument
    if len(sys.argv) > 1 and sys.argv[1] == "transaction_relations":
        create_transaction_relations_migration()
    else:
        create_initial_migration() 