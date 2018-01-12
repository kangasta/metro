import React from 'react';
import { mount, shallow } from 'enzyme';
import App from '../App';
import LocationUtils from '../LocationUtils';

jest.useFakeTimers();

describe('App',()=>{
	it('renders without crashing', () => {
		mount(<App />);
	});
	it('has timers to update location and traffic data',()=>{
		const locationSpy = jest.spyOn(App.prototype, 'updateCoords');
		const querySpy = jest.spyOn(App.prototype, 'sendQueryAndUpdateState');

		shallow(<App />);
		jest.runOnlyPendingTimers();

		expect(locationSpy).toHaveBeenCalled();
		expect(querySpy).toHaveBeenCalled();

		jest.resetAllMocks();
		locationSpy.mockRestore();
		querySpy.mockRestore();
	});
	it('polls location and fetches data at mount time', async ()=>{
		const coords = {lat: 60, lon: 24};
		const coordsPromise = Promise.resolve(coords);
		const coordsSpy = jest.spyOn(LocationUtils, 'getCoords').mockImplementation(()=>{
			return coordsPromise;
		});
		const fetchPromise = Promise.resolve({
			json: ()=>require('../__mocks__/stopsByRadius_niittykumpu.json')
		});
		const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(()=>{
			return fetchPromise;
		});

		const wrapper = await shallow(<App />);
		expect(coordsSpy).toHaveBeenCalled();
		return Promise.all([coordsPromise, fetchPromise]).then(()=>{
			expect(fetchSpy).toHaveBeenCalled();
			expect(wrapper.state().hasOwnProperty('coords')).toBe(true);
			expect(wrapper.state().coords).toEqual(coords);
			// TODO: Check that state.data is updated

			jest.resetAllMocks();
			coordsSpy.mockRestore();
			fetchSpy.mockRestore();
		});
	}),
	it('allows selecting location before location has been detected',()=>{
		const querySpy = jest.spyOn(App.prototype, 'sendQueryAndUpdateState');

		const wrapper = mount(<App />);
		expect(wrapper.state().hasOwnProperty('coords')).toBe(false);
		wrapper.find('.departure-row').first().simulate('click');
		expect(wrapper.state().hasOwnProperty('coords')).toBe(true);
		expect(wrapper.state().coords).toEqual(require('../menuitems.json')[0].coords);
		expect(querySpy).toHaveBeenCalled();
		expect(clearInterval).toHaveBeenCalledWith(wrapper.state('coordsIntervalId'));

		jest.resetAllMocks();
		querySpy.mockRestore();
	});
	it('clears timers at unmount', () => {
		const wrapper = shallow(<App />);
		const ids = [
			wrapper.state('queryIntervalId'),
			wrapper.state('coordsIntervalId')
		];
		wrapper.unmount();
		for (var i = 0; i < ids.length; i++)
			expect(clearInterval).toHaveBeenCalledWith(ids[i]);
	});
});
