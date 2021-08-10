from flask import Blueprint, json, request, jsonify
import app
import altair as alt
import pandas as pd
import numpy as np
import math
from urllib import parse
from haversine import haversine, Unit
import pytz
import time
from datetime import date, datetime, timedelta
from ..geo_boundaries.comm_areas import geo_comm
from ..utils import get_gpd_df
import datetime as dt

user_address_bp = Blueprint('user_address_bp', __name__)
chicago_bottom_left = (-87.953099, 41.630474) # (longitude, latitude)
chicago_top_right = (-87.510900, 42.031590) # (longitude, latitude)

### ENDPOINTS ###

@user_address_bp.route('/neighbors')
def neighbors():
    start = time.time()
    latitude = float(request.args.get('latitude'))
    longitude = float(request.args.get('longitude'))
    if not isInChicago(chicago_bottom_left, chicago_top_right, (longitude, latitude)):
        return {'fail': 'Not in Chicago silly goose! 🦆'}

    neighbors_data, closest_car_theft = getClosestCarTheftData(latitude, longitude)
    neighbors_query_time = time.time() - start

    community_area = int(closest_car_theft['community_area'])
    data = getCarTheftsPerMonthData(community_area, latitude, longitude)

    community_name = closest_car_theft['community']
    closest_car_theft_date = closest_car_theft['date']
    closest_car_theft_dist = round(closest_car_theft['distance_miles'], 2)

    car_thefts_per_month= data['car_thefts_per_month']
    barChart = data['barChart']
    line1DChart = data['line1DChart']
    ctpm_query_time = data['time_stats']

    end = time.time()

    response = {'neighbors': neighbors_data,
            'closest_car_theft': {
                'unique_key': closest_car_theft['unique_key'],
                'community': community_name,
                'date': closest_car_theft_date,
                'distance': closest_car_theft_dist
                },
            'car_thefts_per_month': car_thefts_per_month,
            'barChart': barChart,
            'line1DChart': line1DChart,
            'time_stats': {
                'total': end - start,
                'neighbors_query_time': neighbors_query_time,
                'ctpm_query_time': ctpm_query_time
                }
            }

    return jsonify(response)

### HELPERS ###
def isInChicago(bottom_left, top_right, user_point):
   if (user_point[0] > bottom_left[0] and user_point[0] < top_right[0] and user_point[1] > bottom_left[1] and user_point[1] < top_right[1]) :
      return True
   else:
      return False


def getClosestCarTheftData(user_lat, user_long):
    current_date = datetime.now()
    date_diff = timedelta(days = 90)
    look_back_date = current_date - date_diff

    gdf = get_gpd_df(geo_comm)
    gdf['area_numbe'] = pd.to_numeric(gdf["area_numbe"])
    gdf.community = gdf.community.astype('str')
    gdf = gdf[['geometry', 'community', 'area_numbe']]

    # Area dict to get community names for each area
    area_dict = dict(zip(gdf.area_numbe, gdf.community))

    query = f"""
        SELECT DISTINCT unique_key, date, latitude, longitude, block, community_area, beat, description
        FROM `bigquery-public-data.chicago_crime.crime`
        WHERE date BETWEEN TIMESTAMP('{look_back_date}') AND TIMESTAMP('{current_date}')
              AND primary_type = 'MOTOR VEHICLE THEFT' AND district != 31
    """
    query_job = app.client.query(query)  # Make an API request.
    df = query_job.to_dataframe()
    
    df['distance_miles'] = df.apply(lambda x: getDistance(x, user_lat, user_long), axis=1)
    df['community'] = df.community_area.apply(lambda x: area_dict[x])
    df = df.sort_values(by = ['distance_miles', 'date'], ascending = True)

    neighbors_data = df.to_dict('records')[:100]
    closest_car_theft = neighbors_data[0]
    return neighbors_data, closest_car_theft

