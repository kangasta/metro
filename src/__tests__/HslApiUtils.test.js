import React from 'react';
import { mount } from 'enzyme';

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
	it('fixes todays departures to todays clock',()=>{
		const time_in_minutes = HslApiUtils.currentTimeInMinutes();
		expect(HslApiUtils.fixDepartureTimeToMatchDate(time_in_minutes+10+24*60)).toEqual(time_in_minutes+10);
	});
});

describe('HslApiUtils.leavesIn',()=>{
	it('gives minutes left before departure',()=>{
		const time_in_minutes = HslApiUtils.currentTimeInMinutes();
		expect(HslApiUtils.leavesIn(time_in_minutes+1)).toEqual(1);
		expect(HslApiUtils.leavesIn(time_in_minutes+59)).toEqual(59);
		expect(HslApiUtils.leavesIn(time_in_minutes+60)).toEqual(60);
		expect(HslApiUtils.leavesIn(time_in_minutes+90)).toEqual(90);
	});
});

describe('HslApiUtils.getSymbol',()=>{
	it('gives symbol matching given vehicle type',()=>{
		const names = ['bus', 'metro', 'train', 'tram', '', 'loading'];
		const vehicleTypes = [HslApiUtils.VT_BUS, HslApiUtils.VT_METRO, HslApiUtils.VT_TRAIN, HslApiUtils.VT_TRAM, HslApiUtils.VT_NONE, undefined];
		for (var i = 0; i < vehicleTypes.length; i++) {
			const wrapper = mount(<div>{HslApiUtils.getSymbol(vehicleTypes[i])}</div>);
			if (vehicleTypes[i] != HslApiUtils.VT_NONE)
				expect(wrapper.find('img').html()).toContain(names[i]);
			else
				expect(wrapper.find('img').exists()).toBe(false);
		}
	});
});

describe('HslApiUtils.getTheme',()=>{
	it('gives symbol matching given vehicle type',()=>{
		const names = ['bus', 'metro', 'train', 'tram', 'default', 'default'];
		const vehicleTypes = [HslApiUtils.VT_BUS, HslApiUtils.VT_METRO, HslApiUtils.VT_TRAIN, HslApiUtils.VT_TRAM, HslApiUtils.VT_NONE, undefined];
		for (var i = 0; i < vehicleTypes.length; i++) {
			expect(HslApiUtils.getTheme(vehicleTypes[i])).toEqual(names[i]);
		}
	});
});

describe('HslApiUtils.getStopsByRadiusQuery',()=>{
	it('gives query based on location data',()=>{
		expect(HslApiUtils.getStopsByRadiusQuery(123,456)).toMatch(
			/stopsByRadius.*lat: 123.*lon: 456.*radius: [0-9]+.*name.*code.*vehicleType.*stoptimesWithoutPatterns.*numberOfDepartures: [0-9]+.*trip.*route.*shortName.*realtimeDeparture.*realtime.*headsign/
		);
	});
});

describe('HslApiUtils.checkStopResponseForVehicleType',()=>{
	it('checks if vehicle type is present in response data',()=>{
		const response = require('../__mocks__/stopsByRadius_niittykumpu.json');
		const vehicleTypes = [HslApiUtils.VT_BUS, HslApiUtils.VT_METRO, HslApiUtils.VT_TRAIN, HslApiUtils.VT_TRAM, HslApiUtils.VT_NONE];
		const hasVehicleTypes = [true, true, false, false, false];
		for (var i = 0; i < vehicleTypes.length; i++) {
			expect(HslApiUtils.checkStopResponseForVehicleType(response.data, vehicleTypes[i])).toBe(hasVehicleTypes[i]);
		}
	});
});

describe('HslApiUtils.filterOutStoptimesWithoutPatternsDuplicates',()=>{
	it('removes duplicates from combined stoptimes array',()=>{
		const response = require('../__mocks__/stopsByRadius_niittykumpu.json');
		var stoptimes = [];
		for (var i = 0; i<3; i++) {
			stoptimes = stoptimes.concat(response.data.stopsByRadius.edges[1].node.stop.stoptimesWithoutPatterns);
		}
		stoptimes = HslApiUtils.filterOutStoptimesWithoutPatternsDuplicates(stoptimes);
		const stoptimes_str = stoptimes.map((stoptime)=>{
			return (stoptime.realtimeDeparture.toString() + ',' +
				stoptime.trip.route.shortName.toString() + ',' +
				stoptime.headsign.toString());
		});
		for (i = 0; i < stoptimes_str.length; i++)
			expect(stoptimes_str.filter((stoptime_str)=>(stoptime_str === stoptimes_str[i]))).toHaveLength(1);
	});
});

describe('HslApiUtils.filterOutStoptimesWithoutPatternsDuplicates',()=>{
	it('removes duplicates from combined stoptimes array',()=>{
		const response = require('../__mocks__/stopsByRadius_niittykumpu.json');
		var stoptimes = [];
		for (var i = 0; i<3; i++) {
			stoptimes = stoptimes.concat(response.data.stopsByRadius.edges[Math.min(1,i)].node.stop.stoptimesWithoutPatterns);
		}
		const test_fun = (prev, curr)=>{
			return ((prev.realtimeDeparture >= curr.realtimeDeparture) ? curr : 0);
		};
		expect(stoptimes.reduceRight(test_fun)).toBeFalsy();
		stoptimes = HslApiUtils.sortCombinedStoptimesWithoutPatterns(stoptimes);
		expect(stoptimes.reduceRight(test_fun)).toBeTruthy();
	});
});


describe('HslApiUtils.getListOfStopsAvailable',()=>{
	it('gives stops from data without duplicates',()=>{
		var response = require('../__mocks__/stopsByRadius_niittykumpu.json');
		response.data.stopsByRadius.edges = response.data.stopsByRadius.edges.slice(0,7);
		const stops = ['Niittykumpu (M)', 'Niittysilta', 'Niittykumpu']
			.map((stop_name,i)=>{
				return {destination: stop_name, leaves_in: '', vehicle_type: (i !== 2 ? 3 : 1)};
			});
		expect(HslApiUtils.getListOfStopsAvailable(response.data)).toEqual(stops);
	});
});