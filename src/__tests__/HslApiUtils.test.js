import HslApiUtils from '../HslApiUtils';

describe('HslApiUtils.currentTimeInMinutes',()=>{
	it('gives current time in minutes',()=>{
		const time = new Date();
		expect(HslApiUtils.currentTimeInMinutes()).toEqual(time.getHours()*60 + time.getMinutes());
	});
});

describe('HslApiUtils.fixDepartureTimeToMatchDate',()=>{
	it('fixes tomorrows departures to todays clock',()=>{
		const time_in_minutes = HslApiUtils.currentTimeInMinutes();
		expect(HslApiUtils.fixDepartureTimeToMatchDate(time_in_minutes-10)).toEqual(time_in_minutes-10 + 24*60);
		expect(HslApiUtils.fixDepartureTimeToMatchDate(time_in_minutes)).toEqual(time_in_minutes);
		expect(HslApiUtils.fixDepartureTimeToMatchDate(time_in_minutes+10)).toEqual(time_in_minutes+10);
	});
});

describe('HslApiUtils.getStopsByRadiusQuery',()=>{
	it('gives query based on location data',()=>{
		expect(HslApiUtils.getStopsByRadiusQuery(123,456)).toMatch(
			/stopsByRadius.*lat: 123.*lon: 456.*radius: [0-9]+.*name.*code.*vehicleType.*stoptimesWithoutPatterns.*numberOfDepartures: [0-9]+.*trip.*route.*shortName.*realtimeDeparture.*realtime.*headsign/
		);
	});
});