def getCarTheftsPerMonthData(community_area, user_lat, user_long):

    start = time.time()

    query = f"""
        SELECT DISTINCT unique_key, date, latitude, longitude, community_area
        FROM `bigquery-public-data.chicago_crime.crime`
        WHERE primary_type = 'MOTOR VEHICLE THEFT' 
            AND (DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH) 
            AND CURRENT_DATE()) AND district != 31
    """
    query_job = app.client.query(query)  # Make an API request.
    query_time = time.time() - start
    df = query_job.to_dataframe()

    df['distance_miles'] = df.apply(lambda x: getDistance(x, user_lat, user_long), axis=1)
    df = df.sort_values(by = 'distance_miles', ascending = True)
    car_thefts_per_month =  (df[df['community_area'] == community_area].shape[0])/12

    barChart_start = time.time()
    barChart = createBarChart(df)

    line_chart_start = time.time()
    line1DChart = create1DChart(df)
    end = time.time()

    time_stats = {
        'total': end - start,
        'query_time': query_time,
        'barChart': line_chart_start - barChart_start,
        'line1DChart': end - line_chart_start
    }

    return {
        'car_thefts_per_month': car_thefts_per_month, 
        'barChart': barChart,
        'line1DChart': line1DChart, 
        'time_stats':time_stats
        }

def createBarChart(df):
    # set radius for local and area
    radius_local = 0.5
    local_sqr_mile = np.pi*radius_local**2

    # trim dataframe to only rows within the radius_area distance
    df = df[df['distance_miles'] <= radius_local]

    # convert date to Chicago timezone
    df['date_chicago_tz'] = df['date'].dt.tz_convert('America/Chicago')

    # add time and dow columns
    df["time"] = df["date_chicago_tz"].dt.time
    df["dow"] = df["date_chicago_tz"].dt.day_name()

    # define time boundaries for binning
    midnight = datetime.strptime('00:00:00', '%H:%M:%S').time()
    midnight_after = datetime.strptime('00:00:01', '%H:%M:%S').time()
    midnight_before = datetime.strptime('23:59:00', '%H:%M:%S').time()
    six_am = datetime.strptime('06:00:00', '%H:%M:%S').time()
    noon = datetime.strptime('12:00:00', '%H:%M:%S').time()
    six_pm = datetime.strptime('18:00:00', '%H:%M:%S').time()

    # create a list of  conditions
    conditions = [(df['time'] >= midnight_after) & (df['time'] < six_am),
        (df['time'] >= six_am) & (df['time'] < noon),
        (df['time'] >= noon) & (df['time'] < six_pm),
        ((df['time'] >= six_pm) & (df['time'] <= midnight_before)) | (df['time'] == midnight)
    ]

    # create a list of the values we want to assign for each condition
    time_values = ['Early Morning 12AM-6AM', 'Morning 6AM-12PM', 'Afternoon 12PM-6PM', 'Evening 6PM-12AM']
    # create a new column and use np.select to assign values to it using our lists as arguments
    df['time_bin'] = np.select(conditions, time_values)

    # repeat condition/values as above but for the "day" flag
    conditions = [(df['dow'] == 'Monday') | (df['dow'] == 'Tuesday') | (df['dow'] == 'Wednesday') | (df['dow'] == 'Thursday') | (df['dow'] == 'Friday'), 
                (df['dow'] == 'Saturday') | (df['dow'] == 'Sunday')]
    day_values = ['Weekday', "Weekend"]
    df['day'] = np.select(conditions, day_values)

    # groupby time_bin and day and create column for "car_thefts_month"
    df_final = df.groupby(['time_bin', 'day']).agg({'unique_key': ['count']})
    df_final.columns = ['car_thefts_month']
    df_final['car_thefts_month'] = round(df_final['car_thefts_month'] /12 /local_sqr_mile, 2)
    df_final = df_final.reset_index()

    # create column with concatinated time and day
    df_final['cat_col'] = df_final['time_bin'] + '/' + df_final['day']

    # create full set of time_day combination
    full_set = set(['Early Morning 12AM-6AM/Weekday', 'Morning 6AM-12PM/Weekday', 'Afternoon 12PM-6PM/Weekday', 'Evening 6PM-12AM/Weekday', 
        'Early Morning 12AM-6AM/Weekend', 'Morning 6AM-12PM/Weekend', 'Afternoon 12PM-6PM/Weekend', 'Evening 6PM-12AM/Weekend'])

    # add time_day concat as column
    missing_set = list(full_set-set(df_final['cat_col']))

    # check if missing_set has any elements, if so, add them to the source dataframe and put 0 as car_thefts_month
    if len(missing_set) > 0:
        for i in missing_set:
            df_final.loc[len(df_final.index)] = [i.split('/')[0], i.split('/')[1] , 0, i]

    # set a max car_thefts_per_month for the chart so that if car theft numbers are < 1, the chart axis will at least go to 1
    max_score = df_final.car_thefts_month.max()
    if max_score < 1:
        max_score = 1

    # set up radio buttons
    input_radio = alt.binding_radio(options=['Weekday', 'Weekend'], name= ' ')
    selection = alt.selection_single(fields=['day'], bind=input_radio, init={'day':'Weekday'})

    # build plot
    barChart = alt.Chart(df_final).mark_bar(opacity=0.7, color='salmon', font='Avant Garde').encode(
        x=alt.X('car_thefts_month:Q', axis=alt.Axis(tickMinStep=1, orient='top'), title="", scale=alt.Scale(domain=(0,max_score))),
        y=alt.Y("time_bin", axis=alt.Axis(title=" "), sort=["Early Morning 12AM-6AM", "Morning 6AM-12PM", "Afternoon 12PM-6PM", "Evening 6PM-12AM"]),
        tooltip=[alt.Tooltip('car_thefts_month', title="Thefts per Month")]
        ).properties(
            width=350, 
            height=150,
            title={
                "text": "Auto Thefts per Month per Sq. Mi",
                "subtitle": "Derived from 1/2 mile radius (last 12 months)"
            },
        ).configure_title(
            fontSize=20,
            font='Avant Garde',
            anchor='middle'
        ).configure_axis(
            labelFontSize=14,
            titleFontSize=18
        ).add_selection(
            selection
        ).transform_filter(
            selection
    )

    return barChart.to_json()


