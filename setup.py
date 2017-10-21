from os.path import abspath, dirname, join
from setuptools import find_packages, setup


ENTRY_POINTS = """
[crosscompute.extensions]
ipynb = crosscompute_notebook_extensions.ipynb:IPythonNotebookTool"""
FOLDER = dirname(abspath(__file__))
DESCRIPTION = '\n\n'.join(open(join(FOLDER, x)).read().strip() for x in [
    'README.rst', 'CHANGES.rst'])
setup(
    name='crosscompute-notebook-extensions',
    version='0.5.0',
    description='CrossCompute extensions for Jupyter Notebook',
    long_description=DESCRIPTION,
    classifiers=[
        'Framework :: CrossCompute',
        'Framework :: Jupyter',
        'Programming Language :: Python',
    ],
    author='CrossCompute Inc',
    author_email='support@crosscompute.com',
    url='https://crosscompute.com/docs',
    keywords='web crosscompute jupyter',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    setup_requires=[
        'pytest-runner',
    ],
    install_requires=[
        'configparser',
        'crosscompute>=0.6.9',
        'crosscompute-types>=0.6.9',
        'jinja2',
        'notebook>=5.0.0',
        'psutil',
        'requests',
    ],
    tests_require=[
        'pytest',
    ],
    entry_points=ENTRY_POINTS)
