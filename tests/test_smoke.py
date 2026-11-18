import sys

def test_python_version():
    # Check if the Python version is 3.15
    assert sys.version_info >= (3, 15), "Python version must be 3.15 or higher"

def test_package_importable():
    import crosstalk # noqa: F401