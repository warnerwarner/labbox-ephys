# Labbox-ephys web server

Tested on Linux, should also run on macOS and Windows Subsystem for Linux.

## Prerequisites and kachery setup

It is recommended that you start with a fresh conda environment with Python 3.8 or higher. For example:

```bash
conda create -n labbox-ephys python=3.8
```

After activating the new environment (`conda activate labbox-ephys`), install the following prerequisite packages:

```
conda install -c conda-forge nodejs
npm install -g serve
pip install labbox-ephys
```

Choose a directory where temporary kachery files will be stored and set the KACHERY_STORAGE_DIR environment variable:

```
export KACHERY_STORAGE_DIR="<your-chosen-tmp-file-directory>" 
```

You can also set the following optional environment variables

```bash
# KACHERY_P2P_CONFIG_DIR
# This should correspond to the config directory being used by the kachery-p2p daemon
# By default it is $HOME/.kachery-p2p
export KACHERY_P2P_CONFIG_DIR="<Config directory for kachery-p2p>"

# KACHERY_P2P_API_PORT
# This should correspond to the port being used by the kachery-p2p daemon
# By default it is 20431
export KACHERY_P2P_API_PORT="<Port number used by kachery-p2p daemon>"
```

Ensure that these environment variables are set with each new terminal session by adding those lines to your ~/.bashrc file.

Open a new terminal and start a kachery-p2p daemon, selecting a `<node-label>` for display purposes:

```
kachery-p2p-start-daemon --label <node-label>
```

Keep this running. It allows communication between the Python script and the GUI. For more information, see [kachery-p2p](https://github.com/flatironinstitute/kachery-p2p).

## Installing and running the app

Upgrade to the latest labbox-ephys (it may be worth restarting the kachery daemon in case updates have been made to the kachery-p2p package):

```
pip install --upgrade labbox-ephys
```

Now run the labbox-ephys service:

```
labbox-ephys
```

Open the web app in a browser at http://localhost:15351. On the first run, this should display an empty workspace with instructions on importing recordings and sortings.
