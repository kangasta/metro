import React from 'react';
import { mount, shallow } from 'enzyme';
import moment from 'moment';

import DepartureRow from '../DepartureRow';

describe('DepartureRow',()=>{
	it('renders without crashing with valid props', () => {
		mount(<DepartureRow departure={{
			destination: 'unknown',
			route: 66,
			leaves_in: 4,
			is_realtime: true
		}}/>);
	});
	it('has blink effect when departure is in less than two mins', () => {
		const blink = [true, true, true, false];
		for (var i = 0; i < 4; i++) {
			const wrapper = mount(<DepartureRow departure={{
				destination: 'unknown',
				route: 66,
				leaves_in: i,
				is_realtime: true
			}}/>);
			expect(wrapper.find('.effect-blink').exists()).toBe(blink[i]);
		}
	});
	it('show departure time in HH:MM if departure in more than 60 mins',()=>{
		const leaves_in = 66;
		const wrapper = mount(<DepartureRow departure={{
			destination: 'unknown',
			route: 66,
			leaves_in: leaves_in,
			is_realtime: true
		}}/>);
		expect(wrapper.find('.departure-row-min').text()).toBe(moment().add(leaves_in,'m').format('HH:mm'));
		expect(wrapper.find('.departure-row-min')).toHaveLength(1);
		expect(wrapper.find('.departure-row-min.departure-row-min-HHmm').exists()).toBe(true);
	});
	it('has default on click callback', () => {
		const wrapper = shallow(<DepartureRow departure={{
			destination: 'unknown',
			route: 66,
			leaves_in: 4,
			is_realtime: true
		}}/>);
		wrapper.find('.departure-row').simulate('click');
	});
});
