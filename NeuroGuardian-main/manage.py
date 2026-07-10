import os
import sys

if __name__ == "__main__":
    # Add both current directory and inner folder to path
    current_dir = os.path.dirname(__file__)
    inner_dir = os.path.join(current_dir, 'stroke_risk_prediction')
    
    sys.path.insert(0, current_dir)
    sys.path.insert(0, inner_dir)
    
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH environment variable? Did you forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
