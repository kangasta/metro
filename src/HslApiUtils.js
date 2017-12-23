class HslApiUtils {
	static VT_TRAM = 0;
	static VT_METRO = 1;
	static VT_BUS = 3;
	static VT_TRAIN = 109;

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
}

export default HslApiUtils;