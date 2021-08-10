from .geo_boundaries.comm_areas import ca_zip
from .geo_boundaries.beats import beat_zip
import geopandas as gpd

#Augmenting our dataset with community area split into geographical regions
regions = {
    "North": [1,2,3,4,9,10,11,12,13,14,76,77,5,6,7,21,22],
    "Northwest": [15,16,17,18,19,20],
    "West": [23,24,25,26,27,28,29,30,31],
    "Central": [8,32,33],
    "South": [34,35,36,37,38,39,40,41,42,43,60,69],
    "Southwest": [56,57,58,59,61,62,63,64,65,66,67,68,70,71,72,73,74,75],
    "Southeast": [44,45,46,47,48,49,50,51,52,53,54,55]
}
regions_flipped = { comm_id: region for region, ids in regions.items() for comm_id in ids }

def get_region(comm_area_num):
  '''Given community area number returns the corresponding region'''
  if comm_area_num in regions_flipped:
    return regions_flipped[comm_area_num]
  else:
    return "Unknown"

def ca_to_zip(comm_area_num):
  '''Given community area number returns the corresponding zipcode'''
  if comm_area_num in ca_zip:
    return ca_zip[comm_area_num]
  else:
    return "Unknown"

def beat_to_zip(beat_num):
  '''Given beat number returns the corresponding zipcode'''
  if beat_num in beat_zip:
    return beat_zip[beat_num]
  else:
    return "Unknown"

def get_gpd_df(geo_json):
    ''' Process GeoJSON file '''
    gdf = gpd.GeoDataFrame.from_features((geo_json))
    return gdf