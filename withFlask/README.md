# Using Flask
A test with python flask and socket-io to separate the vis and the machine learning enginei

## To Run

```
$ python app.py
```

Then open two browser windows.  The machine learning engine lives here:

http://localhost:5000/ml

The viewer lives here:

http://localhost:5000/viewer

To allow a port in ubuntu:

sudo ufw allow 5000

to disable:

sudo ufw deny 5000