def create1DChart(df):
    # set radius for local and area
    radius_local = 0.5
    local_sqr_mile = np.pi*radius_local**2
    radius_area = 2
    area_sqr_mile = np.pi*radius_area**2

    # trim dataframe to only rows within the radius_area distance
    df = df[df['distance_miles'] <= radius_area]

    # Create Flag for location type
    df['location_flag'] = df['distance_miles'].apply(lambda x: 'local' if x <= radius_local else 'area')
    scores_df = df.groupby("location_flag").size().reset_index().rename({0:'total_theft_count'}, axis=1)

    scores_df['avg_per_sq_mile'] = scores_df.apply(lambda x: compute_per_sq_mile(x, local_sqr_mile, area_sqr_mile), axis=1)
    
    # update df text for chart
    scores_df = scores_df.rename(columns={'avg_per_sq_mile': '# Auto thefts per month', 'location_flag' : 'Area of interest'})
    scores_df["Area of interest"]= scores_df["Area of interest"].replace('local', '1/2 mile')
    scores_df["Area of interest"]= scores_df["Area of interest"].replace('area', '2 mile')

    max_value = math.ceil(max(scores_df['# Auto thefts per month']))

    font_family = 'Avant Garde'
    line1DChart = alt.Chart(scores_df, title="").mark_tick(opacity=0.7, thickness=12, height=100).encode(
        alt.X('# Auto thefts per month', scale=alt.Scale(domain=(0, max_value)), axis=alt.Axis(title=None, tickMinStep=1)
            ),
        color=alt.Color('Area of interest', legend=alt.Legend(title="Radius Around Location"), scale=alt.Scale(
                domain=['1/2 mile','2 mile' ],
                range=['salmon', 'black'])
        ),
        tooltip=[alt.Tooltip('# Auto thefts per month', title='Thefts per Month')]
    ).properties(
        width=450, 
        height=30,
        title={
            "text": "Auto Thefts per Month per Sq. Mi (last 12 months)",
        }
        ).interactive(
            ).configure_title(
                anchor='start', fontSize=18, font=font_family
            ).configure_axis(
                labelFontSize=16,
                titleFontSize=16
            ).configure_legend(
                titleFontSize=13,
                labelFontSize=12, 
                orient='bottom'
        )

    return line1DChart.to_json()


### APPLY FUNCTIONS ###

def getDistance(row, user_lat, user_long):
    return haversine((row['latitude'], row['longitude']), (user_lat, user_long), unit=Unit.MILES)

def compute_per_sq_mile(row, local_sqr_mile, area_sqr_mile):
    theft = 0
    if row["location_flag"] == 'local':
        theft = round(row['total_theft_count']/12/local_sqr_mile, 2)
    else:
        theft =round(row['total_theft_count']/12/area_sqr_mile, 2)
    return theft