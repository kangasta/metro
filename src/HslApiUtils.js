import React from 'react';

import bus from './img/bus.svg';
import loading from './img/loading.svg';
import metro from './img/metro.svg';
import train from './img/train.svg';
import tram from './img/tram.svg';

class HslApiUtils {
	static VT_BUS = 3;
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
			if (departures.includes(departure_str)) return false;
			departures.push(departure_str);
			return true;
		});
	}
}

export default HslApiUtils;