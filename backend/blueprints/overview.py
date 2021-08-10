from flask import Blueprint, request
from flask.json import jsonify
import app
import json
import pickle
import time
import altair as alt
import pandas as pd
import numpy as np
from ..utils import get_region, beat_to_zip, get_gpd_df

# GeoJSON
from ..geo_boundaries.comm_areas import geo_comm
from ..geo_boundaries.zip_codes import geo_zip

overview_bp = Blueprint('overview_bp', __name__)

# Disable max_rows in altair
alt.data_transformers.disable_max_rows()

#Load from pre computed PKL files
@overview_bp.route('/overview')
def overview():
    # Get argument for unit to display
    unit = request.args.get('unit')
    start = time.time()
    query_time = time.time() - start
    graph_start = time.time()
    end = time.time()

    if unit == 'community':
        response = {'chart': app.overview_ca,
                    'time_stats': {
                        'total': end - start, 
                        'query_time': query_time,
                        'graph_time': end - graph_start
                    }
                }
    else:
        response = {'chart': app.overview_zip,
                    'time_stats': {
                        'total': end - start, 
                        'query_time': query_time,
                        'graph_time': end - graph_start
                    }
                }
    return jsonify(response)




# Logic to use GCP calls.
# @overview_bp.route('/overview')
# def overview_gcp():
#     # Get argument for unit to display
#     unit = request.args.get('unit')
#     start = time.time()

#     # Get argument for unit to display
#     unit = request.args.get('unit')
#     start = time.time()
#     if unit == 'community':
#         gdf = get_gpd_df(geo_comm)
#         gdf['area_numbe'] = pd.to_numeric(gdf["area_numbe"])
#         gdf.community = gdf.community.astype('str')
#         gdf = gdf[['geometry', 'community', 'area_numbe']]

#         # Area dict to get community names for each area
#         area_dict = dict(zip(gdf.area_numbe, gdf.community))

#         # Fetch data
#         df = get_data(unit, area_dict, None)
    
#     elif unit == 'zipcode':
#         gdf = get_gpd_df(geo_zip)
#         gdf['zip'] = pd.to_numeric(gdf["zip"])
#         gdf.zip = gdf.zip.astype('str')
#         gdf = gdf[['geometry', 'zip']]

#         good_zips = set(gdf['zip'])

#         # Fetch data
#         df = get_data(unit, None, good_zips)

#         good_zips_2 = set(df['zipcode'])
#         gdf = gdf[gdf['zip'].isin(good_zips_2)]

#     query_time = time.time() - start
#     graph_start = time.time()

#     # Build Choropleth
#     choro_data = get_geo_data(gdf)

#     # Create Altair Chart
#     if unit == 'community':
#         overview_dashboard = gen_dashboard(
#             df,
#             choro_data,
#             chart_title='Overview of Auto Thefts in Chicago Communities',
#             lookup_key='properties.community',
#             unit='community')
#     elif unit == 'zipcode':
#         overview_dashboard = gen_dashboard(
#             df,
#             choro_data,
#             chart_title='Overview of Auto Thefts in Chicago by Zipcode',
#             lookup_key='properties.zip',
#             unit='zipcode')
    
#     end = time.time()
#     over_json = overview_dashboard.to_json()

#     if unit == 'community':
#         response = {'chart': over_json,
#                     'time_stats': {
#                         'total': end - start, 
#                         'query_time': query_time,
#                         'graph_time': end - graph_start
#                     }
#                 }
#     else:
#         response = {'chart': over_json,
#                     'time_stats': {
#                         'total': end - start, 
#                         'query_time': query_time,
#                         'graph_time': end - graph_start
#                     }
#                 }

#     return jsonify(response)



#### HELPERS ####

def get_data(unit, area_dict, zips):
    query = """
        SELECT unique_key, date, block, primary_type, year, latitude, longitude, 
        location_description, description, arrest, beat, district, community_area, ward
        FROM `bigquery-public-data.chicago_crime.crime`
        WHERE primary_type='MOTOR VEHICLE THEFT' and district != 31 AND (year BETWEEN 2015 AND 2020)
        """
        
    query_job = app.client.query(query)  # Make an API request.
    df = query_job.to_dataframe()

    # convert date to Chicago timezone
    df['date'] = df['date'].dt.tz_convert('America/Chicago')
    
    df['date'] = df['date'].astype('datetime64[ns]')
    df['day'] = df.date.dt.dayofweek
    df['hour'] = df.date.dt.hour
    df['month'] = df.date.dt.month
    df['year'] = df.date.dt.year

    df['region'] = df['community_area'].apply(lambda x: get_region(x))

    df_wo_nulls = df.dropna(axis=0, how='any', thresh=None, subset=None, inplace=False)

    df_final = df_wo_nulls[['community_area', 'beat', 'date', 'year', 'latitude', 'longitude']]

    df_final.community_area = df_final.community_area.astype('int')
    df_final['latitude'] = df_final.latitude.apply(lambda x: np.round(x,1))
    df_final['longitude'] = df_final.longitude.apply(lambda x: np.round(x,1))
    df_final['beat'] = df_final['beat'].astype('str')

    if unit == 'community':
        df_final['community'] = df_final.community_area.apply(lambda x: area_dict[x])

    if unit == 'zipcode':
        df_final['zipcode'] = df_final['beat'].apply(lambda x: beat_to_zip(x))
        df_final = df_final[['zipcode', 'date', 'year', 'latitude', 'longitude']]
        df_final = df_final[df_final['zipcode'].isin(zips)]

    return df_final

def get_geo_data(gdf):
    ''' Merges crime data, with GeoJSON Data returns in appropriate format '''
    choro_json = json.loads(gdf.to_json())
    choro_data = alt.Data(values=choro_json['features'])

    return choro_data


