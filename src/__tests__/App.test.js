import React from 'react';
import { mount, shallow } from 'enzyme';
import App from '../App';

jest.useFakeTimers();

describe('App',()=>{
	it('renders without crashing', () => {
		mount(<App />);
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
