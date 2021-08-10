# Park Safe Chicago

## Where is a safe place to park my car?
### Goal
Our goal is to create an interactive visualization that lets users (anyone who drives a car) analyze auto theft data around Chicago.

### Audience
Any driver comfortable with common interactive maps (e.g., Google Maps) where maps and data are displayed simultaneously.

### Tasks
(1) A driver **discovers** how safe a neighborhood is to park in by seeing auto theft data for all neighborhoods in Chicago as well as any neighborhoods they select while interacting with the map and charts. The driver can also explore features over different years.

(2) A driver enters a **specific address** to identify location-specific trends and features in the surrounding local area of the address. A zoomed in map shows nearby auto theft locations and also visualizations on number of cars stolen per month for certain days/times. All of this data allows the driver to decide whether they should park there or somewhere else.

### Data
Our dataset contains reported crimes in the city of Chicago from 2001 to present (excluding the most recent seven days).
Data is extracted from the [Chicago Police Department's CLEAR](https://data.cityofchicago.org/) (Citizen Law Enforcement Analysis and Reporting) system and is provided to us via Google BigQuery.

#### Video Demo:
[https://www.youtube.com/watch?v=bVO0LygUY7M](https://www.youtube.com/watch?v=bVO0LygUY7M)

#### Final Slide Deck:
[https://docs.google.com/presentation/d/1cgpw0gfGpx5mOGu8J_wFnqnJAYnlOMAxpi4Xqynwptk/edit?usp=sharing](https://docs.google.com/presentation/d/1cgpw0gfGpx5mOGu8J_wFnqnJAYnlOMAxpi4Xqynwptk/edit?usp=sharing)



### Interactive Dashboards
<img width="1421" alt="overview_dashboard" src="https://user-images.githubusercontent.com/75960494/128105896-4ff6c82c-7214-46d2-9a3d-9b498c98a780.png">
<img width="1432" alt="user_address" src="https://user-images.githubusercontent.com/75960494/128105379-ed84a07a-a285-461e-b5e2-d38c54114180.png">

## Environment Setup
### Flask Setup Steps:
Listed are the following steps to get up and running. 

1. Clone repo to your preferred location
* `git clone https://github.com/sanjayms01/ParkSafeChicago.git`

2. Create Python Virtual environment 
* `cd ParkSafeChicago/backend/`
* `python -m venv park-safe`
* `source park-safe/bin/activate`

3. Install all the Python dependencies we have so far for the virtual environment
* `pip install -r requirements.txt`
* `cd ../`

4. Create a `.flaskenv` file and add the following to it (you should already be in the right directory)
* `touch .flaskenv` - this creates the file
* Because the file is starts with a `.` it will only show up if you do `ls -a` 
* To edit this file either use Vim or open up the entire repo with Visual Studio Code, it should show up.
* Add this to the file
```
FLASK_APP=app.py 
FLASK_ENV=development
```

4. Create a `.env` file and add the following to it (you should already be in the right directory)
* `touch .env` - this creates the file
* Because the file is starts with a `.` it will only show up if you do `ls -a` 
* To edit this file either use Vim or open up the entire repo with Visual Studio Code, it should show up.
* Add this to the file
```
GOOGLE_APPLICATION_CREDENTIALS=<PATH_TO_JSON_KEY_FILE_FROM_GCP>     #i.e. "/Users/karthikrameshbabu/.ssh/w209gcp.json"
```

4. Start up Flask! 
* `flask run`
* This should start flask on **port 5000**
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)

<hr>


Keep the Terminal window that's running **Flask** open. Separately open up another Terminal window to start up a Node server.


### Node Setup Steps:
Listed are the following steps to get up and running with the web app
* You must have `Node` installed
  * If you do not, download from here - https://nodejs.org/en/download/

1. Navigate back to the right folder location
* `cd ParkSafeChicago/frontend`

2. Install all the node packages
* `npm install`

3. Build a deployable package 
* `npm run build`

4. Start up Node Server to Host the FE app 
* `npm run start`
* this should start Node on **port 8080**
* Project is running at http://localhost:8080/

5. Navigate to `http://localhost:8080/` and the site should load! **Beware the first load of the home page may take some time!!**


<em>Potentially</em>, If your system doesn't start on local host or http://127.0.0.1, you may have to run the following command, then run steps 1-4 again.
* `unset HOST`
  
<hr>

### General Developer Notes:

* Make sure to always start the python virtual environment before developement work, otherwise things will break!
* If you install a new python pacakge while on the virtual env, run the following command so that we can add it to the `requirements.txt`
`pip freeze >> requirements.txt`

<hr>

### Flask Notes:

* To test the endpoints, have Flask running, then use `localhost:5000/<route_name>`

### Repo Structure
    .
    ├── README.md
    ├── .gitignore
    ├── app.py
    │    └── apiHandler.py
    ├── backend
    │    ├── blueprints
    │    │   ├── overview.py
    │    │   └── userAddress.py
    │    ├── geo_boundaries
    │    │   ├── beats.py
    │    │   ├── comm_areas.py
    │    │   └── zip_codes.py
    │    ├── park_safe
    │    ├── requirements.txt
    │    ├── settings.py
    │    └── utils.py
    ├── frontend
    │    ├── images
    │    ├── src
    |    │   ├── App.js
    |    │   ├── components
    |    │   │    ├── addressModal.js
    |    │   │    ├── searchBox.js
    |    │   │    ├── searchSelection.js
    |    │   │    ├── title.js
    |    │   │    └── userMap.js
    |    │   ├── index.html
    |    │   ├── index.js
    |    │   ├── pages
    |    │   |    ├── about.js
    |    │   |    ├── overview.js
    |    │   |    └── userAddress.js
    |    │   └── utils.js
    │    ├── .babelrc
    │    ├── package.json
    │    └── webpack.config.js
    ├── geo_json_files


<img width="1079" alt="meet_the_team" src="https://user-images.githubusercontent.com/75960494/128106119-9ab5bc3c-ab55-4873-a5bf-5cdb8aef64cc.png">
