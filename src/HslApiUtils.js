import React from 'react';

import bus from './img/bus.svg';
import loading from './img/loading.svg';
import metro from './img/metro.svg';
import train from './img/train.svg';
import tram from './img/tram.svg';

class HslApiUtils {
	static VT_NONE = -1;
	static VT_BUS = 3;
	static VT_FERRY = 4;
	static VT_METRO = 1;
	static VT_TRAIN = 109;
	static VT_TRAM = 0;

	static BusImg = <img src={bus} alt='B'/>;
	static MetroImg = <img src={metro} alt='M'/>;
	static LoadingImg = <img src={loading} alt='L' className='effect-rotate'/>;
	static TrainImg = <img src={train} alt='S'/>;
	static TramImg = <img src={tram} alt='T'/>;

	static currentTimeInMinutes() {
		const curTime = new Date();
		return curTime.getHours()*60 + curTime.getMinutes();
	}

	static fixDepartureTimeToMatchDate(time_in_minutes) {
		return time_in_minutes >= HslApiUtils.currentTimeInMinutes() ?
			time_in_minutes :
			time_in_minutes + 24*60;
	}

	static getSymbol(vehicleType) {
		switch(vehicleType) {
		case HslApiUtils.VT_METRO:
			return HslApiUtils.MetroImg;
		case HslApiUtils.VT_TRAM:
			return HslApiUtils.TramImg;
		case HslApiUtils.VT_TRAIN:
			return HslApiUtils.TrainImg;
		case HslApiUtils.VT_BUS:
			return HslApiUtils.BusImg;
		default:
			return HslApiUtils.LoadingImg;
		}
	}

	static getStopsByRadiusQuery(lat, lon, r=1500, n=10) {
		return (
			'{ stopsByRadius(' +
			'lat: ' + lat.toString() + ', ' +
			'lon: ' + lon.toString() + ', ' +
			'radius: ' + r.toString() + ') { ' +
			'edges { node { distance stop { name code vehicleType ' +
			'stoptimesWithoutPatterns(numberOfDepartures: ' + n.toString() + ') { ' +
			'trip { route { shortName } } realtimeDeparture realtime headsign ' +
			'} } } } } }'
		);
	}

	static checkStopResponseForVehicleType(data, vehicleType) {
		return !!data.stopsByRadius.edges.find(a => {
			return a.node.stop.vehicleType === vehicleType;
		});
	}

	static filterOutStoptimesWithoutPatternsDuplicates(stoptimesWithoutPatterns) {
		var departures = [];
		return stoptimesWithoutPatterns.filter((departure)=>{
			const departure_str = departure.realtimeDeparture + ',' +
				departure.trip.route.shortName + ',' +
				departure.headsign;
			if (departures.indexOf(departure_str) >= 0) return false;
			departures.push(departure_str);
			return true;
		});
	}
	/*
	// HSL API return stops sorted by distance so this should not be necessary
	static sortStopsByRadius(stops){
		return stops.sort((a,b)=>{
			if (a.node.distance < b.node.distance) return -1;
			if (a.node.distance > b.node.distance) return 1;
			return 0;
		});
	}
	*/
	static sortCombinedStoptimesWithoutPatterns(stoptimes) {
		return stoptimes.sort((a,b)=>{
			if (HslApiUtils.fixDepartureTimeToMatchDate(a.realtimeDeparture/60) < HslApiUtils.fixDepartureTimeToMatchDate(b.realtimeDeparture/60)) return -1;
			if (HslApiUtils.fixDepartureTimeToMatchDate(a.realtimeDeparture/60) > HslApiUtils.fixDepartureTimeToMatchDate(b.realtimeDeparture/60)) return 1;
			return 0;
		});
	}
}

export default HslApiUtils;