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
	it('polls location at mount time if available',()=>{
		const coords = {lat: 60, lon: 24};
		const coordsSpy = jest.spyOn(LocationUtils, 'getCoords').mockImplementation(()=>{
			return Promise.resolve(coords);
		});

		shallow(<App />);
		expect(coordsSpy).toHaveBeenCalled();
		// TODO: Check that state is updated

		jest.resetAllMocks();
		coordsSpy.mockRestore();
	}),
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
