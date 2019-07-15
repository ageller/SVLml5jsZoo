@Echo off

echo Starting Zooniverse touchtable app's machine learning engine...

Rem Start the python flask app
START "python" cmd /c "cd C:\Users\uniview\Documents\SVLml5jsZoo & C:\Users\uniview\Anaconda3\python.exe app.py"

Rem wait 5 seconds
timeout 5 /nobreak 

Rem start the browser
START chrome --auto-open-devtools-for-tabs  http://localhost:5000/ml"