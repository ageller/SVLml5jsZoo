# SVLml5jsZoo
![screengrab](static/doc/ScreenShot1.png)

A test exhibit for the Adler Planetarium's SVL to teach Machine Learning using Galaxy Zoo data

A live version is [here](https://ageller.github.io/SVLml5jsZoo/).

## Using Flask
Also included is a test with python flask and socket-io to separate the vis and the machine learning engine.

### To Run

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
