import React from 'react';
import { mount, shallow } from 'enzyme';

import StopInfo from '../StopInfo';

describe('StopInfo',()=>{
	it('renders without crashing', () => {
		mount(<StopInfo/>);
	});
	it('has default on click callbacks', () => {
		const wrapper = shallow(<StopInfo/>);
		const clickables = [
			'stopinfo-left-symbol',
			'stopinfo-right-symbol',
			'stopinfo-main-symbol',
			'stopinfo-location'
		];
		for (var i = 0; i < clickables.length; i++)
			wrapper.find('.' + clickables[i]).simulate('click');
	});
});