def gen_dashboard(chart_data, geo_data, chart_title, lookup_key, unit, color_scheme=["lightmulti", "redyellowgreen"]):
    ''' Generate Altair Dashboard '''
    scheme1 = color_scheme[0]
    scheme2 = color_scheme[1]

    region_list = [['North', 'NorthWest \n and West', 'Near \n North', 'Loop', 'NearSouth, \n South & \n SouthWest', 'Far South'], [41.98,41.93,41.90,41.86,41.8,41.7], [-87.68	, -87.75, -87.645, -87.635, -87.68, -87.66]]
    reg = pd.DataFrame(region_list).T
    reg.columns = ['region', 'latitude', 'longitude']

    pts = alt.selection_multi(fields=[unit])
    years = alt.selection_multi(fields=['year'])

    choro = alt.Chart(chart_data).transform_lookup(
    lookup=unit,
    from_=alt.LookupData(geo_data, lookup_key),
    as_="geom"
    ).transform_aggregate(
        count1='count()',
        groupby=[unit,'geom','year']
        ).transform_calculate(
            geometry ='datum.geom.geometry',
            type= 'datum.geom.type'
            ).mark_geoshape(
                color='lightgrey',
                stroke='gray',
                strokeWidth=0.25
                ).properties(width=500, height=600).encode(
                    tooltip=unit,
                    color = alt.condition(
                        pts,
                        alt.Color('count1:Q',
                                  scale=alt.Scale(scheme=scheme1, domainMid=150), 
                                  title='Thefts per Year', sort='ascending',
                                  legend = alt.Legend(orient='none',
                                                      titleFontSize=20,
                                                      labelFontSize=14,
                                                      titleFont ='Avant Garde',
                                                      legendX=50,
                                                      legendY=300)),
                        alt.ColorValue("lightgrey"))
                    ).add_selection(pts).transform_filter(years)

    year_trend = alt.Chart(chart_data.sample(chart_data.shape[0])).mark_circle(size=300).encode(
        x = alt.X('year:O', axis=alt.Axis(title='Year', grid=True, gridColor = 'gray', labelFontSize=14, titleFontSize=20, titleFont ='Avant Garde')),
        y = alt.Y('count():Q', axis=alt.Axis(title = 'Number of Thefts', grid=True, gridColor = 'gray', labelFontSize=11, titleFontSize=20, titleFont ='Avant Garde')),
        color = alt.condition(years, alt.ColorValue('steelblue'), alt.ColorValue("grey"))
        ).transform_filter(
            pts).add_selection(years).properties(height=200, width=230)

    area_heatmap = alt.Chart(data=chart_data.sample(chart_data.shape[0])).mark_rect(tooltip=True, opacity=0.7).encode( 
    x = alt.X('day(date):O', 
              axis=alt.Axis(labelFontSize=14, tickCount=7, titleFontSize=20,titleFont ='Avant Garde'), 
              title="Day of Week"),
    y = alt.Y('hours(date):T', axis=alt.Axis(title='Time of Day', labelFontSize=14, titleFontSize=20, format="%I%p",titleFont ='Avant Garde'),
              timeUnit=alt.TimeUnitParams(unit='hours', step=3), 
              title="Hour of the Day", sort='descending'),
    color = alt.Color('count():Q',
                      scale=alt.Scale(scheme=scheme2),
                      sort='descending',
                      title='Number of Thefts',
                      legend = alt.Legend(orient='bottom',
                                          legendX=350,
                                          legendY=300,
                                          titleFontSize=20,
                                          labelFontSize=14,
                                          labelFont='Avant Garde',
                                          titleFont ='Avant Garde'))).transform_filter(
                          pts).properties(height=230, width=230).transform_filter(years)

    bar = alt.Chart(data=chart_data.sample(chart_data.shape[0])).mark_bar(
        tooltip=True, size=6, stroke='gray',strokeWidth=0.25
        ).transform_aggregate(
            count1='count()',
            groupby=['year', unit]
            ).encode( 
        x = alt.X('mean(count1):Q', 
                axis=alt.Axis(labelFontSize=14, titleFontSize=24, titleFont ='Avant Garde'), 
                title="Thefts per Year"),
        y = alt.Y(unit+':N',
                axis=alt.Axis(labelFontSize=9,labelFontStyle='bold', labelAngle=0, titleFontSize=24, titleFont ='Avant Garde'),
                title=unit.capitalize(),
                sort='-x'),
                color = alt.condition(pts,
                                        alt.Color('mean(count1):Q',
                                                    scale=alt.Scale(scheme=scheme1, domainMid=150), 
                                                    title='Thefts per Year', sort='ascending',
                                                    legend = None),
                                        alt.ColorValue("lightgrey"))
                        ).add_selection(pts).transform_filter(
                        years).properties(width=200, height=600)

    zips = alt.Chart(chart_data.sample(chart_data.shape[0])).mark_geoshape(
                color='lightgrey',
                stroke='black',
                opacity=0,
                strokeWidth=1)


    labels = alt.Chart(reg).mark_text(lineBreak='\n', color='black').encode(latitude='latitude', longitude='longitude',text=alt.Text('region'),size=alt.value(20)).properties(height=700,width=800)

    regions = zips + labels
    choro_label = choro + regions
    heat_time = alt.vconcat(year_trend, area_heatmap, spacing=15)
    chart = alt.hconcat(choro_label, bar, heat_time, background='white', spacing=10, title = alt.TitleParams(chart_title, fontSize=35, align='center', anchor='middle', font='Avant Garde')).resolve_scale(color='independent')

    return chart
